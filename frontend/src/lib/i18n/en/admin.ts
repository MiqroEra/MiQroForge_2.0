export const adminEn = {
  // Header / navigation
  backToGallery: 'Back to Gallery',
  title: 'Usage Statistics',
  subtitle: 'Token + compute consumption overview',
  daysShort: '{count}d',

  // Access control
  accessDenied: 'Access Denied',
  accessDeniedMsg: 'Admin access required to view usage statistics.',

  // States
  loading: 'Loading statistics...',
  loadFailed: 'Failed to load usage data',

  // Summary cards
  statUsers: 'Users',
  statCoreHours: 'Core Hours',
  statGpuHours: 'GPU Hours',
  statTokens: 'Tokens',
  statEstCost: 'Est. Cost',

  // Table headers
  colUser: 'User',
  colCalls: 'Calls',
  colTokens: 'Tokens',
  colTokenCost: 'Token Cost',
  colCoreHrs: 'Core Hrs',
  colGpuHrs: 'GPU Hrs',
  colWfs: 'WFs',
  colCompCost: 'Comp Cost',
  colTotal: 'Total',

  // Empty table
  noData: 'No usage data in this period.',

  // Footer
  footnote: 'Last {days} days · Costs ({currency}) based on models.yaml & compute_pricing.yaml',

  // Page title
  pageTitle: 'Usage Summary — {app}',
} as const
