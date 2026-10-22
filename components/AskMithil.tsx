"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { runCommand } from "@/lib/console.mjs";
import { CASE_FILES, NAV } from "@/lib/data";
import { CTX, go, type Action } from "./Console";

type Msg = { role: "user" | "model"; text: string; targets?: string[]; offline?: boolean };

const GREETING = "Hey! I'm Mithil — well, an AI that answers from this site. Ask about my projects, my HSBC internship or my skills, or tell me where you want to go and I'll take you there.";
const QUICK = ["What have you built?", "Tell me about your HSBC internship", "How good is Pit Wall's model?", "How can I contact you?"];
const LINK_LABELS: Record<string, string> = { cgpa: "CGPA trend", resume: "résumé", github: "GitHub", linkedin: "LinkedIn", leetcode: "LeetCode" };
const ERRORS: Record<number, string> = {
  429: "That's a lot of questions — give me a few minutes. The ⌘K console still answers the basics.",
  503: "I'm offline right now. The ⌘K console still answers the basics, and everything is on the page.",
};

const label = (t: string) => NAV.find((n) => n.id === t)?.label ?? CASE_FILES.find((c) => c.slug === t)?.title ?? LINK_LABELS[t] ?? t;

/** Floating "ask mithil" chat: answers from the site's own data via /api/chat and offers one-click jumps. */
export default function AskMithil() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  // focus the prompt on open, hand focus back to the launcher on close; Esc closes
  useEffect(() => {
    if (!open) {
      if (wasOpen.current) launcherRef.current?.focus();
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy]);

  const ask = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    const history = [...msgs.filter((m) => !m.offline), { role: "user" as const, text: q }];
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setBusy(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.map(({ role, text }) => ({ role, text })) }),
        signal: AbortSignal.timeout(20_000),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.text) throw r.status;
      setMsgs((m) => [...m, { role: "model", text: d.text, targets: d.targets }]);
    } catch (status) {
      const text = ERRORS[status as number] ?? "Something went wrong reaching the AI. Try again in a moment, or use the ⌘K console.";
      setMsgs((m) => [...m, { role: "model", text, offline: true }]);
    } finally {
      setBusy(false);
    }
  };

  const jump = (target: string) => {
    const { action } = runCommand(`open ${target}`, CTX) as { action?: Action };
    if (!action) return;
    if (!action.external && window.matchMedia("(max-width: 639px)").matches) setOpen(false); // let phones see where they landed
    go(action);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  if (!open) {
    return (
      <button
        ref={launcherRef}
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-5 z-[45] flex items-center gap-2 rounded-full border border-line bg-panel/90 px-3 py-2.5 font-mono text-[12.5px] text-dim shadow-panel backdrop-blur transition-colors hover:border-accent-dim hover:text-ink sm:px-4"
        aria-label="Ask Mithil — AI assistant"
      >
        <span className="dot" aria-hidden />
        <span className="hidden sm:inline">ask mithil</span>
        <span className="rounded border border-line px-1 text-[10px] text-faint">AI</span>
      </button>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="Ask Mithil — AI assistant"
      className="panel-raised fixed bottom-5 left-5 z-[60] flex h-[min(560px,calc(100dvh-6rem))] w-[min(400px,calc(100vw-2.5rem))] flex-col overflow-hidden shadow-panel"
    >
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <span className="grid h-9 w-9 flex-none place-items-center rounded-full border border-accent-dim bg-accent/10 font-mono text-[14px] font-semibold text-accent">
          M
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-semibold text-ink">Ask Mithil</div>
          <div className="flex items-center gap-1.5 font-mono text-[10.5px] text-faint">
            <span className="dot" aria-hidden /> AI · may be wrong
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-line p-1.5 text-faint transition-colors hover:border-accent-dim hover:text-accent"
          aria-label="Close chat"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      <div ref={bodyRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
        <Bubble role="model" text={GREETING} />
        {msgs.length === 0 ? (
          <div>
            <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-faint">quick questions</div>
            <div className="flex flex-wrap gap-1.5">
              {QUICK.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => ask(q)}
                  className="rounded-md border border-line bg-surface px-2.5 py-1.5 text-left text-[12.5px] text-dim transition-colors hover:border-accent-dim hover:text-ink"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {msgs.map((m, i) => (
          <div key={i}>
            <Bubble role={m.role} text={m.text} warn={m.offline} />
            {m.targets?.length ? (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {m.targets.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => jump(t)}
                    className="rounded-md border border-accent-dim bg-accent/10 px-2 py-1 font-mono text-[11.5px] text-accent transition-colors hover:bg-accent/20"
                  >
                    → {label(t)}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}
        {busy ? <div className="font-mono text-[12px] text-faint">thinking…</div> : null}
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 border-t border-line px-3 py-3">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={600}
          placeholder="Ask about my work, or where to go…"
          aria-label="Your question"
          className="min-w-0 flex-1 rounded-md border border-line bg-surface px-3 py-2 text-[13.5px] text-ink placeholder:text-faint focus:border-accent-dim focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-md bg-accent px-3 py-2 font-mono text-[12.5px] font-medium text-on-accent transition-opacity disabled:opacity-40"
        >
          send
        </button>
      </form>
    </div>
  );
}

function Bubble({ role, text, warn }: { role: Msg["role"]; text: string; warn?: boolean }) {
  return (
    <div className={role === "user" ? "flex justify-end" : ""}>
      <p
        className={`max-w-[88%] whitespace-pre-line rounded-lg border px-3 py-2 text-[13.5px] leading-relaxed ${
          role === "user" ? "border-accent-dim bg-accent/10 text-ink" : warn ? "border-line bg-surface text-warn" : "border-line bg-surface text-ink"
        }`}
      >
        {text}
      </p>
    </div>
  );
}
