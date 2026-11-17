import { create } from 'zustand'

export type Theme = 'light' | 'dark' | 'forest' | 'ocean' | 'sunset' | 'midnight'
export type FontSize = 'small' | 'medium' | 'large'
export type Language = 'zh' | 'en'

/** Themes that are dark (used for ReactFlow colorMode and minimap maskColor) */
export const DARK_THEMES: ReadonlySet<Theme> = new Set(['dark', 'midnight'])

/** Get ReactFlow compatible colorMode ('light' | 'dark') for any theme */
export function getColorMode(theme: Theme): 'light' | 'dark' {
  return DARK_THEMES.has(theme) ? 'dark' : 'light'
}

/** Get minimap maskColor string for any theme */
export function getMinimapMaskColor(theme: Theme): string {
  return DARK_THEMES.has(theme) ? 'rgba(0,0,0,0.4)' : 'rgba(200,190,170,0.3)'
}

interface SettingsState {
  theme: Theme
  fontSize: FontSize
  language: Language
  setTheme: (t: Theme) => void
  setFontSize: (f: FontSize) => void
  setLanguage: (l: Language) => void
}

const FONT_SIZE_MAP: Record<FontSize, string> = {
  small:  '13px',
  medium: '15px',
  large:  '17px',
}

function defaultLanguage(): Language {
  if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('zh')) return 'zh'
  return 'en'
}

// Default to dark + medium. Old payloads lack `language`, so fall back per-field.
function loadInitial(): { theme: Theme; fontSize: FontSize; language: Language } {
  try {
    const raw = localStorage.getItem('mf-settings')
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<{ theme: Theme; fontSize: FontSize; language: Language }>
      return {
        theme: parsed.theme ?? 'dark',
        fontSize: parsed.fontSize ?? 'medium',
        language: parsed.language ?? defaultLanguage(),
      }
    }
  } catch {
    // ignore parse errors
  }
  return { theme: 'dark', fontSize: 'medium', language: defaultLanguage() }
}

function applyTheme(theme: Theme) {
  // Remove all theme-related classes first
  document.documentElement.classList.remove(
    'dark',
    'theme-forest',
    'theme-ocean',
    'theme-sunset',
    'theme-midnight'
  )
  // Apply the new theme class
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else if (theme !== 'light') {
    // light is the default (:root CSS), no class needed
    document.documentElement.classList.add(`theme-${theme}`)
  }
}

function applyFontSize(fontSize: FontSize) {
  document.documentElement.style.fontSize = FONT_SIZE_MAP[fontSize]
}

function applyLanguage(language: Language) {
  document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'
}

function persist(state: { theme: Theme; fontSize: FontSize; language: Language }) {
  localStorage.setItem('mf-settings', JSON.stringify(state))
}

// Apply immediately (before React renders) to prevent FOUC
const initial = loadInitial()
applyTheme(initial.theme)
applyFontSize(initial.fontSize)
applyLanguage(initial.language)

export const useSettingsStore = create<SettingsState>((set) => ({
  theme:    initial.theme,
  fontSize: initial.fontSize,
  language: initial.language,

  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
    persist({
      theme,
      fontSize: useSettingsStore.getState().fontSize,
      language: useSettingsStore.getState().language,
    })
  },

  setFontSize: (fontSize) => {
    applyFontSize(fontSize)
    set({ fontSize })
    persist({
      theme: useSettingsStore.getState().theme,
      fontSize,
      language: useSettingsStore.getState().language,
    })
  },

  setLanguage: (language) => {
    applyLanguage(language)
    set({ language })
    persist({
      theme: useSettingsStore.getState().theme,
      fontSize: useSettingsStore.getState().fontSize,
      language,
    })
  },
}))
