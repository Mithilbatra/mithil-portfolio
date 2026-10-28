import test from "node:test";
import assert from "node:assert/strict";
import { step } from "./incident.mjs";

test("happy path: trigger → ack → resolve → reset", () => {
  let s = "idle";
  for (const [ev, want] of [["TRIGGER", "triggered"], ["ACK", "acked"], ["RESOLVE", "resolved"], ["RESET", "idle"]]) {
    s = step(s, ev);
    assert.equal(s, want);
  }
});

test("escalates only while unacknowledged", () => {
  assert.equal(step("triggered", "ESCALATE"), "escalated");
  assert.equal(step("acked", "ESCALATE"), "acked");
  assert.equal(step("escalated", "ACK"), "acked");
});

test("cannot resolve before ack; unknown events are ignored", () => {
  assert.equal(step("triggered", "RESOLVE"), "triggered");
  assert.equal(step("escalated", "RESOLVE"), "escalated");
  assert.equal(step("idle", "NOPE"), "idle");
});
