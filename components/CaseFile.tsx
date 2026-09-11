"use client";

import { useState } from "react";
import type { CaseFile as CaseFileType } from "@/lib/data";
import StatusChip from "./ui/StatusChip";
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

  return (
    <article
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
        <span className="mt-1 font-mono text-sm text-faint">CASE {item.id}</span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h3 className="text-xl font-semibold text-ink sm:text-2xl">{item.title}</h3>
            <StatusChip status={item.status} />
            <span className="font-mono text-xs text-faint">{item.year}</span>
          </span>
          <span className="mt-1.5 block text-sm text-dim">{item.subtitle}</span>
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
            {item.note ? (
              <div className="rounded-md border border-accent-dim/60 bg-accent/[0.06] px-4 py-3 font-mono text-[13px] text-accent">
                ⚑ {item.note}
              </div>
            ) : null}

            <Block label="the problem">{item.problem}</Block>
            <Block label="the approach">{item.approach}</Block>

            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
                <span className="text-faint">{">"} </span>architecture
              </div>
              <ul className="mt-3 space-y-2">
                {item.architecture.map((a, i) => (
                  <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-dim">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-dim" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <Block label="the hard part">{item.hardPart}</Block>
              <Block label="what i learned">{item.learned}</Block>
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
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
