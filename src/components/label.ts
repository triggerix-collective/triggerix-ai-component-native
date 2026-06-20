import type { ComponentPropSchema, EmitFn } from '@triggerix-ai/component'
import { NativeComponentDef } from '../def'

/**
 * Native `<label>` element. Static display only — no event bindings by default.
 */
export class LabelComponent extends NativeComponentDef {
  readonly type = 'label'
  readonly label = 'Label'
  readonly description = 'A static text label, optionally bound to another input via the `for` attribute.'
  readonly container = false
  readonly props: Record<string, ComponentPropSchema> = {
    text: { type: 'string', description: 'Label text', required: true },
    for: { type: 'string', description: 'ID of the associated input element' }
  }

  create(props: Record<string, unknown>, _emit: EmitFn): HTMLElement {
    const el = document.createElement('label')
    el.textContent = String(props.text ?? '')
    if (props.for != null)
      el.htmlFor = String(props.for)
    return el
  }
}

export const label = new LabelComponent()
