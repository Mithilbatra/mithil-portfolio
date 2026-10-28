import { PROFILE } from "@/lib/data";
import TelemetryStrip from "./TelemetryStrip";
import Reveal from "./ui/Reveal";
import { ArrowDown, Download } from "./ui/Icons";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-28 sm:pt-32">
      {/* schematic backdrop */}
      <div className="pointer-events-none absolute inset-0 grid-dots opacity-60" aria-hidden />
      <div className="shell relative">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Left: identity */}
          <div className="lg:col-span-7">
            <Reveal>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-ok">
                <span className="dot" aria-hidden />
                {PROFILE.status}
              </div>
            </Reveal>

            <Reveal delay={60}>
              <h1 className="text-5xl font-semibold leading-[0.98] tracking-tight text-ink sm:text-6xl lg:text-7xl">
                Mithil
                <br />
                Batra<span className="text-accent">.</span>
              </h1>
            </Reveal>

            <Reveal delay={120}>
              <p className="mt-5 font-mono text-sm text-dim">
                <span className="text-accent">{"//"}</span> {PROFILE.role} · {PROFILE.focus.join(" · ")}
              </p>
            </Reveal>

            <Reveal delay={180}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/90">
                {PROFILE.tagline}
              </p>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-dim">
                {PROFILE.blurb}
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#log"
                  className="group inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3 font-mono text-sm font-medium text-[#04140c] transition-transform hover:-translate-y-0.5"
                >
                  open engineering log
                  <ArrowDown
                    width={16}
                    height={16}
                    className="transition-transform group-hover:translate-y-0.5"
                  />
                </a>
                <a
                  href={PROFILE.resumePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-line-strong bg-surface px-5 py-3 font-mono text-sm text-ink transition-colors hover:border-accent-dim hover:text-accent"
                >
                  <Download width={16} height={16} />
                  download resume
                </a>
              </div>
            </Reveal>
          </div>

          {/* Right: where the severity core (SeverityCore.tsx) sits before it docks */}
          <div className="lg:col-span-5">
            <div id="core-slot" className="mx-auto aspect-square w-full max-w-[400px]" aria-hidden />
            <p className="mt-2 text-center font-mono text-[11px] text-faint">severity core · scroll, it docks and keeps watch</p>
          </div>
        </div>

        {/* Telemetry strip — a monitoring readout */}
        <Reveal delay={120} className="mt-16 sm:mt-20">
          <div className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-faint">
            <span aria-hidden>🟢</span>
            <span className="text-ok">INFO</span>
            <span>telemetry</span>
            <span className="text-dim">snapshot=loaded · 4 metrics</span>
            <span className="ml-2 hidden h-px flex-1 bg-line sm:block" />
          </div>
          <TelemetryStrip />
        </Reveal>
      </div>
    </section>
  );
}
