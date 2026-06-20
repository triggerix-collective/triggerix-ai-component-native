import { describe, expect, it } from 'vitest'
import { LabelComponent } from '../../src/components/label'

describe('label', () => {
  it('renders text content', () => {
    const c = new LabelComponent()
    const el = c.create({ text: 'Hello' }, () => {})
    expect(el.tagName).toBe('LABEL')
    expect(el.textContent).toBe('Hello')
  })

  it('sets htmlFor when provided', () => {
    const c = new LabelComponent()
    const el = c.create({ text: 'Name', for: 'name-input' }, () => {})
    expect((el as HTMLLabelElement).htmlFor).toBe('name-input')
  })
})
