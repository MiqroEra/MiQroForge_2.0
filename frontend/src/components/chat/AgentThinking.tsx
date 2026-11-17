/**
 * components/chat/AgentThinking.tsx — Agent 思考中动画指示器
 */

import { memo } from 'react'
import { useT, type DictKey } from '../../lib/i18n'

interface AgentThinkingProps {
  status: 'planning' | 'generating_yaml' | 'generating_node' | 'thinking'
}

const STATUS_KEYS: Record<AgentThinkingProps['status'], DictKey> = {
  planning: 'chat.thinkingPlanning',
  generating_yaml: 'chat.thinkingYaml',
  generating_node: 'chat.thinkingNode',
  thinking: 'chat.thinking',
}

export const AgentThinking = memo(({ status }: AgentThinkingProps) => {
  const { t } = useT()
  const label = t(STATUS_KEYS[status] ?? 'chat.thinkingDefault')

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-mf-hover/50 text-mf-text-muted text-xs max-w-xs">
      {/* 跳动的三个点 */}
      <div className="flex items-center gap-0.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400"
            style={{
              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
      <span>{label}</span>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  )
})
AgentThinking.displayName = 'AgentThinking'
