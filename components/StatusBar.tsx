"use client";

import { useEffect, useState } from "react";
import { NAV, PROFILE } from "@/lib/data";
import { Download } from "./ui/Icons";

export default function StatusBar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const [clock, setClock] = useState<string>("--:--:--");
  const [mounted, setMounted] = useState(false);
  const [mod, setMod] = useState("⌘");

  useEffect(() => {
    setMounted(true);
    if (!/Mac|iPhone|iPad/.test(navigator.platform)) setMod("Ctrl ");
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Live IST clock
  useEffect(() => {
    const tick = () => {
      const t = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata",
      }).format(new Date());
      setClock(t);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Active section via IntersectionObserver
  useEffect(() => {
    const ids = NAV.map((n) => n.id);
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-line bg-bg/80 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <div className="shell flex h-14 items-center justify-between gap-4">
        {/* Identity */}
        <a href="/#top" className="group flex items-center gap-2.5" aria-label="Back to top">
          <span className="font-mono text-accent">{">"}</span>
          <span className="font-mono text-sm text-ink">
            {PROFILE.handle}
            <span className="text-faint">.log</span>
          </span>
          <span className="ml-1 hidden items-center gap-2 sm:flex">
            <span className="dot" aria-hidden />
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV.map((n) => (
            <a
              key={n.id}
              href={`/#${n.id}`}
              className={`rounded-md px-3 py-1.5 font-mono text-[13px] transition-colors ${
                active === n.id
                  ? "text-accent"
                  : "text-dim hover:text-ink"
              }`}
            >
              <span className="text-faint">/</span>
              {n.label}
            </a>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-3">
          <span
            className="hidden whitespace-nowrap font-mono text-[12px] text-faint xl:inline"
            aria-hidden
            suppressHydrationWarning
          >
            {mounted ? `${clock} IST` : ""}
          </span>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("console:open"))}
            className="hidden items-center gap-1 rounded-md border border-line px-2 py-1.5 font-mono text-[11px] text-faint transition-colors hover:border-accent-dim hover:text-accent sm:inline-flex"
            aria-label="Open command console"
          >
            {mod}K
          </button>
          <a
            href={PROFILE.resumePath}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-accent-dim bg-accent/10 px-3 py-1.5 font-mono text-[12px] text-accent transition-colors hover:bg-accent/20"
          >
            <Download width={14} height={14} />
            <span className="hidden sm:inline">resume</span>
          </a>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-dim md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <div className="flex flex-col gap-1">
              <span className={`h-0.5 w-4 bg-current transition ${open ? "translate-y-1.5 rotate-45" : ""}`} />
              <span className={`h-0.5 w-4 bg-current transition ${open ? "opacity-0" : ""}`} />
              <span className={`h-0.5 w-4 bg-current transition ${open ? "-translate-y-1.5 -rotate-45" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open ? (
        <nav className="border-t border-line bg-bg/95 px-5 py-3 backdrop-blur-md md:hidden">
          {NAV.map((n) => (
            <a
              key={n.id}
              href={`/#${n.id}`}
              onClick={() => setOpen(false)}
              className="block rounded-md px-2 py-2.5 font-mono text-sm text-dim hover:text-accent"
            >
              <span className="text-faint">/</span>
              {n.label}
            </a>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
