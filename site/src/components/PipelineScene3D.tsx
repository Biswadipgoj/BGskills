'use client';

// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Biswodip Goj
// PipelineScene3D — the repository's own architecture, rendered.
//
// Every object maps to a real artifact (per the design skill's rule that motion
// must communicate structure, never decorate):
//   · 9 horizontal slabs          → the 9 architecture layers (ARCHITECTURE.md §2)
//   · a light travelling the stack → /dip loading one layer at a time
//   · 14 nodes along the base      → lifecycle/00-bootstrap … 13-release
//   · the active node lights up     → the phase the traveller is in
// No particles, no orbit rings, no invented scenery. Camera is mouse-parallaxed.

import { useEffect, useRef } from 'react';

const LAYERS = [
  { name: 'Entry', file: 'templates/claude/', y: 0, color: 0x22d3ee },
  { name: 'Router skill', file: 'skills/biswodip-unified-engineering/', y: 0, color: 0x38bdf8 },
  { name: 'Phase skills', file: 'skills/', y: 0, color: 0x6366f1 },
  { name: 'Procedures', file: 'lifecycle/00–13', y: 0, color: 0x818cf8 },
  { name: 'Deep dives', file: 'security/', y: 0, color: 0x22c55e },
  { name: 'References', file: 'references/01–07', y: 0, color: 0x2dd4bf },
  { name: 'Tooling', file: 'bin/ · scripts/lib/', y: 0, color: 0xf59e0b },
  { name: 'Integrations', file: 'integrations/ · upstream/', y: 0, color: 0xf472b6 },
  { name: 'Evidence', file: '.biswodip/', y: 0, color: 0x94a3b8 },
];

const PHASES = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13'];

export default function PipelineScene3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLSpanElement>(null);
  const phaseRef = useRef<HTMLSpanElement>(null);

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
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || 520;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mount.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(46, w / h, 0.1, 2000);
      camera.position.set(0, 26, 120);
      camera.lookAt(0, -2, 0);

      const root = new THREE.Group();
      root.rotation.x = -0.16;
      scene.add(root);

      const disposables: Array<{ dispose: () => void }> = [];
      const track = <T extends { dispose: () => void }>(x: T): T => { disposables.push(x); return x; };

      // ── Nine architecture slabs ──────────────────────────────────────────
      const GAP = 7.2;
      const slabGeo = track(new THREE.BoxGeometry(120, 0.6, 54));
      const slabs: Array<InstanceType<typeof THREE.Mesh>> = [];
      const slabMats: Array<InstanceType<typeof THREE.MeshBasicMaterial>> = [];

      LAYERS.forEach((layer, i) => {
        const mat = track(
          new THREE.MeshBasicMaterial({ color: layer.color, transparent: true, opacity: 0.14, wireframe: false })
        );
        const mesh = new THREE.Mesh(slabGeo, mat);
        mesh.position.y = 34 - i * GAP;
        root.add(mesh);
        slabs.push(mesh);
        slabMats.push(mat);

        // Wire outline so the slab reads as a layer, not a solid block
        const edge = new THREE.LineSegments(
          track(new THREE.EdgesGeometry(slabGeo)),
          track(new THREE.LineBasicMaterial({ color: layer.color, transparent: true, opacity: 0.55 }))
        );
        edge.position.copy(mesh.position);
        root.add(edge);
      });

      // ── Traveller: /dip loading one layer at a time ──────────────────────
      const traveller = new THREE.Mesh(
        track(new THREE.SphereGeometry(1.7, 18, 18)),
        track(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 }))
      );
      root.add(traveller);

      const travellerGlow = new THREE.Mesh(
        track(new THREE.SphereGeometry(4.2, 16, 16)),
        track(new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.14 }))
      );
      root.add(travellerGlow);

      // ── Fourteen lifecycle nodes along the base ──────────────────────────
      const nodeGeo = track(new THREE.OctahedronGeometry(1.5, 0));
      const nodeMats: Array<InstanceType<typeof THREE.MeshBasicMaterial>> = [];
      const span = 108;
      PHASES.forEach((p, i) => {
        const mat = track(new THREE.MeshBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.5 }));
        nodeMats.push(mat);
        const node = new THREE.Mesh(nodeGeo, mat);
        node.position.set(-span / 2 + (i / (PHASES.length - 1)) * span, -30, 0);
        root.add(node);
      });

      // A rail joining the phase nodes
      const railPts = PHASES.map((_, i) => new THREE.Vector3(-span / 2 + (i / (PHASES.length - 1)) * span, -30, 0));
      const rail = new THREE.Line(
        track(new THREE.BufferGeometry().setFromPoints(railPts)),
        track(new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.8 }))
      );
      root.add(rail);

      // ── Pointer parallax ─────────────────────────────────────────────────
      let mx = 0, my = 0, tx = 0, ty = 0;
      const onMove = (e: MouseEvent) => {
        tx = (e.clientX / window.innerWidth - 0.5) * 2;
        ty = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener('mousemove', onMove);
      cleanups.push(() => window.removeEventListener('mousemove', onMove));

      const onResize = () => {
        const nw = mount.clientWidth || w;
        const nh = mount.clientHeight || h;
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      };
      window.addEventListener('resize', onResize);
      cleanups.push(() => window.removeEventListener('resize', onResize));

      // ── Loop ─────────────────────────────────────────────────────────────
      const clock = new THREE.Clock();
      let lastLayer = -1;
      let lastPhase = -1;

      const animate = () => {
        raf = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();
        mx += (tx - mx) * 0.05;
        my += (ty - my) * 0.05;

        // Traveller descends the stack, then loops
        const cycle = reduced ? 0.5 : (t * 0.16) % 1;
        const top = 34;
        const bottom = 34 - (LAYERS.length - 1) * GAP;
        traveller.position.y = top - cycle * (top - bottom);
        travellerGlow.position.y = traveller.position.y;

        const activeLayer = Math.min(LAYERS.length - 1, Math.floor(cycle * LAYERS.length));
        if (activeLayer !== lastLayer) {
          lastLayer = activeLayer;
          if (layerRef.current) layerRef.current.textContent = `${LAYERS[activeLayer].name} · ${LAYERS[activeLayer].file}`;
        }
        slabMats.forEach((m, i) => {
          const isActive = i === activeLayer;
          const near = Math.abs(i - activeLayer) === 1;
          const target = isActive ? 0.4 : near ? 0.2 : 0.1;
          m.opacity += (target - m.opacity) * 0.12;
        });

        // Phase node lights with the same cycle
        const activePhase = Math.min(PHASES.length - 1, Math.floor(cycle * PHASES.length));
        if (activePhase !== lastPhase) {
          lastPhase = activePhase;
          if (phaseRef.current) phaseRef.current.textContent = `phase ${PHASES[activePhase]}`;
        }
        nodeMats.forEach((m, i) => {
          const isActive = i === activePhase;
          const done = i < activePhase;
          m.color.lerp(new THREE.Color(isActive ? 0x22d3ee : done ? 0x22c55e : 0x64748b), 0.12);
          m.opacity += ((isActive ? 1 : done ? 0.75 : 0.45) - m.opacity) * 0.12;
        });

        if (!reduced) {
          root.rotation.y = Math.sin(t * 0.14) * 0.12 + mx * 0.24;
          root.rotation.x = -0.16 + my * 0.09;
        }
        camera.position.x = mx * 8;
        camera.position.y = 26 - my * 6;
        camera.lookAt(0, -2, 0);

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
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 460 }}>
      <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />
      <div
        style={{
          position: 'absolute', bottom: 18, left: 20, right: 20,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          gap: '1rem', flexWrap: 'wrap', pointerEvents: 'none',
        }}
      >
        <span className="artifact">
          <span ref={layerRef}>Entry · templates/claude/</span>
        </span>
        <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--muted)', letterSpacing: '0.1em' }}>
          <span ref={phaseRef}>phase 00</span>
        </span>
      </div>
    </div>
  );
}
