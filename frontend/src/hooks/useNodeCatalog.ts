import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { nodesApi } from '../api/nodes-api'
import { useNodeCatalogStore } from '../stores/node-catalog-store'
import { useWorkflowStore, refreshFormalNodeSpecs } from '../stores/workflow-store'
import { clearNodeDetailCache } from '../lib/node-spec-refresh'

export function useNodeCatalog() {
  const { setNodes, setLoading, setError } = useNodeCatalogStore()
  const [isReindexing, setIsReindexing] = useState(false)

  const query = useQuery({
    queryKey: ['nodes'],
    queryFn: () => nodesApi.list(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })

  const reindexMutation = useMutation({
    mutationFn: () => nodesApi.reindex(),
    onSuccess: () => {
      clearNodeDetailCache()
      query.refetch()
      const { nodes } = useWorkflowStore.getState()
      if (nodes.length > 0) void refreshFormalNodeSpecs(nodes)
    },
    onSettled: () => {
      setIsReindexing(false)
    },
  })

  const refreshWithReindex = useCallback(() => {
    setIsReindexing(true)
    reindexMutation.mutate()
  }, [reindexMutation])

  useEffect(() => {
    setLoading(query.isLoading || isReindexing)
  }, [query.isLoading, isReindexing, setLoading])

  useEffect(() => {
    if (query.data) setNodes(query.data.nodes)
  }, [query.data, setNodes])

  useEffect(() => {
    if (query.error) setError(String(query.error))
  }, [query.error, setError])

  return {
    isLoading: query.isLoading || isReindexing,
    isError: query.isError,
    error: query.error,
    refreshWithReindex,
    isReindexing,
  }
}
