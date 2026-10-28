"use client";

import { useEffect, useState } from "react";

type Data = {
  fetchedAt: string;
  race: { event: string; location: string; round: number; utc: string } | null;
  podium: { driver: string; team: string; prob: number }[];
};

function countdown(ms: number) {
  if (ms <= 0) return "lights out";
  const s = Math.floor(ms / 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${Math.floor(s / 86400)}d ${p(Math.floor(s / 3600) % 24)}h ${p(Math.floor(s / 60) % 60)}m ${p(s % 60)}s`;
}

/** Live from the deployed Pit Wall app: next GP countdown + the model's predicted podium. */
export default function RaceWidget() {
  const [data, setData] = useState<Data | null>(null);
  const [failed, setFailed] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  // Load once; on failure keep retrying every 30s so the widget recovers when Pit Wall is back.
  useEffect(() => {
    let alive = true;
    let retry = 0;
    const load = () =>
      fetch("/api/pitwall", { signal: AbortSignal.timeout(25_000) })
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d: Data) => {
          if (!alive) return;
          setData(d);
          setFailed(false);
        })
        .catch(() => {
          if (!alive) return;
          setFailed(true);
          retry = window.setTimeout(load, 30_000);
        });
    load();
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      alive = false;
      clearTimeout(retry);
      clearInterval(id);
    };
  }, []);

  return (
    <div className="rounded-md border border-line bg-surface/60 p-3 sm:p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
        <span>
          <span className="text-faint">{">"} </span>live from pit-wall · /api/weekend
        </span>
        {data ? (
          <span className="normal-case tracking-normal text-faint" suppressHydrationWarning>
            data as of {new Date(data.fetchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        ) : null}
      </div>
      <div aria-live="polite">
        {failed ? (
          <p className="mt-2 font-mono text-[12.5px] text-warn">
            Couldn&apos;t reach the Pit Wall server — retrying every 30 seconds. The screenshot above shows the live
            dashboard.
          </p>
        ) : !data ? (
          <p className="mt-2 font-mono text-[12.5px] text-faint">loading the next race weekend…</p>
        ) : !data.race ? (
          <p className="mt-2 font-mono text-[12.5px] text-faint">No race weekend scheduled right now — the season is on a break.</p>
        ) : null}
      </div>
      {data?.race ? (
        <div className="mt-3 grid gap-4 sm:grid-cols-[1fr_1.2fr]">
          <div>
            <div className="font-mono text-[11px] text-faint">
              R{data.race.round} · {data.race.location}
            </div>
            <div className="mt-0.5 text-[15px] font-semibold text-ink">{data.race.event}</div>
            <div className="mt-2 font-mono text-xl text-accent tabular-nums" suppressHydrationWarning>
              {countdown(new Date(data.race.utc).getTime() - now)}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">to lights out</div>
          </div>
          <ol className="space-y-1.5">
            <li className="font-mono text-[10px] uppercase tracking-[0.14em] text-faint">model forecast · podium probability</li>
            {data.podium.map((d, i) => (
              <li key={d.driver} className="font-mono text-[12px]">
                <div className="flex justify-between gap-2">
                  <span className="truncate text-ink">
                    <span className="text-faint">P{i + 1}</span> {d.driver} <span className="text-faint">· {d.team}</span>
                  </span>
                  <span className="text-accent">{Math.round(d.prob * 100)}%</span>
                </div>
                <div className="mt-1 h-1 rounded-full bg-line">
                  <div className="h-1 rounded-full bg-accent" style={{ width: `${d.prob * 100}%` }} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
