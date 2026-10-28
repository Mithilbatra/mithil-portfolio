"use client";

import { useEffect, useRef, useState } from "react";
import { step, SEV } from "@/lib/incident.mjs";
import type { Level } from "@/lib/data";
import { useSeverity, type Sev } from "./severity/SeverityProvider";
import LogLine from "./ui/LogLine";

type State = "idle" | "triggered" | "escalated" | "acked" | "resolved";

const ESCALATE_MS = 6000;
const INC = "INC-0042";

// Resolvr's own palette + status names (resolvr-expo IncidentsScreen)
const NAVY = "#2c3e50";
const STATUS: Record<Exclude<State, "idle">, { label: string; color: string }> = {
  triggered: { label: "ACTIVE", color: "#f39c12" }, // the backend's Incident.status enum calls this "active"
  escalated: { label: "ESCALATED", color: "#e74c3c" },
  acked: { label: "ACKNOWLEDGED", color: "#3498db" },
  resolved: { label: "RESOLVED", color: "#27ae60" },
};
const PUSH: Partial<Record<State, string>> = {
  triggered: "🔔 New incident · pit-wall-api p95 > 2s (P2)",
  escalated: "🚨 Escalated to P1 · no one acknowledged in 6s",
};
const LOG: Record<Exclude<State, "idle">, { level: Level; text: string }> = {
  triggered: { level: "WARN", text: "alert fired · pit-wall-api p95 > 2s · P2 · push sent to primary" },
  escalated: { level: "CRIT", text: "no ack in 6s · escalated P2 → P1 · paging secondary" },
  acked: { level: "INFO", text: "acknowledged from the app · runbook: restart worker pool" },
  resolved: { level: "INFO", text: "p95 back to 180ms · incident resolved ✓" },
};
const HISTORY = ["INC-0041 · db pool exhausted", "INC-0039 · webhook 5xx spike"];

const stamp = () => new Date().toTimeString().slice(0, 8);

/** Resolvr is a React Native app that needs Expo Go — this is a faithful
 *  in-browser replica of its on-call flow, on the same state machine. */
export default function IncidentReplay() {
  const [state, setState] = useState<State>("idle");
  const [log, setLog] = useState<{ t: string; level: Level; text: string }[]>([]);
  const [p1, setP1] = useState(false);
  const [push, setPush] = useState<string | null>(null);
  const startedAt = useRef(0);
  const { setHover } = useSeverity();

  const send = (ev: string) => setState((s) => step(s, ev) as State);

  // log, push notification and page severity follow the incident
  useEffect(() => {
    if (state === "idle") {
      setLog([]);
      setP1(false);
      setHover(null);
      return;
    }
    if (state === "triggered") startedAt.current = Date.now();
    if (state === "escalated") setP1(true);
    setLog((l) => [...l, { t: stamp(), ...LOG[state] }]);
    setHover({ sev: SEV[state] as Sev, label: `${INC} · ${STATUS[state].label.toLowerCase()}` });
    const msg = PUSH[state];
    if (!msg) return;
    setPush(msg);
    const id = setTimeout(() => setPush(null), 3200);
    return () => clearTimeout(id);
  }, [state, setHover]);

  // unacknowledged alerts escalate
  useEffect(() => {
    if (state !== "triggered") return;
    const id = setTimeout(() => send("ESCALATE"), ESCALATE_MS);
    return () => clearTimeout(id);
  }, [state]);

  useEffect(() => () => setHover(null), [setHover]);

  const s = state === "idle" ? null : STATUS[state];

  return (
    <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[290px_1fr]">
      {/* phone */}
      <div className="mx-auto w-full max-w-[290px] rounded-[2.2rem] border border-line-strong bg-[#05070a] p-2 shadow-panel">
        <div className="relative h-[520px] overflow-hidden rounded-[1.75rem] text-[13px]" style={{ background: "#ecf0f1", color: NAVY }}>
          <div className="absolute left-1/2 top-2 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-[#05070a]" />

          {push ? (
            <div key={push} className="push-in absolute inset-x-2 top-9 z-30 rounded-2xl bg-white/95 p-3 shadow-lg">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-[#7f8c8d]">
                <span className="grid h-4 w-4 place-items-center rounded text-[9px] font-bold text-white" style={{ background: NAVY }}>
                  R
                </span>
                resolvr · now
              </div>
              <div className="mt-1 text-[12.5px] font-medium">{push}</div>
            </div>
          ) : null}

          <div className="px-5 pb-3 pt-9 text-white" style={{ background: NAVY }}>
            <div className="flex items-center justify-between text-[10px] opacity-70">
              <span>on-call: you</span>
              <span>{state === "idle" || state === "resolved" ? "0" : "1"} open</span>
            </div>
            <div className="mt-1 text-xl font-bold">Incidents</div>
          </div>
          <div className="flex gap-5 border-b border-[#dfe4e6] bg-white px-5 text-[12px]">
            <span className="border-b-2 py-2 font-semibold" style={{ borderColor: NAVY }}>
              Incidents
            </span>
            <span className="py-2 text-[#95a5a6]">Issues</span>
            <span className="py-2 text-[#95a5a6]">Projects</span>
          </div>

          <div className="space-y-2.5 p-3">
            {!s ? (
              <div className="rounded-xl bg-white p-5 text-center">
                <div className="mx-auto grid h-10 w-10 place-items-center rounded-full text-lg text-white" style={{ background: "#27ae60" }}>
                  ✓
                </div>
                <div className="mt-2 font-semibold">All quiet</div>
                <div className="text-[12px] text-[#7f8c8d]">No open incidents.</div>
                <button
                  type="button"
                  onClick={() => send("TRIGGER")}
                  className="mt-4 w-full rounded-lg py-2.5 text-[13px] font-semibold text-white"
                  style={{ background: NAVY }}
                >
                  Trigger test alert
                </button>
              </div>
            ) : (
              <div className="replay-card rounded-xl border-l-4 bg-white p-3.5" style={{ borderColor: s.color }}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#7f8c8d]">{INC}</span>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: s.color }}>
                    {s.label}
                  </span>
                </div>
                <div className="mt-1.5 font-semibold">pit-wall-api p95 &gt; 2s</div>
                <div className="text-[11px] text-[#7f8c8d]">
                  service: pit-wall · priority {p1 ? "P1" : "P2"}
                </div>
                {state === "triggered" ? (
                  <div key="esc" className="escalate-bar mt-2.5" style={{ animationDuration: `${ESCALATE_MS}ms` }} />
                ) : null}
                {state === "triggered" || state === "escalated" ? (
                  <button type="button" onClick={() => send("ACK")} className="mt-3 w-full rounded-lg py-2 text-[13px] font-semibold text-white" style={{ background: "#3498db" }}>
                    Acknowledge
                  </button>
                ) : null}
                {state === "acked" ? (
                  <button type="button" onClick={() => send("RESOLVE")} className="mt-3 w-full rounded-lg py-2 text-[13px] font-semibold text-white" style={{ background: "#27ae60" }}>
                    Resolve
                  </button>
                ) : null}
                {state === "resolved" ? (
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-[#27ae60]">resolved in {Math.max(1, Math.round((Date.now() - startedAt.current) / 1000))}s</span>
                    <button type="button" onClick={() => send("RESET")} className="font-semibold underline" style={{ color: NAVY }}>
                      run again
                    </button>
                  </div>
                ) : null}
              </div>
            )}
            {HISTORY.map((h) => (
              <div key={h} className="flex items-center justify-between rounded-xl bg-white/70 px-3.5 py-2.5 text-[12px] text-[#95a5a6]">
                {h}
                <span className="text-[10px] font-bold text-[#27ae60]">RESOLVED</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* explanation + server-side timeline */}
      <div className="min-w-0">
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
          <span className="text-faint">{">"} </span>try it · no expo go needed
        </div>
        <p className="mt-2 text-[14.5px] leading-relaxed text-dim">
          Trigger an alert, then acknowledge it before it escalates.
        </p>
        <dl className="mt-3 grid gap-2 text-[13px] leading-relaxed">
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">the mobile app</dt>
            <dd className="text-dim">
              React Native (Expo) client on a Node.js + Express API with MongoDB, Socket.IO and Firebase Cloud
              Messaging. Runs in Expo Go against its own backend.
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">this browser demo</dt>
            <dd className="text-dim">
              A separate React re-implementation inside this portfolio. It reproduces the mobile workflow — the
              backend&apos;s status names, push-style alerts and escalation — with a client-side state machine, and does{" "}
              <span className="text-ink">not</span> connect to Resolvr&apos;s backend. Escalation is compressed from 5
              minutes (up to 3 attempts in the real API) to one escalation after 6 seconds.
            </dd>
          </div>
        </dl>

        {/* escalation logic, lit up as the replay moves through it */}
        <ol className="mt-4 flex flex-wrap items-center gap-1.5 font-mono text-[11px]" aria-label="Escalation states">
          {(["triggered", "escalated", "acked", "resolved"] as const).map((st, i) => (
            <li key={st} className="flex items-center gap-1.5">
              {i > 0 ? <span className="text-faint">{i === 1 ? "—6s, no ack→" : "→"}</span> : null}
              <span
                className="rounded border px-2 py-0.5"
                style={
                  state === st
                    ? { color: STATUS[st].color, borderColor: STATUS[st].color, background: `${STATUS[st].color}1f` }
                    : { color: "var(--text-faint)", borderColor: "var(--line)" }
                }
              >
                {STATUS[st].label.toLowerCase()}
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-1.5 font-mono text-[11px] text-faint">
          acknowledging while active skips escalation · transitions unit-tested (lib/incident.test.mjs)
        </p>
        <div className="mt-4 rounded-md border border-line bg-bg/60 py-1.5" aria-live="polite">
          {log.length ? (
            log.map((l, i) => (
              <LogLine key={i} time={l.t} level={l.level} emoji={false}>
                {l.text}
              </LogLine>
            ))
          ) : (
            <div className="px-3 py-1 font-mono text-[12px] text-faint">server log — waiting for an alert…</div>
          )}
        </div>
      </div>
    </div>
  );
}
