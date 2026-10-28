"use client";

import { useState } from "react";
import Image from "next/image";
import type { CaseFile as CaseFileType, Level } from "@/lib/data";
import StatusChip from "./ui/StatusChip";
import SevBadge from "./ui/SevBadge";
import LevelBadge from "./ui/LevelBadge";
import { useSeverityZone } from "./severity/useSeverityZone";
import IncidentReplay from "./IncidentReplay";
import RaceWidget from "./RaceWidget";
import { ChevronDown, GitHub, ExternalLink } from "./ui/Icons";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
      <span className="text-faint">{">"} </span>
      {children}
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2 text-[15px] leading-relaxed text-dim">{children}</div>
    </div>
  );
}

const linkBtn =
  "inline-flex items-center gap-2 rounded-md border px-4 py-2 font-mono text-[13px] transition-colors";

/** One project, read as a case study: problem → my role → approach → architecture
 *  → key challenge → results → demo + source. */
export default function CaseFile({ item, defaultOpen = false }: { item: CaseFileType; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `case-${item.id}-body`;
  const demoId = `demo-${item.slug}`;
  const symptomLevel: Level = item.severity === 1 ? "ERROR" : "WARN";
  const zoneSev = item.severity === 1 ? "crit" : item.severity === 2 ? "warn" : "ok";
  const zone = useSeverityZone<HTMLElement>(zoneSev, `${item.title} · SEV-${item.severity}`);
  const hasDemo = !!item.evidence || item.slug === "pit-wall" || item.slug === "resolvr";

  return (
    <article
      ref={zone.ref}
      onPointerEnter={zone.onPointerEnter}
      onPointerLeave={zone.onPointerLeave}
      className={`group panel overflow-hidden transition-colors duration-300 ${open ? "border-accent-dim" : "hover:border-line-strong"}`}
    >
      {/* Header — click to toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-start gap-4 px-5 py-5 text-left sm:px-7 sm:py-6"
      >
        <span className="mt-1 hidden font-mono text-sm text-faint sm:block">
          CASE
          <br />
          <span className="text-dim">{item.id}</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h3 className="text-xl font-semibold text-ink sm:text-2xl">{item.title}</h3>
            <SevBadge severity={item.severity} />
            <StatusChip status={item.status} />
            <span className="font-mono text-xs text-faint">built {item.year}</span>
          </span>
          <span className="mt-1.5 block text-sm text-dim">{item.subtitle}</span>

          <span className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 font-mono text-[12.5px]">
            <LevelBadge level={symptomLevel} />
            <span className="text-faint">symptom</span>
            <span className="text-dim">{item.symptom}</span>
          </span>
          {item.result ? (
            <span className="mt-1.5 flex flex-wrap items-baseline gap-x-2 font-mono text-[12.5px]">
              <span className="font-semibold text-ok">✓ result</span>
              <span className="text-ink">{item.result}</span>
            </span>
          ) : null}

          <span className="mt-3 flex flex-wrap gap-1.5">
            {item.stack.map((s) => (
              <span key={s} className="chip">
                {s}
              </span>
            ))}
          </span>
        </span>
        <ChevronDown
          className={`mt-1 shrink-0 text-faint transition-transform duration-300 ${open ? "rotate-180 text-accent" : "group-hover:text-dim"}`}
          width={20}
          height={20}
        />
      </button>

      {/* Expandable body */}
      <div id={panelId} className="grid grid-cols-1 transition-[grid-template-rows] duration-500 ease-out" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
        <div className="overflow-hidden">
          <div className="space-y-7 border-t border-line px-5 py-6 sm:px-7 sm:py-7">
            {item.note ? (
              <div className="rounded-md border-l-2 border-accent bg-accent/[0.06] px-4 py-3 font-mono text-[13px] text-accent">⚑ {item.note}</div>
            ) : null}

            <Block label="the problem">{item.problem}</Block>
            {item.role ? <Block label="my role">{item.role}</Block> : null}
            {item.credit ? <Block label="credits">{item.credit}</Block> : null}
            <Block label="the approach">{item.approach}</Block>

            <div>
              <Label>architecture</Label>
              <ol className="arch-flow mt-3 rounded-md border border-line bg-surface/60 px-4 py-4">
                {item.architecture.map((a, i) => (
                  <li key={i} className="arch-node">
                    <span className="arch-num">{i + 1}</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border-l-2 border-crit bg-crit/[0.05] px-4 py-3.5">
                <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-crit">key challenge</div>
                <p className="mt-2 text-[14.5px] leading-relaxed text-dim">{item.hardPart}</p>
              </div>
              <div className="rounded-md border-l-2 border-ok bg-ok/[0.05] px-4 py-3.5">
                <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ok">resolution</div>
                <p className="mt-2 text-[14.5px] leading-relaxed text-dim">{item.learned}</p>
              </div>
            </div>

            {item.evaluation ? (
              <div>
                <Label>results · model vs baseline</Label>
                <p className="mt-2 text-[14px] leading-relaxed text-dim">
                  {item.evaluation.metric} {item.evaluation.method} Baseline: {item.evaluation.baseline}.
                </p>
                <div className="mt-3 overflow-x-auto rounded-md border border-line">
                  <table className="w-full font-mono text-[12px] sm:text-[12.5px]">
                    <thead className="bg-surface text-left text-[10.5px] uppercase tracking-[0.06em] text-faint sm:tracking-[0.12em]">
                      <tr>
                        <th className="px-2 py-2 sm:px-3 font-normal">season</th>
                        <th className="hidden px-2 py-2 text-right font-normal sm:table-cell sm:px-3">races</th>
                        <th className="px-2 py-2 sm:px-3 text-right font-normal">model</th>
                        <th className="px-2 py-2 sm:px-3 text-right font-normal">baseline</th>
                        <th className="px-2 py-2 sm:px-3 text-right font-normal">Δ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {item.evaluation.rows.map((r) => {
                        const d = Math.round((r.model - r.baseline) * 10) / 10;
                        return (
                          <tr key={r.season}>
                            <td className="px-2 py-2 text-ink sm:px-3">
                              {r.season}
                              <span className="block text-[10.5px] text-faint sm:hidden">{r.races} races</span>
                            </td>
                            <td className="hidden px-2 py-2 text-right text-dim sm:table-cell sm:px-3">{r.races}</td>
                            <td className="px-2 py-2 sm:px-3 text-right text-ink">{r.model.toFixed(1)}%</td>
                            <td className="px-2 py-2 sm:px-3 text-right text-dim">{r.baseline.toFixed(1)}%</td>
                            <td className={`px-2 py-2 sm:px-3 text-right ${d < 0 ? "text-warn" : "text-ok"}`}>
                              {d > 0 ? "+" : d < 0 ? "−" : "±"}
                              {Math.abs(d).toFixed(1)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-[13.5px] text-ink">{item.evaluation.verdict}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-faint">{item.evaluation.source}</p>
              </div>
            ) : null}

            {item.limitations ? <Block label="known limitations">{item.limitations}</Block> : null}

            {hasDemo ? (
              <div id={demoId} className="scroll-mt-24 space-y-4">
                <Label>demo</Label>
                {item.evidence ? (
                  <figure className="evidence overflow-hidden rounded-md border border-line bg-bg">
                    <figcaption className="flex items-center gap-2 border-b border-line bg-surface px-3 py-2 font-mono text-[11px] text-faint">
                      <span className="text-accent">screenshot/</span>
                      {item.evidence.src.split("/").pop()}
                      <span className="ml-auto hidden text-dim sm:inline">{item.evidence.caption}</span>
                    </figcaption>
                    <div className="evidence-shot relative">
                      <Image
                        src={item.evidence.src}
                        alt={`${item.title} — ${item.evidence.caption}`}
                        width={1440}
                        height={900}
                        sizes="(min-width: 1120px) 1000px, 100vw"
                        className="h-auto w-full"
                      />
                    </div>
                  </figure>
                ) : null}
                {item.slug === "pit-wall" ? <RaceWidget /> : null}
                {item.slug === "resolvr" ? <IncidentReplay /> : null}
              </div>
            ) : null}

            {item.demoNote ? (
              <p className="rounded-md border border-line bg-surface/60 px-3.5 py-2.5 text-[13px] leading-relaxed text-dim">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">demo access · </span>
                {item.demoNote}
              </p>
            ) : null}

            {/* links */}
            <div className="flex flex-wrap gap-3 border-t border-line pt-5">
              {item.links.live ? (
                <a
                  href={item.links.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkBtn} border-accent-dim bg-accent/10 text-accent hover:bg-accent/20`}
                >
                  <ExternalLink width={15} height={15} /> Try the demo
                </a>
              ) : hasDemo ? (
                <a href={`#${demoId}`} className={`${linkBtn} border-accent-dim bg-accent/10 text-accent hover:bg-accent/20`}>
                  ↑ Try the demo
                </a>
              ) : null}
              {item.links.source ? (
                <a
                  href={item.links.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkBtn} border-line-strong bg-surface text-ink hover:border-accent-dim hover:text-accent`}
                >
                  <GitHub width={15} height={15} /> View source
                </a>
              ) : null}
              <a href={`/incidents/${item.slug}`} className={`${linkBtn} border-line text-faint hover:border-accent-dim hover:text-accent`}>
                # permalink
              </a>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
