import { CASE_FILES } from "@/lib/data";
import SectionHeader from "./ui/SectionHeader";
import CaseFile from "./CaseFile";
import Reveal from "./ui/Reveal";

export default function EngineeringLog() {
  return (
    <section id="log" className="scroll-mt-24 py-20 sm:py-28">
      <div className="shell">
        <SectionHeader
          index="01"
          level="WARN"
          command="grep -r 'what broke' ./incidents"
          title="The Engineering Log"
          blurb="I don't just collect projects — I collect problems. Each case file is a real incident I worked, opened up: the symptom, the root cause, and the resolution. Click one to investigate."
        />

        <div className="space-y-4">
          {CASE_FILES.map((c, i) => (
            <Reveal key={c.id} delay={i * 70}>
              <CaseFile item={c} defaultOpen={i === 0} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
