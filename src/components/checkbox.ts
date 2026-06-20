import type { ComponentPropSchema, EmitFn } from '@triggerix-ai/component'
import { NativeComponentDef } from '../def'

/**
 * Native checkbox: a wrapper `<label>` containing a hidden `<input type="checkbox">`
 * and a visible text label. The `'change'` event fires `emit(eventId, { checked })`.
 */
export class CheckboxComponent extends NativeComponentDef {
  readonly type = 'checkbox'
  readonly label = 'Checkbox'
  readonly description = 'A boolean toggle. Bound events fire with `{ checked }` payload.'
  readonly container = false
  readonly prompt = `复选框，可勾选/取消。\`change\` 事件携带 \`{ checked }\` payload。`
  readonly props: Record<string, ComponentPropSchema> = {
    label: { type: 'string', description: 'Visible label text' },
    checked: { type: 'boolean', description: 'Initial checked state', default: false },
    disabled: { type: 'boolean', description: 'Whether the checkbox is disabled' }
  }

  create(props: Record<string, unknown>, emit: EmitFn): HTMLElement {
    const wrapper = document.createElement('label')
    wrapper.dataset.componentType = 'checkbox'
    wrapper.style.display = 'inline-flex'
    wrapper.style.alignItems = 'center'
    wrapper.style.gap = '0.5em'

    const input = document.createElement('input')
    input.type = 'checkbox'
    if (props.checked)
      input.checked = true
    if (props.disabled)
      input.disabled = true
    wrapper.appendChild(input)

    if (props.label != null) {
      const span = document.createElement('span')
      span.textContent = String(props.label)
      wrapper.appendChild(span)
    }

    for (const [domEvent, triggerixEventId] of this.eventBindings) {
      input.addEventListener(domEvent, () => {
        emit(triggerixEventId, { checked: input.checked })
      })
    }

    return wrapper
  }
}

export const checkbox = new CheckboxComponent()
