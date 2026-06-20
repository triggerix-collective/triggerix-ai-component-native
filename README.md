# triggerix-ai-component-native

Native DOM renderer components for [Triggerix AI](https://github.com/triggerix-collective/triggerix-ai).

Provides 8 pre-built unstyled DOM components (`button` / `input` / `card` / `uploadButton` / `label` / `image` / `checkbox` / `select`) and a thin DOM adapter (`mountNative` + `nativeRendererContext`) on top of `@triggerix-ai/component`'s generic, renderer-agnostic mount.

## Architecture

```
+--------------------------------+
|  triggerix runtime (ECA)       |   event registration + trigger eval
+--------------------------------+
              ^
              | runtime.emit(eventId, source, payload)
              |
+--------------------------------+
|  @triggerix-ai/component       |   generic mount + RendererContext
|     - mount(output, container, |
|             components, emit,   |
|             ctx)                |
+--------------------------------+
              ^
              | mountNative (binds nativeRendererContext)
              |
+--------------------------------+
|  triggerix-ai-component-native |   8 DOM components + nativeRendererContext
|     - ButtonComponent, ...     |
|     - nativeRendererContext    |
|     - mountNative               |
+--------------------------------+
```

`triggerix-ai-component-native` only renders DOM and emits Triggerix event IDs. It does not know about triggerix runtime, trigger evaluation, or action execution. That separation is what lets the same components be re-targeted at a Vue or React renderer in the future by swapping only the `RendererContext`.

## Installation

```bash
pnpm add triggerix-ai-component-native
```

Peer dependencies:

```bash
pnpm add @triggerix-ai/component @triggerix/core
```

## Quick start

```ts
import { createComponentRegistry } from '@triggerix-ai/component'
import { createRuntime } from '@triggerix/runtime'
// setup.ts
import { button, components, input, mountNative } from 'triggerix-ai-component-native'

// 1. Developers configure DOM event -> Triggerix event ID bindings
button.bind('click', 'button.click')
input.bind('blur', 'input.blur').bind('change', 'input.change')
uploadButton.bind('change', 'upload.complete')
checkbox.bind('change', 'checkbox.change')
select.bind('change', 'select.change')

// 2. Register the component catalog with triggerix-ai
const componentRegistry = createComponentRegistry()
componentRegistry.use(components)

// 3. Register triggerix events and actions
const runtime = createRuntime()
runtime.registerEvent('button.click')
runtime.registerAction('api.request', async (params) => {
  await fetch(params.url, { method: params.method, body: JSON.stringify(params.body) })
})
runtime.registerAction('toast.show', (params) => {
  alert(params.message)
})

// 4. Mount the AI output
const aiOutput = {
  components: [
    { type: 'input', name: 'nickname', props: { placeholder: '请输入昵称' } },
    { type: 'button', name: 'save', props: { label: '保存' } }
  ],
  triggers: [
    {
      id: 'submit',
      events: [
        { type: 'button.click', source: 'save' }
      ],
      conditions: [
        { left: { $ref: 'nickname.value' }, operator: 'neq', right: '' }
      ],
      actions: [
        { type: 'api.request', params: { method: 'POST', url: '/api/nickname', body: { nickname: { $ref: 'nickname.value' } } } }
      ]
    }
  ]
}

const scope = mountNative(aiOutput, document.getElementById('chat')!, components, (eventId, source, payload) => {
  runtime.emit(eventId, source, payload)
})

// Later: tear down DOM + listeners
scope.unmount()
```

## Component reference

| Component            | `type`           | Default-bound DOM events         | `bind()` recommended for           |
| -------------------- | ---------------- | -------------------------------- | ---------------------------------- |
| `ButtonComponent`    | `'button'`       | —                                | `'click'`                          |
| `InputComponent`     | `'input'`        | —                                | `'blur'`, `'change'`               |
| `CardComponent`      | `'card'`         | (container; no events)           | —                                  |
| `UploadButtonComponent` | `'uploadButton'` | —                              | `'change'`                         |
| `LabelComponent`     | `'label'`        | (display only)                   | —                                  |
| `ImageComponent`     | `'image'`        | (display only)                   | —                                  |
| `CheckboxComponent`  | `'checkbox'`     | —                                | `'change'`                         |
| `SelectComponent`    | `'select'`       | —                                | `'change'`                         |

All eight are exported as singletons (`button`, `input`, ...) and as a stable-order array (`components`). The array entries and the named exports share the same object references, so `componentRegistry.use(components)` picks up any `bind()` calls made on the named exports.

## API surface

| Export                  | Kind        | Description |
| ----------------------- | ----------- | ----------- |
| `NativeComponentDef`    | class       | Base class for custom native components (extend and implement `create`) |
| `ButtonComponent` ... `SelectComponent` | class | Pre-built component implementations |
| `button` ... `select`   | singleton   | Pre-built component instances (call `.bind()` on these in your setup) |
| `components`            | array       | All eight singletons in stable order; feed this to `componentRegistry.use(...)` |
| `mountNative`           | function    | Native DOM mount adapter (thin wrapper over `@triggerix-ai/component/mount`) |
| `nativeRendererContext` | object      | The `RendererContext<HTMLElement, HTMLElement>` implementation |
| `RendererContext`       | type        | Generic contract for any renderer |
| `MountEmitFn`           | type        | `(eventId, source, payload?) => void` callback signature |

## `source` semantics

`event.source` in a Triggerix trigger tells the runtime which component instance fired the event. With two buttons in the same AI output, both fire `button.click`, but only one trigger should fire per click:

```ts
triggers: [
  { events: [{ type: 'button.click', source: 'save' }], actions: [/* save */] },
  { events: [{ type: 'button.click', source: 'cancel' }], actions: [/* cancel */] }
]
```

`mountNative` closure-captures `instance.name` as `source` and forwards it to your `emit` callback. Pass it to `runtime.emit(eventId, source, payload)` and the runtime filters triggers by exact source match.

A trigger whose `event.source` is `undefined` matches every source (so you can still write a single global `button.click` trigger if you want). When multiple events are listed in `events[]`, any one match fires the trigger (OR semantics).

## Adding custom native components

```ts
import { NativeComponentDef } from 'triggerix-ai-component-native'

class MyToggleComponent extends NativeComponentDef {
  readonly type = 'toggle'
  readonly label = 'Toggle'
  readonly description = 'A custom on/off switch'

  create(props, emit) {
    const el = document.createElement('button')
    el.textContent = String(props.label ?? '')
    for (const [domEvent, triggerixEventId] of this.eventBindings)
      el.addEventListener(domEvent, () => emit(triggerixEventId, { on: !el.classList.contains('on') }))
    return el
  }
}

const myToggle = new MyToggleComponent().bind('click', 'toggle.click')
```

Then pass it in the components array to `mountNative`.

## Development

```bash
pnpm install
pnpm run typecheck
pnpm run lint
pnpm test
pnpm run build
```

`examples/basic.html` is a self-contained browser demo (requires building the package first; the import map points at `./dist/index.mjs`).

## License

MIT