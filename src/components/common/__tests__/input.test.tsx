import { render, screen } from '@testing-library/react'
import { Input } from '../../common'

test('input wires label and displays error', () => {
  render(<Input label="Email" error="Inválido" />)
  const input = screen.getByLabelText('Email')
  expect(input).toHaveAttribute('aria-invalid', 'true')
  expect(screen.getByRole('alert')).toHaveTextContent('Inválido')
})