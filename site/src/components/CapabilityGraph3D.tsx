'use client';

// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Biswodip Goj
// Interactive 3D capability graph rendered with raw three.js.
// Nodes are the DIP capabilities; edges connect each capability to its section hub.
// Pointer drag orbits the camera, scroll zooms, hovering a node highlights its edges.

import { useEffect, useRef, useState } from 'react';

interface Node {
  id: string;
  name: string;
  section: string;
  required: boolean;
  stars: number | null;
}

const SECTION_COLOR: Record<string, number> = {
  browser: 0x22d3ee,
  animation: 0x6366f1,
  design: 0xf472b6,
  backend: 0x2dd4bf,
  security: 0x22c55e,
  quality: 0xf59e0b,
};

export default function CapabilityGraph3D({
  nodes,
  height = 520,
}: {
  nodes: Node[];
  height?: number;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [h, setH] = useState(height);

  useEffect(() => {
    const compute = () => setH(window.innerWidth < 768 ? 340 : height);
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [height]);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let raf = 0;
    const cleanups: Array<() => void> = [];

    (async () => {
      const THREE = await import('three');
      if (disposed) return;

      const width = mount.clientWidth || 800;
      const heightPx = mount.clientHeight || h;

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x0b1220, 0.0016);

      const camera = new THREE.PerspectiveCamera(55, width / heightPx, 0.1, 4000);
      camera.position.set(0, 90, 320);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, heightPx);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mount.appendChild(renderer.domElement);

      // --- Layout: section hubs on a ring, capabilities orbiting their hub ---
      const sections = Array.from(new Set(nodes.map((n) => n.section)));
      const hubPos = new Map<string, InstanceType<typeof THREE.Vector3>>();
      const RING = 150;
      sections.forEach((s, i) => {
        const a = (i / sections.length) * Math.PI * 2;
        hubPos.set(s, new THREE.Vector3(Math.cos(a) * RING, 0, Math.sin(a) * RING));
      });

      const positions: Record<string, InstanceType<typeof THREE.Vector3>> = {};
      const perSection = new Map<string, number>();
      nodes.forEach((n) => perSection.set(n.section, (perSection.get(n.section) || 0) + 1));

      const seen = new Map<string, number>();
      nodes.forEach((n) => {
        const idx = seen.get(n.section) || 0;
        seen.set(n.section, idx + 1);
        const total = perSection.get(n.section) || 1;
        const hub = hubPos.get(n.section)!;
        const a = (idx / total) * Math.PI * 2;
        const radius = 42 + (idx % 3) * 16;
        positions[n.id] = new THREE.Vector3(
          hub.x + Math.cos(a) * radius,
          Math.sin(idx * 1.7) * 26,
          hub.z + Math.sin(a) * radius
        );
      });

      // --- Stars backdrop ---
      const starGeo = new THREE.BufferGeometry();
      const starCount = 1200;
      const starPos = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount * 3; i += 3) {
        starPos[i] = (Math.random() - 0.5) * 1800;
        starPos[i + 1] = (Math.random() - 0.5) * 1200;
        starPos[i + 2] = (Math.random() - 0.5) * 1800;
      }
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
      const stars = new THREE.Points(
        starGeo,
        new THREE.PointsMaterial({ color: 0x334155, size: 1.6, transparent: true, opacity: 0.8 })
      );
      scene.add(stars);

      // --- Edges: capability -> hub, and hub -> hub ring ---
      const edgePositions: number[] = [];
      const edgeColors: number[] = [];
      nodes.forEach((n) => {
        const from = positions[n.id];
        const to = hubPos.get(n.section)!;
        edgePositions.push(from.x, from.y, from.z, to.x, to.y, to.z);
        const c = new THREE.Color(SECTION_COLOR[n.section] || 0x888888);
        edgeColors.push(c.r, c.g, c.b, c.r * 0.15, c.g * 0.15, c.b * 0.15);
      });
      sections.forEach((s, i) => {
        const next = sections[(i + 1) % sections.length];
        const a = hubPos.get(s)!;
        const b = hubPos.get(next)!;
        edgePositions.push(a.x, a.y, a.z, b.x, b.y, b.z);
        edgeColors.push(0.05, 0.35, 0.45, 0.05, 0.35, 0.45);
      });

      const edgeGeo = new THREE.BufferGeometry();
      edgeGeo.setAttribute('position', new THREE.Float32BufferAttribute(edgePositions, 3));
      edgeGeo.setAttribute('color', new THREE.Float32BufferAttribute(edgeColors, 3));
      const edges = new THREE.LineSegments(
        edgeGeo,
        new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.45 })
      );
      scene.add(edges);

      // --- Nodes ---
      const nodeMeshes: Array<{ mesh: InstanceType<typeof THREE.Mesh>; node: Node }> = [];
      const sphereGeo = new THREE.SphereGeometry(1, 16, 16);

      nodes.forEach((n) => {
        const isHub = false;
        const r = isHub ? 7 : n.required ? 3.4 : 2.6;
        const mat = new THREE.MeshBasicMaterial({
          color: SECTION_COLOR[n.section] || 0x888888,
          transparent: true,
          opacity: n.required ? 0.95 : 0.6,
        });
        const mesh = new THREE.Mesh(sphereGeo, mat);
        mesh.position.copy(positions[n.id]);
        mesh.scale.setScalar(r);
        mesh.userData.nodeId = n.id;
        scene.add(mesh);
        nodeMeshes.push({ mesh, node: n });
      });

      sections.forEach((s) => {
        const hub = new THREE.Mesh(
          new THREE.IcosahedronGeometry(9, 1),
          new THREE.MeshBasicMaterial({
            color: SECTION_COLOR[s] || 0x888888,
            wireframe: true,
            transparent: true,
            opacity: 0.9,
          })
        );
        hub.position.copy(hubPos.get(s)!);
        hub.userData.hub = s;
        scene.add(hub);
        nodeMeshes.push({ mesh: hub, node: { id: `hub-${s}`, name: s, section: s, required: true, stars: null } });
      });

      // --- Interaction: drag to orbit, wheel to zoom, hover to highlight ---
      let dragging = false;
      let px = 0;
      let py = 0;
      let theta = 0;
      let phi = 0.9;
      let radius = 340;
      let targetTheta = theta;
      let targetPhi = phi;
      let targetRadius = radius;

      const pointer = new THREE.Vector2(-10, -10);
      const raycaster = new THREE.Raycaster();

      const onDown = (e: PointerEvent) => {
        dragging = true;
        px = e.clientX;
        py = e.clientY;
      };
      const onUp = () => (dragging = false);
      const onMove = (e: PointerEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        if (dragging) {
          targetTheta -= (e.clientX - px) * 0.005;
          targetPhi = Math.max(0.25, Math.min(1.5, targetPhi + (e.clientY - py) * 0.004));
          px = e.clientX;
          py = e.clientY;
        }
      };
      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        targetRadius = Math.max(160, Math.min(700, targetRadius + e.deltaY * 0.5));
      };

      renderer.domElement.addEventListener('pointerdown', onDown);
      window.addEventListener('pointerup', onUp);
      renderer.domElement.addEventListener('pointermove', onMove);
      renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
      cleanups.push(() => {
        renderer.domElement.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointerup', onUp);
        renderer.domElement.removeEventListener('pointermove', onMove);
        renderer.domElement.removeEventListener('wheel', onWheel);
      });

      const onResize = () => {
        const w = mount.clientWidth || width;
        const h = mount.clientHeight || heightPx;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', onResize);
      cleanups.push(() => window.removeEventListener('resize', onResize));

      let hoveredId: string | null = null;
      const clock = new THREE.Timer();

      const animate = () => {
        raf = requestAnimationFrame(animate);
        const t = clock.getElapsed();

        theta += (targetTheta - theta) * 0.08;
        phi += (targetPhi - phi) * 0.08;
        radius += (targetRadius - radius) * 0.08;

        if (!reduced) {
          stars.rotation.y = t * 0.01;
          stars.rotation.x = Math.sin(t * 0.05) * 0.05;
        }

        camera.position.x = Math.sin(theta) * Math.sin(phi) * radius;
        camera.position.y = Math.cos(phi) * radius;
        camera.position.z = Math.cos(theta) * Math.sin(phi) * radius;
        camera.lookAt(0, 0, 0);

        // hover detection
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(nodeMeshes.map((n) => n.mesh), false);
        const hit = hits[0]?.object as InstanceType<typeof THREE.Mesh> | undefined;
        const hitId = hit ? (hit.userData.nodeId as string) || (hit.userData.hub as string) : null;

        if (hitId !== hoveredId) {
          hoveredId = hitId;
          setHovered(hitId ? (hit!.userData.nodeId as string) || null : null);
          renderer.domElement.style.cursor = hitId ? 'pointer' : 'grab';
        }

        nodeMeshes.forEach(({ mesh, node }) => {
          const isHover = node.id === hoveredId;
          const pulse = 1 + Math.sin(t * 1.6 + mesh.position.x * 0.02) * 0.12;
          const base = node.id.startsWith('hub-') ? 1 : node.required ? 3.4 : 2.6;
          const target = base * (isHover ? 1.9 : pulse);
          mesh.scale.lerp(new THREE.Vector3(target, target, target), 0.15);
          (mesh.material as InstanceType<typeof THREE.MeshBasicMaterial>).opacity = isHover
            ? 1
            : node.required
            ? 0.95
            : 0.6;
        });

        edges.material.opacity = hoveredId ? 0.28 : 0.45;
        renderer.render(scene, camera);
      };
      animate();
      setReady(true);

      cleanups.push(() => {
        cancelAnimationFrame(raf);
        renderer.dispose();
        sphereGeo.dispose();
        edgeGeo.dispose();
        starGeo.dispose();
        nodeMeshes.forEach(({ mesh }) => {
          (mesh.geometry as InstanceType<typeof THREE.BufferGeometry>)?.dispose?.();
          (mesh.material as InstanceType<typeof THREE.Material>)?.dispose?.();
        });
        if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      });
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      cleanups.forEach((fn) => fn());
    };
  }, [nodes, h, reduced]);

  return (
    <div style={{ position: 'relative', width: '100%', height: h }}>
      <div ref={mountRef} style={{ width: '100%', height: h, borderRadius: 20, overflow: 'hidden', cursor: 'grab' }} />
      {!ready && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#606080', fontFamily: 'JetBrains Mono', fontSize: '0.75rem' }}>
          loading 3D capability graph…
        </div>
      )}
      <div style={{ position: 'absolute', bottom: 12, left: 16, fontSize: '0.65rem', fontFamily: 'JetBrains Mono', color: '#606080', pointerEvents: 'none' }}>
        drag to orbit · scroll to zoom · hover a node
      </div>
      {hovered && (
        <div style={{ position: 'absolute', top: 12, right: 16, fontSize: '0.7rem', fontFamily: 'JetBrains Mono', color: '#00d4ff', background: 'rgba(10,10,15,0.8)', padding: '0.35rem 0.7rem', borderRadius: 8, border: '1px solid rgba(0,212,255,0.2)' }}>
          {hovered}
        </div>
      )}
    </div>
  );
}
