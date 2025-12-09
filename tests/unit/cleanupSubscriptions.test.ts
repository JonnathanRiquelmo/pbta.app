import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAppStore } from '../../src/shared/store/appStore'

describe('cleanupSubscriptions', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAppStore.setState({
      unsubscribers: [],
      movesSubscription: null,
      movesSubscriptionCampaignId: null
    })
  })

  it('should call all unsubscribers and clear the list', () => {
    const unsub1 = vi.fn()
    const unsub2 = vi.fn()

    useAppStore.setState({
      unsubscribers: [unsub1, unsub2]
    })

    const { cleanupSubscriptions } = useAppStore.getState()
    cleanupSubscriptions()

    expect(unsub1).toHaveBeenCalledTimes(1)
    expect(unsub2).toHaveBeenCalledTimes(1)
    expect(useAppStore.getState().unsubscribers).toEqual([])
  })

  it('should call movesSubscription and clear it', () => {
    const movesUnsub = vi.fn()

    useAppStore.setState({
      movesSubscription: movesUnsub,
      movesSubscriptionCampaignId: 'campaign123'
    })

    const { cleanupSubscriptions } = useAppStore.getState()
    cleanupSubscriptions()

    expect(movesUnsub).toHaveBeenCalledTimes(1)
    expect(useAppStore.getState().movesSubscription).toBeNull()
    expect(useAppStore.getState().movesSubscriptionCampaignId).toBeNull()
  })

  it('should handle mixed subscriptions', () => {
    const unsub1 = vi.fn()
    const movesUnsub = vi.fn()

    useAppStore.setState({
      unsubscribers: [unsub1],
      movesSubscription: movesUnsub,
      movesSubscriptionCampaignId: 'campaign123'
    })

    const { cleanupSubscriptions } = useAppStore.getState()
    cleanupSubscriptions()

    expect(unsub1).toHaveBeenCalledTimes(1)
    expect(movesUnsub).toHaveBeenCalledTimes(1)
    expect(useAppStore.getState().unsubscribers).toEqual([])
    expect(useAppStore.getState().movesSubscription).toBeNull()
    expect(useAppStore.getState().movesSubscriptionCampaignId).toBeNull()
  })

  it('should not throw if there are no subscriptions', () => {
    const { cleanupSubscriptions } = useAppStore.getState()
    
    expect(() => cleanupSubscriptions()).not.toThrow()
    expect(useAppStore.getState().unsubscribers).toEqual([])
    expect(useAppStore.getState().movesSubscription).toBeNull()
  })
})
