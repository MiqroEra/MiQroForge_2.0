import { useState, useEffect, useCallback, useRef, type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Package, BookOpen, Ruler, ExternalLink, Settings, Trash2, Brain, X, FolderOpen, LogOut, User, Shield } from 'lucide-react'
import { getStoredUser, clearToken } from '../lib/auth'
import { useT, translate, type DictKey } from '../lib/i18n'
import { usePageTitle } from '../hooks/usePageTitle'
import { useSettingsStore } from '../stores/settings-store'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { ProjectCard } from '../components/gallery/ProjectCard'
import { projectsApi } from '../api/projects-api'
import type { ProjectMeta } from '../api/projects-api'
import { localizeDemoCanvas } from '../lib/demo-localize'
import { SettingsContent } from '../components/settings/SettingsPanel'

// ─── Migration from old localStorage keys ─────────────────────────────────────

const OLD_KEYS = ['mf-canvas-v1', 'mf-agent-v1', 'mf2:saved-workflows', 'mf2:run-snapshots']

async function tryMigrateOldData(): Promise<boolean> {
  const hasOldKeys = OLD_KEYS.some((k) => localStorage.getItem(k) !== null)
  if (!hasOldKeys) return false

  // Check that there are no existing projects
  let existing: ProjectMeta[] = []
  try {
    const resp = await projectsApi.list()
    existing = resp.projects
  } catch { return false }
  if (existing.length > 0) {
    // Projects already exist — just clean up old keys
    for (const key of OLD_KEYS) localStorage.removeItem(key)
    return false
  }

  // Capture old data then immediately clean keys (prevents duplicate migration)
  const canvasRaw = localStorage.getItem('mf-canvas-v1')
  const agentRaw = localStorage.getItem('mf-agent-v1')
  for (const key of OLD_KEYS) localStorage.removeItem(key)

  // Create a migrated project
  const meta = await projectsApi.create({
    name: translate(useSettingsStore.getState().language, 'gallery.migratedName'),
    description: translate(useSettingsStore.getState().language, 'gallery.migratedDescription'),
  })

  // Upload canvas data
  if (canvasRaw) {
    try {
      const parsed = JSON.parse(canvasRaw)
      await projectsApi.saveCanvas(meta.id, {
        meta: parsed.meta || {},
        nodes: parsed.nodes || [],
        edges: parsed.edges || [],
      })
    } catch { /* ignore parse errors */ }
  }

  // Migrate agent messages as a conversation
  if (agentRaw) {
    try {
      const agentData = JSON.parse(agentRaw)
      if (agentData.messages?.length > 0) {
        const conv = await projectsApi.createConversation(meta.id, translate(useSettingsStore.getState().language, 'gallery.migratedChat'))
        await fetch(`/api/v1/projects/${meta.id}/conversations/${conv.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: agentData.messages }),
        })
      }
    } catch { /* ignore */ }
  }

  return true
}

// ─── Ref dropdown ────────────────────────────────────────────────────────────

const REF_PAGES: { path: string; icon: ReactElement; labelKey: DictKey }[] = [
  { path: '/ref/shared-params', icon: <BookOpen size={13} />, labelKey: 'gallery.refSharedParams' },
  { path: '/ref/units', icon: <Ruler size={13} />, labelKey: 'gallery.refUnits' },
]

function RefDropdown() {
  const { t } = useT()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-mf-border rounded-md transition-colors ${
          open
            ? 'bg-blue-600 text-white border-blue-600'
            : 'text-mf-text-secondary hover:text-mf-text-primary hover:bg-mf-hover'
        }`}
      >
        <BookOpen size={14} /> {t('gallery.refs')}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-mf-panel border border-mf-border rounded-md shadow-lg z-50 py-1">
          {REF_PAGES.map((page) => (
            <a
              key={page.path}
              href={page.path}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-mf-text-secondary hover:text-mf-text-primary hover:bg-mf-hover transition-colors"
            >
              {page.icon}
              {t(page.labelKey)}
              <ExternalLink size={10} className="ml-auto text-mf-text-muted" />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Node Repository dropdown ─────────────────────────────────────────────────

const NODE_REPO_PAGES: { path: string; icon: ReactElement; labelKey: DictKey }[] = [
  { path: '/node-repository/preference', icon: <Settings size={13} />, labelKey: 'gallery.repoPreferences' },
  { path: '/node-repository/nodefiles', icon: <FolderOpen size={13} />, labelKey: 'gallery.repoNodeFiles' },
]

function NodeRepoDropdown() {
  const { t } = useT()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-mf-border rounded-md transition-colors ${
          open
            ? 'bg-blue-600 text-white border-blue-600'
            : 'text-mf-text-secondary hover:text-mf-text-primary hover:bg-mf-hover'
        }`}
      >
        <Package size={14} /> {t('gallery.nodeRepository')}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-mf-panel border border-mf-border rounded-md shadow-lg z-50 py-1">
          {NODE_REPO_PAGES.map((page) => (
            <a
              key={page.path}
              href={page.path}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-mf-text-secondary hover:text-mf-text-primary hover:bg-mf-hover transition-colors"
            >
              {page.icon}
              {t(page.labelKey)}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Gallery page ─────────────────────────────────────────────────────────────

export function ProjectGallery() {
  const { t } = useT()
  usePageTitle(t('gallery.pageTitle', { app: 'MiQroForge' }))
  const navigate = useNavigate()
  const [projects, setProjects] = useState<ProjectMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [migrated, setMigrated] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [settingsOpen, setSettingsOpen] = useState(false)
  const storedUser = getStoredUser()

  const dndSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const fetchProjects = useCallback(async () => {
    try {
      const resp = await projectsApi.list()
      setProjects(resp.projects)
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const didMigrate = await tryMigrateOldData()
        if (didMigrate) setMigrated(true)
      } catch { /* migration is best-effort */ }
      await fetchProjects()
    })()
  }, [fetchProjects])

  const handleCreate = async () => {
    try {
      const meta = await projectsApi.create({ name: t('gallery.untitledProject') })
      navigate(`/project/${meta.id}`)
    } catch { /* ignore */ }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('gallery.confirmDelete'))) return
    try {
      await projectsApi.delete(id)
      setProjects((prev) => prev.filter((p) => p.id !== id))
    } catch { /* ignore */ }
  }

  const handleDuplicate = async (id: string) => {
    try {
      const proj = projects.find((p) => p.id === id)
      if (proj?.readonly) {
        const canvas = await projectsApi.getCanvas(id)
        const lang = useSettingsStore.getState().language
        const meta = await projectsApi.create({
          name: translate(lang, 'gallery.demoName'),
          description: translate(lang, 'gallery.demoDescription'),
          icon: proj.icon || '✨',
        })
        await projectsApi.saveCanvas(meta.id, localizeDemoCanvas(canvas))
        setProjects((prev) => [meta, ...prev])
        return
      }
      const meta = await projectsApi.duplicate(id)
      setProjects((prev) => [meta, ...prev])
    } catch { /* ignore */ }
  }

  const handleRename = async (id: string, name: string) => {
    try {
      const meta = await projectsApi.update(id, { name })
      setProjects((prev) => prev.map((p) => (p.id === id ? meta : p)))
    } catch { /* ignore */ }
  }

  const handleIconChange = async (id: string, icon: string) => {
    // Optimistic update
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, icon } : p)))
    try {
      await projectsApi.update(id, { icon })
    } catch { /* ignore */ }
  }

  const handleDescriptionChange = async (id: string, description: string) => {
    // Optimistic update
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, description } : p)))
    try {
      await projectsApi.update(id, { description })
    } catch { /* ignore */ }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = projects.findIndex((p) => p.id === active.id)
    const newIndex = projects.findIndex((p) => p.id === over.id)
    const newOrder = arrayMove(projects, oldIndex, newIndex)
    setProjects(newOrder)
    try {
      await projectsApi.reorder(newOrder.map((p) => p.id))
    } catch { /* ignore */ }
  }

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(t('gallery.confirmBatchDelete', { count: selectedIds.size }))) return
    const ids = Array.from(selectedIds)
    try {
      await projectsApi.batchDelete(ids)
      setProjects((prev) => prev.filter((p) => !selectedIds.has(p.id)))
      setSelectedIds(new Set())
    } catch { /* ignore */ }
  }

  return (
    <div className="min-h-screen bg-mf-base flex flex-col">
      {/* Header */}
      <div className="flex items-center h-14 px-6 border-b border-mf-border bg-mf-panel">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="MiQroForge" className="h-7 w-auto" />
          <span className="text-base font-bold text-mf-text-primary tracking-tight">MiQroForge</span>
          <span className="text-[10px] text-mf-text-muted border border-mf-border rounded px-1">2.0</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          {/* User */}
          <span className="flex items-center gap-1 text-[11px] text-mf-text-muted">
            <User size={12} />
            {storedUser?.username ?? t('gallery.defaultUser')}
          </span>
          <button
            title={t('gallery.logoutTitle')}
            onClick={() => { clearToken(); navigate('/login') }}
            className="flex items-center gap-1 px-2 py-1 text-[11px] text-mf-text-muted
                       hover:text-red-400 hover:bg-mf-hover rounded transition-colors border border-transparent hover:border-red-800/40"
          >
            <LogOut size={11} /> {t('gallery.logout')}
          </button>
          <div className="w-px h-4 bg-mf-border" />
          <RefDropdown />
        <a
          href="/memory"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-400 hover:text-purple-300 border border-purple-800/40 rounded-md hover:bg-purple-900/20 transition-colors"
        >
          <Brain size={14} /> {t('gallery.memory')}
        </a>
        {storedUser?.role === 'admin' && (
          <a
            href="/admin/usage"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-yellow-400 hover:text-yellow-300 border border-yellow-600/40 rounded-md hover:bg-yellow-900/20 transition-colors"
          >
            <Shield size={14} /> {t('gallery.admin')}
          </a>
        )}
        <NodeRepoDropdown />
        <button
          onClick={() => setSettingsOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-mf-text-secondary hover:text-mf-text-primary border border-mf-border rounded-md hover:bg-mf-hover transition-colors"
        >
          <Settings size={14} /> {t('gallery.settings')}
        </button>
        <button
          onClick={() => { setEditMode(!editMode); setSelectedIds(new Set()) }}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-md transition-colors ${
            editMode
              ? 'bg-blue-600 text-white border-blue-600'
              : 'text-mf-text-secondary hover:text-mf-text-primary border-mf-border hover:bg-mf-hover'
          }`}
        >
          {editMode ? t('gallery.done') : t('gallery.edit')}
        </button>
        <button
          onClick={handleCreate}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors"
        >
          <Plus size={14} /> {t('gallery.newProject')}
        </button>
        </div>
      </div>

      {/* Migration banner */}
      {migrated && (
        <div className="mx-6 mt-4 px-4 py-2.5 bg-blue-900/30 border border-blue-500/30 rounded-md text-xs text-blue-300">
          {t('gallery.migrationBanner', { name: t('gallery.migratedName') })}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-mf-text-muted text-sm">
            {t('gallery.loadingProjects')}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-16 h-16 rounded-full bg-mf-panel border border-mf-border flex items-center justify-center">
              <Plus size={24} className="text-mf-text-muted" />
            </div>
            <p className="text-sm text-mf-text-muted">{t('gallery.noProjects')}</p>
            <button
              onClick={handleCreate}
              className="text-sm text-blue-400 hover:text-blue-300 font-medium"
            >
              {t('gallery.createFirst')}
            </button>
          </div>
        ) : (
          <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={projects.map((p) => p.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {projects.map((p) => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    onOpen={() => navigate(`/project/${p.id}`)}
                    onRename={(name) => handleRename(p.id, name)}
                    onIconChange={(icon) => handleIconChange(p.id, icon)}
                    onDescriptionChange={(desc) => handleDescriptionChange(p.id, desc)}
                    onDuplicate={() => handleDuplicate(p.id)}
                    onDelete={() => handleDelete(p.id)}
                    editMode={editMode}
                    selected={selectedIds.has(p.id)}
                    onSelect={(checked) => toggleSelect(p.id, checked)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
        {/* Batch delete bar */}
        {editMode && selectedIds.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-mf-card border border-mf-border rounded-lg shadow-xl px-4 py-2.5 flex items-center gap-3 z-50">
            <span className="text-xs text-mf-text-secondary">
              {t('gallery.selectedCount', { count: selectedIds.size })}
            </span>
            <button
              onClick={handleBatchDelete}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-red-400 hover:text-red-300 bg-red-900/30 hover:bg-red-900/50 border border-red-700/50 rounded transition-colors"
            >
              <Trash2 size={12} /> {t('gallery.deleteSelected')}
            </button>
          </div>
        )}
      </div>

      {/* Settings modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSettingsOpen(false)} />
          <div className="relative bg-mf-panel border border-mf-border rounded-lg shadow-2xl w-80 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-mf-border flex-shrink-0">
              <span className="text-xs font-semibold text-mf-text-secondary uppercase tracking-wide">
                {t('gallery.settings')}
              </span>
              <button
                onClick={() => setSettingsOpen(false)}
                className="text-mf-text-muted hover:text-mf-text-primary"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto mf-scroll p-4">
              <SettingsContent />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
