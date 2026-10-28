"use client";

import { useEffect, useRef } from "react";
import anime from "animejs";

/** Counts the first number in `value` up when scrolled into view, preserving
 *  any prefix/suffix (e.g. "AIR 5376", "99.467%ile", "800+"). */
export default function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const m = value.match(/-?[\d,]*\.?\d+/);
    if (!m) {
      el.textContent = value;
      return;
    }
    const numStr = m[0];
    const num = parseFloat(numStr.replace(/,/g, ""));
    const decimals = (numStr.split(".")[1] || "").length;
    const pre = value.slice(0, m.index ?? 0);
    const post = value.slice((m.index ?? 0) + numStr.length);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || done.current) return;
        done.current = true;
        io.disconnect();
        if (reduce) {
          el.textContent = value;
          return;
        }
        const obj = { v: 0 };
        anime({
          targets: obj,
          v: num,
          duration: 1500,
          easing: "easeOutExpo",
          update: () => {
            el.textContent = pre + obj.v.toFixed(decimals) + post;
          },
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
