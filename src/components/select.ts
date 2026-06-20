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
  readonly prompt = `下拉选择器。**必须** 传 \`options\` 数组（每项 \`{ value, label }\`）。
**仅在选项 >= 5 个时用 select；2-4 个选项优先用 radio**（更直观）。
\`change\` 事件携带 \`{ value }\` payload，引用当前选中值用 \`$ref:<name>.value\`。
option 的 value 应与目标 action 的 enum 一致（如 set_gender 接受 male/female/other）。`
  readonly props: Record<string, ComponentPropSchema> = {
    options: {
      type: 'array',
      description:
        '选项数组，每项 { value, label }。例: [{ value: "male", label: "男" }, { value: "female", label: "女" }]',
      required: true
    },
    value: {
      type: 'string',
      description: 'Initially selected value (must match one of options[i].value)'
    },
    disabled: { type: 'boolean', description: 'Whether the select is disabled' }
  }

  create(props: Record<string, unknown>, emit: EmitFn): HTMLElement {
    const el = document.createElement('select')
    const rawOptions = props.options
    const options: SelectOption[] = Array.isArray(rawOptions) ? (rawOptions as SelectOption[]) : []

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
