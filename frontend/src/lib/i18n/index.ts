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
  // 双保险：language 字典缺失（持久化值被污染）时回退原始 key，而不是抛 TypeError
  let text = dictionaries[language]?.[ns]?.[rest.join('.')] ?? key
  if (vars) for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, String(v))
  return text
}

/**
 * 根据当前语言选择后端提供的双语字段（display_name / display_name_zh 等）。
 * 中文界面且 zh 值存在时用 zh 值，否则回退英文值；两者皆空返回空串。
 */
export function pickLocalized(zh: boolean, zhValue: string | undefined | null, enValue: string | undefined | null): string {
  return (zh && zhValue ? zhValue : enValue) ?? ''
}

export function useT() {
  const language = useSettingsStore((s) => s.language)
  return useMemo(() => ({
    language,
    t: (key: DictKey, vars?: Record<string, string | number>) => translate(language, key, vars),
  }), [language])
}
