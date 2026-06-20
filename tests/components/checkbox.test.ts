import { describe, expect, it } from 'vitest'
import { CheckboxComponent } from '../../src/components/checkbox'

describe('checkbox', () => {
  it('renders with initial checked state', () => {
    const c = new CheckboxComponent()
    const el = c.create({ label: 'Agree', checked: true }, () => {})
    const cb = el.querySelector('input[type=checkbox]') as HTMLInputElement
    expect(cb.checked).toBe(true)
  })

  it('emits { checked } on bound change event', () => {
    const c = new CheckboxComponent().bind('change', 'checkbox.change')
    let captured: Record<string, unknown> | undefined
    const emit = (_id: string, payload?: Record<string, unknown>) => {
      captured = payload
    }
    const el = c.create({ label: 'X' }, emit)
    const cb = el.querySelector('input[type=checkbox]') as HTMLInputElement

    cb.checked = true
    cb.dispatchEvent(new Event('change', { bubbles: true }))
    expect(captured).toEqual({ checked: true })
  })
})
