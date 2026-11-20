import { useCallback } from 'react'
import { workflowsApi } from '../api/workflows-api'
import { useWorkflowStore } from '../stores/workflow-store'
import { useUIStore } from '../stores/ui-store'
import { useProjectStore } from '../stores/project-store'
import { rfStateToWorkflowDoc, workflowDocToYaml } from '../lib/workflow-serializer'
import { useT } from '../lib/i18n'
import type { ValidationResult } from '../types/workflow'

export function useWorkflowValidation() {
  const {
    nodes, edges, meta,
    setValidationResult, setIsValidating,
  } = useWorkflowStore()
  const { showNotification } = useUIStore()
  const { t } = useT()

  const getYaml = useCallback((): string => {
    const doc = rfStateToWorkflowDoc(nodes, edges, meta)
    return workflowDocToYaml(doc)
  }, [nodes, edges, meta])

  const validate = useCallback(async (): Promise<ValidationResult | null> => {
    if (nodes.length === 0) {
      showNotification('error', t('workflow.validationEmpty'))
      return null
    }

    setIsValidating(true)
    try {
      const mfYaml = getYaml()
      const projectId = useProjectStore.getState().currentProjectId ?? undefined
      const resp = await workflowsApi.validate(mfYaml, projectId)

      const result: ValidationResult = {
        valid: resp.valid,
        errors: (resp.errors ?? []).map((i) => ({
          severity: 'error',
          message: i.message,
          node_id: i.location || undefined,
        })),
        warnings: (resp.warnings ?? []).map((i) => ({
          severity: 'warning',
          message: i.message,
          node_id: i.location || undefined,
        })),
        infos: (resp.infos ?? []).map((i) => ({
          severity: 'info',
          message: i.message,
          node_id: i.location || undefined,
        })),
      }

      setValidationResult(result)

      if (result.valid) {
        showNotification('success', t('workflow.validationPassed', { count: result.warnings.length }))
      } else {
        showNotification('error', t('workflow.validationFailed', { count: result.errors.length }))
      }

      return result
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      showNotification('error', t('workflow.validationError', { msg }))
      return null
    } finally {
      setIsValidating(false)
    }
  }, [nodes, edges, getYaml, t, setIsValidating, setValidationResult, showNotification])

  return { validate, getYaml }
}
