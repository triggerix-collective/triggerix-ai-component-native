import type { ComponentPropSchema, EmitFn } from '@triggerix-ai/component'
import { NativeComponentDef } from '../def'

/**
 * Native radio group: a `<div>` containing one `<label><input type="radio">…</label>`
 * per option in `props.options`. The `'change'` event fires `emit(eventId, { value })`
 * with the selected option string.
 *
 * Note: a single `radio` instance represents one **group** (multiple options),
 * not one button. Grouping is implicit via the `name` prop (HTML radio groups).
 */
export class RadioComponent extends NativeComponentDef {
  readonly type = 'radio'
  readonly label = 'Radio Group'
  readonly description = '一组单选按钮（带 options 数组），点击选项时 emit 当前 value。'
  readonly container = false
  readonly prompt = `一组互斥单选按钮（2-4 个选项时优先用 radio，比 select 更直观）。
**必须** 传 \`options\` 数组，每项是 \`{ value, label }\` 对象：
\`\`\`
options: [
  { value: "a", label: "选项 A" },
  { value: "b", label: "选项 B" }
]
\`\`\`
- \`value\`: 初始选中值（**必须** 用 "$ref:user.<field>" 引用当前状态，否则用户看到的会是空白）。value 必须与某个 options[i].value 相等。
- 合法 value/label 列表通过 \`get_options("<field>")\` 拿到
- \`label\`: 用户看到的文字（中文/任意文案）
- 向后兼容：纯字符串 \`["a", "b"]\` 也支持（同时作 value 和 label）

\`change\` 事件携带 \`{ value }\` payload，引用当前选中值用 \`$ref:<name>.value\`。`
  readonly props: Record<string, ComponentPropSchema> = {
    options: {
      type: 'array',
      description: '选项数组。每项是 { value, label } 对象（value 是底层值，label 是显示文字），或纯字符串（同时作 value 和 label）。',
      required: true
    },
    value: { type: 'string', description: '初始选中值（必须与某个 options[i] 相等）' },
    name: { type: 'string', description: 'radio group 名（HTML name 属性），默认 "radio"' },
    disabled: { type: 'boolean', description: '是否禁用全部选项' }
  }

  create(props: Record<string, unknown>, emit: EmitFn): HTMLElement {
    const group = document.createElement('div')
    group.dataset.componentType = 'radio'

    const rawOptions = (Array.isArray(props.options) ? props.options : []) as unknown[]
    const currentValue = typeof props.value === 'string' ? props.value : undefined
    const groupName = typeof props.name === 'string' ? props.name : 'radio'
    const disabled = props.disabled === true

    // 归一化：string → { value, label }（向后兼容）；{ value, label } 对象直接用
    const normalised = rawOptions
      .map((opt): { value: string, label: string } | null => {
        if (typeof opt === 'string')
          return { value: opt, label: opt }
        if (opt && typeof opt === 'object') {
          const o = opt as Record<string, unknown>
          const value = o.value != null ? String(o.value) : ''
          if (!value)
            return null
          const label = o.label != null ? String(o.label) : value
          return { value, label }
        }
        return null
      })
      .filter((x): x is { value: string, label: string } => x !== null)

    for (const { value, label } of normalised) {
      const inputLabel = document.createElement('label')

      const input = document.createElement('input')
      input.type = 'radio'
      input.name = groupName
      input.value = value
      input.disabled = disabled
      if (value === currentValue)
        input.checked = true

      inputLabel.appendChild(input)
      inputLabel.appendChild(document.createTextNode(label))
      group.appendChild(inputLabel)
    }

    for (const [domEvent, triggerixEventId] of this.eventBindings) {
      // Listen on the group, delegate to the checked input
      group.addEventListener(domEvent, () => {
        const checked = group.querySelector<HTMLInputElement>('input[type="radio"]:checked')
        if (checked)
          emit(triggerixEventId, { value: checked.value })
      })
    }

    // 暴露 .value getter/setter：$ref:<name>.value 读当前值；el.value = 'male' 选中对应 radio
    // （div 原生没有 value 属性，需要手动挂一个）
    Object.defineProperty(group, 'value', {
      get() {
        const checked = group.querySelector<HTMLInputElement>('input[type="radio"]:checked')
        return checked?.value ?? ''
      },
      set(v: string) {
        const target = String(v)
        group.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach((input) => {
          input.checked = input.value === target
        })
      },
      configurable: true
    })

    return group
  }
}

export const radio = new RadioComponent()
