import { memoryEn } from '../en/memory'

export const memoryZh: Record<keyof typeof memoryEn, string> = {
  // 页头
  backToGallery: '返回画廊',
  title: '记忆管理',
  subtitle: '管理 Agent 经验记忆',

  // 软件选择器
  software: '软件：',

  // 状态
  loading: '正在加载记忆…',
  emptyPre: '暂无 ',
  emptyPost: ' 的记忆。',

  // 条目列表
  entryOne: '{count} 条记忆',
  entryMany: '{count} 条记忆',
  clearAll: '清空全部',
  confirmTitle: '确定要清空吗？',
  clearing: '清空中…',
  confirmYes: '确认清空',
  cancel: '取消',
  deleteEntry: '删除此记忆',

  // 结果徽标（API 返回 "success" | "failure"）
  resultSuccess: '成功',
  resultFailed: '失败',

  // 页面标题
  pageTitle: '记忆管理 — {app}',
}
