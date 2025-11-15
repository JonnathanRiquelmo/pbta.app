import { describe, it, expect, afterEach, vi } from 'vitest'
import React from 'react'
import { render, screen, cleanup } from '@testing-library/react'

type UseModeFn = () => { isMaster: (email?: string) => boolean; mode: 'PLAYER' | 'MASTER' }

function makeProbe(useMode: UseModeFn) {
  function Probe({ email }: { email?: string }) {
    const { isMaster, mode } = useMode()
    const result = isMaster(email)
    return (
      <div>
        <span data-testid="isMaster">{String(result)}</span>
        <span data-testid="mode">{mode}</span>
      </div>
    )
  }
  return Probe
}

describe('ModeContext.isMaster', () => {
  afterEach(() => {
    cleanup()
    localStorage.clear()
  })

  it('retorna true para e-mail configurado como mestre', async () => {
    vi.resetModules()

    const modeMod = await import('../../contexts/ModeContext')
    const { ModeProvider, useMode } = modeMod
    const Probe = makeProbe(useMode as UseModeFn)

    const masterEnv = (import.meta as unknown as { env: Record<string, string | undefined> }).env
    const masterEmail = (masterEnv.VITE_MASTER_EMAIL ?? 'jonnathan.riquelmo@gmail.com').toLowerCase()

    render(
      <ModeProvider>
        <Probe email={masterEmail} />
      </ModeProvider>
    )

    expect(screen.getByTestId('isMaster').textContent).toBe('true')
  })

  it('retorna false para e-mail comum (não mestre)', async () => {
    vi.resetModules()

    const modeMod = await import('../../contexts/ModeContext')
    const { ModeProvider, useMode } = modeMod
    const Probe = makeProbe(useMode as UseModeFn)
    render(
      <ModeProvider>
        <Probe email={'player@example.com'} />
      </ModeProvider>
    )

    expect(screen.getByTestId('isMaster').textContent).toBe('false')
  })

  it('fallback sem parâmetro: modo PLAYER e isMaster false sem AuthProvider', async () => {
    vi.resetModules()
    const modeMod = await import('../../contexts/ModeContext')
    const { ModeProvider, useMode } = modeMod
    const Probe = makeProbe(useMode as UseModeFn)

    render(
      <ModeProvider>
        <Probe />
      </ModeProvider>
    )

    expect(screen.getByTestId('isMaster').textContent).toBe('false')
    expect(screen.getByTestId('mode').textContent).toBe('PLAYER')
  })

  it('fallback sem parâmetro: retorna false para usuário jogador', async () => {
    vi.resetModules()
    localStorage.setItem('testUserRole', 'player')

    const authMod = await import('../../contexts/AuthContext')
    const modeMod = await import('../../contexts/ModeContext')
    const { AuthProvider } = authMod
    const { ModeProvider, useMode } = modeMod
    const Probe = makeProbe(useMode as UseModeFn)

    render(
      <AuthProvider>
        <ModeProvider>
          <Probe />
        </ModeProvider>
      </AuthProvider>
    )

    await screen.findByText('PLAYER')
    expect(screen.getByTestId('isMaster').textContent).toBe('false')
    expect(screen.getByTestId('mode').textContent).toBe('PLAYER')
  })
})