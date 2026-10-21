"use client";

import { useEffect, useState } from "react";
import { NAV } from "@/lib/data";

const NODES = [{ id: "top", label: "boot" }, ...NAV.map((n) => ({ id: n.id, label: n.label.toLowerCase() }))];

/** Left-edge incident timeline: one node per section, filled in the current
 *  severity colour up to where you are. Desktop-wide only (needs the margin). */
export default function IncidentSpine() {
  const [fill, setFill] = useState(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY + window.innerHeight * 0.4;
      const tops = NODES.map((n) => document.getElementById(n.id)?.offsetTop ?? 0);
      let i = 0;
      tops.forEach((t, k) => {
        if (y >= t) i = k;
      });
      const next = tops[i + 1] ?? document.documentElement.scrollHeight;
      const frac = Math.min(1, Math.max(0, (y - tops[i]) / Math.max(1, next - tops[i])));
      setActive(i);
      setFill(Math.min(1, (i + frac) / (NODES.length - 1)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <nav aria-label="Section timeline" className="spine fixed left-6 top-1/2 z-30 hidden -translate-y-1/2 2xl:block">
      <div className="spine-track" aria-hidden>
        <div className="spine-fill" style={{ height: `${fill * 100}%` }} />
      </div>
      <ol className="relative flex h-full flex-col justify-between">
        {NODES.map((n, i) => (
          <li key={n.id}>
            <a
              href={`#${n.id}`}
              className={`spine-node ${i <= active ? "is-past" : ""} ${i === active ? "is-active" : ""}`}
              aria-current={i === active ? "location" : undefined}
            >
              <span className="spine-dot" aria-hidden />
              <span className="spine-label">
                T+{String(i).padStart(2, "0")} {n.label}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
