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
