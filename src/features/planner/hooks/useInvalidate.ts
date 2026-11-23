import { useQueryClient, type QueryKey } from '@tanstack/react-query'

/** Returns a callback that invalidates every given query key prefix. */
export function useInvalidate(...keys: QueryKey[]) {
  const queryClient = useQueryClient()
  return () => Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })))
}
