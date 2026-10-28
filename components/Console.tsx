"use client";

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { COMMANDS, runCommand } from "@/lib/console.mjs";
import { CASE_FILES, EDUCATION, EXPERIENCE, NAV, PROFILE, SKILLS, TELEMETRY, type Level } from "@/lib/data";
import { useSeverity, type Sev } from "./severity/SeverityProvider";
import LogLine from "./ui/LogLine";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
const QUICK = ["help", "page are you open to full-time roles?", "open resolvr", "cat pit-wall", "sudo hire mithil"];

const job = EXPERIENCE[0];
const school = EDUCATION[0];
export const CTX = {
  profile: PROFILE,
  cases: CASE_FILES,
  sections: NAV.map((n) => n.id),
  links: { resume: PROFILE.resumePath, github: PROFILE.github, linkedin: PROFILE.linkedin, leetcode: PROFILE.leetcode },
  cgpa: TELEMETRY.find((m) => m.label === "CGPA")?.value ?? "",
  experience: `${job.role} @ ${job.org} (${job.period}) — ${job.summary}`,
  skills: SKILLS.map((g) => `${g.key}: ${g.items.join(", ")}`).join(" · "),
  education: `${school.qualification}, ${school.name} · ${school.score}`,
};

type Line = { cmd: string } | { level: Level; text: string };
// shape of runCommand's result (lib/console.mjs is plain JS, so TS can't infer it)
export type Action = { type: string; href: string; external?: boolean; name: string; sev: Sev; label: string; ms: number };
type Result = { lines: { level: Level; text: string }[]; action?: Action };
const WELCOME: Line[] = [{ level: "INFO", text: "on-call console — run `help`, a command, or just ask a question" }];

/** Carry out a `nav` or `event` action from `open` — shared with the chat panel. */
export function go(action: Action) {
  if (action.type === "event") {
    // the CGPA popup lives on the home page
    if (window.location.pathname !== "/") window.location.assign("/#cgpa");
    else window.dispatchEvent(new Event(action.name));
  } else if (action.href.startsWith("mailto:")) window.location.href = action.href;
  else if (action.external) window.open(action.href, "_blank", "noopener,noreferrer");
  else window.location.assign(action.href);
}

export default function Console() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [lines, setLines] = useState<Line[]>(WELCOME);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const konami = useRef(0);
  const { setHover } = useSeverity();

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
  const chaos = () => {
    document.documentElement.dataset.chaos = "1";
    setHover({ sev: "crit", label: "CHAOS MODE" });
    later(() => {
      delete document.documentElement.dataset.chaos;
      setHover({ sev: "ok", label: "chaos auto-resolved ✓" });
      later(() => setHover(null), 1800);
    }, 5000);
  };

  const perform = (action?: Action) => {
    if (!action) return;
    switch (action.type) {
      case "clear":
        setLines([]);
        break;
      case "close":
        setOpen(false);
        break;
      case "nav":
        if (!action.external && !action.href.startsWith("mailto:")) setOpen(false);
        go(action);
        break;
      case "event":
        setOpen(false);
        go(action);
        break;
      case "severity":
        setHover({ sev: action.sev, label: action.label });
        later(() => setHover(null), action.ms);
        break;
      case "hire":
        setHover({ sev: "crit", label: "INC-HIRE · P0" });
        later(() => setHover({ sev: "ok", label: "INC-HIRE · resolved ✓" }), 2600);
        later(() => setHover(null), 5000);
        break;
      case "chaos":
        setOpen(false);
        chaos();
        break;
    }
  };

  const run = (raw: string) => {
    const { lines: out, action } = runCommand(raw, CTX) as Result;
    setLines((l) => [...l, { cmd: raw }, ...out].slice(-200));
    setInput("");
    perform(action);
  };

  // Global openers: ⌘K / Ctrl+K, ` or ~, a "console:open" event; plus the Konami code.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = !!t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (typing) return;
      if (e.key === "`" || e.key === "~") {
        e.preventDefault();
        setOpen(true);
        return;
      }
      const want = KONAMI[konami.current];
      if (e.key === want || e.key.toLowerCase() === want) {
        konami.current += 1;
        if (konami.current === KONAMI.length) {
          konami.current = 0;
          chaos();
        }
      } else konami.current = e.key === KONAMI[0] ? 1 : 0;
    };
    const onOpen = (e: Event) => {
      setOpen(true);
      const preset = (e as CustomEvent<{ input?: string }>).detail?.input;
      if (preset) setInput(preset);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("console:open", onOpen);
    const pending = timers.current;
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("console:open", onOpen);
      pending.forEach(clearTimeout);
    };
    // chaos only touches refs + the stable setHover
  }, []);

  // While open: focus the prompt, Esc closes, Tab stays inside, page doesn't scroll.
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key !== "Tab" || !panelRef.current) return;
      const f = Array.from(panelRef.current.querySelectorAll<HTMLElement>("button, input"));
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    bodyRef.current?.scrollTo(0, bodyRef.current.scrollHeight);
  }, [lines, open]);

  if (!open) return null;

  const word = input.trimStart();
  const suggestions = word && !word.includes(" ") ? COMMANDS.filter(([c]) => c.startsWith(word.toLowerCase())).slice(0, 5) : [];

  // Tab completes the first matching command instead of moving focus.
  const onInputKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab" && !e.shiftKey && suggestions.length) {
      e.preventDefault();
      e.stopPropagation();
      setInput(suggestions[0][0].split(" ")[0] + " ");
    }
  };

  return createPortal(
    <div
      className="modal-backdrop fixed inset-0 z-[90] flex items-start justify-center p-4 pt-[12vh]"
      style={{ background: "rgba(4,6,9,0.72)", backdropFilter: "blur(6px)" }}
      onClick={() => setOpen(false)}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command console"
        className="modal-panel panel-raised scanlines relative w-full max-w-2xl overflow-hidden shadow-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-line-strong bg-surface px-4 py-2.5">
          <span className="h-3 w-3 rounded-full bg-crit/80" />
          <span className="h-3 w-3 rounded-full bg-warn/80" />
          <span className="h-3 w-3 rounded-full bg-ok/80" />
          <span className="ml-2 font-mono text-[11px] text-faint">
            on-call@mithil: <span className="text-dim">~/runbook</span>
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close console"
            className="ml-auto rounded-md border border-line px-1.5 py-0.5 font-mono text-[10px] text-faint transition-colors hover:border-crit hover:text-crit"
          >
            esc
          </button>
        </div>

        <div ref={bodyRef} className="max-h-[46vh] min-h-[160px] overflow-y-auto py-2 pl-1.5 pr-2" aria-live="polite">
          {lines.map((l, i) =>
            "cmd" in l ? (
              <div key={i} className="px-2.5 pt-1.5 font-mono text-[12.5px] text-ink">
                <span className="text-accent">$</span> {l.cmd}
              </div>
            ) : (
              <LogLine key={i} level={l.level} emoji={false}>
                {l.text}
              </LogLine>
            )
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 border-t border-line px-4 py-2.5">
          {(suggestions.length ? suggestions.map(([c]) => c) : QUICK).map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => (suggestions.length ? setInput(q.split(" ")[0] + " ") : run(q))}
              className="chip transition-colors hover:border-accent-dim hover:text-accent"
            >
              {q}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(input);
          }}
          className="flex items-center gap-2 border-t border-line bg-surface px-4 py-3 font-mono text-[13px]"
        >
          <span className="text-accent">$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onInputKey}
            spellCheck={false}
            autoComplete="off"
            aria-label="Command"
            placeholder="ask anything, or type help"
            className="min-w-0 flex-1 bg-transparent text-ink placeholder:text-faint focus:outline-none"
          />
          <span className="hidden text-[10px] text-faint sm:inline">⏎ run · tab complete</span>
        </form>
      </div>
    </div>,
    document.body
  );
}
