"use client";

import { useEffect, useRef } from "react";
import anime from "animejs";
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

/** Fixed pill that drops in when severity is warn/crit. Visibility is
 *  CSS-driven (never sticks); anime.js adds a shake/pop when it escalates. */
export default function CriticalIndicator() {
  const { level, label } = useSeverity();
  const iconRef = useRef<HTMLSpanElement>(null);
  const visible = level !== "ok";
  const color = level === "crit" ? "var(--crit-bright)" : "var(--warn)";
  const title = level === "crit" ? "CRITICAL" : "WARNING";

  useEffect(() => {
    const el = iconRef.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    anime.remove(el);
    if (level === "crit") {
      anime({ targets: el, translateX: [0, -2.5, 2.5, -2, 2, 0], duration: 540, easing: "easeInOutSine" });
    } else if (level === "warn") {
      anime({ targets: el, scale: [0.55, 1], duration: 440, easing: "easeOutBack" });
    }
  }, [level]);

  return (
    <div className="ci-wrap">
      <div
        className={`ci-pill ${visible ? "is-visible" : ""} ${level === "crit" ? "crit-glow" : ""}`}
        style={{ borderColor: `color-mix(in srgb, ${color} 55%, transparent)` }}
        role="status"
        aria-live="polite"
      >
        <span ref={iconRef} className="inline-flex">
          <Triangle color={color} />
        </span>
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
