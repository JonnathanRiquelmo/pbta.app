import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('notes.service bypass', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_TEST_BYPASS_AUTH', 'true')
    localStorage.clear()
    vi.resetModules()
  })

  it('create, update and delete note in bypass store', async () => {
    const { createNote, updateNote, deleteNote } = await import('../notes.service')

    const id = await createNote({ ownerUid: 'player-uid', type: 'global', title: 't', content: 'c' })
    expect(typeof id).toBe('string')

    const raw = localStorage.getItem('bypass:notes')
    expect(raw).toBeTruthy()
    const items = JSON.parse(raw as string)
    expect(items.length).toBe(1)
    expect(items[0].id).toBe(id)

    await updateNote(id, { title: 't2' })
    const raw2 = localStorage.getItem('bypass:notes')
    const items2 = JSON.parse(raw2 as string)
    expect(items2[0].title).toBe('t2')

    await deleteNote(id)
    const raw3 = localStorage.getItem('bypass:notes')
    const items3 = JSON.parse(raw3 as string)
    expect(items3.length).toBe(0)
  })
})