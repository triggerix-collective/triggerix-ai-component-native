import type { EmitFn } from '@triggerix-ai/component'
import { describe, expect, it } from 'vitest'
import { InputComponent } from '../../src/components/input'

function emitCapture() {
  const calls: Array<[string, Record<string, unknown> | undefined]> = []
  const emit: EmitFn = (eventId, payload) => calls.push([eventId, payload])
  return { calls, emit }
}

describe('input', () => {
  it('renders a text input by default with placeholder and value', () => {
    const c = new InputComponent()
    const el = c.create({ placeholder: 'name', value: 'Ada' }, () => {})
    expect(el).toBeInstanceOf(HTMLInputElement)
    expect((el as HTMLInputElement).type).toBe('text')
    expect((el as HTMLInputElement).placeholder).toBe('name')
    expect((el as HTMLInputElement).value).toBe('Ada')
  })

  it('honours type prop', () => {
    const c = new InputComponent()
    const el = c.create({ type: 'password' }, () => {})
    expect((el as HTMLInputElement).type).toBe('password')
  })

  it('emits { value } payload on bound events', () => {
    const c = new InputComponent().bind('blur', 'input.blur').bind('change', 'input.change')
    const { calls, emit } = emitCapture()
    const el = c.create({ value: 'foo' }, emit) as HTMLInputElement

    el.dispatchEvent(new Event('change', { bubbles: true }))
    el.dispatchEvent(new Event('blur', { bubbles: true }))

    expect(calls.map(c => c[0])).toEqual(['input.change', 'input.blur'])
    expect(calls[0][1]).toEqual({ value: 'foo' })
  })
})
