import { describe, expect, it } from 'vitest'
import { ButtonComponent } from '../../src/components/button'

describe('button', () => {
  it('renders a <button> with the label', () => {
    const c = new ButtonComponent()
    const el = c.create({ label: 'Save' }, () => {})
    expect(el).toBeInstanceOf(HTMLButtonElement)
    expect(el.textContent).toBe('Save')
  })

  it('honours disabled prop', () => {
    const c = new ButtonComponent()
    const el = c.create({ label: 'X', disabled: true }, () => {})
    expect((el as HTMLButtonElement).disabled).toBe(true)
  })

  it('emits on bound DOM events', () => {
    const c = new ButtonComponent().bind('click', 'button.click')
    const emitted: string[] = []
    const el = c.create({ label: 'OK' }, id => emitted.push(id))

    el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(emitted).toEqual(['button.click'])
  })

  it('handles empty label gracefully', () => {
    const c = new ButtonComponent()
    const el = c.create({}, () => {})
    expect(el.textContent).toBe('')
  })
})
