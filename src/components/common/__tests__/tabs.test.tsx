import { render, screen, fireEvent } from '@testing-library/react'
import { Tabs } from '../../common'

test('tabs navigate with arrow keys', async () => {
  render(<Tabs items={[{ id: 'a', label: 'A', content: 'A' }, { id: 'b', label: 'B', content: 'B' }]} />)
  expect(screen.getByRole('tabpanel', { name: 'A' })).toBeVisible()
  fireEvent.keyDown(screen.getByRole('tab', { selected: true }), { key: 'ArrowRight' })
  expect(screen.getByRole('tabpanel', { name: 'B' })).toBeVisible()
})