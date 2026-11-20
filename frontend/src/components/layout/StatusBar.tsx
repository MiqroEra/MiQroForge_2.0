import React from 'react'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { useWorkflowStore } from '../../stores/workflow-store'
import { useUIStore } from '../../stores/ui-store'
import { useRunOverlayStore } from '../../stores/run-overlay-store'
import { useT } from '../../lib/i18n'
import type { RunPhase } from '../../types/index-types'
import { phaseEmoji, phaseLabel } from '../../lib/phase-utils'

// ─── StatusBar ────────────────────────────────────────────────────────────────

export function StatusBar() {
  const { nodes, edges, validationResult } = useWorkflowStore()
  const { notification, clearNotification } = useUIStore()
  const { activeRunName, workflowPhase, clearOverlay } = useRunOverlayStore()
  const { t } = useT()

  React.useEffect(() => {
    if (!notification) return
    if (notification.type !== 'success') return
    const t = setTimeout(clearNotification, 4000)
    return () => clearTimeout(t)
  }, [notification, clearNotification])

  const runPhaseEmoji = workflowPhase ? phaseEmoji(workflowPhase as RunPhase) : '⏳'

  return (
    <div className="h-6 flex items-center px-3 bg-mf-panel border-t border-mf-border text-[11px] text-mf-text-muted gap-4 flex-shrink-0">
      <span>{nodes.length} {nodes.length === 1 ? t('topbar.nodeUnit') : t('topbar.nodeUnits')}</span>
      <span>{edges.length} {edges.length === 1 ? t('topbar.connUnit') : t('topbar.connUnits')}</span>

      {validationResult && (
        <span className={validationResult.valid ? 'text-green-500' : 'text-red-500'}>
          {validationResult.valid ? t('topbar.valid') : t('topbar.errors', { count: validationResult.errors.length })}
        </span>
      )}

      {/* Active run indicator */}
      {activeRunName && (
        <span className="flex items-center gap-1.5 text-[11px]">
          <span className={
            workflowPhase === 'Succeeded' ? 'text-green-400' :
            workflowPhase === 'PartialSuccess' ? 'text-orange-300' :
            workflowPhase === 'Failed' || workflowPhase === 'Error' ? 'text-red-400' :
            'text-blue-400'
          }>
            {runPhaseEmoji} {activeRunName}
            {workflowPhase && ` (${phaseLabel(workflowPhase, t)})`}
          </span>
          <button
            onClick={clearOverlay}
            className="text-mf-text-muted hover:text-mf-text-primary ml-0.5"
            title={t('topbar.clearRunOverlay')}
          >
            ✕
          </button>
        </span>
      )}

      <div className="flex-1" />

      {notification && (
        <span
          className={`flex items-center gap-1 cursor-pointer max-w-xs truncate ${
            notification.type === 'success' ? 'text-green-400' :
            notification.type === 'error' ? 'text-red-400' :
            'text-blue-400'
          }`}
          title={notification.message}
          onClick={clearNotification}
        >
          {notification.type === 'success' && <CheckCircle size={11} className="flex-shrink-0" />}
          {notification.type === 'error' && <AlertCircle size={11} className="flex-shrink-0" />}
          <span className="truncate">{notification.message}</span>
          {notification.type !== 'success' && (
            <span className="flex-shrink-0 ml-0.5 text-mf-text-muted hover:text-mf-text-secondary">✕</span>
          )}
        </span>
      )}
    </div>
  )
}
