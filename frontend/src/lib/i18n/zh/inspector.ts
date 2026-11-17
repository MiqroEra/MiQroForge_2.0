import { inspectorEn } from '../en/inspector'

export const inspectorZh: Record<keyof typeof inspectorEn, string> = {
  // 面板
  inspectorTitle: '检查器',
  selectNodeHint: '选择一个节点以查看',

  // 分区标题
  nodeGeneratorSection: '节点生成器',
  scriptDescriptionSection: '脚本描述',
  ioPortsSection: 'I/O 端口',
  runStatusSection: '运行状态',
  resourcesSection: '资源',
  streamInputsSection: '流输入',
  streamOutputsSection: '流输出',
  outputsSection: '输出',
  parametersSection: '参数',

  // 操作
  removeNode: '删除节点',
  generate: '生成',
  generating: '生成中...',

  // 空状态
  noParameters: '无参数',
  noOutputsDefined: '未定义输出',
  portsNone: '无',

  // 参数扫描
  sweepSwitchSingleTitle: '切回单值模式',
  sweepSwitchMultiTitle: '启用并行扫描 — 每行输入一个值，实现扇出执行',
  sweepModeSingle: '↩ 单值',
  sweepModeMulti: '⚡ 扫描',
  sweepValuesLabel: '取值',
  sweepValuesHint: '每行一个值，或用逗号分隔。',
  sweepPatternLabel: '模板',
  sweepPatternHint: '包含 {{item}} 的表达式，按扫描值逐个替换。',
  sweepConfiguredCount: '扫描: 已配置 {count} 个值',

  // 参数显示偏好
  paramPrefsTitle: '参数显示偏好',
  paramVisibility: '参数可见性',
  prefShow: '显示',
  prefCollapse: '折叠',
  prefHide: '隐藏',
  collapseAdvancedParams: '折叠 {count} 个高级参数',
  advancedParam: '{count} 个高级参数',
  advancedParams: '{count} 个高级参数',
  hiddenParam: '{count} 个隐藏参数（点击齿轮显示）',
  hiddenParams: '{count} 个隐藏参数（点击齿轮显示）',

  // 枚举自定义值
  customOption: '自定义...',
  customValuePlaceholder: '输入自定义值...',

  // 临时节点描述编辑器
  ephemeralDescSuffix: '（临时节点脚本意图）',
  ephemeralDescPlaceholder: '描述这个临时节点应该做什么...',
  ephemeralDescHint: '编译时将生成脚本。编译前可在此编辑。',

  // 端口
  inputsLabel: '输入',
  outputsLabel: '输出',
  requiredShort: '必填',
  ephemeralPortsHint: '临时节点端口可连接任意类型。至少需要 1 个端口。',
  genPortsHint: '端口在运行时连接。至少需要 1 个。',

  // 节点生成器编辑器
  softwareLabel: '软件',
  softwareAny: '任意（自动检测）',
  descriptionLabel: '描述',
  genDescriptionPlaceholder: '描述该节点的用途和行为...',

  // 工作区图像
  workspaceOutput: '工作区输出',

  // 板上输出
  gateMustPass: '● 必须通过',
  gateWarn: '◐ 警告',
  gateIgnore: '○ 忽略',
  gateDetail: '门禁: {description}',

  // 运行摘要
  switchInstanceTitle: '点击切换实例',

  // 资源参数
  hideResourceParams: '隐藏资源参数',
  podMemory: 'Pod 内存: {mem} + {overhead} 开销 = {total} GiB',
  resourceParam: '{count} 个资源参数',
  resourceParams: '{count} 个资源参数',
}
