import { adminEn } from '../en/admin'

export const adminZh: Record<keyof typeof adminEn, string> = {
  // 页头 / 导航
  backToGallery: '返回画廊',
  title: '用量统计',
  subtitle: 'Token 与计算资源消耗概览',
  daysShort: '{count} 天',

  // 访问控制
  accessDenied: '访问被拒绝',
  accessDeniedMsg: '查看用量统计需要管理员权限。',

  // 状态
  loading: '正在加载统计数据…',
  loadFailed: '加载用量数据失败',

  // 汇总卡片
  statUsers: '用户数',
  statCoreHours: 'CPU 核时',
  statGpuHours: 'GPU 时',
  statTokens: 'Tokens',
  statEstCost: '预估费用',

  // 表头
  colUser: '用户',
  colCalls: '调用次数',
  colTokens: 'Tokens',
  colTokenCost: 'Token 费用',
  colCoreHrs: 'CPU 核时',
  colGpuHrs: 'GPU 时',
  colWfs: '工作流数',
  colCompCost: '计算费用',
  colTotal: '合计',

  // 空表
  noData: '该时间段内暂无用量数据。',

  // 页脚
  footnote: '最近 {days} 天 · 费用（{currency}）基于 models.yaml 与 compute_pricing.yaml',

  // 页面标题
  pageTitle: '用量总览 — {app}',
}
