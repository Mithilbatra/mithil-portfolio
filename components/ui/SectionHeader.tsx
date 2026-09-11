import Reveal from "./Reveal";

interface Props {
  index: string; // "01"
  title: string;
  command: string; // e.g. "cat engineering.log"
  blurb?: string;
}

/** Consistent section header styled as a shell command + readout. */
export default function SectionHeader({ index, title, command, blurb }: Props) {
  return (
    <Reveal className="mb-10 sm:mb-14">
      <div className="flex items-center gap-3 text-faint">
        <span className="font-mono text-[11px] tracking-[0.22em]">SECTION {index}</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      <div className="mt-4 flex items-baseline gap-2 font-mono text-sm text-accent">
        <span className="text-faint">$</span>
        <span>{command}</span>
      </div>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {title}
      </h2>
      {blurb ? (
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-dim">{blurb}</p>
      ) : null}
    </Reveal>
  );
}
