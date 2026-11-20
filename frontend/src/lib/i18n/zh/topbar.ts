import { topbarEn } from '../en/topbar'

export const topbarZh: Record<keyof typeof topbarEn, string> = {
  backToGallery: '返回项目画廊',
  rename: '点击重命名',
  files: '文件',
  toggleFiles: '切换文件面板',
  chat: '对话',
  toggleChat: '切换 AI 助手（Phase 2）',
  save: '保存',
  saveWorkflow: '保存工作流',
  clearCanvas: '清空画布',
  confirmClear: '确定清空画布?',
  run: '运行',
  running: '运行中…',
  runTitle: '校验并提交工作流（Ctrl+Enter）',
  workflowRunning: '有工作流正在运行',
  history: '运行历史',
  emptyCanvas: '画布为空 — 无内容可保存',
  snapshotSaved: '已为「{name}」保存快照',
  snapshotFailed: '快照保存失败: {error}',
  compiling: '正在编译并提交工作流…（可能需要长达 2 分钟）',
  submitted: '已提交: {name}',
  submitFailed: '提交失败: {error}',
  defaultUser: '用户',
  nodeUnit: '节点',
  nodeUnits: '节点',
  connUnit: '连接',
  connUnits: '连接',
  valid: '✓ 校验通过',
  errors: '✗ {count} 个错误',
  clearRunOverlay: '清除运行覆盖层',

  // 页面标题
  canvasTitle: '工作流画布 — {app}',

  // 语言切换
  switchLanguage: '切换语言',
}
