# React Frontend

**Hierarchy:** `frontend/src/` — @xyflow/react canvas editor + chat UI.

## STRUCTURE
```
src/
├── api/          # API client (fetch wrappers, typed endpoints)
├── components/   # Shared UI components
├── hooks/        # Custom React hooks
├── lib/          # Utility functions, constants
├── pages/        # Route pages (ProjectGallery, CanvasLayout, etc.)
├── stores/       # Zustand stores (canvas, project, workflow, etc.)
├── types/        # TypeScript type definitions
├── App.tsx       # Root: BrowserRouter + Routes + QueryClientProvider
└── main.tsx      # React DOM bootstrap
```

## WHERE TO LOOK
| Task | Location |
|------|----------|
| Fix/move nodes on canvas | `src/stores/` (Zustand state) + `src/lib/` (layout) |
| Add node type to palette | `src/components/` + `src/stores/` |
| Modify inspector panel | `src/components/` |
| Add API route | `src/api/` + `api/routers/` (backend) |
| Modify routing | `src/App.tsx` |

## KEY PATTERNS
- **State**: Zustand v5 (stores per domain: canvas, project, workflow, settings, chat, auth, UI)
- **Canvas**: @xyflow/react v12 — custom nodes, edges, minimap
- **API**: Custom typed fetch client in `src/api/` (not TanStack Query's generate)
- **Styling**: Tailwind CSS v3 with `mf-` design tokens (dark mode via class)
- **TypeScript**: Strict — noUnusedLocals, verbatimModuleSyntax enforced
- **Route isolation**: Project switch saves canvas + clears localStorage state
- **Node spec snapshots**: Canvas nodes embed a nodespec snapshot (`onboard_inputs` enum_values / ports / description). It goes stale when `nodespec.yaml` changes. `src/lib/node-spec-refresh.ts` re-syncs snapshots from `GET /api/v1/nodes/{name}` whenever nodes load into the workflow store (`loadFromNodes`) and after reindex; user param values are preserved. When changing a nodespec, remember old canvases refresh on load — no manual canvas edits needed.
