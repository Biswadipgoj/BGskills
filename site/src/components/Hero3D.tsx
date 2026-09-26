'use client';

// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Biswodip Goj
// 3D hero backdrop: a slowly rotating wireframe icosahedron core inside a
// particle field, with mouse-parallax. Rendered with raw three.js.

import { useEffect, useRef } from 'react';

export default function Hero3D() {
  const mountRef = useRef<HTMLDivElement>(null);

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
      const h = mount.clientHeight || window.innerHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 2000);
      camera.position.z = 260;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.domElement.style.display = 'block';
      mount.appendChild(renderer.domElement);

      const group = new THREE.Group();
      scene.add(group);

      // Core wireframe
      const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(70, 2),
        new THREE.MeshBasicMaterial({ color: 0x00d4ff, wireframe: true, transparent: true, opacity: 0.16 })
      );
      group.add(core);

      const inner = new THREE.Mesh(
        new THREE.IcosahedronGeometry(44, 1),
        new THREE.MeshBasicMaterial({ color: 0x8b5cf6, wireframe: true, transparent: true, opacity: 0.22 })
      );
      group.add(inner);

      // Orbiting rings
      const rings: Array<InstanceType<typeof THREE.Mesh>> = [];
      for (let i = 0; i < 3; i++) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(96 + i * 26, 0.5, 8, 120),
          new THREE.MeshBasicMaterial({ color: i % 2 ? 0x8b5cf6 : 0x00d4ff, transparent: true, opacity: 0.28 })
        );
        ring.rotation.x = Math.PI / 2 + i * 0.4;
        ring.rotation.y = i * 0.6;
        group.add(ring);
        rings.push(ring);
      }

      // Particle field
      const count = 900;
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count * 3; i += 3) {
        const r = 180 + Math.random() * 520;
        const a = Math.random() * Math.PI * 2;
        const b = Math.acos(2 * Math.random() - 1);
        pos[i] = r * Math.sin(b) * Math.cos(a);
        pos[i + 1] = r * Math.cos(b) * 0.6;
        pos[i + 2] = r * Math.sin(b) * Math.sin(a);
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const points = new THREE.Points(
        pGeo,
        new THREE.PointsMaterial({ color: 0x00d4ff, size: 1.5, transparent: true, opacity: 0.55 })
      );
      scene.add(points);

      let mx = 0;
      let my = 0;
      let tx = 0;
      let ty = 0;
      const onMove = (e: MouseEvent) => {
        tx = (e.clientX / window.innerWidth - 0.5) * 2;
        ty = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener('mousemove', onMove);
      cleanups.push(() => window.removeEventListener('mousemove', onMove));

      const onResize = () => {
        const nw = mount.clientWidth || window.innerWidth;
        const nh = mount.clientHeight || window.innerHeight;
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      };
      window.addEventListener('resize', onResize);
      cleanups.push(() => window.removeEventListener('resize', onResize));

      const clock = new THREE.Timer();
      const animate = () => {
        raf = requestAnimationFrame(animate);
        const t = clock.getElapsed();
        mx += (tx - mx) * 0.05;
        my += (ty - my) * 0.05;

        if (!reduced) {
          core.rotation.y = t * 0.12;
          core.rotation.x = t * 0.07;
          inner.rotation.y = -t * 0.18;
          inner.rotation.z = t * 0.09;
          rings.forEach((r, i) => {
            r.rotation.z = t * (0.1 + i * 0.05) * (i % 2 ? -1 : 1);
          });
          points.rotation.y = t * 0.015;
        }
        group.rotation.y = mx * 0.35;
        group.rotation.x = my * 0.22;
        camera.position.x = mx * 26;
        camera.position.y = -my * 20;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      };
      animate();

      cleanups.push(() => {
        cancelAnimationFrame(raf);
        core.geometry.dispose();
        (core.material as InstanceType<typeof THREE.Material>).dispose();
        inner.geometry.dispose();
        (inner.material as InstanceType<typeof THREE.Material>).dispose();
        rings.forEach((r) => {
          r.geometry.dispose();
          (r.material as InstanceType<typeof THREE.Material>).dispose();
        });
        pGeo.dispose();
        (points.material as InstanceType<typeof THREE.Material>).dispose();
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

  return <div ref={mountRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} aria-hidden="true" />;
}
