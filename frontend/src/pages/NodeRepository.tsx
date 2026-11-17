import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Eye, EyeOff, ChevronDown, ChevronRight, Save, FolderOpen } from 'lucide-react'
import { useNodeCatalog } from '../hooks/useNodeCatalog'
import { buildSemanticGroups, useNodeCatalogStore } from '../stores/node-catalog-store'
import { resolveLabel, semanticIcon, semanticLabel } from '../lib/semantic-labels'
import { useT } from '../lib/i18n'
import {
  getNodePrefs,
  saveGlobalPrefs,
  getAllGlobalPrefs,
  classifyParams,
  onGlobalPrefsChange,
  isGlobalPrefsLoaded,
  getShowDeprecated,
  setShowDeprecated,
  type NodePreference,
  type ParamVisibility,
} from '../lib/node-preferences'
import type { NodeSummaryResponse, OnBoardParamResponse } from '../types/index-types'

// Import settings store so theme is applied
import '../stores/settings-store'

// ─── API helpers ─────────────────────────────────────────────────────────────

async function fetchNodeDetail(name: string) {
  const res = await fetch(`/api/v1/nodes/${encodeURIComponent(name)}`)
  if (!res.ok) return null
  return res.json()
}

// ─── Node preference editor ─────────────────────────────────────────────────

function ParamPrefRow({
  param,
  visibility,
  onToggle,
}: {
  param: OnBoardParamResponse
  visibility: ParamVisibility
  onToggle: (name: string, next: ParamVisibility) => void
}) {
  const { t } = useT()
  const icon =
    visibility === 'hidden' ? <EyeOff size={12} className="text-red-400" /> :
    visibility === 'collapsed' ? <ChevronDown size={12} className="text-yellow-400" /> :
    <Eye size={12} className="text-green-400" />

  const next: ParamVisibility =
    visibility === 'visible' ? 'collapsed' :
    visibility === 'collapsed' ? 'hidden' : 'visible'

  const label =
    visibility === 'visible' ? t('repository.visVisible') :
    visibility === 'collapsed' ? t('repository.visCollapsed') : t('repository.visHidden')

  return (
    <div className="flex items-center justify-between px-3 py-1.5 hover:bg-mf-hover/30 transition-colors">
      <div className="min-w-0 flex items-center gap-2">
        <span className="text-xs font-mono text-mf-text-primary truncate">{param.name}</span>
        <span className="text-[10px] text-mf-text-muted">{param.kind}</span>
      </div>
      <button
        onClick={() => onToggle(param.name, next)}
        className="flex items-center gap-1 text-[10px] text-mf-text-muted hover:text-mf-text-primary transition-colors"
        title={t('repository.visHint', { label })}
      >
        {icon}
        <span>{label}</span>
      </button>
    </div>
  )
}

function NodePrefEditor({
  nodeName,
  params,
  onSave,
}: {
  nodeName: string
  params: OnBoardParamResponse[]
  onSave: (nodeName: string, pref: NodePreference) => void
}) {
  const [pref, setPref] = useState<NodePreference>(() => getNodePrefs(nodeName))
  const [dirty, setDirty] = useState(false)
  const { t } = useT()

  // Re-read prefs when global prefs load or change
  useEffect(() => {
    // If global prefs already loaded (e.g. from CanvasLayout startup), read now
    if (isGlobalPrefsLoaded()) {
      setPref(getNodePrefs(nodeName))
    }
    return onGlobalPrefsChange(() => {
      setPref(getNodePrefs(nodeName))
      setDirty(false)
    })
  }, [nodeName])

  const handleToggle = useCallback((paramName: string, next: ParamVisibility) => {
    setPref((prev) => {
      const nextPref: NodePreference = {
        collapsedParams: prev.collapsedParams.filter((n) => n !== paramName),
        hiddenParams: prev.hiddenParams.filter((n) => n !== paramName),
      }
      if (next === 'collapsed') nextPref.collapsedParams.push(paramName)
      else if (next === 'hidden') nextPref.hiddenParams.push(paramName)
      return nextPref
    })
    setDirty(true)
  }, [])

  const visibility = classifyParams(params.map((p) => p.name), pref)

  return (
    <div className="border-t border-mf-border/40">
      <div className="flex items-center justify-between px-3 py-1.5 bg-mf-hover/20">
        <span className="text-[10px] text-mf-text-muted uppercase tracking-wide">{t('repository.paramVisibility')}</span>
        {dirty && (
          <button
            onClick={() => { onSave(nodeName, pref); setDirty(false) }}
            className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Save size={10} /> {t('repository.saveGlobal')}
          </button>
        )}
      </div>
      {params.map((p) => (
        <ParamPrefRow
          key={p.name}
          param={p}
          visibility={visibility[p.name] ?? 'visible'}
          onToggle={handleToggle}
        />
      ))}
    </div>
  )
}

// ─── Node row ────────────────────────────────────────────────────────────────

function NodeRow({ node }: { node: NodeSummaryResponse }) {
  const { t, language } = useT()
  const [expanded, setExpanded] = useState(false)
  const [detail, setDetail] = useState<{ onboard_inputs: OnBoardParamResponse[] } | null>(null)

  const handleExpand = async () => {
    if (!expanded && !detail) {
      const d = await fetchNodeDetail(node.name)
      if (d) setDetail(d)
    }
    setExpanded(!expanded)
  }

  const handleSave = async (_nodeName: string, pref: NodePreference) => {
    // Merge with existing global prefs and save
    const all = getAllGlobalPrefs()
    all[node.name] = pref
    await saveGlobalPrefs(all)
  }

  const description =
    language === 'zh' && node.description_zh ? node.description_zh : node.description

  return (
    <div className="border-b border-mf-border/30 last:border-b-0">
      <div
        onClick={handleExpand}
        className="flex items-center justify-between px-4 py-2 hover:bg-mf-hover/30 cursor-pointer transition-colors"
        title={description}
      >
        <div className="min-w-0 flex items-center gap-2">
          <span className="text-xs font-medium text-mf-text-primary truncate">
            {language === 'zh' && node.display_name_zh ? node.display_name_zh : node.display_name}
          </span>
          {node.deprecated && (
            <span className="text-[9px] px-1 py-0.5 rounded bg-yellow-900/40 text-yellow-400 border border-yellow-700/40">
              {t('repository.deprecated')}
            </span>
          )}
          {node.software && (
            <span className="text-[10px] text-mf-text-muted font-mono">{node.software}</span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[10px] text-mf-text-muted">
            {t('repository.paramCount', { count: node.onboard_inputs_count })}
          </span>
          <span className="text-mf-text-muted">
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>
        </div>
      </div>
      {expanded && detail && (
        <NodePrefEditor
          nodeName={node.name}
          params={detail.onboard_inputs}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

// ─── Semantic group card ─────────────────────────────────────────────────────

function GroupCard({
  semanticType,
  icon,
  nodes,
}: {
  semanticType: string
  icon: string
  nodes: NodeSummaryResponse[]
}) {
  const { t } = useT()
  const [expanded, setExpanded] = useState(false)

  const label =
    semanticType === '__other__'
      ? t('labels.other')
      : resolveLabel(semanticLabel(semanticType), t)

  return (
    <div className="rounded-lg border border-mf-border bg-mf-panel overflow-hidden">
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between px-4 py-3 bg-mf-hover/30 cursor-pointer hover:bg-mf-hover/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span className="text-sm font-semibold text-mf-text-primary">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-mf-text-muted">
            {nodes.length === 1
              ? t('repository.nodeOne', { count: nodes.length })
              : t('repository.nodeMany', { count: nodes.length })}
          </span>
          {expanded ? <ChevronDown size={14} className="text-mf-text-muted" /> : <ChevronRight size={14} className="text-mf-text-muted" />}
        </div>
      </div>
      {expanded && (
        <div>
          {nodes.map((n) => (
            <NodeRow key={n.name} node={n} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function NodeRepository() {
  const { t } = useT()
  const { isLoading } = useNodeCatalog()
  const [showDeprecated, setShowDeprecatedState] = useState(() => getShowDeprecated())
  const nodes = useNodeCatalogStore((s) => s.filteredNodes)

  useEffect(() => {
    document.title = t('repository.docTitle', { app: 'MiQroForge' })
  }, [t])

  // Sync with global prefs when they load
  useEffect(() => {
    return onGlobalPrefsChange(() => {
      setShowDeprecatedState(getShowDeprecated())
    })
  }, [])

  const handleToggleDeprecated = useCallback(async (checked: boolean) => {
    setShowDeprecatedState(checked)
    await setShowDeprecated(checked)
  }, [])

  const visibleNodes = showDeprecated ? nodes : nodes.filter((n) => !n.deprecated)
  const groups = buildSemanticGroups(visibleNodes)

  return (
    <div className="min-h-screen bg-mf-base text-mf-text-primary">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-mf-panel border-b border-mf-border">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-4">
          <a
            href="/"
            className="flex items-center gap-1.5 text-xs text-mf-text-muted hover:text-mf-text-primary transition-colors"
          >
            <ArrowLeft size={14} />
            {t('repository.backToGallery')}
          </a>
          <div className="w-px h-5 bg-mf-border" />
          <a
            href="/node-repository/nodefiles"
            className="flex items-center gap-1.5 text-xs text-mf-text-muted hover:text-mf-text-primary transition-colors"
          >
            <FolderOpen size={13} />
            {t('repository.nodeFiles')}
          </a>
          <div className="w-px h-5 bg-mf-border" />
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="MiQroForge" className="h-5 w-auto" />
            <h1 className="text-sm font-semibold tracking-tight">{t('repository.title')}</h1>
          </div>
          <span className="text-[10px] text-mf-text-muted">{t('repository.preferenceTag')}</span>
          <div className="flex-1" />
          <label className="flex items-center gap-1.5 text-[11px] text-mf-text-muted cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showDeprecated}
              onChange={(e) => handleToggleDeprecated(e.target.checked)}
              className="rounded border-mf-border"
            />
            {t('repository.showDeprecated')}
          </label>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6">
        {/* Intro */}
        <div className="mb-6 p-4 rounded-lg border border-mf-border bg-mf-panel">
          <h2 className="text-xs font-semibold text-mf-text-secondary uppercase tracking-wide mb-2">
            {t('repository.title')}
          </h2>
          <p className="text-[12px] text-mf-text-muted">
            {t('repository.introPre')}
            <strong className="text-mf-text-primary">{t('repository.introGlobal')}</strong>
            {t('repository.introPost')}
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="text-sm text-mf-text-muted animate-pulse py-8 text-center">{t('repository.loading')}</div>
        )}

        {/* Node groups */}
        <div className="grid gap-4">
          {groups.map((g) => (
            <GroupCard
              key={g.semanticType}
              semanticType={g.semanticType}
              icon={semanticIcon(g.semanticType)}
              nodes={g.nodes}
            />
          ))}
        </div>

        {groups.length === 0 && !isLoading && (
          <div className="text-sm text-mf-text-muted py-8 text-center">
            {t('repository.emptyPre')}
            <code className="text-blue-400">mf2 nodes reindex</code>
            {t('repository.emptyPost')}
          </div>
        )}
      </main>
    </div>
  )
}
