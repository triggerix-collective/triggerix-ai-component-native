import { ComponentDef } from '@triggerix-ai/component'

/**
 * Native DOM component base class.
 *
 * Concrete components extend this and implement `create()` to build an HTML
 * element. The base class inherits `bind()` from {@link ComponentDef}, which
 * maps renderer-native DOM event names (e.g. `'click'`) to Triggerix event
 * IDs (e.g. `'button.click'`).
 *
 * Inside `create()` the implementation should:
 *   1. Build the HTML element from `props`
 *   2. Iterate `this.eventBindings` and attach DOM listeners that call
 *      `emit(triggerixEventId, optionalPayload)` for the bound DOM event
 *   3. Return the element
 *
 * The `source` (component instance name) is captured upstream by the mount
 * scope's closure — concrete components do not need to know about it.
 *
 * Developers configure bindings in their application `setup.ts`:
 *
 * ```ts
 * import { button, input } from 'triggerix-ai-component-native'
 * button.bind('click', 'button.click')
 * input.bind('blur', 'input.blur').bind('change', 'input.change')
 * ```
 */
export abstract class NativeComponentDef extends ComponentDef<HTMLElement> {
}
