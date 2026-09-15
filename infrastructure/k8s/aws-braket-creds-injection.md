# AWS Braket Credential Injection — Decision Note

> **Date:** 2026-06-01 | **Node:** N4 (hardware-execute) | **Wave:** 1  
> **Context:** quantum-ewf-qsci-pipeline — AWS Braket hardware execution node needs
> AWS credentials at runtime to submit circuits and retrieve results.

---

## 1. Investigation: Compiler Secret/Env Injection Support

The MF YAML compiler (`workflows/pipeline/compiler.py`) was audited for `envFrom`,
`secretKeyRef`, or any K8s secret injection mechanism. **Result: not supported.**

The compiler generates Argo templates with the following env patterns:

| Template type | Env mechanism | Source | Supports secrets? |
|---------------|---------------|--------|-------------------|
| `compute` (container) | `env: [{name, value}]` | `exec_cfg.environment` (static) | No |
| `lightweight` (script) | `env: [{name, value}]` | hardcoded + input params | No |
| `lightweight` (profile container) | `env: [{name, value}]` | `exec_cfg.environment` (static) | No |
| `ephemeral` (script) | `env: [{name, value}]` | hardcoded (`MF_API_URL` etc.) | No |
| `prefab` (script) | `env: [{name, value}]` | hardcoded (`MF_API_URL` etc.) | No |

**No template emits `envFrom` or `valueFrom.secretKeyRef`.** The `exec_cfg.environment`
field (`nodes/schemas/execution.py`) is `dict[str, str]` — plaintext values baked into
the compiled Argo YAML, unsuitable for secrets.

### What would need to change (Wave 2+)

To support K8s-native secret injection, the compiler would need:

1. **Schema change:** Add `Credentials` model to `nodes/schemas/` or
   `workflows/pipeline/models.py`, referencing a named K8s secret + keys to expose
   as env vars.

2. **Compiler change:** In `_build_compute_template()`, `_build_lightweight_script_template()`,
   `_build_ephemeral_template()`, and `_build_prefab_template()`, add optional
   `envFrom: [{secretRef: {name: ...}}]` when credentials are declared.

3. **MF YAML model change:** Allow nodes to declare a `credentials` block referencing
   a pre-created K8s secret (not inline values).

This has been implemented. The workspace-PVC fallback (Section 3) is now deprecated in favor
of compiler-native `envFrom` Secret injection (Section 2).

---

## 2. Implementation: envFrom Secret Injection

The compiler reads `secret_refs` from each node's `ComputeExecutionConfig` and
emits `envFrom.secretRef` entries in the Argo container spec. The kubelet resolves
the Secret at pod admission and populates the container environment with all its
keys as environment variables. No workspace PVC staging is needed.

### Mechanism

```
┌──────────────────────────────────────────────────────────┐
│  K8s Cluster (namespace: workflow = ARGO_NAMESPACE)       │
│                                                          │
│  ┌─────────────────┐     ┌──────────────────────────┐   │
│  │  K8s Secret     │     │  N4 Pod (hardware-execute)│   │
│  │                 │     │                          │   │
│  │ aws-braket-     │     │  env:                    │   │
│  │ creds           │────▶│    AWS_ACCESS_KEY_ID=... │   │
│  │ (opaque)        │     │    AWS_SECRET_ACCESS_KEY │   │
│  │                 │     │    AWS_DEFAULT_REGION    │   │
│  └─────────────────┘     │                          │   │
│                          │  (injected by kubelet    │   │
│                          │   at pod admission, not  │   │
│                          │   by pod ServiceAccount) │   │
│                          └──────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

### How it works

1. **NodeSpec declares `secret_refs`** — the `hardware-execute` node's
   `execution.secret_refs` field lists the K8s Secret names (or
   `${onboard.<param>}` templates) to inject:

   ```yaml
   # In nodes/quantum/hardware-execute/nodespec.yaml:
   execution:
     type: compute
     secret_refs:
       - ${onboard.aws_account}    # resolved at compile time via _resolve_secret_refs()
   ```

2. **Compiler resolves templates and emits `envFrom`** —
   `_build_compute_template()` runs `_resolve_secret_refs()` (instance
   `onboard_params` override > nodespec onboard default; unresolvable
   placeholders raise `ValueError`) and emits `envFrom.secretRef` with
   `optional: true` (the pod starts even if the Secret is temporarily absent):

   ```yaml
   # Generated Argo container spec (aws_account=aws-braket-creds-ayu):
   container:
     image: quantum-exec-0.1
     envFrom:
       - secretRef:
           name: aws-braket-creds-ayu
           optional: true
     env:
       - name: MF_API_URL
         value: "http://..."
   ```

3. **Kubelet resolves Secret at admission** — when Kubernetes creates the pod,
   the kubelet (not the pod's ServiceAccount) reads the Secret and injects all
   its keys as environment variables. The boto3 SDK picks these up automatically
   via its standard env var convention. No `.aws/` file staging is needed.

4. **Container invokes Braket SDK** — `run.sh` calls the Braket SDK, which reads
   `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_DEFAULT_REGION` directly
   from the environment.

### Secret specification

| Attribute | Requirement |
|-----------|-------------|
| Namespace | Workflow namespace where hardware-execute pods run (`.env` `ARGO_NAMESPACE`; currently `miqroforge-wxy`) |
| Name | `aws-braket-creds` (referenced in NodeSpec `secret_refs`) |
| Key naming | **Uppercase boto3 standard names**: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION` |
| Optional keys | `AWS_SESSION_TOKEN` (for STS temporary credentials) |
| Type | Opaque |

> **Key naming convention:** boto3 specifically looks for uppercase env vars
> (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`).
> Lowercase or alternate key names are silently ignored by the SDK. If a Secret
> uses nonstandard key names, the compiler must remap them via
> `env[].valueFrom.secretKeyRef` (not currently supported).

### RBAC note

`envFrom.secretRef` is resolved by the **kubelet** at pod admission time, using
the kubelet's own node credentials. The pod's ServiceAccount is never involved
in reading the Secret object. Therefore `rbac-dev.yaml` does **not** need
`secrets` verbs for workflow pods. This is a common misconception: adding
`secrets` permissions to the workflow ServiceAccount is unnecessary and would
not affect `envFrom` behavior.

### Credential creation (one-time admin operation)

The Secret must be created in the **workflow namespace** — the namespace where
`hardware-execute` pods run (`.env` `ARGO_NAMESPACE`; currently `miqroforge-wxy`).
`envFrom.secretRef` is resolved by the kubelet in the pod's own namespace.

```bash
kubectl create secret generic aws-braket-creds \
  --namespace="$ARGO_NAMESPACE" \
  --from-literal=AWS_ACCESS_KEY_ID=... \
  --from-literal=AWS_SECRET_ACCESS_KEY=... \
  --from-literal=AWS_DEFAULT_REGION=us-east-1
```

See also `infrastructure/k8s/aws-braket-secret.example.yaml` for a declarative
template.

### Multi-account support

One Secret = one AWS account. The `hardware-execute` node selects the account
per workflow run via the `aws_account` onboard enum, whose values are Secret
names resolved through the `${onboard.aws_account}` template:

| `aws_account` value | Secret | AWS account |
|---------------------|--------|-------------|
| `aws-braket-creds` (default) | `aws-braket-creds` | 533612071261 (mqe-quantum-dev) |
| `aws-braket-creds-ayu` | `aws-braket-creds-ayu` | 565950323203 (IAM user ayu) |

Adding an account is a one-time admin Secret creation plus registering the
enum value in the nodespec (see `nodes/quantum/AGENTS.md` §"多账号支持").
Rotation of any account is per-Secret re-apply; no node image rebuild or
nodespec change is required. The `backend` (sv1 / QPU) and `aws_account`
choices are orthogonal — any backend runs under any account's credentials.

### Implementation history

| Milestone | Description |
|-----------|-------------|
| Schema | `ComputeExecutionConfig.secret_refs: list[str]` added in `nodes/schemas/node.py` |
| Compiler | `_build_compute_template()` emits `envFrom.secretRef(optional: true)` for each entry in `secret_refs` |
| Secret | `aws-braket-creds` / `aws-braket-creds-ayu` Secrets in the workflow namespace (`miqroforge-wxy`; consumed by compiler via `envFrom`) |
| Multi-account | `${onboard.<param>}` template support in `_resolve_secret_refs()`; `hardware-execute` gains `aws_account` enum |

---

## 3. Deprecated: Workspace-PVC Fallback (Wave 1)

> **⚠️ Deprecated.** The PVC staging mechanism described below has been
> superseded by `envFrom` Secret injection (Section 2). It is preserved here
> for historical context. New deployments should use `secret_refs` in the
> NodeSpec and do not need `.aws/` file staging.

The original Wave 1 approach staged AWS credentials as files in the Workspace
PVC (`/mf/workspace/.aws/credentials` and `.aws/config`). The `run.sh` script
would set `AWS_SHARED_CREDENTIALS_FILE` and `AWS_CONFIG_FILE` before invoking
the Braket SDK.

This approach had several drawbacks:

- **Credentials visible to any pod** with the workspace PVC mounted, not scoped
  to specific nodes that need them.
- **Rotation required re-staging** into the PVC after each Secret update.
- **Manual one-time setup** (init container or `kubectl exec`) per project.

All of these are eliminated by the current `envFrom` mechanism, which scopes
credentials to the nodes that declare `secret_refs` and requires zero per-project
setup beyond the one-time Secret creation.

The original Wave 1 tradeoff table and staging command are preserved in the git
history of this document.

---

## 4. Region Precedence

The effective `AWS_DEFAULT_REGION` seen by Braket SDK calls depends on whether
`run.sh` overrides it:

| Scenario | Region source |
|----------|--------------|
| Braket backend (SV1/QPU) | `run.sh` exports `AWS_DEFAULT_REGION=us-east-1` — **overrides** the Secret's region value |
| Non-Braket AWS SDK calls in container | Secret's `AWS_DEFAULT_REGION` key (fallback) |
| Local backend | Secret's region is irrelevant (no AWS calls) |

The `run.sh` override is intentional: Braket hardware is only available in
`us-east-1`, and the script enforces this regardless of what the Secret contains.
The Secret's region key serves as a fallback for non-Braket AWS SDK calls
(e.g., S3 logging) that may be added to the container in the future.

---

## 5. Credential Source

Per `wcx_data/hardware_explore/aws_braket_setup.md` (2026-05-27):

| Field | Value |
|-------|-------|
| AWS Account | 533612071261 |
| IAM User | mqe-quantum-dev |
| Region | us-east-1 |
| S3 Bucket | amazon-braket-mqe-533612071261 |
| Auth file | `~/.aws/credentials` (local dev machine) |
| SDK | `amazon-braket-sdk`, `amazon-braket-pennylane-plugin` |

Additional account (ayu):

| Field | Value |
|-------|-------|
| AWS Account | 565950323203 |
| IAM User | ayu |

---

## References

- `infrastructure/k8s/aws-braket-secret.example.yaml` — Secret template (placeholders)
- `infrastructure/k8s/rbac-dev.yaml` — `miqroforge-dev` namespace + ServiceAccount (no `secrets` permissions needed for `envFrom`)
- `infrastructure/k8s/workspace.yaml` — PVC definition (`/mf/workspace`; no longer used for credential staging)
- `nodes/schemas/node.py` — `ComputeExecutionConfig.secret_refs` field definition
- `workflows/pipeline/compiler.py` — `_build_compute_template()` emits `envFrom.secretRef`
- `wcx_data/hardware_explore/aws_braket_setup.md` — Braket setup record
