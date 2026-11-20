#!/usr/bin/env node
/**
 * check-i18n-sync.mjs — 校验 zh/en 词典同步
 *
 * 逐命名空间比较 src/lib/i18n/en/*.ts 与 src/lib/i18n/zh/*.ts：
 *   1. key 集合一致（zh 不能缺 key，也不能多 key）
 *   2. 每个 key 的 {placeholder} 集合一致
 * 任何不一致 → 退出码 1（可用于 CI）。
 *
 * 用法：node scripts/check-i18n-sync.mjs
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'lib', 'i18n')
const enDir = join(root, 'en')
const zhDir = join(root, 'zh')

// 提取 "  key: 'value'" 形式的 key 与 {placeholder}（两空格缩进的顶层键）
function parseKeys(file) {
  const text = readFileSync(file, 'utf-8')
  const keys = {}
  for (const line of text.split('\n')) {
    const m = line.match(/^ {2}([A-Za-z][A-Za-z0-9_]*):\s*(?:'((?:[^'\\]|\\.)*)')?/)
    if (!m) continue
    const [, key, rawValue] = m
    const placeholders = new Set()
    if (rawValue != null) {
      for (const pm of rawValue.matchAll(/\{([A-Za-z][A-Za-z0-9_]*)\}/g)) placeholders.add(pm[1])
    }
    keys[key] = placeholders
  }
  return keys
}

const enFiles = readdirSync(enDir).filter((f) => f.endsWith('.ts'))
const zhFiles = readdirSync(zhDir).filter((f) => f.endsWith('.ts'))

let problems = 0
const report = (msg) => {
  problems += 1
  console.error(msg)
}

// 文件集一致（zh 侧必须与 en 侧同集合）
for (const f of enFiles) {
  if (!zhFiles.includes(f)) report(`zh/ 缺少文件: ${f}`)
}
for (const f of zhFiles) {
  if (!enFiles.includes(f)) report(`zh/ 多出文件: ${f}`)
}

for (const f of enFiles.sort()) {
  if (!zhFiles.includes(f)) continue
  const en = parseKeys(join(enDir, f))
  const zh = parseKeys(join(zhDir, f))
  const enKeys = Object.keys(en)
  const zhKeys = Object.keys(zh)
  for (const k of enKeys) {
    if (!(k in zh)) {
      report(`${f}: zh 缺少 key "${k}"`)
      continue
    }
    const enPh = en[k]
    const zhPh = zh[k]
    for (const p of enPh) {
      if (!zhPh.has(p)) report(`${f}: key "${k}" zh 缺少占位符 {${p}}`)
    }
    for (const p of zhPh) {
      if (!enPh.has(p)) report(`${f}: key "${k}" zh 多出占位符 {${p}}`)
    }
  }
  for (const k of zhKeys) {
    if (!(k in en)) report(`${f}: zh 多出 key "${k}"`)
  }
}

if (problems > 0) {
  console.error(`\ni18n 同步检查失败：${problems} 个问题`)
  process.exit(1)
}
console.log(`i18n 同步检查通过：${enFiles.length} 个命名空间 × 2 语言，key 与占位符完全一致`)
