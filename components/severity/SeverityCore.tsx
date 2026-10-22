"use client";

import { useEffect, useRef } from "react";
import { useSeverity, type Sev } from "./SeverityProvider";

const HEX: Record<Sev, number> = { ok: 0x5de9a0, warn: 0xf5b14c, crit: 0xff4757 };
const HEX_LIGHT: Record<Sev, number> = { ok: 0x0b7346, warn: 0x965800, crit: 0xc8102e }; // readable on paper
const HUD: Record<Sev, { label: string; tag: string; color: string }> = {
  ok: { label: "NOMINAL", tag: "P4", color: "var(--ok)" },
  warn: { label: "ELEVATED", tag: "P2", color: "var(--warn)" },
  crit: { label: "CRITICAL", tag: "P0", color: "var(--crit-bright)" },
};

const BASE = 420; // canvas size in CSS px; the dock just scales it down
const MARGIN = 20; // dock distance from the viewport corner (matches .core-hud)
const dockSize = () => (window.innerWidth < 640 ? 56 : 84); // matches .core-hud-disc
const ease = (t: number) => t * t * (3 - 2 * t);

function Triangle({ color }: { color: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3.2 22.2 20.5H1.8L12 3.2Z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={`${color}22`} />
      <path d="M12 10v4.2" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="12" cy="17.4" r="1.2" fill={color} />
    </svg>
  );
}

/**
 * The page's single severity element. In the hero it fills #core-slot; as you
 * scroll it flies to the bottom-right corner and docks, becoming the severity
 * readout (colour, triangle, level). Click it once docked to page on-call.
 * Pages without a #core-slot start docked.
 */
export default function SeverityCore() {
  const { level, label } = useSeverity();
  const levelRef = useRef(level);
  const coreRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  // Fly between the hero slot and the dock, driven by scroll position.
  useEffect(() => {
    const core = coreRef.current;
    const hud = hudRef.current;
    if (!core || !hud) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const place = () => {
      raf = 0;
      const d = dockSize();
      // clientWidth excludes the scrollbar, matching how CSS `right:` places the dock disc
      const dx = document.documentElement.clientWidth - MARGIN - d;
      const dy = document.documentElement.clientHeight - MARGIN - d;
      const slot = document.getElementById("core-slot");
      let e = 1;
      let x = dx;
      let y = dy;
      let size = d;
      if (slot) {
        const r = slot.getBoundingClientRect();
        const t = Math.min(1, Math.max(0, window.scrollY / (r.top + window.scrollY + r.height * 0.5)));
        e = reduce ? (t > 0.5 ? 1 : 0) : ease(t);
        x = r.left + (dx - r.left) * e;
        y = r.top + (dy - r.top) * e;
        size = r.width + (d - r.width) * e;
      }
      core.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${size / BASE})`;
      hud.dataset.docked = e > 0.98 ? "1" : "0";
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(place);
    };
    place();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // three.js scene: wireframe icosahedron + particle halo, coloured by severity.
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    let raf = 0;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      let THREE: typeof import("three");
      try {
        THREE = await import("three");
      } catch {
        return;
      }
      if (disposed) return;
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
      camera.position.z = 4.4;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      } catch {
        return; // leave the CSS fallback ring in place
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(BASE, BASE);
      el.appendChild(renderer.domElement);
      el.querySelector(".viz-fallback")?.remove();

      const group = new THREE.Group();
      scene.add(group);
      const ico = new THREE.IcosahedronGeometry(1.4, 1);
      const wireGeo = new THREE.WireframeGeometry(ico);
      const lineMat = new THREE.LineBasicMaterial({ color: HEX.ok, transparent: true, opacity: 0.6 });
      group.add(new THREE.LineSegments(wireGeo, lineMat));
      const vertMat = new THREE.PointsMaterial({ color: HEX.ok, size: 0.055, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false });
      group.add(new THREE.Points(ico, vertMat));
      const coreGeo = new THREE.IcosahedronGeometry(0.55, 0);
      const coreMat = new THREE.MeshBasicMaterial({ color: HEX.ok, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending });
      group.add(new THREE.Mesh(coreGeo, coreMat));

      const N = 1200;
      const pos = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const r = 2.1 + Math.random() * 1.5;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
        pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
        pos[i * 3 + 2] = r * Math.cos(ph);
      }
      const haloGeo = new THREE.BufferGeometry();
      haloGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const haloMat = new THREE.PointsMaterial({ color: HEX.ok, size: 0.022, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false });
      const halo = new THREE.Points(haloGeo, haloMat);
      scene.add(halo);

      const cur = new THREE.Color(HEX.ok);
      const tgt = new THREE.Color(HEX.ok);
      let mx = 0;
      let my = 0;
      const onMove = (e: PointerEvent) => {
        mx = (e.clientX / window.innerWidth - 0.5) * 2;
        my = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      const clock = new THREE.Clock();
      let wasLight = false;

      const render = () => {
        const t = clock.getElapsedTime();
        const lv = levelRef.current;
        const light = document.documentElement.dataset.theme === "light";
        if (light !== wasLight) {
          // additive glow washes out on a light page; plain blending keeps the lines inked
          wasLight = light;
          for (const m of [vertMat, coreMat, haloMat]) {
            m.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
            m.needsUpdate = true;
          }
          lineMat.opacity = light ? 0.75 : 0.6;
        }
        tgt.setHex((light ? HEX_LIGHT : HEX)[lv]);
        cur.lerp(tgt, 0.06);
        lineMat.color.copy(cur);
        vertMat.color.copy(cur);
        haloMat.color.copy(cur);
        coreMat.color.copy(cur);

        // chaos mode (Konami / `chaos` command) spins the core up and blows the halo out
        const chaos = document.documentElement.dataset.chaos === "1";
        const agitate = chaos ? 9 : lv === "crit" ? 1.6 : lv === "warn" ? 1.25 : 1;
        group.rotation.y += 0.0009 + 0.0009 * agitate;
        group.rotation.x += 0.0003 * agitate;
        halo.rotation.y -= 0.0004 * agitate;
        halo.scale.setScalar(halo.scale.x + ((chaos ? 1.9 : 1) - halo.scale.x) * 0.08);
        group.scale.setScalar(1 + Math.sin(t * (chaos ? 14 : 1.2)) * (chaos ? 0.16 : 0.012));
        coreMat.opacity = 0.05 + (Math.sin(t * 1.5) * 0.5 + 0.5) * (lv === "crit" ? 0.12 : 0.06);

        camera.position.x += (mx * 0.35 - camera.position.x) * 0.03;
        camera.position.y += (-my * 0.25 - camera.position.y) * 0.03;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
      };
      const loop = () => {
        if (disposed) return;
        render();
        raf = requestAnimationFrame(loop);
      };
      if (reduce) render();
      else raf = requestAnimationFrame(loop);

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onMove);
        [wireGeo, ico, coreGeo, haloGeo, lineMat, vertMat, coreMat, haloMat, renderer].forEach((x) => x.dispose());
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  const cfg = HUD[level];

  return (
    <>
      <button
        ref={hudRef}
        type="button"
        data-docked="0"
        className="core-hud"
        style={{ ["--hud-color" as string]: cfg.color }}
        onClick={() => window.dispatchEvent(new Event("console:open"))}
        aria-label={`Page severity ${cfg.label}. Open the on-call console.`}
      >
        <span className="core-hud-meta" aria-live="polite">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-faint">page severity</span>
          <span className="flex items-center justify-end gap-1.5 font-mono text-[13px] font-semibold" style={{ color: cfg.color }}>
            {level !== "ok" ? <Triangle color={cfg.color} /> : null}
            {cfg.label} <span className="text-faint">· {cfg.tag}</span>
          </span>
          <span className="font-mono text-[10px] text-dim">{label ?? "click to page on-call"}</span>
        </span>
        <span className="core-hud-disc" />
      </button>
      <div ref={coreRef} className="core" aria-hidden>
        <div ref={mountRef} className="relative" style={{ width: BASE, height: BASE }}>
          <div className="viz-fallback" />
        </div>
      </div>
    </>
  );
}
