import { create } from 'zustand'
import type { DictKey } from '../lib/i18n'

// ─── Shortcut IDs ─────────────────────────────────────────────────────────────

export type ShortcutId =
  | 'togglePalette'
  | 'toggleRuns'
  | 'toggleFiles'
  | 'runWorkflow'
  | 'fitView'
  | 'nodeUndo'
  | 'nodeRedo'

// ─── Default definitions ──────────────────────────────────────────────────────

interface ShortcutMeta {
  id: ShortcutId
  labelKey: DictKey
  descKey: DictKey
  defaultKey: string
}

export const SHORTCUT_DEFS: Record<ShortcutId, ShortcutMeta> = {
  togglePalette: {
    id: 'togglePalette',
    labelKey: 'shortcuts.togglePaletteLabel',
    descKey: 'shortcuts.togglePaletteDesc',
    defaultKey: 'n',
  },
  toggleRuns: {
    id: 'toggleRuns',
    labelKey: 'shortcuts.toggleRunsLabel',
    descKey: 'shortcuts.toggleRunsDesc',
    defaultKey: 'r',
  },
  toggleFiles: {
    id: 'toggleFiles',
    labelKey: 'shortcuts.toggleFilesLabel',
    descKey: 'shortcuts.toggleFilesDesc',
    defaultKey: 'f',
  },
  runWorkflow: {
    id: 'runWorkflow',
    labelKey: 'shortcuts.runWorkflowLabel',
    descKey: 'shortcuts.runWorkflowDesc',
    defaultKey: 'ctrl+enter',
  },
  fitView: {
    id: 'fitView',
    labelKey: 'shortcuts.fitViewLabel',
    descKey: 'shortcuts.fitViewDesc',
    defaultKey: 'space',
  },
  nodeUndo: {
    id: 'nodeUndo',
    labelKey: 'shortcuts.nodeUndoLabel',
    descKey: 'shortcuts.nodeUndoDesc',
    defaultKey: 'a',
  },
  nodeRedo: {
    id: 'nodeRedo',
    labelKey: 'shortcuts.nodeRedoLabel',
    descKey: 'shortcuts.nodeRedoDesc',
    defaultKey: 'd',
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Check whether a KeyboardEvent matches a binding string (e.g. "ctrl+enter"). */
export function keyMatch(e: KeyboardEvent, binding: string): boolean {
  if (!binding) return false
  const parts = binding.toLowerCase().split('+')
  const needsCtrl  = parts.includes('ctrl')
  const needsMeta  = parts.includes('meta')
  const needsAlt   = parts.includes('alt')
  const needsShift = parts.includes('shift')
  // Last part is the actual key; 'space' maps to the literal space character
  const rawKey = parts[parts.length - 1]
  const key = rawKey === 'space' ? ' ' : rawKey
  return (
    e.key.toLowerCase() === key &&
    e.ctrlKey  === needsCtrl &&
    e.metaKey  === needsMeta &&
    e.altKey   === needsAlt &&
    e.shiftKey === needsShift
  )
}

/** Build a binding string from a KeyboardEvent. Returns null for bare modifiers. */
export function bindingFromEvent(e: KeyboardEvent): string | null {
  // Normalise space → 'space' so it's human-readable when stored / displayed
  const bare = e.key === ' ' ? 'space' : e.key.toLowerCase()
  if (['control', 'meta', 'alt', 'shift'].includes(bare)) return null
  const parts: string[] = []
  if (e.ctrlKey)  parts.push('ctrl')
  if (e.metaKey)  parts.push('meta')
  if (e.altKey)   parts.push('alt')
  if (e.shiftKey) parts.push('shift')
  parts.push(bare)
  return parts.join('+')
}

/** Human-readable label for a binding string. */
export function displayKey(binding: string): string {
  return binding
    .split('+')
    .map((p) => {
      if (p === 'ctrl')  return 'Ctrl'
      if (p === 'meta')  return '⌘'
      if (p === 'alt')   return 'Alt'
      if (p === 'shift') return '⇧'
      if (p === 'enter') return '↵'
      if (p === 'tab')   return 'Tab'
      if (p === 'space') return 'Space'
      if (p === ' ')     return 'Space'   // legacy stored value
      return p.toUpperCase()
    })
    .join('+')
}

// ─── Persistence ──────────────────────────────────────────────────────────────

function defaultBindings(): Record<ShortcutId, string> {
  return Object.fromEntries(
    Object.entries(SHORTCUT_DEFS).map(([id, def]) => [id, def.defaultKey]),
  ) as Record<ShortcutId, string>
}

function loadBindings(): Record<ShortcutId, string> {
  try {
    const raw = localStorage.getItem('mf-shortcuts')
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Record<ShortcutId, string>>
      // Merge with defaults so new shortcuts added in future have a value
      return { ...defaultBindings(), ...parsed }
    }
  } catch { /* ignore */ }
  return defaultBindings()
}

function saveBindings(b: Record<ShortcutId, string>) {
  localStorage.setItem('mf-shortcuts', JSON.stringify(b))
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface ShortcutsState {
  bindings: Record<ShortcutId, string>
  setBinding: (id: ShortcutId, key: string) => void
  resetBinding: (id: ShortcutId) => void
  resetAll: () => void
}

export const useShortcutsStore = create<ShortcutsState>((set) => ({
  bindings: loadBindings(),

  setBinding: (id, key) =>
    set((s) => {
      const next = { ...s.bindings, [id]: key }
      saveBindings(next)
      return { bindings: next }
    }),

  resetBinding: (id) =>
    set((s) => {
      const next = { ...s.bindings, [id]: SHORTCUT_DEFS[id].defaultKey }
      saveBindings(next)
      return { bindings: next }
    }),

  resetAll: () => {
    const next = defaultBindings()
    saveBindings(next)
    set({ bindings: next })
  },
}))
