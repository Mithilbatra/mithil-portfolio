"use client";

import { useState, type FormEvent } from "react";
import { PROFILE } from "@/lib/data";
import { useSeverityZone } from "./severity/useSeverityZone";
import type { Sev } from "./severity/SeverityProvider";

const PRIORITIES: { id: string; label: string; sev: Sev; color: string }[] = [
  { id: "P0", label: "hiring", sev: "crit", color: "var(--crit-bright)" },
  { id: "P1", label: "project / freelance", sev: "warn", color: "var(--warn)" },
  { id: "P2", label: "collab", sev: "ok", color: "var(--info)" },
  { id: "P3", label: "just saying hi", sev: "ok", color: "var(--ok)" },
];

const field =
  "w-full rounded-md border border-line bg-bg px-3 py-2 font-mono text-[13px] text-ink placeholder:text-faint focus:border-accent-dim focus:outline-none";

/** Contact form framed as filing an incident. No backend: it opens the
 *  visitor's mail client with a prefilled ticket, so it always reaches me. */
export default function IncidentForm() {
  const [prio, setPrio] = useState(PRIORITIES[0]);
  const [subject, setSubject] = useState("");
  const [from, setFrom] = useState("");
  const [body, setBody] = useState("");
  const [ticket, setTicket] = useState<string | null>(null);
  const zone = useSeverityZone<HTMLFormElement>(prio.sev, `new incident · ${prio.id} ${prio.label}`);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const id = `INC-${Math.floor(1000 + Math.random() * 9000)}`;
    const subj = `[${prio.id}] ${subject.trim()} (${id})`;
    const text = `${body.trim()}\n\n— ${from.trim() || "anonymous"} · filed via the engineering log`;
    // encodeURIComponent keeps user text from injecting extra mailto fields
    window.location.href = `mailto:${PROFILE.email}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(text)}`;
    setTicket(id);
  };

  return (
    <form
      ref={zone.ref}
      onPointerEnter={zone.onPointerEnter}
      onPointerLeave={zone.onPointerLeave}
      onSubmit={submit}
      className="panel mt-4 overflow-hidden"
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface px-4 py-2.5">
        <span className="font-mono text-[11px] text-faint">
          <span className="text-accent">$</span> resolvr incident create
        </span>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("console:open", { detail: { input: "page " } }))}
          className="ml-auto font-mono text-[11px] text-faint transition-colors hover:text-accent"
        >
          or 📟 page on-call (⌘K / Ctrl K) →
        </button>
      </div>

      <div className="grid gap-4 px-4 py-5 sm:px-6 lg:grid-cols-[1fr_1.3fr]">
        <fieldset>
          <legend className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-faint">priority</legend>
          <div className="grid gap-2">
            {PRIORITIES.map((p) => (
              <label
                key={p.id}
                className="flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 font-mono text-[12.5px] transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent"
                style={{
                  borderColor: prio.id === p.id ? `color-mix(in srgb, ${p.color} 60%, transparent)` : "var(--line)",
                  background: prio.id === p.id ? `color-mix(in srgb, ${p.color} 9%, transparent)` : undefined,
                }}
              >
                <input type="radio" name="priority" className="sr-only" checked={prio.id === p.id} onChange={() => setPrio(p)} />
                <span className="font-semibold" style={{ color: p.color }}>
                  {p.id}
                </span>
                <span className="text-dim">{p.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-3">
          <input className={field} required maxLength={120} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="title — e.g. SWE new-grad role at Acme" aria-label="Incident title" />
          <input className={field} maxLength={80} value={from} onChange={(e) => setFrom(e.target.value)} placeholder="your name / company (optional)" aria-label="Your name" />
          <textarea className={`${field} min-h-[96px] resize-y`} required maxLength={2000} value={body} onChange={(e) => setBody(e.target.value)} placeholder="what's going on?" aria-label="Details" />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="rounded-md px-4 py-2 font-mono text-[13px] font-medium text-[#04140c] transition-transform hover:-translate-y-0.5"
              style={{ background: prio.color }}
            >
              file {prio.id} incident
            </button>
            {ticket ? (
              <span className="font-mono text-[12px] text-ok" role="status">
                {ticket} created · your mail client is open — hit send to page me ✓
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </form>
  );
}
