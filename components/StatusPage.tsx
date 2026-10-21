"use client";

import { useEffect, useRef, useState } from "react";
import { CASE_FILES } from "@/lib/data";
import SectionHeader from "./ui/SectionHeader";
import Reveal from "./ui/Reveal";
import { useSeverityZone } from "./severity/useSeverityZone";

type Ping = { ok: boolean; ms: number | null };
const SLOTS = 36;
const POLL_MS = 30_000;
const LIVE = CASE_FILES.filter((c) => c.links.live);
const SOURCE_ONLY = CASE_FILES.filter((c) => !c.links.live);
const SITE = "portfolio";

const tone = (p: Ping) => (!p.ok ? "var(--crit-bright)" : (p.ms ?? 0) > 900 ? "var(--warn)" : "var(--ok)");
const uptime = (ps: Ping[]) => (ps.length ? `${((ps.filter((p) => p.ok).length / ps.length) * 100).toFixed(1)}%` : "—");

function Bars({ pings }: { pings: Ping[] }) {
  return (
    <div className="flex h-7 items-end gap-[3px]" aria-hidden>
      {Array.from({ length: Math.max(0, SLOTS - pings.length) }, (_, i) => (
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
  const [history, setHistory] = useState<Record<string, Ping[]>>({});
  const [checkedAt, setCheckedAt] = useState<string | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Poll only while the section is on (or near) screen, at most once per 10s.
  useEffect(() => {
    let alive = true;
    let near = false;
    let lastAt = 0;
    const push = (latest: Record<string, Ping>) =>
      setHistory((h) => {
        const next = { ...h };
        for (const [k, p] of Object.entries(latest)) next[k] = [...(h[k] ?? []), p].slice(-SLOTS);
        return next;
      });
    const poll = async () => {
      if (!near || document.hidden || Date.now() - lastAt < 10_000) return;
      lastAt = Date.now();
      const t0 = performance.now();
      try {
        const r = await fetch("/api/status", { cache: "no-store", signal: AbortSignal.timeout(10_000) });
        const d = (await r.json()) as Record<string, Ping>;
        if (!alive) return;
        setCheckedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
        // checks run in parallel, so the slowest one bounds the wait; the rest is this site
        const slowest = Math.max(0, ...Object.values(d).map((p) => p.ms ?? 0));
        push({ ...d, [SITE]: { ok: r.ok, ms: Math.max(1, Math.round(performance.now() - t0) - slowest) } });
      } catch {
        if (alive) push({ [SITE]: { ok: false, ms: null } });
      }
    };
    const io = new IntersectionObserver(
      ([e]) => {
        near = e.isIntersecting;
        poll();
      },
      { rootMargin: "300px 0px" }
    );
    if (sectionRef.current) io.observe(sectionRef.current);
    const id = setInterval(poll, POLL_MS);
    return () => {
      alive = false;
      clearInterval(id);
      io.disconnect();
    };
  }, []);

  const latest = (k: string) => history[k]?.[history[k].length - 1];
  const down = LIVE.filter((c) => latest(c.slug) && !latest(c.slug)!.ok).map((c) => c.slug);
  const checked = LIVE.some((c) => latest(c.slug));
  const zone = useSeverityZone<HTMLDivElement>(down.length ? "warn" : "ok", down.length ? `status · ${down.join(", ")} down` : undefined);

  const rows = [
    ...LIVE.map((c) => ({ name: c.slug, detail: c.links.live!.replace(/^https?:\/\//, "") })),
    { name: SITE, detail: "this site · vercel" },
  ];

  return (
    <section ref={sectionRef} id="status" className="scroll-mt-24 py-20 sm:py-28">
      <div className="shell">
        <SectionHeader
          index="04"
          command="curl -s /api/status | jq"
          title="System Status"
          blurb="Real health checks, not decoration — this page pings my production apps every 30 seconds while you're here."
        />
        <Reveal>
          <div ref={zone.ref} onPointerEnter={zone.onPointerEnter} onPointerLeave={zone.onPointerLeave} className="panel overflow-hidden">
            <div
              className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4"
              style={{ background: `color-mix(in srgb, ${down.length ? "var(--warn)" : "var(--ok)"} 8%, transparent)` }}
            >
              <span className="dot" style={down.length ? { background: "var(--warn)" } : undefined} aria-hidden />
              <span className="text-[15px] font-semibold text-ink">
                {!checked ? "Running checks…" : down.length ? `Degraded · ${down.join(", ")}` : "All systems operational"}
              </span>
              <span className="ml-auto font-mono text-[11px] text-faint" aria-live="polite">
                {checkedAt ? `last check ${checkedAt} · every 30s` : "checks every 30s while you're here"}
              </span>
            </div>

            <ul className="divide-y divide-line">
              {rows.map((row) => {
                const pings = history[row.name] ?? [];
                const p = pings[pings.length - 1];
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
                      <Bars pings={pings} />
                      <span className="w-14 text-right font-mono text-[11px] text-dim">{uptime(pings)}</span>
                    </div>
                  </li>
                );
              })}
              {SOURCE_ONLY.map((c) => (
                <li key={c.slug} className="flex flex-wrap items-center gap-2 px-5 py-3.5 font-mono text-[13px] text-dim">
                  <span className="h-2 w-2 rounded-full bg-line-strong" />
                  {c.slug}
                  <span className="text-[11px] text-faint">mobile app · runs in Expo Go — try the in-browser replica in its case file ·</span>
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
