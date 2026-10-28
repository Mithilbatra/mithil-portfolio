"use client";

import { useEffect, useState } from "react";
import { CASE_FILES } from "@/lib/data";
import SectionHeader from "./ui/SectionHeader";
import Reveal from "./ui/Reveal";
import { useSeverityZone } from "./severity/useSeverityZone";

type Ping = { ok: boolean; ms: number | null };
const SLOTS = 36;
const POLL_MS = 30_000;
const pitWall = CASE_FILES.find((c) => c.slug === "pit-wall");
const sourceOnly = CASE_FILES.filter((c) => !c.links.live);

const tone = (p: Ping) => (!p.ok ? "var(--crit-bright)" : (p.ms ?? 0) > 900 ? "var(--warn)" : "var(--ok)");
const uptime = (ps: Ping[]) => (ps.length ? `${((ps.filter((p) => p.ok).length / ps.length) * 100).toFixed(1)}%` : "—");

function Bars({ pings }: { pings: Ping[] }) {
  const empty = Math.max(0, SLOTS - pings.length);
  return (
    <div className="flex h-7 items-end gap-[3px]" aria-hidden>
      {Array.from({ length: empty }, (_, i) => (
        <span key={`e${i}`} className="h-[30%] w-[5px] rounded-sm bg-line" />
      ))}
      {pings.map((p, i) => (
        <span
          key={i}
          className="w-[5px] rounded-sm"
          style={{ height: `${p.ok ? Math.max(30, Math.min(100, ((p.ms ?? 0) / 1200) * 100)) : 100}%`, background: tone(p) }}
        />
      ))}
    </div>
  );
}

/** Real health checks, polled every 30s while the tab is visible. */
export default function StatusPage() {
  const [pit, setPit] = useState<Ping[]>([]);
  const [site, setSite] = useState<Ping[]>([]);

  useEffect(() => {
    let alive = true;
    const poll = async () => {
      if (document.hidden) return;
      const t0 = performance.now();
      try {
        const r = await fetch("/api/status", { cache: "no-store" });
        const d = (await r.json()) as { pitwall: Ping };
        if (!alive) return;
        // the route waits on Pit Wall, so subtract that to get this site's own round trip
        const total = Math.round(performance.now() - t0);
        setSite((s) => [...s, { ok: r.ok, ms: Math.max(1, total - (d.pitwall.ms ?? 0)) }].slice(-SLOTS));
        setPit((p) => [...p, d.pitwall].slice(-SLOTS));
      } catch {
        if (alive) setSite((s) => [...s, { ok: false, ms: null }].slice(-SLOTS));
      }
    };
    poll();
    const id = setInterval(poll, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const last = pit[pit.length - 1];
  const degraded = !!last && !last.ok;
  const zone = useSeverityZone<HTMLDivElement>(degraded ? "warn" : "ok", degraded ? "status · pit-wall down" : undefined);

  const live = [
    { name: "pit-wall", detail: pitWall?.links.live?.replace(/^https?:\/\//, "") ?? "", pings: pit },
    { name: "portfolio", detail: "this site · vercel", pings: site },
  ];

  return (
    <section id="status" className="scroll-mt-24 py-20 sm:py-28">
      <div className="shell">
        <SectionHeader
          index="04"
          command="curl -s /api/status | jq"
          title="System Status"
          blurb="Real health checks, not decoration — this page pings my production services every 30 seconds while you're here."
        />
        <Reveal>
          <div ref={zone.ref} onPointerEnter={zone.onPointerEnter} onPointerLeave={zone.onPointerLeave} className="panel overflow-hidden">
            <div
              className="flex items-center gap-3 border-b border-line px-5 py-4"
              style={{ background: `color-mix(in srgb, ${degraded ? "var(--warn)" : "var(--ok)"} 8%, transparent)` }}
            >
              <span className="dot" style={degraded ? { background: "var(--warn)" } : undefined} aria-hidden />
              <span className="text-[15px] font-semibold text-ink">
                {!last ? "Running checks…" : degraded ? "Degraded performance · pit-wall" : "All systems operational"}
              </span>
              <span className="ml-auto font-mono text-[11px] text-faint">poll 30s · session window</span>
            </div>

            <ul className="divide-y divide-line">
              {live.map((row) => {
                const p = row.pings[row.pings.length - 1];
                return (
                  <li key={row.name} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 font-mono text-[13px] text-ink">
                        <span className="h-2 w-2 rounded-full" style={{ background: p ? tone(p) : "var(--line-strong)" }} />
                        {row.name}
                        <span className="text-[11px]" style={{ color: p ? tone(p) : "var(--text-faint)" }}>
                          {!p ? "checking" : !p.ok ? "down" : `${p.ms}ms`}
                        </span>
                      </div>
                      <div className="mt-0.5 truncate font-mono text-[11px] text-faint">{row.detail}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Bars pings={row.pings} />
                      <span className="w-14 text-right font-mono text-[11px] text-dim">{uptime(row.pings)}</span>
                    </div>
                  </li>
                );
              })}
              {sourceOnly.map((c) => (
                <li key={c.slug} className="flex items-center gap-2 px-5 py-3.5 font-mono text-[13px] text-dim">
                  <span className="h-2 w-2 rounded-full bg-line-strong" />
                  {c.slug}
                  <span className="text-[11px] text-faint">no public endpoint · </span>
                  {c.links.source ? (
                    <a href={c.links.source} target="_blank" rel="noopener noreferrer" className="link-underline text-[11px]">
                      source ↗
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
