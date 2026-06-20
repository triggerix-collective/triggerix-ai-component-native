import type { ComponentPropSchema, EmitFn } from '@triggerix-ai/component'
import { NativeComponentDef } from '../def'

/**
 * Native container `<div>` with optional title. Marks `container = true`
 * so AI can nest children inside. By default has no bound events.
 */
export class CardComponent extends NativeComponentDef {
  readonly type = 'card'
  readonly label = 'Card'
  readonly description = 'A container element. Can nest other components inside (children).'
  readonly container = true
  readonly prompt = `带可选标题的容器，把多个组件视觉分组在一起。`
  readonly props: Record<string, ComponentPropSchema> = {
    title: { type: 'string', description: 'Optional card title shown as a heading' }
  }

  create(props: Record<string, unknown>, _emit: EmitFn): HTMLElement {
    const el = document.createElement('div')
    el.dataset.componentType = 'card'
    if (props.title != null) {
      const heading = document.createElement('h3')
      heading.textContent = String(props.title)
      el.appendChild(heading)
    }
    // Children are appended by the mount scope after create() returns.
    return el
  }
}

export const card = new CardComponent()
