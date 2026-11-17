import { translate } from './i18n'
import { useSettingsStore } from '../stores/settings-store'
import type { CanvasState } from '../api/projects-api'

export function demoNodeDescription(): string {
  return translate(useSettingsStore.getState().language, 'gallery.demoNodeDescription')
}

export function demoWorkflowMeta(): { name: string; description: string } {
  const lang = useSettingsStore.getState().language
  return {
    name: translate(lang, 'gallery.demoName'),
    description: translate(lang, 'gallery.demoDescription'),
  }
}

export function localizeDemoCanvas(canvas: CanvasState): CanvasState {
  return {
    meta: { ...canvas.meta, ...demoWorkflowMeta() },
    nodes: canvas.nodes.map((node) => {
      const data = (node.data ?? {}) as Record<string, unknown>
      const gen = data.node_generator as Record<string, unknown> | undefined
      if (!gen) return node
      return {
        ...node,
        data: {
          ...data,
          node_generator: { ...gen, description: demoNodeDescription() },
        },
      }
    }),
    edges: canvas.edges,
  }
}
