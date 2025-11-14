import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../../common'

test('button shows aria-busy when loading', async () => {
  render(<Button loading>Enviar</Button>)
  const btn = screen.getByRole('button', { name: 'Enviar' })
  expect(btn).toHaveAttribute('aria-busy', 'true')
  expect(btn).toBeDisabled()
})