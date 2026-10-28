"use client";

import { useEffect, useState } from "react";
import { TELEMETRY } from "@/lib/data";
import CountUp from "./ui/CountUp";
import CgpaChartModal from "./CgpaChartModal";

function MiniChartIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 19V5" />
      <path d="M4 15l4-4 3 3 5-6" />
      <path d="M4 19h16" />
    </svg>
  );
}

export default function TelemetryStrip() {
  const [openCgpa, setOpenCgpa] = useState(false);

  // the console's `cgpa` command opens the same popup
  useEffect(() => {
    const show = () => setOpenCgpa(true);
    if (window.location.hash === "#cgpa") show(); // arrived from `cgpa` on another page
    window.addEventListener("cgpa:open", show);
    return () => window.removeEventListener("cgpa:open", show);
  }, []);

  return (
    <>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-4">
        {TELEMETRY.map((m) => {
          const content = (
            <>
              <CountUp
                value={m.value}
                className="block font-mono text-2xl font-semibold text-accent sm:text-3xl"
              />
              <div className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-ink">
                <span className="h-1.5 w-1.5 rounded-full bg-ok" aria-hidden />
                {m.label}
              </div>
              {m.detail ? (
                <div className="mt-1 font-mono text-[11px] text-faint">{m.detail}</div>
              ) : null}
            </>
          );

          if (m.label === "CGPA") {
            return (
              <button
                key={m.label}
                type="button"
                onClick={() => setOpenCgpa(true)}
                aria-haspopup="dialog"
                aria-label={`CGPA ${m.value} — view the trend over time`}
                className="group relative cursor-pointer bg-panel px-5 py-6 text-left transition-colors hover:bg-raised"
              >
                {content}
                <span className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[9px] text-faint transition-colors group-hover:border-accent-dim group-hover:text-accent">
                  <MiniChartIcon />
                  trend
                </span>
              </button>
            );
          }

          return (
            <div key={m.label} className="group bg-panel px-5 py-6 transition-colors hover:bg-raised">
              {content}
            </div>
          );
        })}
      </div>
      <CgpaChartModal open={openCgpa} onClose={() => setOpenCgpa(false)} />
    </>
  );
}
