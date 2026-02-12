# ConsensusOS v1.0.0

> Modular, zero-dependency control plane for multi-chain consensus governance.

[![Tests](https://img.shields.io/badge/tests-295%20passing-brightgreen)](#)
[![Dependencies](https://img.shields.io/badge/dependencies-0-blue)](#)
[![License](https://img.shields.io/badge/license-MIT-green)](#)

## What is ConsensusOS?

ConsensusOS is a **plugin-based control plane** that governs multi-chain infrastructure. The core is deliberately thin — all functionality lives in plugins that communicate exclusively through a shared event bus. Governance rules are enforced via a fail-closed invariant engine.

**Key properties:**
- **Zero production dependencies** — no supply chain risk
- **Frozen Plugin API v1** — stable contract for all plugins
- **Fail-closed invariants** — invalid transitions are always rejected
- **Deterministic replay** — reproduce any system state from event history
- **Resource-bounded execution** — CPU, memory, and time limits via tokens

## Quick Start

```bash
git clone https://github.com/mcp-tool-shop-org/ConsensusOS.git
cd ConsensusOS
npm install
npm test  # 295 tests passing
```

See [QUICKSTART.md](QUICKSTART.md) for a full walkthrough.

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   CLI (entry)                   │
├─────────────────────────────────────────────────┤
│              Plugin SDK / Attestation           │
├──────────┬──────────┬──────────┬────────────────┤
│  Health  │ Verifier │  Config  │    Sandbox     │
│ Sentinel │ (Release)│ Guardian │ (Replay/Amend) │
├──────────┴──────────┴──────────┼────────────────┤
│           Governor Layer       │   Adapters     │
│  (Token · Policy · Queue)     │ (XRPL/ETH/ATOM)│
├────────────────────────────────┴────────────────┤
│                 Core Layer                      │
│    EventBus · InvariantEngine · Loader · Logger │
├─────────────────────────────────────────────────┤
│              Plugin API v1 (frozen)             │
└─────────────────────────────────────────────────┘
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full specification.

## Documentation

| Document | Purpose |
|----------|---------|
| [QUICKSTART.md](QUICKSTART.md) | Get running in 3 minutes |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Frozen v1.0 architecture spec |
| [PLUGIN_GUIDE.md](PLUGIN_GUIDE.md) | How to write a plugin |
| [ADAPTER_GUIDE.md](ADAPTER_GUIDE.md) | How to create a chain adapter |
| [SANDBOX_GUIDE.md](SANDBOX_GUIDE.md) | Sandbox, replay, and amendment walkthrough |
| [GOVERNOR_GUIDE.md](GOVERNOR_GUIDE.md) | Token execution, policies, build queue |
| [SECURITY.md](SECURITY.md) | Security policy and vulnerability reporting |
| [THREAT_MODEL.md](THREAT_MODEL.md) | STRIDE threat analysis |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Development workflow and PR checklist |
| [BUILD.md](BUILD.md) | Reproducible build and verification |

## Modules

| Module | Purpose |
|--------|---------|
| **Health Sentinel** | Node health monitoring via heartbeats |
| **Release Verifier** | Software release hash verification |
| **Config Guardian** | Configuration schema validation |
| **Sandbox Engine** | Isolated simulation, replay, amendments |
| **Governor** | Token-based execution, policy, build queue |

## Adapters

| Chain | Status |
|-------|--------|
| XRPL | ✅ Implemented |
| Ethereum | ✅ Implemented |
| Cosmos | ✅ Implemented |

## Testing

```bash
npm test         # Full suite (295 tests)
npx vitest       # Watch mode
```

Test categories:
- **Architecture** (16 tests) — structural invariant enforcement
- **Security** (27 tests) — abuse resistance and determinism
- **Stress** (22 tests) — edge cases and throughput
- **Unit** (230 tests) — component-level coverage

## License

MIT