---
title: API Reference
description: Full API surface, exports, and security model.
sidebar:
  order: 6
---

## Core exports

| Export | Description |
|--------|-------------|
| `CoreLoader` | Plugin lifecycle orchestrator — register, boot, shutdown |
| `CoreEventBus` | Ordered, typed, replayable event bus with wildcard subscriptions |
| `CoreInvariantEngine` | Fail-closed invariant engine with append-only registration |
| `createLogger(scope)` | Structured logger scoped to a module |

## Module factories

| Factory | Purpose |
|---------|---------|
| `createHealthSentinel()` | Node health monitoring via heartbeats |
| `createReleaseVerifier()` | Software release hash verification |
| `createConfigGuardian()` | Configuration schema validation and migration |
| `createSandboxPlugin()` | Isolated simulation, replay, and amendment engine |
| `createGovernorPlugin()` | Token-based execution, policy enforcement, build queue |

## Adapter factories

| Factory | Chain |
|---------|-------|
| `createXrplAdapter()` | XRPL |
| `createEthereumAdapter()` | Ethereum |
| `createCosmosAdapter()` | Cosmos |

## Plugin SDK exports

| Export | Description |
|--------|-------------|
| `BasePlugin` | Abstract base class with lifecycle defaults |
| `ManifestBuilder` | Fluent builder for type-safe plugin manifests |
| `validatePlugin()` | Pre-registration validation |
| `AttestationPipeline` | Release attestation and build provenance |

## Subpath exports

```ts
import { ... } from "@mcptoolshop/consensus-os";          // Full API
import { ... } from "@mcptoolshop/consensus-os/plugin";   // Plugin SDK + types
import { ... } from "@mcptoolshop/consensus-os/cli";      // CLI dispatch
```

## Testing

295 tests across four categories:

| Category | Tests | Coverage |
|----------|-------|----------|
| Architecture | 16 | Structural invariant enforcement |
| Security | 27 | Abuse resistance and determinism |
| Stress | 22 | Edge cases and throughput |
| Unit | 230 | Component-level coverage |

```bash
npm test         # Full suite
npx vitest       # Watch mode
```

## Security model

| Aspect | Detail |
|--------|--------|
| **Data accessed** | In-memory state for governance tokens, audit logs, policy evaluation |
| **Data NOT accessed** | No network egress, no telemetry, no cloud services, no credentials |
| **Permissions** | Standard Node.js process — no elevated permissions required |
| **Dependencies** | Zero runtime dependencies |
