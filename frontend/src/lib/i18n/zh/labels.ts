import { labelsEn } from '../en/labels'

export const labelsZh: Record<keyof typeof labelsEn, string> = {
  geoOptimization: '几何优化',
  frequencyAnalysis: '频率分析',
  thermoExtraction: '热力学提取',
  singlePointEnergyMol: '单点能 [mol]',
  singlePointEnergyCrystal: '单点能 [crystal]',
  cellOptimization: '晶胞优化',
  portPhysical: '物理',
  portSoftware: '软件',
  portLogic: '逻辑',
  portReport: '报告',
  other: '其他',
}
