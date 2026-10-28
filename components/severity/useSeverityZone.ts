"use client";

import { useEffect, useId, useRef } from "react";
import { useSeverity, type Sev } from "./SeverityProvider";

/**
 * Marks an element as a "severity zone". While it's centered in the viewport it
 * sets the page severity; hovering it asserts the same severity immediately.
 * Spread the returned props onto the element you want to track.
 */
export function useSeverityZone<T extends HTMLElement = HTMLElement>(sev: Sev, label?: string) {
  const { setHover, setView } = useSeverity();
  const id = useId();
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && e.intersectionRatio >= 0.5) setView(id, { sev, label });
        else setView(id, null);
      },
      { threshold: [0, 0.5, 1], rootMargin: "-8% 0px -8% 0px" }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      setView(id, null);
    };
  }, [id, sev, label, setView]);

  const onPointerEnter = () => setHover({ sev, label });
  const onPointerLeave = () => setHover(null);

  return { ref, onPointerEnter, onPointerLeave };
}
