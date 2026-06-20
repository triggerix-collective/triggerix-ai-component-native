import { button, card, checkbox, image, input, label, select, uploadButton } from './components'

export {
  ButtonComponent,
  CardComponent,
  CheckboxComponent,
  ImageComponent,
  InputComponent,
  LabelComponent,
  SelectComponent,
  UploadButtonComponent
} from './components'

export { button, card, checkbox, image, input, label, select, uploadButton } from './components'

export { NativeComponentDef } from './def'

/**
 * All eight pre-built components, in stable order. The exported singletons
 * (e.g. `button`, `input`) and this array share the same object references,
 * so binding an event on `button` immediately reflects in `components[0]`.
 */
export const components = [button, input, card, uploadButton, label, image, checkbox, select]

export { mountNative, nativeRendererContext } from './renderer'
export type { MountEmitFn, RendererContext } from './renderer'
