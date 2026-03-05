---
title: CLI Reference
description: All ConsensusOS CLI commands.
sidebar:
  order: 5
---

ConsensusOS provides a CLI for common operations. All commands run locally with zero network egress.

## Commands

| Command | Description |
|---------|-------------|
| `npx consensusos doctor` | Run health checks across all registered plugins |
| `npx consensusos verify` | Verify release artifact integrity |
| `npx consensusos config` | Configuration validation, diff, and migration |
| `npx consensusos status` | System status overview |
| `npx consensusos plugins` | List loaded plugins with version and capability info |
| `npx consensusos adapters` | List and query registered chain adapters |

## Examples

### Health check

```bash
npx consensusos doctor
```

Runs the HealthSentinel plugin's check routine against all registered nodes, reporting heartbeat status and any detected issues.

### Release verification

```bash
npx consensusos verify
```

Uses the ReleaseVerifier plugin to check artifact hashes against expected values.

### Configuration management

```bash
npx consensusos config
```

Runs the ConfigGuardian plugin's schema validation and reports any configuration drift or migration opportunities.
