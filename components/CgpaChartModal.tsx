"use client";

import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { ACADEMIC } from "@/lib/data";

const W = 520;
const H = 310;
const PL = 42;
const PR = 18;
const PT = 26;
const PB = 40;
const Y_MIN = 7.5;
const Y_MAX = 10;
const GRID = [7.5, 8, 8.5, 9, 9.5, 10];

export default function CgpaChartModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const geo = useMemo(() => {
    const sgpa = ACADEMIC.sgpa;
    const n = sgpa.length;
    const cgpa = sgpa.map((_, i) => {
      const s = sgpa.slice(0, i + 1);
      return s.reduce((a, b) => a + b, 0) / s.length;
    });
    const plotW = W - PL - PR;
    const plotH = H - PT - PB;
    const x = (i: number) => PL + (n === 1 ? 0 : (i / (n - 1)) * plotW);
    const y = (v: number) => PT + (1 - (v - Y_MIN) / (Y_MAX - Y_MIN)) * plotH;
    const line = (arr: number[]) =>
      arr.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
    const cgpaD = line(cgpa);
    const sgpaD = line(sgpa);
    const areaD = `${cgpaD} L ${x(n - 1).toFixed(1)} ${y(Y_MIN).toFixed(1)} L ${x(0).toFixed(1)} ${y(
      Y_MIN
    ).toFixed(1)} Z`;
    return { sgpa, cgpa, n, x, y, cgpaD, sgpaD, areaD };
  }, []);

  // Escape to close, focus management, scroll lock
  useEffect(() => {
    if (!open) return;
    const prevActive = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevActive?.focus?.();
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const { sgpa, cgpa, n, x, y, cgpaD, sgpaD, areaD } = geo;
  const finalCgpa = cgpa[cgpa.length - 1].toFixed(2);

  return createPortal(
    <div
      className="modal-backdrop fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ background: "rgba(4,6,9,0.72)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="modal-panel panel-raised scanlines relative w-full max-w-xl overflow-hidden shadow-panel"
        role="dialog"
        aria-modal="true"
        aria-label="CGPA over time"
        onClick={(e) => e.stopPropagation()}
      >
        {/* title bar */}
        <div className="flex items-center gap-2 border-b border-line-strong bg-surface px-4 py-2.5">
          <span className="h-3 w-3 rounded-full bg-crit/80" />
          <span className="h-3 w-3 rounded-full bg-warn/80" />
          <span className="h-3 w-3 rounded-full bg-ok/80" />
          <span className="ml-2 font-mono text-[11px] text-faint">
            cgpa_trend.svg <span className="text-dim">// 6 semesters</span>
          </span>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close"
            className="ml-auto rounded-md border border-line p-1 text-faint transition-colors hover:border-crit hover:text-crit"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="px-4 py-5 sm:px-6">
          <div className="mb-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
              <span className="text-faint">{">"} </span>plot cgpa --over-time
            </div>
            <h3 className="mt-1 text-xl font-semibold text-ink">CGPA over time</h3>
            <p className="mt-1 text-[13px] text-dim">
              Running average of semester SGPAs — settling at{" "}
              <span className="font-mono text-accent">{finalCgpa}</span> after 6 semesters.
            </p>
          </div>

          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            role="img"
            aria-label={`Line chart of CGPA across ${n} semesters, ending at ${finalCgpa}`}
          >
            <defs>
              <linearGradient id="cgpaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* horizontal gridlines + y labels */}
            {GRID.map((g) => (
              <g key={g}>
                <line
                  x1={PL}
                  x2={W - PR}
                  y1={y(g)}
                  y2={y(g)}
                  stroke="var(--line)"
                  strokeWidth="1"
                  strokeDasharray={g === Y_MIN ? "0" : "3 4"}
                />
                <text x={PL - 8} y={y(g) + 3} textAnchor="end" className="font-mono" fontSize="9" fill="var(--text-faint)">
                  {g.toFixed(1)}
                </text>
              </g>
            ))}

            {/* x labels */}
            {sgpa.map((_, i) => (
              <text key={i} x={x(i)} y={H - PB + 18} textAnchor="middle" className="font-mono" fontSize="9" fill="var(--text-faint)">
                S{i + 1}
              </text>
            ))}

            {/* area under cgpa */}
            <path className="chart-area" d={areaD} fill="url(#cgpaFill)" />

            {/* sgpa line (secondary) */}
            <path
              className="chart-line d2"
              pathLength={1}
              d={sgpaD}
              fill="none"
              stroke="var(--info)"
              strokeWidth="1.6"
              strokeDasharray="4 4"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.85"
            />

            {/* cgpa line (primary) */}
            <path
              className="chart-line"
              pathLength={1}
              d={cgpaD}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* dots */}
            <g>
              {sgpa.map((v, i) => (
                <circle
                  key={`s${i}`}
                  className="chart-dot"
                  style={{ animationDelay: `${0.7 + i * 0.05}s` }}
                  cx={x(i)}
                  cy={y(v)}
                  r="2.6"
                  fill="var(--bg)"
                  stroke="var(--info)"
                  strokeWidth="1.6"
                />
              ))}
              {cgpa.map((v, i) => (
                <circle
                  key={`c${i}`}
                  className="chart-dot"
                  style={{ animationDelay: `${0.75 + i * 0.05}s` }}
                  cx={x(i)}
                  cy={y(v)}
                  r={i === cgpa.length - 1 ? 4.2 : 3.2}
                  fill="var(--bg)"
                  stroke="var(--accent)"
                  strokeWidth="2"
                />
              ))}
            </g>

            {/* cgpa value labels */}
            <g>
              {cgpa.map((v, i) => (
                <text
                  key={i}
                  className="chart-label font-mono"
                  style={{ animationDelay: `${1.05 + i * 0.05}s` }}
                  x={x(i)}
                  y={y(v) - 10}
                  textAnchor="middle"
                  fontSize="9.5"
                  fontWeight="600"
                  fill="var(--accent)"
                >
                  {v.toFixed(2)}
                </text>
              ))}
            </g>
          </svg>

          {/* legend */}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px]">
            <span className="inline-flex items-center gap-2 text-dim">
              <span className="inline-block h-[2px] w-5" style={{ background: "var(--accent)" }} />
              CGPA (cumulative)
            </span>
            <span className="inline-flex items-center gap-2 text-dim">
              <span className="inline-block h-0 w-5" style={{ borderTop: "1.6px dashed var(--info)" }} />
              SGPA (per semester)
            </span>
            <span className="ml-auto text-faint">
              final CGPA <span className="text-accent">{finalCgpa}</span>
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
