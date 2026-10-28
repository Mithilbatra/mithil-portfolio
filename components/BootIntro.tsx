"use client";

import { useEffect, useState } from "react";

/** First visit per session: a 1.3s system check, then blast doors open.
 *  Pure CSS animation (ends hidden even without JS); JS only skips it on
 *  repeat visits and unmounts it afterwards. Hidden under reduced motion. */
export default function BootIntro() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("booted")) return setGone(true);
      sessionStorage.setItem("booted", "1");
    } catch {
      // storage blocked — just play it
    }
    const id = setTimeout(() => setGone(true), 2400);
    return () => clearTimeout(id);
  }, []);

  if (gone) return null;
  return (
    <div className="boot" aria-hidden>
      <div className="boot-door boot-door-top" />
      <div className="boot-door boot-door-bottom" />
      <div className="boot-text font-mono">
        <div className="boot-title">
          MITHIL <span className="text-accent">{"//"}</span> ENGINEERING LOG
        </div>
        <div className="boot-line" style={{ animationDelay: "0.2s" }}>
          <span className="text-ok">[ok]</span> mounting incidents
        </div>
        <div className="boot-line" style={{ animationDelay: "0.42s" }}>
          <span className="text-ok">[ok]</span> severity core online
        </div>
        <div className="boot-line" style={{ animationDelay: "0.64s" }}>
          <span className="text-ok">[ok]</span> paging on-call · all systems nominal
        </div>
      </div>
    </div>
  );
}
