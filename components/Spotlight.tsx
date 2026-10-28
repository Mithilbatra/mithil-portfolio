"use client";

import { useEffect } from "react";

/** One pointer listener for the whole page: the panel under the cursor gets
 *  --mx/--my so its CSS radial highlight follows the mouse (see globals.css). */
export default function Spotlight() {
  useEffect(() => {
    let lit: HTMLElement | null = null;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(".panel, .panel-raised") ?? null;
      if (lit && lit !== el) {
        lit.style.removeProperty("--mx");
        lit.style.removeProperty("--my");
      }
      lit = el;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);
  return null;
}
