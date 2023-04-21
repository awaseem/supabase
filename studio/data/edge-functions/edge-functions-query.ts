import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { get } from 'lib/common/fetch'
import { API_ADMIN_URL } from 'lib/constants'
import { useCallback } from 'react'
import { edgeFunctionsKeys } from './keys'

export type EdgeFunctionsVariables = { projectRef?: string }

export type EdgeFunctionsResponse = {
  id: string
  name: string
  slug: string
  status: string
  version: number
  created_at: number
  updated_at: number
  verify_jwt: boolean
  import_map: boolean
}

export async function getEdgeFunctions(
  { projectRef }: EdgeFunctionsVariables,
  signal?: AbortSignal
) {
  if (!projectRef) throw new Error('projectRef is required')

  console.log('getEdgeFunctions', {
    API_ADMIN_URL,
    endpoint: `${API_ADMIN_URL}/projects/${projectRef}/functions`,
  })
  const response = await get(`${API_ADMIN_URL}/projects/${projectRef}/functions`, {
    signal,
  })
  if (response.error) throw response.error
  return response as EdgeFunctionsResponse[]
}

export type EdgeFunctionsData = Awaited<ReturnType<typeof getEdgeFunctions>>
export type EdgeFunctionsError = unknown

export const useEdgeFunctionsQuery = <TData = EdgeFunctionsData>(
  { projectRef }: EdgeFunctionsVariables,
  { enabled = true, ...options }: UseQueryOptions<EdgeFunctionsData, EdgeFunctionsError, TData> = {}
) =>
  useQuery<EdgeFunctionsData, EdgeFunctionsError, TData>(
    edgeFunctionsKeys.list(projectRef),
    ({ signal }) => getEdgeFunctions({ projectRef }, signal),
    { enabled: enabled && typeof projectRef !== 'undefined', ...options }
  )

export const useEdgeFunctionsPrefetch = ({ projectRef }: EdgeFunctionsVariables) => {
  const client = useQueryClient()

  return useCallback(() => {
    if (projectRef) {
      client.prefetchQuery(edgeFunctionsKeys.list(projectRef), ({ signal }) =>
        getEdgeFunctions({ projectRef }, signal)
      )
    }
  }, [projectRef])
}
