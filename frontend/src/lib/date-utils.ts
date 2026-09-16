// ─── 北京时间格式化 ────────────────────────────────────────────────────────────
//
// 所有用户可见的绝对时间统一按 Asia/Shanghai（UTC+8）渲染，与浏览器本地时区无关。
// 后端 API 输出带偏移的 ISO 8601 字符串（如 2026-05-26T16:00:00+08:00 或 ...Z），
// new Date() 均可直接解析；本模块只负责把瞬间渲染为固定形状的数字时间。

const BEIJING_TIME_ZONE = 'Asia/Shanghai'

const INVALID_FALLBACK = '—'

interface DateParts {
  year: string
  month: string
  day: string
  hour: string
  minute: string
  second: string
}

/** 将 Date 或 ISO 字符串拆解为北京时间各字段；无效输入返回 null。 */
function extractParts(input: Date | string): DateParts | null {
  const date = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(date.getTime())) return null
  const parts = new Intl.DateTimeFormat('zh-CN', {
    timeZone: BEIJING_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date)
  const get = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((p) => p.type === type)?.value ?? ''
  // 部分 ICU 环境下 hour12:false 会把午夜渲染为 "24"，归零为 "00"
  const hour = get('hour') === '24' ? '00' : get('hour')
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour,
    minute: get('minute'),
    second: get('second'),
  }
}

/** ISO 时间戳 → 北京时间 `YYYY-MM-DD HH:mm`（withSeconds 时含秒）。无效输入返回 '—'。 */
export function formatDateTime(iso: string | null | undefined, withSeconds = false): string {
  if (!iso) return INVALID_FALLBACK
  const p = extractParts(iso)
  if (!p) return INVALID_FALLBACK
  const time = withSeconds ? `${p.hour}:${p.minute}:${p.second}` : `${p.hour}:${p.minute}`
  return `${p.year}-${p.month}-${p.day} ${time}`
}

/** ISO 时间戳 → 北京时间 `YYYY-MM-DD`。无效输入返回 '—'。 */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return INVALID_FALLBACK
  const p = extractParts(iso)
  if (!p) return INVALID_FALLBACK
  return `${p.year}-${p.month}-${p.day}`
}

/** 毫秒 epoch → 北京时间 `HH:mm`。无效输入返回 '—'。 */
export function formatClock(epochMs: number): string {
  const p = extractParts(new Date(epochMs))
  if (!p) return INVALID_FALLBACK
  return `${p.hour}:${p.minute}`
}
