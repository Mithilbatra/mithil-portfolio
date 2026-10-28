import { EXPERIENCE } from "@/lib/data";
import SectionHeader from "./ui/SectionHeader";
import Reveal from "./ui/Reveal";
import LogLine from "./ui/LogLine";

export default function Deployments() {
  return (
    <section id="deployments" className="scroll-mt-24 py-20 sm:py-28">
      <div className="shell">
        <SectionHeader
          index="02"
          command="git log --deployments"
          title="Deployment History"
          blurb="Where the code met production and other people's expectations."
        />

        <div className="space-y-4">
          {EXPERIENCE.map((d, i) => {
            const src = d.org.toLowerCase();
            return (
              <Reveal key={d.org + i}>
                <article className="panel px-5 py-6 sm:px-8 sm:py-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-semibold text-ink sm:text-2xl">{d.org}</h3>
                        <span
                          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em]"
                          style={{
                            color: "var(--ok)",
                            background: "rgba(70,212,138,0.12)",
                            border: "1px solid rgba(70,212,138,0.2)",
                          }}
                        >
                          <span aria-hidden>🟢</span> deployed
                        </span>
                      </div>
                      <p className="mt-1.5 text-[15px] text-accent">{d.role}</p>
                    </div>
                    <span className="font-mono text-sm text-faint">{d.period}</span>
                  </div>

                  <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-dim">{d.summary}</p>

                  {/* Work as a deploy log */}
                  <div className="mt-5 rounded-md border border-line bg-surface/60 py-2">
                    {d.work.map((w, j) => (
                      <LogLine key={j} n={j + 1} level="INFO" source={src} emoji={false}>
                        {w}
                      </LogLine>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-1.5">
                    {d.tags.map((t) => (
                      <span key={t} className="chip">
                        {t}
                      </span>
                    ))}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
