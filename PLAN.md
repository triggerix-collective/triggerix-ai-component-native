# triggerix-ai-component-native 实现计划

## Context（背景）

根据 `D:\Projects\triggerix\ai-docs\ai-integration-pipeline\README_CN.md` 的端到端管线设计，`triggerix-ai` monorepo 已提供协议层（`@triggerix-ai/component`：BaseRenderer + ComponentDef + ComponentRegistry）和上游（registry / schema / prompt / fn），但缺少**原生 DOM 渲染器实现**——AI 生成的 `{ components, triggers }` 最终需要一个能把抽象组件实例变成真实 DOM、把 trigger JSON 跑起来的运行时。

`triggerix-ai-component-native` 就是这个**实现层**：独立仓库，无样式 Demo，验证协议可行性、对接 triggerix-ai 全链路。它是未来"生产渲染器"（同时对接 UI + Shinix 样式）的参考实现。

仓库地址：`git@github.com:triggerix-collective/triggerix-ai-component-native.git`
本地路径：`D:\Projects\triggerix-ai-component-native`

---

## 核心定位与依赖

| 项 | 选择 | 备注 |
|---|---|---|
| 包名 | `triggerix-ai-component-native` | 无 `@` 前缀，与文档示例一致 |
| 类型 | ESM + CJS + d.ts | `exports` 三种格式 |
| 协议层依赖 | `@triggerix-ai/component`（npm 版本号） | 独立仓库不依赖 monorepo workspace |
| 触发器运行时依赖 | `@triggerix/core`（npm 版本号） | 提供 Trigger/Condition/ActionNode 类型 + 操作符常量 |
| 构建 | `unbuild`（与 monorepo 一致） | `scripts/build.common.ts` 风格抽到本地 |
| 测试 | `vitest` + `jsdom` | mount/unmount 需要 DOM 环境 |
| Lint | `@antfu/eslint-config` | 与 monorepo 一致 |
| Node | LTS | `engines.node >= 20` |

---

## 仓库目录结构

```
triggerix-ai-component-native/
├── src/
│   ├── index.ts                 # 公共入口（re-export）
│   ├── def.ts                   # NativeComponentDef<El extends HTMLElement> 基类
│   ├── renderer.ts              # NativeRenderer + createNativeRenderer 工厂
│   ├── runtime/
│   │   ├── mount.ts             # mount(output, container): Scope 主体逻辑
│   │   ├── context.ts           # ScopeContext 类型 + createScopeContext()
│   │   ├── evaluate.ts          # evaluateCondition / evaluateConditionGroup
│   │   ├── execute.ts           # executeActions (含 sequence/parallel/if/tryCatch)
│   │   └── resolve.ts           # resolveValue / resolveParams（$ref → 元素 value）
│   ├── components/              # 8 个预建控件（已 bind DOM 事件 → triggerix 事件）
│   │   ├── button.ts
│   │   ├── input.ts
│   │   ├── card.ts              # container=true
│   │   ├── uploadButton.ts      # 隐藏 file input + 触发按钮
│   │   ├── label.ts
│   │   ├── image.ts
│   │   ├── checkbox.ts
│   │   └── select.ts
│   └── types.ts                 # NativeActionHandler、NativeRendererOptions 等
├── tests/
│   ├── def.test.ts              # NativeComponentDef 基类：bind + create 自动绑定
│   ├── components/
│   │   ├── button.test.ts
│   │   ├── input.test.ts
│   │   ├── card.test.ts
│   │   └── uploadButton.test.ts
│   ├── runtime/
│   │   ├── evaluate.test.ts     # eq/neq/gt/exists + and/or/not + $ref
│   │   ├── execute.test.ts      # sequence/parallel/if/tryCatch
│   │   └── resolve.test.ts      # $ref → element.value 解析
│   └── mount.test.ts            # 端到端：mount → 触发 → execute → unmount
├── examples/
│   └── basic.html               # 浏览器内联 demo（无需打包）
├── package.json
├── tsconfig.json
├── eslint.config.ts
├── vitest.config.ts             # 启用 jsdom 环境
├── build.config.ts              # unbuild 配置
├── .github/workflows/
│   └── release.yaml             # 与 triggerix-ai 同款 npm publish 工作流
├── .gitignore
├── LICENSE
└── README.md
```

---

## 关键模块设计

### 1. `NativeComponentDef<El extends HTMLElement>`（继承 `ComponentDef<HTMLElement>`）

文件：[src/def.ts](src/def.ts)

继承 `@triggerix-ai/component` 的 `ComponentDef<HTMLElement>`，把 `bind()` 自动应用到 DOM 事件的能力下沉：

```typescript
import type { EmitFn } from '@triggerix-ai/component'
// src/def.ts —— 核心抽象
import { ComponentDef } from '@triggerix-ai/component'

export abstract class NativeComponentDef extends ComponentDef<HTMLElement> {
  // 子类只需实现 createElement，事件绑定由基类负责
  protected abstract createElement(props: Record<string, unknown>): HTMLElement

  // 覆写 create：基类实现创建 DOM + 遍历 bind 配置 addEventListener
  create(props: Record<string, unknown>, emit: EmitFn): HTMLElement {
    const el = this.createElement(props)
    for (const [domEvent, triggerixEventId] of this.eventBindings) {
      el.addEventListener(domEvent, (e: Event) => {
        emit(triggerixEventId, this.collectPayload(e))
      })
    }
    return el
  }

  // 子类可覆写以把 DOM 事件细节（如 input.value、checkbox.checked）塞进 emit payload
  protected collectPayload(_e: Event): Record<string, unknown> | undefined {
    return undefined
  }
}
```

### 2. 8 个预建组件对象（按文档示例 + 扩展）

文件：[src/components/button.ts](src/components/button.ts) 等

| 组件 | type | 容器 | 默认 bind | 关键 props |
|---|---|---|---|---|
| `button` | `'button'` | false | `'click' → 'button.click'` | `label`, `disabled` |
| `input` | `'input'` | false | `'blur' → 'input.blur'`<br>`'change' → 'input.change'` | `placeholder`, `type`, `value`（payload 携带） |
| `card` | `'card'` | true | — | `title` |
| `uploadButton` | `'uploadButton'` | false | `'change' → 'upload.complete'`（file list 进 payload） | `label`, `accept`, `multiple` |
| `label` | `'label'` | false | — | `text`, `for` |
| `image` | `'image'` | false | — | `src`, `alt` |
| `checkbox` | `'checkbox'` | false | `'change' → 'checkbox.change'`（checked 进 payload） | `label`, `checked` |
| `select` | `'select'` | false | `'change' → 'select.change'`（value 进 payload） | `options[]`, `value` |

每个组件**导出预创建实例**，开发者直接 `bind()`/`use()` 即可，文档示例照常工作：

```typescript
// src/components/button.ts
export const button = new ButtonComponent()
  .bind('click', 'button.click')
```

### 3. Actions API：方案 A + 方案 B 双写法都支持

文件：[src/renderer.ts](src/renderer.ts)、[src/types.ts](src/types.ts)

支持您提到的"对称 bind"的链式 API **与** 文档同款的 Record 写法，两者并存：

```typescript
// types.ts
export interface ActionContext {
  scope: ScopeContext // 当前 mount 的 elements map
  emit: EmitFn // 用于级联触发（try 中 action 触发的 event）
}

export type NativeActionHandler<P = Record<string, unknown>>
  = (params: P, ctx: ActionContext) => void | Promise<void>
```

```typescript
// renderer.ts
export interface NativeRendererOptions {
  components: ReadonlyArray<ComponentDef<HTMLElement>>
  /** 方案 A：构造时一次性传入（与文档示例对齐） */
  actions?: Record<string, NativeActionHandler>
}

export class NativeRenderer extends BaseRenderer<HTMLElement> {
  private readonly actionHandlers = new Map<string, NativeActionHandler>()

  constructor(options: NativeRendererOptions) {
    super({ components: options.components })
    if (options.actions) {
      for (const [id, handler] of Object.entries(options.actions)) {
        this.bindAction(id, handler)
      }
    }
  }

  // 方案 B：链式 API，对称于组件的 .bind(domEvent, eventId)
  bindAction(actionId: string, handler: NativeActionHandler): this {
    this.actionHandlers.set(actionId, handler)
    return this
  }

  unbindAction(actionId: string): this {
    this.actionHandlers.delete(actionId)
    return this
  }

  // mount 由内部 runtime/mount.ts 实现
  mount(output: AIOutput, container: HTMLElement): Scope { ... }
}

export function createNativeRenderer(options: NativeRendererOptions): NativeRenderer {
  return new NativeRenderer(options)
}
```

使用示例（同时覆盖两种风格）：
```typescript
// 风格 A：Record
const renderer = createNativeRenderer({
  components: [button, input, card],
  actions: {
    'api.request': async (params, ctx) => { ... },
    'toast.show': (params) => { alert(params.message) }
  }
})

// 风格 B：链式 bindAction
const renderer = createNativeRenderer({ components: [button, input, card] })
  .bindAction('api.request', async (params) => { ... })
  .bindAction('toast.show', (params) => { alert(params.message) })
```

### 4. `mount(output, container): Scope` —— 核心运行时

文件：[src/runtime/mount.ts](src/runtime/mount.ts)、[src/runtime/context.ts](src/runtime/context.ts)

**Scope 隔离（与文档 100% 对齐）**：
- 每次 `mount()` 创建一个独立 `ScopeContext`
- `elements: Map<string, HTMLElement>` —— 通过语义名（`"nickname"`、`"save"`）而非 DOM id 定位
- 不设 `id` 属性、不用 Shadow DOM
- 同名不干扰：scope1 的 `"save"` 和 scope2 的 `"upload"` 完全独立

```typescript
// context.ts
export interface ScopeContext {
  elements: Map<string, HTMLElement> // name → DOM 元素
  getValue: (ref: string) => unknown // ref 'nickname.value' → nickname input 的当前值
  setValue?: (name: string, value: unknown) => void // 可选：用于 stateful 组件
}

export function createScopeContext(): ScopeContext {
  const elements = new Map<string, HTMLElement>()
  return {
    elements,
    getValue(ref: string): unknown {
      // 约定：'name.value' / 'name.checked' / 'name.src' 等
      const [name, prop = 'value'] = ref.split('.')
      const el = elements.get(name)
      if (!el)
        return undefined
      return (el as any)[prop]
    }
  }
}
```

```typescript
// mount.ts
mount(output: AIOutput, container: HTMLElement): Scope {
  const ctx = createScopeContext()
  const cleanups: Array<() => void> = []

  for (const instance of output.components) {
    const def = this.components.getComponent(instance.type)
    if (!def) continue
    const el = def.create(instance.props ?? {}, (eventId, payload) => {
      this.handleEvent(eventId, instance, payload, output, ctx)
    })
    if (instance.name) ctx.elements.set(instance.name, el)
    container.appendChild(el)
    cleanups.push(() => el.remove())
  }

  return {
    unmount() {
      for (const fn of cleanups) fn()
      ctx.elements.clear()
    }
  }
}

private handleEvent(eventId, instance, payload, output, ctx) {
  // 1. 筛选匹配 trigger：event.type === eventId && event.source === instance.name
  // 2. 评估 conditions（递归 ConditionGroup）
  // 3. 执行 actions（递归 ActionNode：sequence/parallel/if/tryCatch）
}
```

### 5. 条件评估 [src/runtime/evaluate.ts](src/runtime/evaluate.ts)

参考 `@triggerix/core` 的 `VALID_OPERATORS` / `LOGICAL_OPERATORS`：

```typescript
import type { Condition, ConditionGroup, LogicalOp, Operator } from '@triggerix/core'
import type { ScopeContext } from './context'
import { LOGICAL_OPERATORS, VALID_OPERATORS } from '@triggerix/core'
import { resolveValue } from './resolve'

export function evaluateCondition(cond: Condition, ctx: ScopeContext): boolean {
  // 1. 校验 operator ∈ VALID_OPERATORS（运行时校验，不合法返回 false）
  // 2. resolveValue(cond.left, ctx) / resolveValue(cond.right, ctx)
  // 3. 按 operator 分发：
  //    - 'exists': 仅检查 left 是否非 undefined
  //    - 'eq'/'neq': 严格相等比较（处理 null/undefined）
  //    - 'gt'/'gte'/'lt'/'lte': 数值或字典序比较
}

export function evaluateConditionGroup(group: ConditionGroup, ctx: ScopeContext): boolean {
  switch (group.type) {
    case 'and': return group.conditions.every(c => isGroup(c) ? evaluateConditionGroup(c, ctx) : evaluateCondition(c, ctx))
    case 'or': return group.conditions.some(c => isGroup(c) ? evaluateConditionGroup(c, ctx) : evaluateCondition(c, ctx))
    case 'not': return !group.conditions.every(c => isGroup(c) ? evaluateConditionGroup(c, ctx) : evaluateCondition(c, ctx))
  }
}
```

### 6. 动作执行 [src/runtime/execute.ts](src/runtime/execute.ts)

支持四种 ActionNode 流控节点：

```typescript
import type { ActionNode } from '@triggerix/core'
import { resolveParams } from './resolve'

export async function executeActions(
  nodes: ActionNode[],
  ctx: ScopeContext,
  handlers: Map<string, NativeActionHandler>,
  emit: EmitFn
): Promise<void> {
  for (const node of nodes) {
    await executeOne(node, ctx, handlers, emit)
  }
}

async function executeOne(node, ctx, handlers, emit): Promise<void> {
  if ('type' in node) {
    switch (node.type) {
      case 'sequence': await executeActions(node.actions, ctx, handlers, emit); return
      case 'parallel': await Promise.all(node.actions.map(n => executeOne(n, ctx, handlers, emit))); return
      case 'if': {
        const ok = isConditionGroup(node.condition)
          ? evaluateConditionGroup(node.condition, ctx)
          : evaluateCondition(node.condition, ctx)
        await executeActions(ok ? node.then : (node.else ?? []), ctx, handlers, emit)
        return
      }
      case 'tryCatch': {
        try { await executeActions(node.try, ctx, handlers, emit) }
        catch (e) {
          if (node.catch)
            await executeActions(node.catch, ctx, handlers, emit)
        }
        if (node.finally)
          await executeActions(node.finally, ctx, handlers, emit)
        return
      }
    }
  }
  // 普通 Action：{ type, params }
  const handler = handlers.get(node.type)
  if (!handler)
    return // 未注册则静默跳过（或 console.warn）
  const resolved = resolveParams(node.params ?? {}, ctx)
  await handler(resolved, { scope: ctx, emit })
}
```

### 7. `$ref` 解析 [src/runtime/resolve.ts](src/runtime/resolve.ts)

```typescript
export function resolveValue(v: unknown, ctx: ScopeContext): unknown {
  if (v && typeof v === 'object' && '$ref' in v) {
    return ctx.getValue((v as { $ref: string }).$ref)
  }
  // 递归处理嵌套对象（如 body: { nickname: { $ref: 'nickname.value' } }）
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    const out: Record<string, unknown> = {}
    for (const [k, val] of Object.entries(v)) out[k] = resolveValue(val, ctx)
    return out
  }
  if (Array.isArray(v))
    return v.map(item => resolveValue(item, ctx))
  return v
}
```

---

## 测试策略

| 测试文件 | 覆盖点 |
|---|---|
| `def.test.ts` | bind() 自动 addEventListener；多个 bind 累计 events；emit payload 收集 |
| `components/*.test.ts` | 每个组件的 createElement 返回正确标签、props 正确写入、emit 触发正确事件 |
| `runtime/evaluate.test.ts` | eq/neq/gt/gte/lt/lte/exists 全覆盖；and/or/not；嵌套 ConditionGroup；非法 operator 容错 |
| `runtime/execute.test.ts` | 普通 Action；sequence 顺序；parallel 并发；if 真/假分支；tryCatch 异常分支 |
| `runtime/resolve.test.ts` | 字面量、简单 `$ref`、嵌套 `$ref`（含数组/对象） |
| `mount.test.ts` | 端到端：注册组件 + actions → AI 输出 mount → 模拟点击 → handler 被调用 → unmount 后 DOM 清空 |

使用 `vitest` + `jsdom`（`vitest.config.ts` 设 `environment: 'jsdom'`）。

---

## 验证步骤（Verification）

1. **构建验证**
   ```bash
   pnpm install
   pnpm run build           # unbuild 输出 dist/{index.mjs,index.cjs,index.d.ts}
   ```

2. **类型检查**
   ```bash
   pnpm run typecheck       # tsc --noEmit
   ```

3. **Lint**
   ```bash
   pnpm run lint            # eslint .
   ```

4. **单元测试 + 端到端测试**
   ```bash
   pnpm test                # vitest run，所有 tests/*.test.ts 通过
   ```

5. **浏览器 demo 验证**（手测）
   - 打开 `examples/basic.html`
   - 该 HTML 内嵌一段 AI 输出，调用 `mount()` 后真实渲染
   - 点击"保存"按钮 → 触发 `button.click` → 条件评估 → 执行 `api.request` 控制台输出 fetch 参数
   - blur 输入框 → 触发 `input.blur` → 触发 `toast.show` alert

6. **协议对齐验证**
   - 直接复用 `tests/integration/end-to-end.test.ts` 的场景思路：
     ```typescript
     // 拿 triggerix-ai 包生成的 systemPrompt/tools 喂给本库的 renderer
     const renderer = createNativeRenderer({
       components: [button, input, card, uploadButton, label, image, checkbox, select],
       actions: { 'api.request': async (p) => {...}, 'toast.show': (p) => {...} }
     })
     const scope = renderer.mount(aiOutput, document.getElementById('chat'))
     // 模拟用户点击 → 验证 handler 被调用
     scope.unmount()
     ```

7. **GitHub Release 流程验证**
   - tag `v0.0.1` → `.github/workflows/release.yaml` 自动 publish 到 npm
   - 在另一个项目 `pnpm add triggerix-ai-component-native` 验证可消费

---

## 待用户确认的关键决策（已通过 AskUserQuestion 确认）

| 决策项 | 选择 |
|---|---|
| 依赖来源 | 纯 npm 版本号（独立仓库不依赖 monorepo workspace） |
| 预建组件 | 8 个完整组件：button / input / card / uploadButton / label / image / checkbox / select |
| Actions API | 双写法：构造时 `actions: Record<id, handler>`（文档风格） + 链式 `bindAction(id, handler)`（对称 bind） |
| Scope 隔离 | JS 层 scope Map（与文档 100% 对齐，不设 DOM id、不用 Shadow DOM） |

---

## 实施顺序

1. **脚手架**：`package.json` / `tsconfig.json` / `eslint.config.ts` / `vitest.config.ts` / `build.config.ts` / `.gitignore` / `LICENSE`
2. **协议实现层**：`src/def.ts`（NativeComponentDef 基类）
3. **预建组件**：`src/components/*.ts`（8 个）
4. **运行时原语**：`src/runtime/resolve.ts` → `src/runtime/evaluate.ts` → `src/runtime/execute.ts` → `src/runtime/context.ts` → `src/runtime/mount.ts`
5. **Renderer**：`src/renderer.ts`（NativeRenderer + bindAction/unbindAction）+ `src/types.ts`
6. **公共入口**：`src/index.ts`（re-export）
7. **单元测试**：def → components → runtime/* → mount
8. **浏览器 demo**：`examples/basic.html`
9. **CI**：`.github/workflows/release.yaml`
10. **README**：使用说明、协议对齐说明、与 triggerix-ai 协作示例
11. **本地验证**：install → build → typecheck → lint → test → 浏览器 demo

---

## 关键文件清单（待创建）

- `package.json`、`tsconfig.json`、`eslint.config.ts`、`vitest.config.ts`、`build.config.ts`、`.gitignore`、`LICENSE`
- `src/index.ts`、`src/types.ts`、`src/def.ts`、`src/renderer.ts`
- `src/runtime/{mount,context,evaluate,execute,resolve}.ts`
- `src/components/{button,input,card,uploadButton,label,image,checkbox,select}.ts`
- `tests/def.test.ts`、`tests/components/*.test.ts`、`tests/runtime/*.test.ts`、`tests/mount.test.ts`
- `examples/basic.html`、`.github/workflows/release.yaml`、`README.md`