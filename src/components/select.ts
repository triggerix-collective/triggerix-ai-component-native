import type { ComponentPropSchema, EmitFn } from '@triggerix-ai/component'
import { NativeComponentDef } from '../def'

interface SelectOption {
  value: string
  label: string
}

/**
 * Native `<select>` element with `<option>` children. Bound events fire
 * `emit(eventId, { value })` carrying the selected option's value.
 */
export class SelectComponent extends NativeComponentDef {
  readonly type = 'select'
  readonly label = 'Select'
  readonly description = 'A dropdown selector. Bound events fire with `{ value }` payload.'
  readonly container = false
  readonly props: Record<string, ComponentPropSchema> = {
    options: {
      type: 'object',
      description: 'List of { value, label } options',
      required: true
    },
    value: { type: 'string', description: 'Initially selected value' },
    disabled: { type: 'boolean', description: 'Whether the select is disabled' }
  }

  create(props: Record<string, unknown>, emit: EmitFn): HTMLElement {
    const el = document.createElement('select')
    const rawOptions = props.options
    const options: SelectOption[] = Array.isArray(rawOptions)
      ? (rawOptions as SelectOption[])
      : []

    for (const opt of options) {
      const o = document.createElement('option')
      o.value = String(opt.value)
      o.textContent = String(opt.label)
      if (props.value != null && String(opt.value) === String(props.value))
        o.selected = true
      el.appendChild(o)
    }
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

export const select = new SelectComponent()
