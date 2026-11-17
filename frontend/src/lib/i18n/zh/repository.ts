import { repositoryEn } from '../en/repository'

export const repositoryZh: Record<keyof typeof repositoryEn, string> = {
  // 页头 / 导航
  backToGallery: '画廊',
  nodeFiles: '节点文件',
  title: '节点偏好设置',
  preferenceTag: '偏好设置',
  showDeprecated: '显示已弃用',

  // 简介
  introPre: '配置每个节点的参数可见性（可见 / 折叠 / 隐藏）。此处保存的更改将',
  introGlobal: '全局',
  introPost: '应用于所有项目。包括内置节点和来自 userdata/nodes/ 的用户添加节点。',

  // 状态
  loading: '正在加载节点…',
  emptyPre: '未找到节点。请先运行 ',
  emptyPost: '。',

  // 节点行
  deprecated: '已弃用',
  paramCount: '{count} 个参数',
  nodeOne: '{count} 个节点',
  nodeMany: '{count} 个节点',

  // 参数可见性编辑器
  paramVisibility: '参数可见性',
  visVisible: '可见',
  visCollapsed: '折叠',
  visHidden: '隐藏',
  visHint: '点击切换：{label}',
  saveGlobal: '全局保存',

  // 文档标题
  docTitle: '节点偏好设置 — {app}',
}
