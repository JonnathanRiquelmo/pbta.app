export type MovesSummary = {
  count: number
  loading: boolean
  error: Error | null
}

export function useMovesForMaster(): MovesSummary {
  return { count: 0, loading: false, error: null }
}