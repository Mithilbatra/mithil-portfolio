"use client";

import { useEffect, useState } from "react";
import { step, SEV } from "@/lib/incident.mjs";
import type { Level } from "@/lib/data";
import { useSeverity, type Sev } from "./severity/SeverityProvider";
import LogLine from "./ui/LogLine";

type State = "idle" | "triggered" | "escalated" | "acked" | "resolved";

const ESCALATE_MS = 6000;
const INC = "INC-0042";

const COLUMNS: { title: string; holds: State[] }[] = [
  { title: "triggered", holds: ["triggered", "escalated"] },
  { title: "acknowledged", holds: ["acked"] },
  { title: "resolved", holds: ["resolved"] },
];

const LOG: Record<Exclude<State, "idle">, { level: Level; text: string }> = {
  triggered: { level: "WARN", text: "alert fired · pit-wall-api p95 > 2s · P2 · paging primary on-call" },
  escalated: { level: "CRIT", text: "no ack in 6s · escalated P2 → P1 · paging secondary" },
  acked: { level: "INFO", text: "acknowledged · runbook: drain + restart worker pool" },
  resolved: { level: "INFO", text: "p95 back to 180ms · incident resolved ✓" },
};

const stamp = () => new Date().toTimeString().slice(0, 8);

/** Resolvr, live: fire a test alert and run it through triggered → escalated → acked → resolved. */
export default function IncidentReplay() {
  const [state, setState] = useState<State>("idle");
  const [log, setLog] = useState<{ t: string; level: Level; text: string }[]>([]);
  const [p1, setP1] = useState(false);
  const { setHover } = useSeverity();

  const send = (ev: string) => setState((s) => step(s, ev) as State);

  // log + page severity follow the incident
  useEffect(() => {
    if (state === "idle") {
      setLog([]);
      setP1(false);
      setHover(null);
      return;
    }
    if (state === "escalated") setP1(true);
    setLog((l) => [...l, { t: stamp(), ...LOG[state] }]);
    setHover({ sev: SEV[state] as Sev, label: `${INC} · ${state}` });
  }, [state, setHover]);

  // unacknowledged alerts escalate
  useEffect(() => {
    if (state !== "triggered") return;
    const id = setTimeout(() => send("ESCALATE"), ESCALATE_MS);
    return () => clearTimeout(id);
  }, [state]);

  useEffect(() => () => setHover(null), [setHover]);

  const prio = p1 ? "P1" : "P2";
  const prioColor = p1 ? "var(--crit-bright)" : "var(--warn)";

  return (
    <div className="rounded-md border border-line bg-surface/60 p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
          <span className="text-faint">{">"} </span>live replay · try resolvr
        </div>
        {state === "idle" ? (
          <button type="button" onClick={() => send("TRIGGER")} className="replay-btn" style={{ color: "var(--warn)" }}>
            ▶ fire test alert
          </button>
        ) : state === "resolved" ? (
          <button type="button" onClick={() => send("RESET")} className="replay-btn">
            ↺ reset
          </button>
        ) : null}
      </div>

      {state === "idle" ? (
        <p className="mt-3 font-mono text-[12.5px] text-faint">
          Fire an alert, then acknowledge it before it escalates. This is the state machine Resolvr runs on.
        </p>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {COLUMNS.map((col) => (
              <div key={col.title} className="min-h-[118px] rounded-md border border-line bg-bg/60 p-2">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">{col.title}</div>
                {col.holds.includes(state) ? (
                  <div className="replay-card rounded border bg-panel p-2" style={{ borderColor: `color-mix(in srgb, ${state === "resolved" ? "var(--ok)" : prioColor} 55%, transparent)` }}>
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-[10px] text-dim">{INC}</span>
                      <span className="font-mono text-[10px] font-semibold" style={{ color: state === "resolved" ? "var(--ok)" : prioColor }}>
                        {state === "resolved" ? "OK" : prio}
                      </span>
                    </div>
                    <div className="mt-1 text-[12px] leading-snug text-ink">pit-wall-api p95 &gt; 2s</div>
                    {state === "triggered" ? <div key="esc" className="escalate-bar mt-2" style={{ animationDuration: `${ESCALATE_MS}ms` }} /> : null}
                    {state === "triggered" || state === "escalated" ? (
                      <button type="button" onClick={() => send("ACK")} className="replay-btn mt-2 w-full justify-center">
                        ack
                      </button>
                    ) : null}
                    {state === "acked" ? (
                      <button type="button" onClick={() => send("RESOLVE")} className="replay-btn mt-2 w-full justify-center" style={{ color: "var(--ok)" }}>
                        resolve
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-md border border-line bg-bg/60 py-1.5" aria-live="polite">
            {log.map((l, i) => (
              <LogLine key={i} time={l.t} level={l.level} emoji={false}>
                {l.text}
              </LogLine>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
