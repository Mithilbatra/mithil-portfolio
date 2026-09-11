import { PROFILE } from "@/lib/data";
import { GitHub, LinkedIn, Mail } from "./ui/Icons";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line py-10">
      <div className="shell flex flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-2 font-mono text-[12px] text-faint">
          <span className="dot" aria-hidden />
          <span>
            <span className="text-dim">{PROFILE.handle}.log</span> — all systems operational · ©{" "}
            {year}
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
          built with <span className="text-dim">next.js</span> ·{" "}
          <a href="#top" className="transition-colors hover:text-accent">
            ↑ back to top
          </a>
        </div>
      </div>
    </footer>
  );
}
