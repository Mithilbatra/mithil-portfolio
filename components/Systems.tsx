import { SKILLS, CERTIFICATIONS } from "@/lib/data";
import SectionHeader from "./ui/SectionHeader";
import Reveal from "./ui/Reveal";
import { Cpu } from "./ui/Icons";
import SkillGraph from "./SkillGraph";

export default function Systems() {
  return (
    <section id="systems" className="scroll-mt-24 py-20 sm:py-28">
      <div className="shell">
        <SectionHeader
          index="05"
          command="systemctl status --capabilities"
          title="Systems & Runtime"
          blurb="The stack I reach for — and a few certifications that back it up."
        />

        {/* Dependency graph: which skill shipped which project (desktop; the grid below covers mobile) */}
        <Reveal className="mb-10 hidden md:block">
          <div className="panel px-5 py-5">
            <div className="mb-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-faint">
              <span>
                <span className="text-accent">{">"}</span> dependency-graph · skill → shipped in
              </span>
              <span className="normal-case tracking-normal">hover or tab through a node</span>
            </div>
            <SkillGraph />
          </div>
        </Reveal>

        {/* Skills grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SKILLS.map((g, i) => (
            <Reveal key={g.key} delay={i * 50}>
              <div className="panel h-full px-5 py-5 transition-colors hover:border-line-strong">
                <div className="flex items-center gap-2 font-mono text-[12px] text-faint">
                  <span className="text-accent">{g.key}/</span>
                  <span className="uppercase tracking-[0.14em]">{g.label}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {g.items.map((it) => (
                    <span
                      key={it}
                      className="rounded-md border border-line bg-surface px-2.5 py-1 text-[13px] text-dim transition-colors hover:border-accent-dim hover:text-ink"
                    >
                      {it}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Certifications */}
        <Reveal className="mt-14">
          <div className="mb-5 flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.2em] text-faint">
            <Cpu width={15} height={15} className="text-accent-dim" />
            installed certifications
          </div>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-3">
          {CERTIFICATIONS.map((c, i) => (
            <Reveal key={c.title} delay={i * 60}>
              <div className="panel h-full px-5 py-5">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="text-[15px] font-semibold text-ink">{c.title}</h4>
                </div>
                <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
                  {c.issuer}
                </div>
                <p className="mt-3 text-[14px] leading-relaxed text-dim">{c.detail}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
