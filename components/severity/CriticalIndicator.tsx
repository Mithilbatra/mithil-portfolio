"use client";

import { useSeverity } from "./SeverityProvider";

function Triangle({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.2 22.2 20.5H1.8L12 3.2Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill={`${color}22`}
      />
      <path d="M12 10v4.2" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
      <circle cx="12" cy="17.4" r="1.05" fill={color} />
    </svg>
  );
}

/** Fixed pill that drops in when the page severity is warn/crit — a red (or
 *  amber) warning triangle naming what's being showcased. CSS-driven so it can
 *  never get stuck between rapid severity changes. */
export default function CriticalIndicator() {
  const { level, label } = useSeverity();
  const visible = level !== "ok";
  const color = level === "crit" ? "var(--crit-bright)" : "var(--warn)";
  const title = level === "crit" ? "CRITICAL" : "WARNING";

  return (
    <div className="ci-wrap">
      <div
        className={`ci-pill ${visible ? "is-visible" : ""} ${level === "crit" ? "crit-glow" : ""}`}
        style={{ borderColor: `color-mix(in srgb, ${color} 55%, transparent)` }}
        role="status"
        aria-live="polite"
      >
        <Triangle color={color} />
        <span
          className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em]"
          style={{ color }}
        >
          {title}
        </span>
        {label ? (
          <>
            <span className="text-line-strong">·</span>
            <span className="font-mono text-[11px] text-dim">{label}</span>
          </>
        ) : null}
      </div>
    </div>
  );
}
