import type {
  AIOutput,
  ComponentDef,
  MountEmitFn,
  RendererContext,
  Scope
} from '@triggerix-ai/component'
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
 */
export function mountNative(
  output: AIOutput,
  container: HTMLElement,
  components: ReadonlyArray<ComponentDef<HTMLElement>>,
  emit: MountEmitFn
): Scope {
  return mount(output, container, components, emit, nativeRendererContext)
}

// Re-export mount-level types so callers can import them from this package.
export type { MountEmitFn, RendererContext } from '@triggerix-ai/component'
