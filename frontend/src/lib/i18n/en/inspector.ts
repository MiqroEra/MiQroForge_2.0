export const inspectorEn = {
  // Panel chrome
  inspectorTitle: 'Inspector',
  selectNodeHint: 'Select a node to inspect',

  // Section titles
  nodeGeneratorSection: 'Node Generator',
  scriptDescriptionSection: 'Script Description',
  ioPortsSection: 'I/O Ports',
  runStatusSection: 'Run Status',
  resourcesSection: 'Resources',
  streamInputsSection: 'Stream Inputs',
  streamOutputsSection: 'Stream Outputs',
  outputsSection: 'Outputs',
  parametersSection: 'Parameters',

  // Actions
  removeNode: 'Remove Node',
  generate: 'Generate',
  generating: 'Generating...',

  // Empty states
  noParameters: 'No parameters',
  noOutputsDefined: 'No outputs defined',
  portsNone: 'None',

  // Parameter sweep
  sweepSwitchSingleTitle: 'Switch back to single value mode',
  sweepSwitchMultiTitle: 'Enable parallel sweep — enter multiple values (one per line) to fan-out execution',
  sweepModeSingle: '↩ Single',
  sweepModeMulti: '⚡ Sweep',
  sweepValuesLabel: 'Values',
  sweepValuesHint: 'One value per line or comma-separated.',
  sweepPatternLabel: 'Pattern',
  sweepPatternHint: 'Expression with {{item}}, replaced per sweep value.',
  sweepConfiguredCount: 'Sweep: {count} values configured',

  // Parameter visibility preferences
  paramPrefsTitle: 'Parameter display preferences',
  paramVisibility: 'Parameter visibility',
  prefShow: 'Show',
  prefCollapse: 'Collapse',
  prefHide: 'Hide',
  collapseAdvancedParams: 'Collapse {count} advanced params',
  advancedParam: '{count} advanced param',
  advancedParams: '{count} advanced params',
  hiddenParam: '{count} hidden param (click gear to show)',
  hiddenParams: '{count} hidden params (click gear to show)',

  // Enum custom values
  customOption: 'Custom...',
  customValuePlaceholder: 'Type custom value...',

  // Ephemeral description editor
  ephemeralDescSuffix: '(ephemeral node script intent)',
  ephemeralDescPlaceholder: 'Describe what this ephemeral node should do...',
  ephemeralDescHint: 'Script will be generated when you compile. Edit this before compiling.',

  // Ports
  inputsLabel: 'Inputs',
  outputsLabel: 'Outputs',
  requiredShort: 'req',
  ephemeralPortsHint: 'Ephemeral ports connect to any type. At least 1 total port required.',
  genPortsHint: 'Ports connect at runtime. At least 1 total required.',

  // Node generator editor
  softwareLabel: 'Software',
  softwareAny: 'Any (auto-detect)',
  descriptionLabel: 'Description',
  genDescriptionPlaceholder: "Describe the node's purpose and behavior...",

  // Workspace image
  workspaceOutput: 'Workspace Output',

  // Onboard outputs
  gateMustPass: '● must pass',
  gateWarn: '◐ warn',
  gateIgnore: '○ ignore',
  gateDetail: 'Gate: {description}',

  // Run summary
  switchInstanceTitle: 'Click to switch instance',

  // Resource params
  hideResourceParams: 'Hide resource params',
  podMemory: 'Pod memory: {mem} + {overhead} overhead = {total} GiB',
  resourceParam: '{count} resource param',
  resourceParams: '{count} resource params',

  // Auto-generated resource param names (resources.parametrize)
  paramCpuCores: 'CPU Cores',
  paramAppMemory: 'App Memory (GB)',
  paramWalltime: 'Walltime (hours)',
  paramMemOverhead: 'Memory Overhead (GB)',
  paramGpuCount: 'GPU Count',
  paramScratchDisk: 'Scratch Disk (GB)',
} as const
