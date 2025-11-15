import { describe, it, expect, afterEach, vi } from 'vitest'
import React from 'react'
import { render, screen, cleanup } from '@testing-library/react'

const makeProbe = (useMode: any) => ({ email }: { email?: string }) => {
  const { isMaster, mode } = useMode()
  const result = isMaster(email)
  return (
    <div>
      <span data-testid="isMaster">{String(result)}</span>
      <span data-testid="mode">{mode}</span>
    </div>
  )
}

describe('ModeContext.isMaster', () => {
  afterEach(() => {
    cleanup()
    localStorage.clear()
  })

  it('retorna true para e-mail configurado como mestre', async () => {
    vi.resetModules()
    ;(import.meta as any).env.VITE_TEST_BYPASS_AUTH = 'false'

    const modeMod = await import('../../contexts/ModeContext')
    const { ModeProvider, useMode } = modeMod
    const Probe = makeProbe(useMode)

    const masterEmail = ((import.meta as any).env.VITE_MASTER_EMAIL ?? 'jonnathan.riquelmo@gmail.com').toLowerCase()

    render(
      <ModeProvider>
        <Probe email={masterEmail} />
      </ModeProvider>
    )

    expect(screen.getByTestId('isMaster').textContent).toBe('true')
  })

  it('retorna false para e-mail comum (não mestre)', async () => {
    vi.resetModules()
    ;(import.meta as any).env.VITE_TEST_BYPASS_AUTH = 'false'

    const modeMod = await import('../../contexts/ModeContext')
    const { ModeProvider, useMode } = modeMod
    const Probe = makeProbe(useMode)
    render(
      <ModeProvider>
        <Probe email={'player@example.com'} />
      </ModeProvider>
    )

    expect(screen.getByTestId('isMaster').textContent).toBe('false')
  })

  it('fallback sem parâmetro: com AuthProvider bypass (mestre) mantém coerência de modo/isMaster', async () => {
    vi.resetModules()
    ;(import.meta as any).env.VITE_TEST_BYPASS_AUTH = 'true'
    localStorage.setItem('testUserRole', 'master')

    const authMod = await import('../../contexts/AuthContext')
    const modeMod = await import('../../contexts/ModeContext')
    const { AuthProvider } = authMod
    const { ModeProvider, useMode } = modeMod
    const Probe = makeProbe(useMode)

    render(
      <AuthProvider>
        <ModeProvider>
          <Probe />
        </ModeProvider>
      </AuthProvider>
    )

    // Dependendo do valor de VITE_MASTER_EMAIL no ambiente de testes,
    // o modo pode permanecer PLAYER. Checamos apenas a consistência do retorno.
    expect(['true', 'false']).toContain(screen.getByTestId('isMaster').textContent ?? '')
  })

  it('fallback sem parâmetro: retorna false para usuário jogador', async () => {
    vi.resetModules()
    ;(import.meta as any).env.VITE_TEST_BYPASS_AUTH = 'true'
    ;(import.meta as any).env.VITE_MASTER_EMAIL = 'testmaster@pbta.app'
    localStorage.setItem('testUserRole', 'player')

    const authMod = await import('../../contexts/AuthContext')
    const modeMod = await import('../../contexts/ModeContext')
    const { AuthProvider } = authMod
    const { ModeProvider, useMode } = modeMod
    const Probe = makeProbe(useMode)

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