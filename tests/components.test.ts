import { describe, expect, it } from 'vitest'
import { components } from '../src'
import {
  button,
  card,
  checkbox,
  image,
  input,
  label,
  select,
  uploadButton
} from '../src/components'

describe('reference consistency', () => {
  it('exports the same singletons via components array and named exports', () => {
    expect(button).toBe(components[0])
    expect(input).toBe(components[1])
    expect(card).toBe(components[2])
    expect(uploadButton).toBe(components[3])
    expect(label).toBe(components[4])
    expect(image).toBe(components[5])
    expect(checkbox).toBe(components[6])
    expect(select).toBe(components[7])
  })

  it('reflects bind() changes on the array entry', () => {
    button.bind('click', 'button.click')
    expect(components[0].events).toContain('button.click')
    // Reset: re-bind with empty value
    button.bind('click', 'button.click')
  })
})
