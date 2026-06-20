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
**必须** 传 \`options\` 字符串数组（每项同时作为 value 和 label 文本）。
\`change\` 事件携带 \`{ value }\` payload，引用当前选中值用 \`$ref:<name>.value\`。
**option 值应与目标 action 的 enum 一致**（例：set_gender 接受 male/female/other，所以 options 写 ["male", "female", "other"]）。`
  readonly props: Record<string, ComponentPropSchema> = {
    options: {
      type: 'array',
      description: '选项字符串数组（如 ["male", "female"]）。字符串同时作为 value 和 label 文本。',
      required: true
    },
    value: { type: 'string', description: '初始选中值（必须与某个 options[i] 相等）' },
    name: { type: 'string', description: 'radio group 名（HTML name 属性），默认 "radio"' },
    disabled: { type: 'boolean', description: '是否禁用全部选项' }
  }

  create(props: Record<string, unknown>, emit: EmitFn): HTMLElement {
    const group = document.createElement('div')
    group.dataset.componentType = 'radio'
    group.style.display = 'inline-flex'
    group.style.flexDirection = 'column'
    group.style.gap = '0.4em'

    const options = (Array.isArray(props.options) ? props.options : []) as string[]
    const currentValue = typeof props.value === 'string' ? props.value : undefined
    const groupName = typeof props.name === 'string' ? props.name : 'radio'
    const disabled = props.disabled === true

    for (const opt of options) {
      const label = document.createElement('label')
      label.style.display = 'inline-flex'
      label.style.alignItems = 'center'
      label.style.gap = '0.4em'

      const input = document.createElement('input')
      input.type = 'radio'
      input.name = groupName
      input.value = opt
      if (opt === currentValue)
        input.checked = true
      if (disabled)
        input.disabled = true

      label.appendChild(input)
      label.appendChild(document.createTextNode(opt))
      group.appendChild(label)
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
