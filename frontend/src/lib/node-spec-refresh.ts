/**
 * lib/node-spec-refresh.ts — 刷新画布节点的 nodespec 快照
 *
 * 画布节点在放置时把一份 nodespec 快照（onboard_inputs 的 enum_values、
 * 描述、stream 端口等）写进 node.data。nodespec.yaml 更新（如新增枚举值、
 * 调整端口）后，已有工作流里的节点快照会过期，Inspector 的下拉框、
 * 端口渲染都会基于旧快照。
 *
 * 本模块在节点加载进 workflow store 时（loadFromNodes），用节点索引的
 * 最新 spec（GET /api/v1/nodes/{name}）合并刷新快照：
 *   - 刷新 spec 元数据（enum_values / 描述 / 端口 / resources / gates）
 *   - 保留用户已填写的 onboard_params 值（只保留新 spec 中仍存在的参数）
 *   - ephemeral / pending 节点跳过（它们没有节点库 spec）
 *
 * prefab 节点也尝试刷新：已入库（accept）的能拉到最新 spec；未入库的
 * 404 后原样保留生成时的快照。
 */
import type { NodeDetailResponse } from '../types/index-types'
import type { MFNodeData } from '../stores/workflow-store'
import type { OnBoardParam, OnBoardOutput, StreamPort, ResourceSpec } from '../types/nodespec'
import { nodesApi } from '../api/nodes-api'

// ─── 详情缓存 ────────────────────────────────────────────────────────────────
// 按节点名缓存 detail 请求（同一画布多次 loadFromNodes 不会重复拉取）。
// reindex 后必须 clearNodeDetailCache()，否则本次会话内拉不到新 spec。

const _detailCache = new Map<string, Promise<NodeDetailResponse | null>>()

/** 拉取节点最新 spec；404 / 网络错误返回 null（调用方保持原快照）。 */
export function fetchNodeDetailCached(name: string): Promise<NodeDetailResponse | null> {
  let pending = _detailCache.get(name)
  if (!pending) {
    pending = nodesApi.get(name).catch(() => null)
    _detailCache.set(name, pending)
  }
  return pending
}

/** reindex 成功后调用：清空详情缓存，让下一次 loadFromNodes 拉到新 spec。 */
export function clearNodeDetailCache(): void {
  _detailCache.clear()
}

// ─── 端口合并 ────────────────────────────────────────────────────────────────

function mergePorts(
  latest: NodeDetailResponse['stream_inputs'],
  old: StreamPort[] | undefined,
): StreamPort[] {
  return latest.map((p) => {
    const prev = (old ?? []).find((o) => o.name === p.name)
    const port: StreamPort = {
      name: p.name,
      display_name: p.display_name,
      category: p.category,
      detail: p.detail,
    }
    // 索引里的端口摘要没有 required/description —— 沿用旧快照上的这两个字段
    if (prev?.required !== undefined) port.required = prev.required
    if (prev?.description !== undefined) port.description = prev.description
    return port
  })
}

// ─── 主合并函数 ──────────────────────────────────────────────────────────────

/**
 * 用节点索引的最新 spec 刷新一个画布节点的 spec 快照。
 * 返回 Partial<MFNodeData>，供 workflow store 的 updateNodeData 合并。
 * 用户参数值（onboard_params）以新 spec 的参数集为准做过滤，值本身不动。
 */
export function mergeLatestSpec(
  data: MFNodeData,
  detail: NodeDetailResponse,
): Partial<MFNodeData> {
  const newInputs: OnBoardParam[] = detail.onboard_inputs.map((p) => ({
    name: p.name,
    display_name: p.display_name,
    type: p.kind,
    default: p.default,
    description: p.description,
    enum_values: p.allowed_values,
    min: p.min_value,
    max: p.max_value,
    unit: p.unit,
    multiple_input: p.multiple_input,
    resource_param: p.resource_param,
    allow_other: p.allow_other,
  }))

  const newOutputs: OnBoardOutput[] = detail.onboard_outputs.map((o) => ({
    name: o.name,
    display_name: o.display_name,
    kind: o.kind,
    unit: o.unit,
    description: o.description,
    quality_gate: o.quality_gate,
    gate_default: o.gate_default,
    gate_description: o.gate_description,
  }))

  // 只保留新 spec 中仍存在的参数值（spec 是唯一事实源）
  const validParams = new Set(newInputs.map((p) => p.name))
  const onboardParams: Record<string, unknown> = Object.fromEntries(
    Object.entries(data.onboard_params ?? {}).filter(([k]) => validParams.has(k)),
  )

  const resources: ResourceSpec = {
    cpu: detail.resources_cpu,
    mem_gb: detail.resources_mem_gb ?? detail.resources_memory_gb ?? 1,
    mem_overhead: data.resources?.mem_overhead ?? 0,
    gpu: detail.resources_gpu,
    estimated_walltime_hours: detail.resources_walltime_hours,
    scratch_disk_gb: detail.resources_scratch_disk_gb,
    parallel_tasks: detail.resources_parallel_tasks,
  }

  const merged: Partial<MFNodeData> = {
    version: detail.version,
    display_name: detail.display_name,
    description: detail.description,
    node_type: detail.node_type,
    category: detail.category,
    nodespec_path: detail.nodespec_path,
    onboard_inputs: newInputs,
    onboard_outputs: newOutputs,
    stream_inputs: mergePorts(detail.stream_inputs, data.stream_inputs),
    stream_outputs: mergePorts(detail.stream_outputs, data.stream_outputs),
    onboard_params: onboardParams,
    resources,
  }
  if (detail.software) merged.software = detail.software

  return merged
}
