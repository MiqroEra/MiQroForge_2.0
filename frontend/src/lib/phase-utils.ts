import type { RunPhase } from '../types/index-types'
import type { DictKey } from './i18n'

// ─── Phase configuration map ──────────────────────────────────────────────────

interface PhaseConfig {
  emoji: string
  borderClass: string
  textClass: string
  badgeClass: string
}

const PHASE_CONFIG: Record<RunPhase, PhaseConfig> = {
  Running:       { emoji: '🔄', borderClass: 'border-blue-400 animate-pulse',    textClass: 'text-blue-400',              badgeClass: 'badge badge-running'   },
  Succeeded:     { emoji: '✅', borderClass: 'border-green-500',                 textClass: 'text-green-500 font-medium', badgeClass: 'badge badge-succeeded' },
  Failed:        { emoji: '❌', borderClass: 'border-red-500',                   textClass: 'text-red-500 font-medium',   badgeClass: 'badge badge-failed'    },
  Error:         { emoji: '❌', borderClass: 'border-red-500',                   textClass: 'text-red-500 font-medium',   badgeClass: 'badge badge-failed'    },
  Pending:       { emoji: '⏳', borderClass: 'border-gray-500',                  textClass: 'text-mf-text-muted',         badgeClass: 'badge badge-pending'   },
  Unknown:       { emoji: '⊘',  borderClass: 'border-gray-600 opacity-50',      textClass: 'text-mf-text-muted',         badgeClass: 'badge badge-unknown'   },
  // Individual node skipped because a when-condition was false
  Omitted:       { emoji: '⊘',  borderClass: 'border-gray-600 opacity-40',      textClass: 'text-gray-400 opacity-70',   badgeClass: 'badge badge-omitted'   },
  // Workflow completed but ≥1 downstream node was blocked by a quality gate
  PartialSuccess: { emoji: '⚠️', borderClass: 'border-orange-400',              textClass: 'text-orange-300 font-medium', badgeClass: 'badge badge-partial'  },
}

const FALLBACK_CONFIG: PhaseConfig = {
  emoji: '⊘',
  borderClass: 'border-gray-600 opacity-50',
  textClass: 'text-mf-text-muted',
  badgeClass: 'badge badge-unknown',
}

export function phaseConfig(phase: RunPhase): PhaseConfig {
  return PHASE_CONFIG[phase] ?? FALLBACK_CONFIG
}

export function phaseEmoji(phase: RunPhase): string {
  return phaseConfig(phase).emoji
}

export function phaseBorderClass(phase: RunPhase): string {
  return phaseConfig(phase).borderClass
}

export function phaseTextClass(phase: RunPhase): string {
  return phaseConfig(phase).textClass
}

export function phaseBadgeClass(phase: RunPhase): string {
  return phaseConfig(phase).badgeClass
}

// ─── Phase label localization ─────────────────────────────────────────────────

const PHASE_LABEL_KEYS: Record<string, DictKey> = {
  Running:        'runs.phaseRunning',
  Succeeded:      'runs.phaseSucceeded',
  Failed:         'runs.phaseFailed',
  Error:          'runs.phaseError',
  Pending:        'runs.phasePending',
  Unknown:        'runs.phaseUnknown',
  Omitted:        'runs.phaseOmitted',
  PartialSuccess: 'runs.phasePartialSuccess',
}

/** Localized phase text; unknown values (e.g. Argo's Skipped/Terminated) pass through unchanged. */
export function phaseLabel(phase: string | undefined, t: (key: DictKey) => string): string {
  if (!phase) return ''
  const key = PHASE_LABEL_KEYS[phase]
  return key ? t(key) : phase
}

// ─── Duration formatting ──────────────────────────────────────────────────────

/** Format a duration given as seconds. */
export function formatDurationSeconds(secs: number): string {
  if (secs < 60) return `${secs}s`
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}m ${s}s`
}

/** Format elapsed time between two ISO timestamps (or now if finishedAt is absent). */
export function formatElapsed(startedAt?: string, finishedAt?: string): string {
  if (!startedAt) return ''
  const start = new Date(startedAt).getTime()
  const end = finishedAt ? new Date(finishedAt).getTime() : Date.now()
  return formatDurationSeconds(Math.round((end - start) / 1000))
}
