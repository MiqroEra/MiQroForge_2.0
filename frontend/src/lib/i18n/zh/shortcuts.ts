import { shortcutsEn } from '../en/shortcuts'

export const shortcutsZh: Record<keyof typeof shortcutsEn, string> = {
  togglePaletteLabel: '切换节点面板',
  togglePaletteDesc: '显示 / 隐藏节点面板',
  toggleRunsLabel: '切换历史面板',
  toggleRunsDesc: '显示 / 隐藏历史面板',
  toggleFilesLabel: '切换文件面板',
  toggleFilesDesc: '显示 / 隐藏文件面板',
  runWorkflowLabel: '运行工作流',
  runWorkflowDesc: '校验并提交当前工作流',
  fitViewLabel: '适配画布',
  fitViewDesc: '缩放平移以显示所有节点',
  nodeUndoLabel: '节点 — 后退',
  nodeUndoDesc: '撤销画布上选中节点的实现',
  nodeRedoLabel: '节点 — 前进',
  nodeRedoDesc: '重做画布上选中节点的实现',
}
