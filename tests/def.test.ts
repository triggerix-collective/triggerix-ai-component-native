import { describe, expect, it } from 'vitest'
import { ButtonComponent } from '../src/components/button'
import { InputComponent } from '../src/components/input'
import { NativeComponentDef } from '../src/def'

describe('nativeComponentDef', () => {
  it('subclasses inherit bind() from ComponentDef', () => {
    const c = new ButtonComponent()
    c.bind('click', 'button.click')
    expect(c.events).toEqual(['button.click'])
  })

  it('supports chained bind calls', () => {
    const c = new InputComponent()
    c.bind('blur', 'input.blur').bind('change', 'input.change')
    expect(c.events).toEqual(['input.blur', 'input.change'])
  })

  it('nativeComponentDef is registered as an abstract class', () => {
    expect(typeof NativeComponentDef).toBe('function')
  })
})
