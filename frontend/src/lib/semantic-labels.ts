import { translate } from './i18n'
import type { DictKey } from './i18n'
import { labelsEn } from './i18n/en/labels'

// ─── Human-readable labels for semantic types ────────────────────────────────

// i18n dict keys under the `labels` namespace
export type LabelsKey = `labels.${keyof typeof labelsEn}`

const LABELS_KEYS: ReadonlySet<string> = new Set(Object.keys(labelsEn))

/** Type guard: does `value` reference a known key in the labels namespace? */
export function isLabelsKey(value: string): value is LabelsKey {
  if (!value.startsWith('labels.')) return false
  return LABELS_KEYS.has(value.slice('labels.'.length))
}

/**
 * Resolve a label that may be either a `labels.*` dict key or a raw display
 * string (e.g. an API-provided display_name). Dict keys are translated via
 * `t`; anything else passes through untouched.
 */
export function resolveLabel(
  keyOrValue: string,
  t: (key: DictKey, vars?: Record<string, string | number>) => string,
): string {
  return isLabelsKey(keyOrValue) ? t(keyOrValue) : keyOrValue
}

/** `resolveLabel` bound to the English dictionary (fallback rendering). */
export function resolveLabelEn(keyOrValue: string): string {
  return resolveLabel(keyOrValue, (key) => translate('en', key))
}

// Fallback hardcoded labels (used before API data loads).
// Values are dict keys; resolve through `resolveLabel`/`resolveLabelEn`.
export const SEMANTIC_LABELS: Record<string, LabelsKey> = {
  'geometry-optimization': 'labels.geoOptimization',
  'frequency-analysis': 'labels.frequencyAnalysis',
  'thermo-extraction': 'labels.thermoExtraction',
  'single-point-energy': 'labels.singlePointEnergyMol',
  'crystal-single-point-energy': 'labels.singlePointEnergyCrystal',
  'cell-optimization': 'labels.cellOptimization',
}

// Runtime registry data loaded from API
let _registryLabels: Record<string, string> = {}
let _registryDescriptions: Record<string, string> = {}
let _registryLabelsZh: Record<string, string> = {}
let _registryDescriptionsZh: Record<string, string> = {}

/**
 * Load semantic registry data from API response.
 * Call this once at app startup.
 */
export function setSemanticRegistry(types: Record<string, { display_name: string; description: string; display_name_zh?: string; description_zh?: string }>): void {
  _registryLabels = {}
  _registryDescriptions = {}
  _registryLabelsZh = {}
  _registryDescriptionsZh = {}
  for (const [key, entry] of Object.entries(types)) {
    _registryLabels[key] = entry.display_name
    _registryDescriptions[key] = entry.description
    _registryLabelsZh[key] = entry.display_name_zh ?? ''
    _registryDescriptionsZh[key] = entry.description_zh ?? ''
  }
}

export function semanticLabel(st: string): string {
  // Prefer API data over hardcoded fallback
  const registryLabel = _registryLabels[st]
  if (registryLabel != null) return registryLabel
  const fallback = SEMANTIC_LABELS[st]
  if (fallback !== undefined) return resolveLabelEn(fallback)
  return st.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export function semanticDescription(st: string): string {
  return _registryDescriptions[st] ?? ''
}

export function semanticLabelZh(st: string): string {
  const zh = _registryLabelsZh[st]
  if (zh) return zh
  return semanticLabel(st)
}

export function semanticDescriptionZh(st: string): string {
  return _registryDescriptionsZh[st] || semanticDescription(st)
}

// ─── Icons for semantic types ─────────────────────────────────────────────────

export const SEMANTIC_ICONS: Record<string, string> = {
  'geometry-optimization': '⚙️',
  'frequency-analysis': '〜',
  'thermo-extraction': '🌡',
  'single-point-energy': '⚡',
  'crystal-single-point-energy': '💎',
  'cell-optimization': '📦',
}

export function semanticIcon(st: string): string {
  return SEMANTIC_ICONS[st] ?? '◈'
}

// ─── Shared picker option type (Palette → Canvas drag protocol) ───────────────

export interface PickerOption {
  nodeName: string
  software: string | null
  label: string   // display_name
  methods?: string[]  // algorithm tags for sub-grouping
}
