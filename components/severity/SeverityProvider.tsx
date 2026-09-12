"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import AmbientGlow from "./AmbientGlow";
import CriticalIndicator from "./CriticalIndicator";

export type Sev = "ok" | "warn" | "crit";

const RANK: Record<Sev, number> = { ok: 0, warn: 1, crit: 2 };

interface Zone {
  sev: Sev;
  label?: string;
}

interface Ctx {
  level: Sev;
  label?: string;
  setHover: (z: Zone | null) => void;
  setView: (id: string, z: Zone | null) => void;
}

const SeverityContext = createContext<Ctx | null>(null);

export function useSeverity(): Ctx {
  const c = useContext(SeverityContext);
  if (!c) throw new Error("useSeverity must be used within <SeverityProvider>");
  return c;
}

/**
 * Tracks the "severity" of whatever the visitor is currently looking at or
 * hovering, and exposes it to the whole page. Hovering a zone wins; otherwise
 * the most severe zone in view wins; default is calm/green ("ok").
 */
export default function SeverityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ level: Sev; label?: string }>({ level: "ok" });
  const hover = useRef<Zone | null>(null);
  const views = useRef<Map<string, Zone>>(new Map());

  const recompute = useCallback(() => {
    let win: Zone | null = hover.current;
    if (!win) {
      views.current.forEach((z) => {
        if (!win || RANK[z.sev] > RANK[win.sev]) win = z;
      });
    }
    const level = win?.sev ?? "ok";
    const label = win?.label;
    setState((s) => (s.level === level && s.label === label ? s : { level, label }));
  }, []);

  const setHover = useCallback(
    (z: Zone | null) => {
      hover.current = z;
      recompute();
    },
    [recompute]
  );

  const setView = useCallback(
    (id: string, z: Zone | null) => {
      if (z) views.current.set(id, z);
      else views.current.delete(id);
      recompute();
    },
    [recompute]
  );

  useEffect(() => {
    document.documentElement.dataset.sev = state.level;
  }, [state.level]);

  return (
    <SeverityContext.Provider value={{ level: state.level, label: state.label, setHover, setView }}>
      <div className="sev-bar" aria-hidden />
      {children}
      <AmbientGlow />
      <CriticalIndicator />
    </SeverityContext.Provider>
  );
}
