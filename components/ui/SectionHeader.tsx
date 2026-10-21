import Reveal from "./Reveal";
import LevelBadge from "./LevelBadge";
import type { Level } from "@/lib/data";

interface Props {
  index: string; // "01"
  title: string;
  command: string; // e.g. "cat engineering.log"
  blurb?: string;
  level?: Level;
}

/** Section header styled as a log query: level tag + shell command + readout. */
export default function SectionHeader({ index, title, command, blurb, level = "INFO" }: Props) {
  return (
    <Reveal className="mb-10 sm:mb-14">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[11px] text-faint">{">_"}</span>
        <LevelBadge level={level} />
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-faint">
          section {index}
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <div className="mt-4 flex items-baseline gap-2 font-mono text-sm text-accent">
        <span className="text-faint">$</span>
        <span>{command}</span>
      </div>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{title}</h2>
      {blurb ? (
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-dim">{blurb}</p>
      ) : null}
    </Reveal>
  );
}
