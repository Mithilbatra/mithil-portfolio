"use client";

import { useState } from "react";
import type { CaseFile as CaseFileType, Level } from "@/lib/data";
import StatusChip from "./ui/StatusChip";
import SevBadge from "./ui/SevBadge";
import LogLine from "./ui/LogLine";
import LevelBadge from "./ui/LevelBadge";
import Image from "next/image";
import { useSeverityZone } from "./severity/useSeverityZone";
import IncidentReplay from "./IncidentReplay";
import RaceWidget from "./RaceWidget";
import { ChevronDown, GitHub, ExternalLink } from "./ui/Icons";

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
        <span className="text-faint">{">"} </span>
        {label}
      </div>
      <div className="mt-2 text-[15px] leading-relaxed text-dim">{children}</div>
    </div>
  );
}

export default function CaseFile({ item, defaultOpen = false }: { item: CaseFileType; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `case-${item.id}-body`;
  const symptomLevel: Level = item.severity === 1 ? "ERROR" : "WARN";
  const zoneSev = item.severity === 1 ? "crit" : item.severity === 2 ? "warn" : "ok";
  const zone = useSeverityZone<HTMLElement>(zoneSev, `${item.title} · SEV-${item.severity}`);

  return (
    <article
      ref={zone.ref}
      onPointerEnter={zone.onPointerEnter}
      onPointerLeave={zone.onPointerLeave}
      className={`group panel overflow-hidden transition-colors duration-300 ${
        open ? "border-accent-dim" : "hover:border-line-strong"
      }`}
    >
      {/* Header — click to toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-start gap-4 px-5 py-5 text-left sm:px-7 sm:py-6"
      >
        <span className="mt-1 font-mono text-sm text-faint">
          CASE
          <br className="hidden sm:block" />
          <span className="text-dim"> {item.id}</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h3 className="text-xl font-semibold text-ink sm:text-2xl">{item.title}</h3>
            <SevBadge severity={item.severity} />
            <StatusChip status={item.status} />
            <span className="font-mono text-xs text-faint">{item.year}</span>
          </span>
          <span className="mt-1.5 block text-sm text-dim">{item.subtitle}</span>

          {/* Symptom — a one-line log teaser of what went wrong */}
          <span className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 font-mono text-[12.5px]">
            <LevelBadge level={symptomLevel} />
            <span className="text-faint">symptom</span>
            <span className="text-dim">{item.symptom}</span>
          </span>

          <span className="mt-3 flex flex-wrap gap-1.5">
            {item.stack.map((s) => (
              <span key={s} className="chip">
                {s}
              </span>
            ))}
          </span>
        </span>
        <ChevronDown
          className={`mt-1 shrink-0 text-faint transition-transform duration-300 ${
            open ? "rotate-180 text-accent" : "group-hover:text-dim"
          }`}
          width={20}
          height={20}
        />
      </button>

      {/* Expandable body */}
      <div
        id={panelId}
        className="grid transition-[grid-template-rows] duration-500 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="space-y-6 border-t border-line px-5 py-6 sm:px-7 sm:py-7">
            {/* incident meta line */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
              <span>
                incident <span className="text-dim">#{item.id}</span>
              </span>
              <span className="text-line-strong">·</span>
              <span>
                class <span className="text-dim">{item.category}</span>
              </span>
              <span className="text-line-strong">·</span>
              <span>
                status <span className="text-ok">resolved</span>
              </span>
            </div>

            {item.note ? (
              <div className="rounded-md border-l-2 border-accent bg-accent/[0.06] px-4 py-3 font-mono text-[13px] text-accent">
                ⚑ {item.note}
              </div>
            ) : null}

            <Block label="the problem">{item.problem}</Block>
            <Block label="the approach">{item.approach}</Block>

            {item.evidence ? (
              <figure className="evidence overflow-hidden rounded-md border border-line bg-bg">
                <figcaption className="flex items-center gap-2 border-b border-line bg-surface px-3 py-2 font-mono text-[11px] text-faint">
                  <span className="text-accent">evidence/</span>
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

            {/* Architecture as a log */}
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                <span className="text-faint">{">"} </span>architecture.log
              </div>
              <div className="mt-3 rounded-md border border-line bg-surface/60 py-2">
                {item.architecture.map((a, i) => (
                  <LogLine key={i} n={i + 1} level="INFO" emoji={false}>
                    {a}
                  </LogLine>
                ))}
              </div>
            </div>

            {/* Root cause + resolution — post-mortem */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border-l-2 border-crit bg-crit/[0.06] px-4 py-3.5">
                <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-crit">
                  <span aria-hidden>🔴</span> error · root cause
                </div>
                <p className="mt-2 text-[14.5px] leading-relaxed text-dim">{item.hardPart}</p>
              </div>
              <div className="rounded-md border-l-2 border-ok bg-ok/[0.06] px-4 py-3.5">
                <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ok">
                  <span aria-hidden>🟢</span> info · resolution
                </div>
                <p className="mt-2 text-[14.5px] leading-relaxed text-dim">{item.learned}</p>
              </div>
            </div>

            {/* links */}
            <div className="flex flex-wrap gap-3 pt-1">
              {item.links.source ? (
                <a
                  href={item.links.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-line-strong bg-surface px-4 py-2 font-mono text-[13px] text-ink transition-colors hover:border-accent-dim hover:text-accent"
                >
                  <GitHub width={15} height={15} /> source
                </a>
              ) : null}
              {item.links.live ? (
                <a
                  href={item.links.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-line-strong bg-surface px-4 py-2 font-mono text-[13px] text-ink transition-colors hover:border-accent-dim hover:text-accent"
                >
                  <ExternalLink width={15} height={15} /> live demo
                </a>
              ) : null}
              <a
                href={`/incidents/${item.slug}`}
                className="inline-flex items-center gap-2 rounded-md border border-line px-4 py-2 font-mono text-[13px] text-faint transition-colors hover:border-accent-dim hover:text-accent"
              >
                # permalink
              </a>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
