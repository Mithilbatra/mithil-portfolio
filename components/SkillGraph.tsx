"use client";

import { useState } from "react";
import { CASE_FILES, EXPERIENCE } from "@/lib/data";

const PROJECTS = [
  ...CASE_FILES.map((c) => ({ id: c.slug, name: c.title, skills: c.stack })),
  ...EXPERIENCE.map((e) => ({ id: e.org.toLowerCase(), name: `${e.org} · intern`, skills: e.tags })),
];
const uses = (s: string) => PROJECTS.filter((p) => p.skills.includes(s));
// most-shared skills on top, so the busiest edges cluster together
const SKILLS = Array.from(new Set(PROJECTS.flatMap((p) => p.skills))).sort(
  (a, b) => uses(b).length - uses(a).length || a.localeCompare(b)
);

const W = 680;
const ROW = 24;
const PAD = 22;
const SX = 230;
const PX = 470;
const H = PAD * 2 + (SKILLS.length - 1) * ROW;
const sy = (i: number) => PAD + i * ROW;
const py = (j: number) => PAD + (j * (H - PAD * 2)) / (PROJECTS.length - 1);

type Active = { kind: "skill" | "project"; id: string } | null;

/** Bipartite skill → project graph; hover or focus a node to trace its edges. */
export default function SkillGraph() {
  const [active, setActive] = useState<Active>(null);

  const skillLit = (s: string) =>
    !active || (active.kind === "skill" ? active.id === s : PROJECTS.find((p) => p.id === active.id)?.skills.includes(s));
  const projectLit = (p: (typeof PROJECTS)[number]) =>
    !active || (active.kind === "project" ? active.id === p.id : p.skills.includes(active.id));
  const edgeLit = (s: string, pid: string) =>
    !!active && (active.kind === "skill" ? active.id === s : active.id === pid);

  const node = (kind: "skill" | "project", id: string, label: string) => ({
    tabIndex: 0,
    role: "button",
    "aria-label": label,
    onMouseEnter: () => setActive({ kind, id }),
    onFocus: () => setActive({ kind, id }),
    onMouseLeave: () => setActive(null),
    onBlur: () => setActive(null),
    className: "cursor-pointer focus:outline-none",
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="group" aria-label="Skills mapped to the projects that use them">
      {PROJECTS.flatMap((p, j) =>
        p.skills.map((s) => {
          const i = SKILLS.indexOf(s);
          const mid = (SX + PX) / 2;
          return (
            <path
              key={`${s}-${p.id}`}
              d={`M ${SX} ${sy(i)} C ${mid} ${sy(i)}, ${mid} ${py(j)}, ${PX} ${py(j)}`}
              fill="none"
              stroke={edgeLit(s, p.id) ? "var(--accent)" : "var(--line-strong)"}
              strokeOpacity={active ? (edgeLit(s, p.id) ? 0.9 : 0.12) : 0.55}
              strokeWidth={edgeLit(s, p.id) ? 1.6 : 1}
              style={{ transition: "stroke-opacity .2s, stroke .2s" }}
            />
          );
        })
      )}

      {SKILLS.map((s, i) => (
        <g key={s} {...node("skill", s, `${s}: used in ${uses(s).map((p) => p.name).join(", ")}`)}>
          <circle cx={SX} cy={sy(i)} r={4} fill="var(--bg)" stroke={skillLit(s) ? "var(--accent)" : "var(--line-strong)"} strokeWidth={1.6} />
          <text
            x={SX - 12}
            y={sy(i) + 4}
            textAnchor="end"
            fontSize="12"
            className="font-mono"
            fill={skillLit(s) ? "var(--text)" : "var(--text-faint)"}
            style={{ transition: "fill .2s" }}
          >
            {s}
            <tspan fill="var(--text-faint)"> ×{uses(s).length}</tspan>
          </text>
        </g>
      ))}

      {PROJECTS.map((p, j) => (
        <g key={p.id} {...node("project", p.id, `${p.name}: ${p.skills.join(", ")}`)}>
          <rect x={PX} y={py(j) - 11} width={W - PX - 4} height={22} rx={5} fill="var(--surface)" stroke={projectLit(p) ? "var(--accent-dim)" : "var(--line)"} />
          <circle cx={PX} cy={py(j)} r={4.5} fill={projectLit(p) ? "var(--accent)" : "var(--line-strong)"} />
          <text x={PX + 14} y={py(j) + 4} fontSize="12.5" className="font-mono" fill={projectLit(p) ? "var(--accent)" : "var(--text-faint)"}>
            {p.name}
          </text>
        </g>
      ))}
    </svg>
  );
}
