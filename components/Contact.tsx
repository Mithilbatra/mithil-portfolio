"use client";

import { useState } from "react";
import { PROFILE } from "@/lib/data";
import SectionHeader from "./ui/SectionHeader";
import Reveal from "./ui/Reveal";
import LogLine from "./ui/LogLine";
import { useSeverityZone } from "./severity/useSeverityZone";
import { Mail, GitHub, LinkedIn, LeetCode, Phone, Copy, Check } from "./ui/Icons";

interface Channel {
  label: string;
  value: string;
  href: string;
  Icon: (p: any) => JSX.Element;
  external?: boolean;
}

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const hiringZone = useSeverityZone<HTMLDivElement>("crit", "Hiring signal");

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — ignore */
    }
  };

  const channels: Channel[] = [
    { label: "email", value: PROFILE.email, href: `mailto:${PROFILE.email}`, Icon: Mail },
    { label: "github", value: PROFILE.github.replace(/^https?:\/\//, ""), href: PROFILE.github, Icon: GitHub, external: true },
    { label: "linkedin", value: PROFILE.linkedin.replace(/^https?:\/\//, ""), href: PROFILE.linkedin, Icon: LinkedIn, external: true },
    { label: "leetcode", value: PROFILE.leetcode.replace(/^https?:\/\//, ""), href: PROFILE.leetcode, Icon: LeetCode, external: true },
    { label: "phone", value: PROFILE.phone, href: `tel:${PROFILE.phone.replace(/\s/g, "")}`, Icon: Phone },
  ];

  return (
    <section id="contact" className="scroll-mt-24 py-20 sm:py-28">
      <div className="shell">
        <SectionHeader
          index="05"
          command="./contact --open-channel"
          title="Open a Channel"
          blurb="Hiring, collaborating, or just want to talk shop about systems and F1? Reach out."
        />

        <div className="grid gap-4 lg:grid-cols-5">
          {/* Channels */}
          <Reveal className="lg:col-span-3">
            <div className="panel h-full overflow-hidden">
              <div className="flex items-center gap-2 border-b border-line bg-surface px-4 py-2.5">
                <span className="h-3 w-3 rounded-full bg-crit/80" />
                <span className="h-3 w-3 rounded-full bg-warn/80" />
                <span className="h-3 w-3 rounded-full bg-ok/80" />
                <span className="ml-2 font-mono text-[11px] text-faint">channels.sh</span>
              </div>
              <ul className="divide-y divide-line">
                {channels.map((c) => (
                  <li key={c.label}>
                    <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                      <c.Icon width={17} height={17} className="shrink-0 text-accent" />
                      <span className="w-20 shrink-0 font-mono text-[12px] uppercase tracking-[0.12em] text-faint">
                        {c.label}
                      </span>
                      <a
                        href={c.href}
                        target={c.external ? "_blank" : undefined}
                        rel={c.external ? "noopener noreferrer" : undefined}
                        className="link-underline min-w-0 flex-1 truncate font-mono text-[13px] sm:text-sm"
                      >
                        {c.value}
                      </a>
                      {c.label === "email" ? (
                        <button
                          onClick={copyEmail}
                          className="shrink-0 rounded-md border border-line p-1.5 text-faint transition-colors hover:border-accent-dim hover:text-accent"
                          aria-label="Copy email"
                        >
                          {copied ? (
                            <Check width={15} height={15} className="text-ok" />
                          ) : (
                            <Copy width={15} height={15} />
                          )}
                        </button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* Hiring-signal log — the punchline, as a CRIT entry */}
          <Reveal delay={80} className="lg:col-span-2">
            <div
              ref={hiringZone.ref}
              onPointerEnter={hiringZone.onPointerEnter}
              onPointerLeave={hiringZone.onPointerLeave}
              className="panel-raised scanlines relative flex h-full flex-col overflow-hidden"
            >
              <div className="flex items-center gap-2 border-b border-line-strong bg-surface px-4 py-2.5">
                <span className="h-3 w-3 rounded-full bg-crit/80" />
                <span className="h-3 w-3 rounded-full bg-warn/80" />
                <span className="h-3 w-3 rounded-full bg-ok/80" />
                <span className="ml-2 font-mono text-[11px] text-faint">hiring-signal.log</span>
                <span className="ml-auto flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-crit-bright">
                  <span className="rec-dot" aria-hidden />
                  rec
                </span>
              </div>
              <div className="flex flex-1 flex-col justify-center gap-0.5 px-1.5 py-4">
                <LogLine level="INFO" source="audit" emoji={false}>
                  strong fundamentals <span className="text-ok">✓</span>
                </LogLine>
                <LogLine level="INFO" source="audit" emoji={false}>
                  ships real systems <span className="text-ok">✓</span>
                </LogLine>
                <LogLine level="INFO" source="audit" emoji={false}>
                  thinks about failure <span className="text-ok">✓</span>
                </LogLine>
                <LogLine level="CRIT" source="hiring">
                  <span className="font-semibold text-ink">
                    recommend=PROCEED → schedule technical interview
                  </span>
                </LogLine>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
