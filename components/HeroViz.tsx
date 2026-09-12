"use client";

import { useEffect, useRef } from "react";
import { useSeverity } from "./severity/SeverityProvider";

const HEX: Record<string, number> = { ok: 0x5de9a0, warn: 0xf5b14c, crit: 0xff4757 };

/**
 * A three.js "severity core": a wireframe icosahedron + particle halo that
 * rotates, breathes, and shifts color to match the page severity. Loaded
 * client-side only; falls back to a CSS ring if WebGL is unavailable.
 */
export default function HeroViz() {
  const mount = useRef<HTMLDivElement>(null);
  const { level } = useSeverity();
  const levelRef = useRef(level);
  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  useEffect(() => {
    const el = mount.current;
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

      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

      const width = () => el.clientWidth || 400;
      const height = () => el.clientHeight || 400;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, width() / height(), 0.1, 100);
      camera.position.z = 4.4;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      } catch {
        return; // leave the CSS fallback ring in place
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width(), height());
      el.appendChild(renderer.domElement);
      // three is live — drop the loading/fallback ring
      el.querySelector(".viz-fallback")?.remove();

      const group = new THREE.Group();
      scene.add(group);

      const ico = new THREE.IcosahedronGeometry(1.4, 1);

      const wireGeo = new THREE.WireframeGeometry(ico);
      const lineMat = new THREE.LineBasicMaterial({ color: HEX.ok, transparent: true, opacity: 0.85 });
      const lines = new THREE.LineSegments(wireGeo, lineMat);
      group.add(lines);

      const vertMat = new THREE.PointsMaterial({
        color: HEX.ok,
        size: 0.07,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const vertPts = new THREE.Points(ico, vertMat);
      group.add(vertPts);

      const coreGeo = new THREE.IcosahedronGeometry(0.55, 0);
      const coreMat = new THREE.MeshBasicMaterial({
        color: HEX.ok,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      group.add(core);

      const N = 1500;
      const pos = new Float32Array(N * 3);
      for (let i = 0; i < N; i++) {
        const r = 2.1 + Math.random() * 1.7;
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
        pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
        pos[i * 3 + 2] = r * Math.cos(ph);
      }
      const haloGeo = new THREE.BufferGeometry();
      haloGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const haloMat = new THREE.PointsMaterial({
        color: HEX.ok,
        size: 0.024,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const halo = new THREE.Points(haloGeo, haloMat);
      scene.add(halo);

      const cur = new THREE.Color(HEX.ok);
      const tgt = new THREE.Color(HEX.ok);

      let mx = 0;
      let my = 0;
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        my = ((e.clientY - r.top) / r.height - 0.5) * 2;
      };
      el.addEventListener("pointermove", onMove);

      const onResize = () => {
        camera.aspect = width() / height();
        camera.updateProjectionMatrix();
        renderer.setSize(width(), height());
      };
      const ro = new ResizeObserver(onResize);
      ro.observe(el);

      const clock = new THREE.Clock();

      const render = () => {
        const t = clock.getElapsedTime();
        const lv = levelRef.current;
        tgt.setHex(HEX[lv]);
        cur.lerp(tgt, 0.06);
        lineMat.color.copy(cur);
        vertMat.color.copy(cur);
        haloMat.color.copy(cur);
        coreMat.color.copy(cur);

        const agitate = lv === "crit" ? 2.6 : lv === "warn" ? 1.6 : 1;
        group.rotation.y += 0.0016 + 0.0016 * agitate;
        group.rotation.x += 0.0006 * agitate;
        group.rotation.x += (my * 0.35 - (group.rotation.x % (Math.PI * 2)) * 0) * 0;
        halo.rotation.y -= 0.0007 * agitate;
        halo.rotation.x += 0.0003;

        const amp = lv === "crit" ? 0.07 : lv === "warn" ? 0.04 : 0.02;
        const freq = lv === "crit" ? 6 : lv === "warn" ? 3.4 : 1.8;
        group.scale.setScalar(1 + Math.sin(t * freq) * amp);
        coreMat.opacity = 0.08 + (Math.sin(t * 3) * 0.5 + 0.5) * (lv === "crit" ? 0.28 : 0.12);
        lineMat.opacity = lv === "crit" ? 0.95 : 0.85;

        // gentle parallax toward pointer
        camera.position.x += (mx * 0.7 - camera.position.x) * 0.05;
        camera.position.y += (-my * 0.5 - camera.position.y) * 0.05;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      };

      // requestAnimationFrame naturally pauses in a hidden tab and the pending
      // frame resumes on focus, so no explicit visibility handling is needed.
      const loop = () => {
        if (disposed) return;
        render();
        raf = requestAnimationFrame(loop);
      };

      if (reduce) {
        render();
      } else {
        raf = requestAnimationFrame(loop);
      }

      cleanup = () => {
        cancelAnimationFrame(raf);
        el.removeEventListener("pointermove", onMove);
        ro.disconnect();
        wireGeo.dispose();
        ico.dispose();
        coreGeo.dispose();
        haloGeo.dispose();
        lineMat.dispose();
        vertMat.dispose();
        coreMat.dispose();
        haloMat.dispose();
        renderer.dispose();
        if (renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div ref={mount} className="hero-viz" aria-hidden>
      <div className="viz-fallback" />
    </div>
  );
}
