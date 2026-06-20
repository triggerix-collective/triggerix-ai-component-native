import type { ComponentPropSchema, EmitFn } from '@triggerix-ai/component'
import { NativeComponentDef } from '../def'

const INPUT_TYPES = ['text', 'number', 'password'] as const

/**
 * Native `<input>` element. Bound events (`blur`, `change`, etc.) fire
 * `emit(eventId, { value })` — the payload carries the current `.value`
 * so Triggerix conditions can read it via `$ref`.
 */
export class InputComponent extends NativeComponentDef {
  readonly type = 'input'
  readonly label = 'Input'
  readonly description = 'A text/number/password input field. Bound events fire with `{ value }` payload.'
  readonly container = false
  readonly props: Record<string, ComponentPropSchema> = {
    placeholder: { type: 'string', description: 'Placeholder text' },
    type: { type: 'string', enum: [...INPUT_TYPES], description: 'Input type', default: 'text' },
    value: { type: 'string', description: 'Initial value' },
    disabled: { type: 'boolean', description: 'Whether the input is disabled' }
  }

  create(props: Record<string, unknown>, emit: EmitFn): HTMLElement {
    const el = document.createElement('input')
    const type = props.type as (typeof INPUT_TYPES)[number] | undefined
    el.type = type ?? 'text'
    if (props.placeholder != null)
      el.placeholder = String(props.placeholder)
    if (props.value != null)
      el.value = String(props.value)
    if (props.disabled)
      el.disabled = true

    for (const [domEvent, triggerixEventId] of this.eventBindings) {
      el.addEventListener(domEvent, () => {
        emit(triggerixEventId, { value: el.value })
      })
    }

    return el
  }
}

export const input = new InputComponent()
