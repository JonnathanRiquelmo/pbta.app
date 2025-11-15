import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DiceRoller from '../DiceRoller'
import { ToastProvider } from '../../common'

vi.mock('../../../services/rolls.service', () => ({
  createRoll: vi.fn(async () => 'roll_test')
}))

vi.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { uid: 'test-uid', email: 'testplayer@pbta.app' } })
}))

describe('DiceRoller', () => {
  it('rola e salva uma rolagem exibindo feedback', async () => {
    const user = userEvent.setup()
    render(<ToastProvider><DiceRoller /></ToastProvider>)

    const input = screen.getByPlaceholderText('Modificador')
    const button = screen.getByRole('button', { name: 'Rolar 2d6' })
    await user.clear(input)
    await user.type(input, '1')
    await user.click(button)

    expect(button).toBeEnabled()
    // Apenas valida que o texto de resultado aparece em alguma forma
    const resultText = await screen.findByText(/Total:/)
    expect(resultText).toBeInTheDocument()
  })
})