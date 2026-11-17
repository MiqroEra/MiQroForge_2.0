import { workflowEn } from '../en/workflow'

export const workflowZh: Record<keyof typeof workflowEn, string> = {
  savedWorkflows: '已保存工作流',
  noSavedWorkflows: '暂无已保存的工作流。',
  noSavedClickSave: '点击工具栏中的保存。',
  confirmDelete: '确定删除已保存工作流「{name}」?',
  deleteWorkflow: '删除已保存工作流',
  loaded: '已加载「{name}」',
  runWorkflow: '运行工作流',
  validating: '正在校验…',
  submitting: '正在提交…',
  addNodesBeforeRun: '运行前请先向画布添加节点。',
  valid: '校验通过',
  errorUnit: '{count} 个错误',
  errorUnits: '{count} 个错误',
  submitted: '已提交:',
}
