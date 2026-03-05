---
title: Adapters
description: Multi-chain adapters for XRPL, Ethereum, and Cosmos.
sidebar:
  order: 4
---

ConsensusOS ships with adapters for three blockchain networks. Each adapter is a standard plugin that communicates through the event bus and respects the frozen Plugin API v1 contract.

## Available adapters

| Factory | Chain | Status |
|---------|-------|--------|
| `createXrplAdapter()` | XRPL | Implemented |
| `createEthereumAdapter()` | Ethereum | Implemented |
| `createCosmosAdapter()` | Cosmos | Implemented |

## Using an adapter

Register an adapter like any other plugin:

```ts
import {
  CoreLoader,
  createXrplAdapter,
  createEthereumAdapter,
} from "@mcptoolshop/consensus-os";

const loader = new CoreLoader();
loader.register(createXrplAdapter());
loader.register(createEthereumAdapter());
await loader.boot();
```

## CLI commands

```bash
npx consensusos adapters   # List and query chain adapters
```

## Writing a custom adapter

Chain adapters follow the same plugin pattern as all other modules. Extend `BasePlugin`, declare the `adapter` capability, and implement your chain-specific logic in the lifecycle hooks.

See the [ADAPTER_GUIDE.md](https://github.com/mcp-tool-shop-org/ConsensusOS/blob/main/ADAPTER_GUIDE.md) for a complete walkthrough.
