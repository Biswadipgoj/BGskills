'use client';

// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Biswodip Goj
// LifecycleTunnel — a scroll-driven 3D tunnel the camera flies through, one ring
// per lifecycle phase. Adapted from the "scroll-driven 3D tunnel" technique in
// 3D-Web-Prompts, themed to the repository: 14 gates from 00-bootstrap to
// 13-release, with the current phase named as you pass through it.

import { useEffect, useRef } from 'react';

const PHASES = [
  '00 bootstrap', '01 plan', '02 inspect', '03 threat model', '04 implement',
  '05 verify', '06 design', '07 performance', '08 security review', '09 pentest',
  '10 fix', '11 adversarial', '12 score', '13 release',
];

export default function LifecycleTunnel({ height = 420 }: { height?: number }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let raf = 0;
    const cleanups: Array<() => void> = [];

    (async () => {
      const THREE = await import('three');
      if (disposed) return;

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const w = mount.clientWidth || 800;
      const h = mount.clientHeight || height;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
      mount.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x0b1220, 40, 260);
      const camera = new THREE.PerspectiveCamera(62, w / h, 0.1, 800);

      const disposables: Array<{ dispose: () => void }> = [];
      const track = <T extends { dispose: () => void }>(x: T): T => {
        disposables.push(x);
        return x;
      };

      // Curve the tunnel runs along
      const curve = new THREE.CatmullRomCurve3(
        Array.from({ length: 26 }, (_, i) => {
          const a = i * 0.42;
          return new THREE.Vector3(Math.sin(a) * 9, Math.cos(a * 0.7) * 6, -i * 15);
        })
      );

      // Tunnel walls
      const tubeGeo = track(new THREE.TubeGeometry(curve, 160, 17, 10, false));
      const tubeMat = track(
        new THREE.MeshBasicMaterial({
          color: 0x6366f1,
          wireframe: true,
          transparent: true,
          opacity: 0.14,
          side: THREE.BackSide,
        })
      );
      scene.add(new THREE.Mesh(tubeGeo, tubeMat));

      // One ring per lifecycle phase
      const ringGeo = track(new THREE.TorusGeometry(17, 0.42, 8, 64));
      const ringMats: Array<InstanceType<typeof THREE.MeshBasicMaterial>> = [];
      const phaseRings: Array<InstanceType<typeof THREE.Mesh>> = [];
      const total = PHASES.length;
      const step = 1 / (total + 1);

      for (let i = 0; i < total; i++) {
        const at = step * (i + 1);
        const pos = curve.getPointAt(at);
        const tangent = curve.getTangentAt(at);

        const mat = track(
          new THREE.MeshBasicMaterial({ color: i % 3 === 0 ? 0x22d3ee : 0x22c55e, transparent: true, opacity: 0.55 })
        );
        ringMats.push(mat);
        const ring = new THREE.Mesh(ringGeo, mat);
        ring.position.copy(pos);
        ring.lookAt(pos.clone().add(tangent));
        scene.add(ring);
        phaseRings.push(ring);
      }

      // Scroll drives progress through the tunnel
      const section = mount.closest('section') || mount;
      let progress = 0;
      let smooth = 0;

      const computeProgress = () => {
        const rect = (section as HTMLElement).getBoundingClientRect();
        const vh = window.innerHeight;
        // 0 when the section bottom enters, 1 when its top passes the viewport top
        const raw = 1 - (rect.bottom - vh * 0.15) / (rect.height + vh * 0.7);
        progress = Math.min(1, Math.max(0, raw));
      };

      computeProgress();
      window.addEventListener('scroll', computeProgress, { passive: true });
      cleanups.push(() => window.removeEventListener('scroll', computeProgress));

      const onResize = () => {
        const nw = mount.clientWidth || w;
        const nh = mount.clientHeight || h;
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      };
      window.addEventListener('resize', onResize);
      cleanups.push(() => window.removeEventListener('resize', onResize));

      let lastLabel = -1;
      const clock = new THREE.Clock();

      const animate = () => {
        raf = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();
        smooth += (progress - smooth) * (reduced ? 1 : 0.06);

        const travel = smooth * 0.985;
        const pos = curve.getPointAt(Math.min(0.999, travel));
        const ahead = curve.getPointAt(Math.min(0.999, travel + 0.02));
        camera.position.copy(pos);
        camera.position.y += Math.sin(t * 0.6) * 0.6;
        camera.lookAt(ahead);

        // Highlight the ring nearest the camera
        const idx = Math.min(total - 1, Math.floor(travel / step));
        if (idx !== lastLabel) {
          lastLabel = idx;
          if (labelRef.current) labelRef.current.textContent = PHASES[idx];
        }
        ringMats.forEach((m, i) => {
          const target = i === idx ? 0.95 : i < idx ? 0.2 : 0.42;
          m.opacity += (target - m.opacity) * 0.1;
          const targetColor = i === idx ? 0x22d3ee : i < idx ? 0x94a3b8 : 0x22c55e;
          m.color.lerp(new THREE.Color(targetColor), 0.08);
        });

        renderer.render(scene, camera);
      };
      animate();

      cleanups.push(() => {
        cancelAnimationFrame(raf);
        disposables.forEach((d) => d.dispose());
        renderer.dispose();
        if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      });
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanups.forEach((fn) => fn());
    };
  }, [height]);

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: 18, overflow: 'hidden', border: '1px solid var(--border)', background: 'rgba(15, 27, 46, 0.6)' }}>
      <div ref={mountRef} style={{ width: '100%', height }} />
      <div
        className="mono"
        style={{
          position: 'absolute', bottom: 14, left: 16, fontSize: '0.62rem',
          letterSpacing: '0.16em', color: 'var(--dim)', pointerEvents: 'none',
        }}
      >
        phase <span ref={labelRef} style={{ color: 'var(--gold)' }}>00 bootstrap</span>
      </div>
      <div
        className="mono"
        style={{
          position: 'absolute', top: 14, right: 16, fontSize: '0.58rem',
          letterSpacing: '0.16em', color: 'var(--dim)', pointerEvents: 'none',
        }}
      >
        lifecycle/00–13 · scroll to fly through
      </div>
    </div>
  );
}
