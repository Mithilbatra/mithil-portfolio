"use client";

import { useEffect, useState } from "react";

type Data = {
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

  useEffect(() => {
    fetch("/api/pitwall")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setFailed(true));
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-md border border-line bg-surface/60 p-3 sm:p-4">
      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
        <span className="text-faint">{">"} </span>live from pit-wall · /api/weekend
      </div>
      {failed ? (
        <p className="mt-2 font-mono text-[12.5px] text-warn">telemetry link down — the live app is still one click away below.</p>
      ) : !data?.race ? (
        <p className="mt-2 font-mono text-[12.5px] text-faint">fetching race weekend…</p>
      ) : (
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
      )}
    </div>
  );
}
