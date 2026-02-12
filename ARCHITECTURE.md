# ConsensusOS Architecture

> Phase 1 — Foundation  
> Last updated: 2025-01-01

---

## Overview

ConsensusOS is a **modular, plugin-based control plane** designed to govern multi-chain infrastructure. The core is deliberately thin — all functionality lives in plugins that communicate exclusively through a shared event bus. Governance rules are enforced via a fail-closed invariant engine that prevents invalid state transitions.

```
┌──────────────────────────────────────────────────────────┐
│                     ConsensusOS Core                     │
│                                                          │
│  ┌───────────┐  ┌───────────────┐  ┌─────────────────┐  │
│  │ Core      │  │  Event Bus    │  │  Invariant       │  │
│  │ Loader    │──│  (pub/sub)    │──│  Engine          │  │
│  │           │  │               │  │  (fail-closed)   │  │
│  └─────┬─────┘  └───────┬───────┘  └────────┬────────┘  │
│        │                │                    │           │
│   ┌────┴────────────────┴────────────────────┴────┐      │
│   │              Plugin Context (injected)        │      │
│   └──┬──────────┬──────────┬──────────┬───────────┘      │
│      │          │          │          │                   │
│  ┌───┴───┐ ┌───┴───┐ ┌───┴───┐ ┌───┴───┐               │
│  │Plugin │ │Plugin │ │Plugin │ │Plugin │  ...            │
│  │  A    │ │  B    │ │  C    │ │  D    │               │
│  └───────┘ └───────┘ └───────┘ └───────┘               │
└──────────────────────────────────────────────────────────┘
```

## Design Principles

| # | Principle | Enforcement |
|---|-----------|-------------|
| 1 | **Core stays thin** | Core only provides loader, event bus, and invariant engine |
| 2 | **Everything is a plugin** | All functionality implements the `Plugin` interface |
| 3 | **No direct module-to-module calls** | Plugins communicate only via the event bus |
| 4 | **Fail-closed invariants** | Unknown state or thrown errors → transition rejected |
| 5 | **Append-only governance** | Invariants cannot be unregistered at runtime |
| 6 | **Deterministic ordering** | Events carry monotonic sequence numbers; boot order is topologically sorted |
| 7 | **Observable** | Full event history and invariant audit log are replayable |

---

## Core Components

### 1. Plugin API v1 (`src/plugins/api.ts`)

Every module in ConsensusOS implements the `Plugin` interface:

```typescript
interface Plugin {
  readonly manifest: PluginManifest;
  init(ctx: PluginContext): Promise<LifecycleResult>;
  start(): Promise<LifecycleResult>;
  stop(): Promise<LifecycleResult>;
  destroy?(): Promise<void>;
}
```

**Manifest** declares identity, version, capabilities, and dependencies:

```typescript
interface PluginManifest {
  readonly id: PluginId;
  readonly name: string;
  readonly version: SemVer;
  readonly capabilities: readonly Capability[];
  readonly dependencies?: readonly PluginId[];
}
```

**Capability tags** classify plugins: `adapter`, `sentinel`, `verifier`, `guardian`, `sandbox`, `governor`, or any custom string.

**Plugin Context** is injected during `init()` and provides the plugin's only window into the core:

```typescript
interface PluginContext {
  readonly events: EventBus;
  readonly invariants: InvariantEngine;
  readonly config: PluginConfig;
  readonly log: Logger;
}
```

**Factories** are the recommended export pattern — the core controls instantiation timing:

```typescript
type PluginFactory = () => Plugin;
```

### 2. Event Bus (`src/core/event-bus.ts`)

The event bus is the central nervous system. All inter-plugin communication flows through it.

**Event envelope:**

```typescript
interface ConsensusEvent<T = unknown> {
  readonly topic: string;      // Dot-delimited (e.g. "health.check.completed")
  readonly source: PluginId;   // Emitting plugin
  readonly timestamp: string;  // ISO-8601
  readonly sequence: number;   // Monotonic, gap-free
  readonly data: T;            // Typed payload
}
```

**Key behaviors:**

| Feature | Details |
|---------|---------|
| Topic matching | Exact match, `prefix.*` wildcard, or `*` (all events) |
| Ordering | Monotonic sequence numbers, strictly increasing |
| Error isolation | Handler errors are caught and logged, never propagated |
| History | Full ordered event log available for replay/debugging |
| Reset | Clears log, sequence counter, and all subscriptions |

**Topic convention:** `<domain>.<action>[.<detail>]`  
Examples: `health.sentinel.ready`, `core.boot.complete`, `config.updated`

### 3. Invariant Engine (`src/core/invariant-engine.ts`)

Fail-closed enforcement of system invariants. This is the Registrum integration point — structural governance rules that constrain what the system is allowed to do.

**Invariant registration:**

```typescript
interface Invariant<T = unknown> {
  readonly name: string;         // e.g. "config.schema-valid"
  readonly owner: PluginId;      // Registering plugin
  readonly description: string;  // Human-readable purpose
  check(context: T): boolean | Promise<boolean>;
}
```

**Verdict structure:**

```typescript
interface TransitionVerdict {
  readonly allowed: boolean;              // true only if ALL pass
  readonly results: readonly InvariantResult[];
  readonly violations: readonly InvariantResult[];
  readonly timestamp: string;
}
```

**Key behaviors:**

| Feature | Details |
|---------|---------|
| Fail-closed | If `check()` throws, the invariant counts as failed |
| Append-only | Invariants cannot be removed once registered |
| Uniqueness | Duplicate invariant names throw at registration time |
| Async support | Check predicates can be synchronous or `async` |
| Audit log | Every `TransitionVerdict` is recorded for later inspection |

### 4. Core Loader (`src/core/loader.ts`)

Discovers, validates, dependency-sorts, and orchestrates plugin lifecycles.

**Boot sequence:**

```
register → resolve dependencies → init (dependency order) → start → [running]
```

**Shutdown sequence:**

```
stop (reverse order) → destroy (reverse order)
```

**Dependency resolution** uses Kahn's algorithm for topological sorting with cycle detection:

1. Build an adjacency graph from plugin manifests  
2. Compute in-degrees for each plugin  
3. Process plugins with zero in-degree first  
4. If unprocessed plugins remain after exhausting the queue → circular dependency error

**Key behaviors:**

| Feature | Details |
|---------|---------|
| Factories | Accepts `Plugin` instances or `PluginFactory` functions |
| Config injection | Per-plugin config via `LoaderOptions.configs[pluginId]` |
| Fail-fast | If any plugin fails `init()`, the boot halts immediately |
| State tracking | Each plugin's state is tracked: `registered → initialized → started → stopped → error` |
| Events | Emits `core.boot.complete` and `core.shutdown.complete` |

---

## Plugin Lifecycle

```
    ┌────────────┐
    │ registered  │  register() called
    └─────┬──────┘
          │
          ▼
    ┌────────────┐
    │ initialized │  init(ctx) → { ok: true }
    └─────┬──────┘
          │
          ▼
    ┌────────────┐
    │  started    │  start() → { ok: true }
    └─────┬──────┘
          │
          ▼  (shutdown)
    ┌────────────┐
    │  stopped    │  stop() → { ok: true }
    └─────┬──────┘
          │
          ▼
    ┌────────────┐
    │ destroyed   │  destroy() (optional)
    └────────────┘
```

**Error state:** If `init()` or `start()` returns `{ ok: false }`, the plugin enters the `error` state and boot halts.

---

## Directory Structure

```
ConsensusOS/
├── src/
│   ├── index.ts                 # Barrel exports
│   ├── plugins/
│   │   └── api.ts               # Plugin API v1 — interfaces & types
│   ├── core/
│   │   ├── event-bus.ts         # CoreEventBus implementation
│   │   ├── invariant-engine.ts  # CoreInvariantEngine implementation
│   │   ├── loader.ts            # CoreLoader — lifecycle orchestration
│   │   └── logger.ts            # Structured console logger
│   └── mocks/
│       ├── echo-plugin.ts       # Wildcard subscriber (testing)
│       ├── health-sentinel-plugin.ts  # Invariant registration example
│       └── config-guardian-plugin.ts  # Dependency & config example
├── tests/
│   ├── event-bus.test.ts        # 9 tests
│   ├── invariant-engine.test.ts # 9 tests
│   └── loader.test.ts           # 12 tests
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## Inter-Module Communication

Plugins never import or call each other directly. All communication follows one of two patterns:

### Pattern 1: Event-Driven (async, decoupled)

```typescript
// Publisher (in start or runtime)
ctx.events.publish("health.check.completed", this.manifest.id, {
  nodesChecked: 5,
  allHealthy: true,
});

// Subscriber (set up in init or start)
ctx.events.subscribe("health.*", (event) => {
  // React to health domain events
});
```

### Pattern 2: Invariant-Gated Transitions

```typescript
// Register invariant (in init)
ctx.invariants.register({
  name: "config.required-keys-present",
  owner: this.manifest.id,
  description: "All required configuration keys must be present",
  check: (ctx) => requiredKeys.every((k) => k in ctx),
});

// Check before state transition (in runtime)
const verdict = await ctx.invariants.check(proposedState);
if (!verdict.allowed) {
  // Transition rejected — log violations
  verdict.violations.forEach((v) => log.error(`Invariant violated: ${v.name}`));
}
```

---

## Testing Strategy

- **Unit tests**: Each core component (event bus, invariant engine, loader) is tested in isolation
- **Integration tests**: Loader tests boot multiple plugins together to verify cross-cutting behavior
- **Mock plugins**: Three mock plugins exercise different capabilities:
  - `EchoPlugin` — wildcard subscriber, verifies event bus wiring
  - `HealthSentinelPlugin` — registers invariants, emits events, configurable via context
  - `ConfigGuardianPlugin` — declares dependency on health-sentinel, validates config

**Test coverage target:** 30/30 tests passing (9 + 9 + 12)

---

## Phase Roadmap

| Phase | Focus | Status |
|-------|-------|--------|
| **1 — Foundation** | Core architecture, Plugin API, Event Bus, Invariant Engine, Loader | ✅ Complete |
| 2 — Core Modules | Health Sentinel, Release Verifier, Config Guardian (real), CLI, XRPL Adapter v1 | Planned |
| 3 — Sandbox Engine | Docker simulation, snapshot injection, amendment simulation, replay | Planned |
| 4 — Governor Layer | Token-based execution, CPU/RAM throttling, build queue, policy engine | Planned |
| 5 — Platform Expansion | Multi-chain adapters, public plugin SDK, docs portal, CI/CD attestation | Planned |

---

## Key Decisions

1. **TypeScript ESM-only** — `"type": "module"` with `.js` import extensions for maximum compatibility
2. **Vitest** — fast, ESM-native, TypeScript-first test runner
3. **No runtime dependencies** — core has zero production dependencies (all `devDependencies`)
4. **Factory pattern** — plugins exported as factories so the core controls instantiation timing
5. **Fire-and-forget async handlers** — event bus dispatches synchronously; async handlers run concurrently but errors are caught and logged, never propagated
6. **Kahn's algorithm** — deterministic topological sort for dependency resolution; circular dependencies are a hard error
