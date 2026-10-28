"use client";

import { useEffect, useRef } from "react";
import anime from "animejs";
import { useSeverity, type Sev } from "./SeverityProvider";

const CFG: Record<Sev, { score: number; label: string; tag: string; color: string }> = {
  ok: { score: 6, label: "NOMINAL", tag: "P4", color: "var(--ok)" },
  warn: { score: 58, label: "ELEVATED", tag: "P2", color: "var(--warn)" },
  crit: { score: 96, label: "CRITICAL", tag: "P0", color: "var(--crit-bright)" },
};

const R = 16;
const CIRC = 2 * Math.PI * R;

export default function SeverityHUD() {
  const { level, label } = useSeverity();
  const ringRef = useRef<SVGCircleElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const scoreRef = useRef(0);
  const mounted = useRef(false);

  useEffect(() => {
    const cfg = CFG[level];
    const setNum = (v: number) => {
      if (numRef.current) numRef.current.textContent = String(Math.round(v));
    };
    // The ring is animated by a CSS transition on stroke-dashoffset, so it is
    // always correct even if rAF-based anime never ticks (hidden tab, etc.).
    if (ringRef.current) ringRef.current.style.strokeDashoffset = String(CIRC * (1 - cfg.score / 100));

    const from = scoreRef.current;
    scoreRef.current = cfg.score;
    setNum(cfg.score); // final value set immediately — anime below is just flourish

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !mounted.current) {
      mounted.current = true;
      return;
    }
    const obj = { v: from };
    anime({
      targets: obj,
      v: cfg.score,
      duration: 900,
      easing: "easeOutExpo",
      update: () => setNum(obj.v),
    });
  }, [level]);

  const cfg = CFG[level];

  return (
    <div
      className="sev-hud"
      style={{ ["--hud-color" as string]: cfg.color }}
      role="status"
      aria-live="polite"
      aria-label={`Severity ${cfg.label}, score ${cfg.score} of 100`}
    >
      <div className="hud-ring">
        <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden>
          <circle cx="22" cy="22" r={R} fill="none" stroke="var(--line-strong)" strokeWidth="3" />
          <circle
            ref={ringRef}
            className="hud-ring-fill"
            cx="22"
            cy="22"
            r={R}
            fill="none"
            stroke={cfg.color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC}
          />
        </svg>
        <span ref={numRef} className="hud-score">
          {cfg.score}
        </span>
      </div>
      <div className="hud-meta">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-faint">
          severity index
        </span>
        <span className="font-mono text-[13px] font-semibold" style={{ color: cfg.color }}>
          {cfg.label} <span className="text-faint">· {cfg.tag}</span>
        </span>
        <span className="font-mono text-[10px] text-dim">{label ?? "all systems nominal"}</span>
      </div>
    </div>
  );
}
