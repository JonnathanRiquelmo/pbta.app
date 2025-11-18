import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import CharacterRoute from '../Route'

describe('CharacterRoute blocking when sum != 3', () => {
  it('disables submit when remaining > 0', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={[{ pathname: '/characters/c-1' }] as any}>
        <Routes>
          <Route path="/characters/:id" element={<CharacterRoute />} />
        </Routes>
      </MemoryRouter>
    )
    await user.type(screen.getByLabelText('Nome'), 'Jogador')
    await user.type(screen.getByLabelText('Antecedentes'), 'Teste')
    const forcaGroup = screen.getByRole('group', { name: 'Força' })
    await user.click(within(forcaGroup).getByRole('radio', { name: '1' }))
    const agilidadeGroup = screen.getByRole('group', { name: 'Agilidade' })
    await user.click(within(agilidadeGroup).getByRole('radio', { name: '1' }))
    expect(screen.queryByText(/Soma restante: 1/)).not.toBeNull()
    const btn = screen.getByRole('button', { name: /Criar Ficha/i }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })
})