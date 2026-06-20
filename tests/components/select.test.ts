import { describe, expect, it } from 'vitest'
import { SelectComponent } from '../../src/components/select'

describe('select', () => {
  it('renders <option> children from props', () => {
    const c = new SelectComponent()
    const el = c.create(
      { options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }] },
      () => {}
    )
    const opts = el.querySelectorAll('option')
    expect(opts).toHaveLength(2)
    expect(opts[0].value).toBe('a')
    expect(opts[1].textContent).toBe('B')
  })

  it('marks the initially selected value', () => {
    const c = new SelectComponent()
    const el = c.create(
      { options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }], value: 'b' },
      () => {}
    )
    expect((el as HTMLSelectElement).value).toBe('b')
  })

  it('emits { value } on bound change event', () => {
    const c = new SelectComponent().bind('change', 'select.change')
    let captured: Record<string, unknown> | undefined
    const emit = (_id: string, payload?: Record<string, unknown>) => {
      captured = payload
    }
    const el = c.create(
      { options: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }] },
      emit
    )
    ;(el as HTMLSelectElement).value = 'b'
    el.dispatchEvent(new Event('change', { bubbles: true }))
    expect(captured).toEqual({ value: 'b' })
  })
})
