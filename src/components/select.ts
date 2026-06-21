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
- **value**：初始选中值。**必须** 用 "$ref:user.<field>" 引用当前状态；value 必须与某个 options[i].value 相等。
- option 的 value 应与目标 action 接受的 enum 一致；不确定合法 value/label 列表时**先调** \`get_options("<field>")\`。
\`change\` 事件携带 \`{ value }\` payload，引用当前选中值用 \`$ref:<name>.value\`。`
  readonly props: Record<string, ComponentPropSchema> = {
    options: {
      type: 'array',
      description:
        '选项数组，每项 { value, label }。value 是底层取值，label 是显示文字。合法 value/label 列表可通过 get_options("<field>") 拿到。',
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
