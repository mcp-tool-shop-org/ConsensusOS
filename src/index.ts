/**
 * ConsensusOS — Modular Control Plane
 *
 * Public API surface. This is the only entry point for consumers.
 */

// Core
export { CoreLoader } from "./core/loader.js";
export { CoreEventBus, WILDCARD } from "./core/event-bus.js";
export { CoreInvariantEngine } from "./core/invariant-engine.js";
export { createLogger } from "./core/logger.js";

// Types
export type { EventBus, EventHandler, Unsubscribe } from "./core/event-bus.js";
export type {
  InvariantEngine,
  Invariant,
  InvariantResult,
  TransitionVerdict,
} from "./core/invariant-engine.js";
export type { LoaderOptions, PluginState } from "./core/loader.js";
export type {
  Plugin,
  PluginManifest,
  PluginContext,
  PluginConfig,
  PluginFactory,
  PluginId,
  Capability,
  SemVer,
  ConsensusEvent,
  LifecycleResult,
  Logger,
} from "./plugins/api.js";

// State
export { CoreStateRegistry } from "./state/registry.js";
export type {
  StateRegistry,
  StateEntry,
  StateTransition,
  StateSnapshot,
} from "./state/registry.js";

// Modules
export { HealthSentinel, createHealthSentinel } from "./modules/health/health-sentinel.js";
export { ReleaseVerifier, createReleaseVerifier } from "./modules/verifier/release-verifier.js";
export { ConfigGuardian, createConfigGuardian } from "./modules/config/config-guardian.js";

// Adapters
export { XrplAdapter, createXrplAdapter } from "./adapters/xrpl/xrpl-adapter.js";

// CLI
export { dispatch, registeredCommands, main as runCli } from "./cli/cli.js";
export type { CliContext, CommandResult, CommandHandler } from "./cli/cli.js";
