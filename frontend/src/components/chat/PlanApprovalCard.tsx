/**
 * components/chat/PlanApprovalCard.tsx — 语义工作流审批卡片
 *
 * 显示 Planner 生成的语义工作流计划，提供：
 * - 查看计划详情
 * - 显示到 Canvas（生成 ❓ PendingNodes）
 * - 自动生成 YAML（触发 YAML Coder）
 */

import { memo, useState } from 'react'
import { GitBranch, Play, Eye, ChevronDown, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react'
import { useT } from '../../lib/i18n'
import type { SemanticWorkflow } from '../../types/semantic'

interface PlanApprovalCardProps {
  workflow: SemanticWorkflow
  onShowOnCanvas: (workflow: SemanticWorkflow) => void
  onAutoResolve: (workflow: SemanticWorkflow) => void
}

export const PlanApprovalCard = memo(({
  workflow,
  onShowOnCanvas,
  onAutoResolve,
}: PlanApprovalCardProps) => {
  const { t } = useT()
  const [expanded, setExpanded] = useState(false)

  const hasImplementations = workflow.steps.some(
    (s) => (workflow.available_implementations[s.id] ?? []).length > 0
  )

  return (
    <div className="border border-amber-800/50 rounded-lg bg-amber-950/20 overflow-hidden text-xs max-w-sm">
      {/* Header */}
      <div className="px-3 py-2 bg-amber-900/20 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <GitBranch size={13} className="text-amber-400 flex-shrink-0" />
          <span className="text-amber-200 font-medium truncate">
            {workflow.name || t('chat.workflowDefault')}
          </span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-amber-600 hover:text-amber-400 flex-shrink-0"
        >
          {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
        </button>
      </div>

      {/* Summary */}
      <div className="px-3 py-1.5 text-mf-text-muted">
        {workflow.description || t('chat.stepsCount', { count: workflow.steps.length })}
        {workflow.target_molecule && (
          <span className="ml-1 text-amber-600/80">— {workflow.target_molecule}</span>
        )}
      </div>

      {/* Steps (collapsed by default) */}
      {expanded && (
        <div className="border-t border-amber-800/30 px-3 py-2 space-y-2">
          {workflow.steps.map((step, i) => {
            const implementations = workflow.available_implementations[step.id] ?? []
            return (
              <div key={step.id} className="flex items-start gap-2">
                <span className="text-amber-700 font-mono w-4 flex-shrink-0">{i + 1}.</span>
                <div className="min-w-0">
                  <div className="text-amber-200 font-medium">{step.display_name}</div>
                  <div className="text-mf-text-muted font-mono text-[10px]">{step.semantic_type}</div>
                  {step.rationale && (
                    <div className="text-mf-text-muted mt-0.5 italic">{step.rationale}</div>
                  )}
                  {implementations.length > 0 ? (
                    <div className="flex items-center gap-1 mt-0.5">
                      <CheckCircle size={9} className="text-green-500" />
                      <span className="text-green-500/70 text-[10px]">
                        {implementations.join(', ')}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 mt-0.5">
                      <AlertCircle size={9} className="text-orange-500" />
                      <span className="text-orange-500/70 text-[10px]">{t('chat.noImplementation')}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {workflow.planner_notes && (
            <div className="text-mf-text-muted border-t border-amber-800/30 pt-1.5 mt-1.5 italic">
              💡 {workflow.planner_notes}
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="border-t border-amber-800/30 px-3 py-1.5 flex gap-2">
        <button
          onClick={() => onShowOnCanvas(workflow)}
          className="flex items-center gap-1 px-2 py-1 rounded text-amber-300 hover:text-amber-100 hover:bg-amber-900/30 transition-colors"
          title={t('chat.showOnCanvasTitle')}
        >
          <Eye size={11} />
          {t('chat.showOnCanvas')}
        </button>
        <button
          onClick={() => onAutoResolve(workflow)}
          disabled={!hasImplementations}
          className="flex items-center gap-1 px-2 py-1 rounded text-green-400 hover:text-green-200 hover:bg-green-900/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title={hasImplementations ? t('chat.autoResolveTitle') : t('chat.noImplementationTitle')}
        >
          <Play size={11} />
          {t('chat.autoResolve')}
        </button>
      </div>
    </div>
  )
})
PlanApprovalCard.displayName = 'PlanApprovalCard'
