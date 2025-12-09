import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import CharacterSheet from '../CharacterSheet'

describe('CharacterSheet blocking when sum != 3', () => {
  it('disables submit when remaining > 0', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/campaigns/c-1/sheet']}>
        <Routes>
          <Route path="/campaigns/:id/sheet" element={<CharacterSheet />} />
        </Routes>
      </MemoryRouter>
    )
    // Preencher Nome - encontrar o input que vem após o label "Nome"
    const nomeInput = screen.getByText('Nome').closest('div')?.querySelector('input')
    if (nomeInput) await user.type(nomeInput, 'Jogador')
    
    // Preencher Antecedentes - encontrar o textarea que vem após o label "Antecedentes"
    const antecedentesTextarea = screen.getByText('Antecedentes').closest('div')?.querySelector('textarea')
    if (antecedentesTextarea) await user.type(antecedentesTextarea, 'Teste')
    
    // Selecionar valor 1 para Força clicando no rótulo
    const forcaLabel = screen.getByText('Forca').closest('div')?.closest('div')
    if (forcaLabel) {
      const radio1 = within(forcaLabel).getByText('1').closest('label')
      if (radio1) await user.click(radio1)
    }
    
    // Selecionar valor 1 para Agilidade clicando no rótulo
    const agilidadeLabel = screen.getByText('Agilidade').closest('div')?.closest('div')
    if (agilidadeLabel) {
      const radio1 = within(agilidadeLabel).getByText('1').closest('label')
      if (radio1) await user.click(radio1)
    }
    
    // Verificar que os atributos estão inválidos (soma = 2, precisa de 3)
    expect(screen.queryByText('❌ Atributos inválidos')).not.toBeNull()
    
    // Verificar que o botão está desabilitado
    const btn = screen.getByRole('button', { name: /Salvar Ficha/i }) as HTMLButtonElement
    expect(btn.disabled).toBe(true)
  })
})
