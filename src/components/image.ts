import type { ComponentPropSchema, EmitFn } from '@triggerix-ai/component'
import { NativeComponentDef } from '../def'

/**
 * Native `<img>` element. Static display only — no event bindings by default.
 */
export class ImageComponent extends NativeComponentDef {
  readonly type = 'image'
  readonly label = 'Image'
  readonly description = 'A static image element.'
  readonly container = false
  readonly props: Record<string, ComponentPropSchema> = {
    src: { type: 'string', description: 'Image source URL', required: true },
    alt: { type: 'string', description: 'Alternative text' },
    width: { type: 'number', description: 'Width in pixels' },
    height: { type: 'number', description: 'Height in pixels' }
  }

  create(props: Record<string, unknown>, _emit: EmitFn): HTMLElement {
    const el = document.createElement('img')
    el.src = String(props.src ?? '')
    if (props.alt != null)
      el.alt = String(props.alt)
    if (props.width != null)
      el.width = Number(props.width)
    if (props.height != null)
      el.height = Number(props.height)
    return el
  }
}

export const image = new ImageComponent()
