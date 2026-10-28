import { CASE_FILES, RUNBOOK } from "@/lib/data";
import SectionHeader from "./ui/SectionHeader";
import Reveal from "./ui/Reveal";

export default function Runbook() {
  return (
    <section id="runbook" className="scroll-mt-24 py-20 sm:py-28">
      <div className="shell">
        <SectionHeader
          index="02"
          command="cat RUNBOOK.md"
          title="My Runbook"
          blurb="Four rules I engineer by — each one paid for by a real incident."
        />
        <ol className="grid gap-4 sm:grid-cols-2">
          {RUNBOOK.map((r, i) => {
            const isCase = CASE_FILES.some((c) => c.slug === r.from);
            return (
              <Reveal as="li" key={r.rule} delay={i * 60}>
                <div className="panel h-full px-5 py-5 sm:px-6">
                  <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-faint">
                    <span className="text-accent">rule {String(i + 1).padStart(2, "0")}</span>
                    <span>· learned in</span>
                    <a href={isCase ? `/incidents/${r.from}` : "/#deployments"} className="link-underline normal-case tracking-normal">
                      {r.from}
                    </a>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-ink">{r.rule}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-dim">{r.body}</p>
                </div>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
