export const repositoryEn = {
  // Header / navigation
  backToGallery: 'Gallery',
  nodeFiles: 'Node Files',
  title: 'Node Preferences',
  preferenceTag: 'preference',
  showDeprecated: 'Show deprecated',

  // Intro
  introPre: 'Configure parameter visibility (visible / collapsed / hidden) for each node. Changes saved here apply ',
  introGlobal: 'globally',
  introPost: ' to all projects. Includes both built-in nodes and user-added nodes from userdata/nodes/.',

  // States
  loading: 'Loading nodes...',
  emptyPre: 'No nodes found. Run ',
  emptyPost: ' first.',

  // Node rows
  deprecated: 'deprecated',
  paramCount: '{count} params',
  nodeOne: '{count} node',
  nodeMany: '{count} nodes',

  // Param visibility editor
  paramVisibility: 'Parameter Visibility',
  visVisible: 'Visible',
  visCollapsed: 'Collapsed',
  visHidden: 'Hidden',
  visHint: 'Click to change: {label}',
  saveGlobal: 'Save Global',

  // Document title
  docTitle: 'Node Preferences — {app}',
} as const
