import { render, screen, fireEvent } from '@testing-library/react'
import { Modal } from '../../common'

test('modal opens with role dialog and closes on Esc', async () => {
  const onClose = vi.fn()
  render(<Modal open onClose={onClose} title="Título">Corpo</Modal>)
  expect(screen.getByRole('dialog', { name: 'Título' })).toBeInTheDocument()
  fireEvent.keyDown(document, { key: 'Escape' })
  expect(onClose).toHaveBeenCalled()
})