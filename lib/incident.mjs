// Resolvr-style incident lifecycle used by the live replay demo.
// triggered (P2) escalates to P1 if nobody acknowledges; ack → resolve → reset.
const NEXT = {
  idle: { TRIGGER: "triggered" },
  triggered: { ESCALATE: "escalated", ACK: "acked" },
  escalated: { ACK: "acked" },
  acked: { RESOLVE: "resolved" },
  resolved: { RESET: "idle" },
};

/** Next state for an event; events that don't apply leave the state unchanged. */
export const step = (state, event) => NEXT[state]?.[event] ?? state;

/** Page severity while the replay sits in each state. */
export const SEV = { idle: "ok", triggered: "warn", escalated: "crit", acked: "warn", resolved: "ok" };
