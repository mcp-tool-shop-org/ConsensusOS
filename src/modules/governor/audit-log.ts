/**
 * Execution Audit Log
 *
 * Immutable, append-only audit log for all governor actions.
 * Every token issuance, revocation, task execution, and policy
 * evaluation is recorded for forensic analysis and compliance.
 */

import type { AuditAction, AuditEntry } from "./types.js";

let auditCounter = 0;

export class AuditLog {
  private readonly entries: AuditEntry[] = [];

  /** Record an audit entry */
  record(action: AuditAction, actor: string, entityId: string, details: Record<string, unknown> = {}): AuditEntry {
    const entry: AuditEntry = {
      id: `audit-${++auditCounter}-${Date.now()}`,
      action,
      actor,
      entityId,
      details,
      timestamp: new Date().toISOString(),
    };
    this.entries.push(entry);
    return entry;
  }

  /** Get all entries */
  all(): readonly AuditEntry[] {
    return [...this.entries];
  }

  /** Filter entries by action */
  byAction(action: AuditAction): readonly AuditEntry[] {
    return this.entries.filter((e) => e.action === action);
  }

  /** Filter entries by actor */
  byActor(actor: string): readonly AuditEntry[] {
    return this.entries.filter((e) => e.actor === actor);
  }

  /** Filter entries by entity */
  byEntity(entityId: string): readonly AuditEntry[] {
    return this.entries.filter((e) => e.entityId === entityId);
  }

  /** Filter entries within a time range (ISO-8601 strings) */
  byTimeRange(start: string, end: string): readonly AuditEntry[] {
    return this.entries.filter((e) => e.timestamp >= start && e.timestamp <= end);
  }

  /** Get the most recent N entries */
  recent(count: number): readonly AuditEntry[] {
    return this.entries.slice(-count);
  }

  /** Total number of entries */
  get size(): number {
    return this.entries.length;
  }

  /** Clear all entries (for testing only) */
  clear(): void {
    this.entries.length = 0;
  }
}
