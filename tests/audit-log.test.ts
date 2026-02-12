import { describe, it, expect, beforeEach } from "vitest";
import { AuditLog } from "../src/modules/governor/audit-log.js";

describe("AuditLog", () => {
  let log: AuditLog;

  beforeEach(() => {
    log = new AuditLog();
  });

  it("records and retrieves entries", () => {
    log.record("token.issued", "alice", "token-1", { cpu: 1000 });
    log.record("task.queued", "bob", "task-1");

    expect(log.size).toBe(2);
    const all = log.all();
    expect(all[0].action).toBe("token.issued");
    expect(all[0].actor).toBe("alice");
    expect(all[0].entityId).toBe("token-1");
    expect(all[0].details).toEqual({ cpu: 1000 });
    expect(all[1].action).toBe("task.queued");
  });

  it("filters by action", () => {
    log.record("token.issued", "a", "t1");
    log.record("task.queued", "b", "t2");
    log.record("token.issued", "c", "t3");

    const issued = log.byAction("token.issued");
    expect(issued).toHaveLength(2);
    expect(issued.every((e) => e.action === "token.issued")).toBe(true);
  });

  it("filters by actor", () => {
    log.record("token.issued", "alice", "t1");
    log.record("token.issued", "bob", "t2");
    log.record("task.queued", "alice", "t3");

    const alice = log.byActor("alice");
    expect(alice).toHaveLength(2);
  });

  it("filters by entity", () => {
    log.record("token.issued", "a", "token-42");
    log.record("token.revoked", "a", "token-42");
    log.record("token.issued", "b", "token-99");

    const entries = log.byEntity("token-42");
    expect(entries).toHaveLength(2);
  });

  it("returns recent entries", () => {
    for (let i = 0; i < 10; i++) {
      log.record("token.issued", "a", `t-${i}`);
    }

    const recent = log.recent(3);
    expect(recent).toHaveLength(3);
    expect(recent[0].entityId).toBe("t-7");
    expect(recent[2].entityId).toBe("t-9");
  });

  it("clears all entries", () => {
    log.record("token.issued", "a", "t1");
    log.record("token.issued", "b", "t2");
    expect(log.size).toBe(2);

    log.clear();
    expect(log.size).toBe(0);
  });

  it("entries have timestamps and unique IDs", () => {
    const e1 = log.record("token.issued", "a", "t1");
    const e2 = log.record("token.revoked", "a", "t1");

    expect(e1.id).not.toBe(e2.id);
    expect(e1.timestamp).toBeDefined();
    expect(e2.timestamp).toBeDefined();
  });
});
