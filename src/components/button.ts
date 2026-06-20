import type { ComponentPropSchema, EmitFn } from '@triggerix-ai/component'
import { NativeComponentDef } from '../def'

/**
 * Native `<button>` element. Bound DOM events fire `emit(eventId)` with
 * no payload — actions typically don't need the button's intrinsic state.
 */
export class ButtonComponent extends NativeComponentDef {
  readonly type = 'button'
  readonly label = 'Button'
  readonly description = 'A clickable button that fires a Triggerix event when activated.'
  readonly container = false
  readonly prompt = `一个可点击的按钮。点击时触发 \`button.click\` 事件（无 payload）。
通过 \`addTrigger\` 绑定事件到外部 action。`
  readonly props: Record<string, ComponentPropSchema> = {
    label: { type: 'string', description: 'Visible button text', required: true },
    disabled: { type: 'boolean', description: 'Whether the button is disabled' }
  }

  create(props: Record<string, unknown>, emit: EmitFn): HTMLElement {
    const el = document.createElement('button')
    el.type = 'button'
    el.textContent = String(props.label ?? '')
    if (props.disabled)
      el.disabled = true

    for (const [domEvent, triggerixEventId] of this.eventBindings)
      el.addEventListener(domEvent, () => emit(triggerixEventId))

    return el
  }
}

export const button = new ButtonComponent()
