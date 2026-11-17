import { useMemo } from 'react'
import { en } from './en'
import { zh } from './zh'
import { useSettingsStore } from '../../stores/settings-store'
import type { Language } from '../../stores/settings-store'

type LeafKeys<T> = { [K in keyof T]: T[K] extends string ? K : never }[keyof T]
export type DictKey = { [K in keyof typeof en]: `${Extract<K, string>}.${Extract<LeafKeys<(typeof en)[K]>, string>}` }[keyof typeof en]

const dictionaries = { en, zh } as Record<Language, Record<string, Record<string, string>>>

export function translate(language: Language, key: DictKey, vars?: Record<string, string | number>): string {
  const [ns, ...rest] = key.split('.')
  let text = dictionaries[language][ns]?.[rest.join('.')] ?? key
  if (vars) for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, String(v))
  return text
}

export function useT() {
  const language = useSettingsStore((s) => s.language)
  return useMemo(() => ({
    language,
    t: (key: DictKey, vars?: Record<string, string | number>) => translate(language, key, vars),
  }), [language])
}
