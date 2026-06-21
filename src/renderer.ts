import type {
  AIOutput,
  ComponentDef,
  MountEmitFn,
  RendererContext,
  Scope
} from '@triggerix-ai/component'
import type { RefResolver } from '@triggerix/runtime'
import { mount } from '@triggerix-ai/component'

/**
 * Native DOM renderer context. Provides the two primitive operations
 * `appendChild` and `removeChild` used by `@triggerix-ai/component`'s generic
 * `mount` implementation.
 */
export const nativeRendererContext: RendererContext<HTMLElement, HTMLElement> = {
  appendChild: (parent, child) => parent.appendChild(child),
  removeChild: (_parent, child) => child.remove()
}

/**
 * Native DOM mount adapter — thin convenience wrapper that pre-binds
 * `nativeRendererContext` so callers don't have to thread it through.
 *
 * The application provides `emit`, which receives `(eventId, source, payload)`
 * — `source` is the semantic component instance name from `output.components[i].name`.
 * Most applications forward these arguments directly to `triggerixRuntime.emit(type, source, payload)`.
 *
 * `refResolver` is forwarded to the runtime's `$ref` resolver for component
 * props. Strings like `"$ref:user.nickname"` inside `props` are normalised to
 * the runtime's `{ $ref: '...' }` object form and then resolved.
 */
export function mountNative(
  output: AIOutput,
  container: HTMLElement,
  components: ReadonlyArray<ComponentDef<HTMLElement>>,
  emit: MountEmitFn,
  refResolver?: RefResolver
): Scope {
  return mount(output, container, components, emit, nativeRendererContext, refResolver)
}

// Re-export mount-level types so callers can import them from this package.
export type { MountEmitFn, RendererContext } from '@triggerix-ai/component'
