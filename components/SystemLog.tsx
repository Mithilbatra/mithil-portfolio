"use client";

import { useEffect, useRef, useState } from "react";
import { SYSTEM_LOG, type LogEntry } from "@/lib/data";
import LogLine from "./ui/LogLine";

const MAX_VISIBLE = 9;
const TICK_MS = 850;

interface Row extends LogEntry {
  n: number;
  time: string;
}

function stamp(d = new Date()) {
  const p = (x: number, n = 2) => String(x).padStart(n, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}.${p(
    Math.floor(d.getMilliseconds() / 10)
  )}`;
}

export default function SystemLog() {
  const [rows, setRows] = useState<Row[]>([]);
  const idx = useRef(0);
  const count = useRef(0);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const emit = () => {
      const entry = SYSTEM_LOG[idx.current % SYSTEM_LOG.length];
      idx.current += 1;
      count.current += 1;
      const row: Row = { ...entry, n: count.current, time: stamp() };
      setRows((prev) => [...prev, row].slice(-MAX_VISIBLE));
    };

    if (reduce) {
      // Static: show a full pass of the log, no streaming.
      const all = SYSTEM_LOG.map((e, i) => ({ ...e, n: i + 1, time: stamp() }));
      setRows(all.slice(-MAX_VISIBLE));
      return;
    }

    // Seed a couple immediately so the panel isn't empty, then stream.
    emit();
    emit();
    const id = setInterval(emit, TICK_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="panel-raised scanlines relative overflow-hidden shadow-panel">
      {/* title bar */}
      <div className="flex items-center gap-2 border-b border-line-strong bg-surface px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-crit/80" />
        <span className="h-3 w-3 rounded-full bg-warn/80" />
        <span className="h-3 w-3 rounded-full bg-ok/80" />
        <span className="ml-2 font-mono text-[11px] text-faint">
          mithil@nitdelhi: <span className="text-dim">~/system.log</span>
        </span>
        <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-crit-bright">
          <span className="rec-dot" aria-hidden />
          rec
        </span>
      </div>

      {/* command line */}
      <div className="border-b border-line px-3 py-2 font-mono text-[12px] text-faint">
        <span className="text-accent">$</span> tail -f system.log{" "}
        <span className="text-dim">--follow --level=all</span>
      </div>

      {/* streaming body — newest pushes up from the bottom */}
      <div className="flex min-h-[248px] flex-col justify-end px-1.5 py-2">
        {rows.map((r, i) => (
          <LogLine
            key={r.n}
            n={r.n}
            time={r.time}
            level={r.level}
            source={r.source}
            className={i === rows.length - 1 ? "opacity-100" : ""}
          >
            {r.msg}
            {i === rows.length - 1 ? <span className="cursor" aria-hidden /> : null}
          </LogLine>
        ))}
      </div>
    </div>
  );
}
