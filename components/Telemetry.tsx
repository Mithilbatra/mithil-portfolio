import { ACHIEVEMENTS, EDUCATION, COURSEWORK } from "@/lib/data";
import SectionHeader from "./ui/SectionHeader";
import Reveal from "./ui/Reveal";

export default function Telemetry() {
  return (
    <section id="telemetry" className="scroll-mt-24 py-20 sm:py-28">
      <div className="shell">
        <SectionHeader
          index="06"
          command="tail -f telemetry.log"
          title="Telemetry & Signals"
          blurb="Awards, leadership, and the academic track record behind the profile."
        />

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Signals / achievements as a log */}
          <Reveal className="lg:row-span-2">
            <div className="panel h-full px-4 py-5 sm:px-5">
              <div className="mb-3 px-1 font-mono text-[11px] uppercase tracking-[0.2em] text-faint">
                {">"} awards &amp; leadership
              </div>
              <ul className="divide-y divide-line px-1">
                {ACHIEVEMENTS.map((a) => (
                  <li key={a.title} className="flex items-baseline justify-between gap-3 py-3">
                    <span>
                      <span className="block text-[15px] text-ink">{a.title}</span>
                      <span className="text-[13px] text-faint">{a.detail}</span>
                    </span>
                    <span className="flex-none font-mono text-[10px] uppercase tracking-[0.14em] text-faint">{a.kind}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Education */}
          <Reveal>
            <div className="panel h-full px-5 py-5 sm:px-6">
              <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-faint">
                {">"} education
              </div>
              <ol className="relative space-y-5 border-l border-line pl-5">
                {EDUCATION.map((e) => (
                  <li key={e.name} className="relative">
                    <span className="absolute -left-[23px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-bg bg-accent-dim" />
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <h4 className="text-[15px] font-semibold text-ink">{e.name}</h4>
                      <span className="font-mono text-xs text-faint">{e.period}</span>
                    </div>
                    <div className="mt-0.5 text-[14px] text-dim">{e.qualification}</div>
                    <div className="mt-1 font-mono text-[13px] text-accent">{e.score}</div>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>

          {/* Coursework */}
          <Reveal delay={80}>
            <div className="panel h-full px-5 py-5 sm:px-6">
              <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-faint">
                {">"} loaded coursework
              </div>
              <div className="flex flex-wrap gap-1.5">
                {COURSEWORK.map((c) => (
                  <span key={c} className="chip">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
