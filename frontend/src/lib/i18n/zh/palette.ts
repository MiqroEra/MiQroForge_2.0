import { paletteEn } from '../en/palette'

export const paletteZh: Record<keyof typeof paletteEn, string> = {
  searchNodes: '搜索节点…',
  nodesTitle: '节点',
  refreshCatalog: '刷新节点目录（重新扫描文件系统）',
  collapsePalette: '收起面板',
  expandPalette: '展开面板',
  loadingNodes: '正在加载节点…',
  noMatches: '没有匹配的节点。',
  noNodesFound: '未找到节点。请运行 mf2 nodes reindex。',
  dragHint: '拖拽到画布 · 点击选择软件',
  dragToPlace: '拖拽以放置 {name}',
  implUnit: '{count} 个实现',
  implUnits: '{count} 个实现',
  ephemeralHint: '临时节点 · 拖拽创建',
  nodeGenHint: 'AI 辅助 · 拖拽创建',
  ephemeralTitle: '临时节点',
  nodeGenTitle: '生成节点',
}
