import { canvasEn } from '../en/canvas'

export const canvasZh: Record<keyof typeof canvasEn, string> = {
  // ── Port rows ──
  required: '必填',
  // ── Type badges ──
  prefabBadge: '预制',
  ephemeralBadge: '临时',
  sweepMulti: '并行',
  // ── Pending node ──
  selectImplementation: '选择实现',
  noImplementationsFound: '未找到可用实现',
  // ── Run overlay ──
  clickToSwitchInstance: '点击切换实例',
  expand: '▼ 展开',
  collapse: '▲ 收起',
  viewFullLog: '查看完整 log',
  downloading: '下载中…',
  podUnreachable: 'Pod 已被清理或命名空间不可达',
  generating: '生成中…',
  clickToViewError: '▼ 点击查看错误',
  clickToGoBack: '▲ 点击返回',
  // ── Footer ──
  paramOne: '⚙ {count} 个参数',
  paramMany: '⚙ {count} 个参数',
  // ── Edge ──
  deleteConnection: '删除连接',
  // ── Context menu ──
  undo: '↩ 返回上一步',
  redo: '↪ 重做上一步',
  saveNodeToLibrary: '💾 保存节点到节点库',
  deleteNode: '🗑 删除节点',
  cancel: '取消',
  // ── Notifications ──
  noGeneratedFiles: '没有可保存的生成节点文件',
  savedAs: '已保存为 {name}',
  savedToLibrary: '已将 {name} 保存到节点库',
  saveFailed: '保存失败',
}
