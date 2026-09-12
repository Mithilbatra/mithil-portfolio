"use client";

import { useEffect, useRef, createElement } from "react";
import anime from "animejs";

const GLYPHS = "!<>-_\\/[]{}=+*^?#·:;0123456789abcdefghijklmnopqrstuvwxyz";

/**
 * Decodes `text` from random glyphs into the real string using anime.js.
 * trigger "mount" runs once on load; "view" waits until scrolled into view
 * (and shows the string encrypted until then). Falls back to plain text under
 * reduced motion. SSR renders the real text (good for SEO / no-JS).
 */
export default function ScrambleText({
  text,
  className,
  as = "span",
  trigger = "mount",
  delay = 0,
}: {
  text: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  trigger?: "mount" | "view";
  delay?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      el.textContent = text;
      return;
    }

    const scrambled = () =>
      text
        .split("")
        .map((c) => (c === " " ? " " : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
        .join("");

    let ran = false;
    const run = () => {
      if (ran) return;
      ran = true;
      const obj = { p: 0 };
      anime({
        targets: obj,
        p: 1,
        duration: Math.max(650, text.length * 34),
        easing: "easeInOutQuad",
        delay,
        update: () => {
          const reveal = Math.floor(obj.p * text.length);
          let out = "";
          for (let i = 0; i < text.length; i++) {
            if (i < reveal || text[i] === " ") out += text[i];
            else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          }
          el.textContent = out;
        },
        complete: () => {
          el.textContent = text; // guarantee the final, correct string
        },
      });
    };

    if (trigger === "view") {
      el.textContent = scrambled(); // encrypted until reached
      const io = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) {
            run();
            io.disconnect();
          }
        },
        { threshold: 0.6 }
      );
      io.observe(el);
      return () => io.disconnect();
    }
    run();
  }, [text, trigger, delay]);

  return createElement(as, { ref, className }, text);
}
