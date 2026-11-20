import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useT } from '../../lib/i18n'
import type { DictKey } from '../../lib/i18n'
import { usePageTitle } from '../../hooks/usePageTitle'

// Import settings store so theme is applied on this page too
import '../../stores/settings-store'

interface UnitEntry {
  symbol: string
  dimension: string
  to_si_factor: number
}

interface UnitsData {
  total_units: number
  total_dimensions: number
  dimensions: Record<string, UnitEntry[]>
}

const SI_LABELS: Record<string, DictKey> = {
  energy: 'docs.siEnergy',
  length: 'docs.siLength',
  pressure: 'docs.siPressure',
  temperature: 'docs.siTemperature',
  angle: 'docs.siAngle',
  force: 'docs.siForce',
  time: 'docs.siTime',
}

export function UnitsPage() {
  const { t } = useT()
  const [data, setData] = useState<UnitsData | null>(null)
  const [error, setError] = useState<string | null>(null)

  usePageTitle(t('docs.unitsTitle', { app: 'MiQroForge' }))

  useEffect(() => {
    fetch('/api/v1/nodes/units')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(setData)
      .catch((e) => setError(e.message))
  }, [])

  const sorted = data
    ? Object.entries(data.dimensions).sort(([a], [b]) => a.localeCompare(b))
    : []

  return (
    <div className="min-h-screen bg-mf-base text-mf-text-primary">
      {/* Page header */}
      <header className="sticky top-0 z-10 bg-mf-panel border-b border-mf-border">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-4">
          <a
            href="/"
            className="flex items-center gap-1.5 text-xs text-mf-text-muted hover:text-mf-text-primary transition-colors"
          >
            <ArrowLeft size={14} />
            {t('docs.backToCanvas')}
          </a>
          <div className="w-px h-5 bg-mf-border" />
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="MiQroForge" className="h-5 w-auto" />
            <h1 className="text-sm font-semibold tracking-tight">{t('docs.unitsReference')}</h1>
          </div>
          {data && (
            <span className="ml-auto text-[11px] text-mf-text-muted">
              {t('docs.unitsStats', { total: data.total_units, dims: data.total_dimensions })}
            </span>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6">
        {/* Intro */}
        <div className="mb-6 p-4 rounded-lg border border-mf-border bg-mf-panel">
          <h2 className="text-xs font-semibold text-mf-text-secondary uppercase tracking-wide mb-2">
            {t('docs.connRules')}
          </h2>
          <ul className="text-[12px] text-mf-text-muted space-y-1 list-disc list-inside">
            <li>
              {t('docs.rulesDimPre')}<strong className="text-mf-text-primary">{t('docs.rulesDimension')}</strong>
              {t('docs.rulesDimMid')}<code className="text-blue-400">energy</code>
              {t('docs.rulesDimShape')}<strong className="text-mf-text-primary">{t('docs.rulesShape')}</strong>
              {t('docs.rulesDimMid')}<code className="text-blue-400">scalar</code>
              {t('docs.rulesDimEnd')}
            </li>
            <li>
              {t('docs.rulesAutoPre')}<strong className="text-mf-text-primary">{t('docs.rulesAutoConverted')}</strong>
              {t('docs.rulesAutoEnd')}
            </li>
            <li>
              {t('docs.rulesDiffPre')}<code className="text-blue-400">energy</code>
              {t('docs.rulesDiffMid')}<code className="text-blue-400">length</code>
              {t('docs.rulesDiffEnd')}
            </li>
          </ul>
        </div>

        {/* Error */}
        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-6">
            {t('docs.unitsLoadFailed', { error })}
          </div>
        )}

        {/* Loading */}
        {!data && !error && (
          <div className="text-sm text-mf-text-muted animate-pulse py-8 text-center">{t('docs.unitsLoading')}</div>
        )}

        {/* Dimension cards grid */}
        {data && (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
            {sorted.map(([dimension, units]) => (
              <DimensionCard key={dimension} dimension={dimension} units={units} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}


function DimensionCard({ dimension, units }: { dimension: string; units: UnitEntry[] }) {
  const { t } = useT()
  const siKey = SI_LABELS[dimension]
  const siLabel = siKey !== undefined ? t(siKey) : '?'

  return (
    <div className="rounded-lg border border-mf-border bg-mf-panel overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-mf-hover/40 border-b border-mf-border">
        <span className="text-[13px] font-semibold text-mf-text-primary capitalize">{dimension}</span>
        <span className="text-[11px] text-mf-text-muted">{t('docs.siPrefix', { label: siLabel })}</span>
      </div>
      {/* Unit rows */}
      <table className="w-full text-[12px]">
        <thead>
          <tr className="text-mf-text-muted border-b border-mf-border">
            <th className="text-left px-4 py-1.5 font-medium">{t('docs.colSymbol')}</th>
            <th className="text-right px-4 py-1.5 font-medium">{t('docs.colToSiFactor')}</th>
          </tr>
        </thead>
        <tbody>
          {units.map((u, i) => (
            <tr
              key={u.symbol}
              className={`hover:bg-mf-hover/30 ${i < units.length - 1 ? 'border-b border-mf-border/40' : ''}`}
            >
              <td className="px-4 py-1.5 font-mono text-mf-text-primary">{u.symbol}</td>
              <td className="px-4 py-1.5 text-right font-mono text-mf-text-muted">{formatFactor(u.to_si_factor)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


function formatFactor(f: number): string {
  if (f === 1) return '1'
  if (f < 0.01 || f > 1e6) return f.toExponential(3)
  return f.toPrecision(4)
}
