import { PROFILE, LEVELS, type Level } from "@/lib/data";
import { GitHub, LinkedIn, Mail } from "./ui/Icons";

const ORDER: Level[] = ["DEBUG", "INFO", "WARN", "ERROR", "CRIT"];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line py-10">
      <div className="shell">
        {/* Log-level legend */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-lg border border-line bg-panel px-4 py-3 font-mono text-[11px]">
          <span className="uppercase tracking-[0.18em] text-faint">log levels</span>
          {ORDER.map((lv) => (
            <span key={lv} className="inline-flex items-center gap-1.5" style={{ color: LEVELS[lv].color }}>
              <span aria-hidden>{LEVELS[lv].emoji}</span>
              {LEVELS[lv].label}
              <span className="text-faint">— {LEVELS[lv].desc}</span>
            </span>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2 font-mono text-[12px] text-faint">
            <span className="dot" aria-hidden />
            <span>
              <span className="text-dim">{PROFILE.handle}.log</span> ·{" "}
              <a href="/#status" className="transition-colors hover:text-accent">
                live system status
              </a>{" "}
              · © {year}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={PROFILE.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-faint transition-colors hover:text-accent"
              aria-label="GitHub"
            >
              <GitHub width={18} height={18} />
            </a>
            <a
              href={PROFILE.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-faint transition-colors hover:text-accent"
              aria-label="LinkedIn"
            >
              <LinkedIn width={18} height={18} />
            </a>
            <a
              href={`mailto:${PROFILE.email}`}
              className="text-faint transition-colors hover:text-accent"
              aria-label="Email"
            >
              <Mail width={18} height={18} />
            </a>
          </div>

          <div className="font-mono text-[11px] text-faint">
            press <kbd className="text-dim">~</kbd> for a terminal · ↑↑↓↓←→←→BA if you dare ·{" "}
            <a href="#top" className="transition-colors hover:text-accent">
              ↑ back to top
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
