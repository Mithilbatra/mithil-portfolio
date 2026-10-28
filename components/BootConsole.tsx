"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Tone = "sys" | "ok" | "accent" | "muted";
interface Line {
  text: string;
  tone: Tone;
}

const LINES: Line[] = [
  { text: "mithil@nitdelhi ~ % ./init --profile", tone: "accent" },
  { text: "[ok]  loading kernel ............... done", tone: "sys" },
  { text: "[ok]  mount languages .............. java · python · c++ · ts · go", tone: "sys" },
  { text: "[ok]  mount services ............... spring · postgres · docker", tone: "sys" },
  { text: "[ok]  link ai/ml modules ........... llm · rag · nlp · cv", tone: "sys" },
  { text: "[ok]  attach experience ............ hsbc // swe intern", tone: "sys" },
  { text: "status: AVAILABLE — SWE / NEW GRAD 2026", tone: "ok" },
  { text: "3 case files loaded. → open engineering log", tone: "muted" },
];

const toneClass: Record<Tone, string> = {
  sys: "text-dim",
  ok: "text-ok",
  accent: "text-accent",
  muted: "text-faint",
};

const CHAR_MS = 11; // per character
const LINE_PAUSE = 95; // gap between lines

export default function BootConsole() {
  // Precompute each line's start offset on a single virtual timeline.
  const { starts, total } = useMemo(() => {
    const s: number[] = [];
    let t = 0;
    for (const l of LINES) {
      s.push(t);
      t += l.text.length * CHAR_MS + LINE_PAUSE;
    }
    return { starts: s, total: t };
  }, []);

  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setElapsed(total);
      setDone(true);
      return;
    }

    let raf = 0;
    let interval = 0;
    const step = () => {
      const now = performance.now();
      if (startRef.current === null) startRef.current = now;
      const e = now - startRef.current;
      // Time-based: even if throttled to ~1s ticks, position jumps ahead correctly.
      setElapsed(e);
      if (e >= total) {
        setDone(true);
        if (raf) cancelAnimationFrame(raf);
        if (interval) window.clearInterval(interval);
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    // Backup ticker in case rAF is paused (hidden tab): guarantees completion.
    interval = window.setInterval(step, 250);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (interval) window.clearInterval(interval);
    };
  }, [total]);

  // Which line is currently typing, and how many chars of it are shown.
  let activeLine = LINES.length;
  for (let i = 0; i < LINES.length; i++) {
    if (elapsed >= starts[i]) activeLine = i;
  }
  const activeChars = done
    ? LINES[LINES.length - 1].text.length
    : Math.max(0, Math.floor((elapsed - starts[activeLine]) / CHAR_MS));

  return (
    <div className="panel-raised overflow-hidden shadow-panel">
      {/* title bar */}
      <div className="flex items-center gap-2 border-b border-line-strong bg-surface px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-crit/80" />
        <span className="h-3 w-3 rounded-full bg-warn/80" />
        <span className="h-3 w-3 rounded-full bg-ok/80" />
        <span className="ml-2 font-mono text-[11px] text-faint">
          mithil@nitdelhi: ~/portfolio
        </span>
      </div>

      {/* body */}
      <div className="min-h-[252px] px-4 py-4 font-mono text-[12.5px] leading-[1.9] sm:text-[13px]">
        {LINES.map((l, i) => {
          if (i > activeLine) return null;
          const full = l.text;
          const shown = i < activeLine ? full : full.slice(0, activeChars);
          const isActive = i === activeLine && !done;
          return (
            <div key={i} className={`${toneClass[l.tone]} break-words`}>
              {shown}
              {isActive ? <span className="cursor" aria-hidden /> : null}
            </div>
          );
        })}
        {done ? (
          <div className="mt-1 flex items-center text-accent">
            <span>{">"}</span>
            <span className="cursor" aria-hidden />
          </div>
        ) : null}
      </div>
    </div>
  );
}
