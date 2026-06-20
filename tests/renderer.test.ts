import type { AIOutput, ComponentDef } from '@triggerix-ai/component'
import { describe, expect, it } from 'vitest'
import { button, components, input, mountNative, nativeRendererContext } from '../src'

describe('mountNative integration', () => {
  it('appends DOM elements for each AI component instance', () => {
    const container = document.createElement('div')
    button.bind('click', 'button.click')
    input.bind('blur', 'input.blur').bind('change', 'input.change')

    const aiOutput: AIOutput = {
      components: [
        { type: 'input', name: 'nickname', props: { placeholder: '昵称' } },
        { type: 'button', name: 'save', props: { label: '保存' } }
      ],
      triggers: []
    }

    const scope = mountNative(aiOutput, container, components, () => {})
    expect(container.children).toHaveLength(2)
    expect(container.querySelector('input')).toBeTruthy()
    expect(container.querySelector('button')).toBeTruthy()
    scope.unmount()
    expect(container.children).toHaveLength(0)
  })

  it('auto-injects source via closure when emitting events', () => {
    const container = document.createElement('div')
    button.bind('click', 'button.click')

    const aiOutput: AIOutput = {
      components: [
        { type: 'button', name: 'save', props: { label: '保存' } },
        { type: 'button', name: 'cancel', props: { label: '取消' } }
      ],
      triggers: []
    }

    const emitted: Array<[string, string | undefined]> = []
    const scope = mountNative(
      aiOutput,
      container,
      [button],
      (eventId: string, source: string | undefined) => {
        emitted.push([eventId, source])
      }
    )

    const btns = container.querySelectorAll('button');
    (btns[0] as HTMLButtonElement).dispatchEvent(new MouseEvent('click', { bubbles: true }));
    (btns[1] as HTMLButtonElement).dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(emitted).toEqual([
      ['button.click', 'save'],
      ['button.click', 'cancel']
    ])
    scope.unmount()
  })

  it('nativeRendererContext uses appendChild / removeChild', () => {
    expect(typeof nativeRendererContext.appendChild).toBe('function')
    expect(typeof nativeRendererContext.removeChild).toBe('function')

    const parent = document.createElement('div')
    const child = document.createElement('span')
    nativeRendererContext.appendChild(parent, child)
    expect(parent.contains(child)).toBe(true)
    nativeRendererContext.removeChild(parent, child)
    expect(parent.contains(child)).toBe(false)
  })
})

describe('component types are compatible with @triggerix-ai/component', () => {
  it('components array satisfies ComponentDef<HTMLElement>[]', () => {
    const _check: ReadonlyArray<ComponentDef<HTMLElement>> = components
    expect(_check).toBe(components)
  })
})
