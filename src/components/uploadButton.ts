import type { ComponentPropSchema, EmitFn } from '@triggerix-ai/component'
import { NativeComponentDef } from '../def'

/**
 * File upload trigger — a visible button that proxies clicks to a hidden
 * `<input type="file">`. The `'change'` event on the hidden input fires
 * `emit(eventId, { files })` carrying the selected `FileList`.
 */
export class UploadButtonComponent extends NativeComponentDef {
  readonly type = 'uploadButton'
  readonly label = 'Upload Button'
  readonly description
    = 'A button that opens a native file picker. Emits `{ files }` payload on change.'

  readonly container = false
  readonly prompt = `文件上传按钮。点击后弹出系统文件选择器，\`change\` 事件携带 \`{ files, count }\` payload。`
  readonly props: Record<string, ComponentPropSchema> = {
    label: { type: 'string', description: 'Visible button text', required: true },
    accept: { type: 'string', description: 'File types accepted (e.g. "image/*")' },
    multiple: { type: 'boolean', description: 'Allow selecting multiple files' }
  }

  create(props: Record<string, unknown>, emit: EmitFn): HTMLElement {
    const wrapper = document.createElement('label')
    wrapper.dataset.componentType = 'uploadButton'
    wrapper.style.display = 'inline-flex'
    wrapper.style.cursor = 'pointer'

    const button = document.createElement('span')
    button.textContent = String(props.label ?? 'Upload')
    button.setAttribute('role', 'button')
    wrapper.appendChild(button)

    const input = document.createElement('input')
    input.type = 'file'
    input.style.display = 'none'
    if (props.accept != null)
      input.accept = String(props.accept)
    if (props.multiple)
      input.multiple = true
    wrapper.appendChild(input)

    for (const [domEvent, triggerixEventId] of this.eventBindings) {
      input.addEventListener(domEvent, () => {
        const files = input.files ? Array.from(input.files) : []
        emit(triggerixEventId, { files, count: files.length })
      })
    }

    return wrapper
  }
}

export const uploadButton = new UploadButtonComponent()
