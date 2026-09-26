'use client';

// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Biswodip Goj
// Cinematic layer: scroll progress, custom cursor with trail, and a scroll
// velocity skew wrapper. All effects respect prefers-reduced-motion.

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });
  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        scaleX,
        transformOrigin: '0%',
        background: 'linear-gradient(90deg, #22d3ee, #6366f1)',
        zIndex: 200,
      }}
      aria-hidden="true"
    />
  );
}

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduced) return;
    setEnabled(true);

    let x = 0;
    let y = 0;
    let rx = 0;
    let ry = 0;
    let raf = 0;
    let hovering = false;

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      const el = e.target as HTMLElement;
      hovering = !!el.closest('a, button, [data-cursor-hover]');
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${x - 3}px, ${y - 3}px, 0)`;
      if (ringRef.current) {
        const s = hovering ? 2.1 : 1;
        ringRef.current.style.transform = `translate3d(${rx - 16}px, ${ry - 16}px, 0) scale(${s})`;
        ringRef.current.style.borderColor = hovering ? 'rgba(34,211,238,0.9)' : 'rgba(99,102,241,0.55)';
      }
    };
    window.addEventListener('mousemove', onMove);
    loop();

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{ position: 'fixed', top: 0, left: 0, width: 6, height: 6, borderRadius: '50%', background: '#22d3ee', zIndex: 300, pointerEvents: 'none', boxShadow: '0 0 12px #22d3ee' }}
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{ position: 'fixed', top: 0, left: 0, width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(99,102,241,0.55)', zIndex: 300, pointerEvents: 'none', transition: 'border-color 0.2s' }}
      />
    </>
  );
}

export function ScrollSkew({ children }: { children: React.ReactNode }) {
  const { scrollY } = useScroll();
  const [velocity, setVelocity] = useState(0);
  const prev = useRef(0);
  const skew = useTransform(useSpring(velocity, { stiffness: 200, damping: 30 }), (v) => Math.max(-3, Math.min(3, v * 0.02)));

  useEffect(() => {
    const unsub = scrollY.on('change', (latest) => {
      setVelocity(latest - prev.current);
      prev.current = latest;
    });
    return () => unsub();
  }, [scrollY]);

  return (
    <motion.div style={{ skewY: skew, willChange: 'transform' }}>
      {children}
    </motion.div>
  );
}

export function Marquee({ items, speed = 40 }: { items: string[]; speed?: number }) {
  const loop = [...items, ...items];
  return (
    <div style={{ overflow: 'hidden', width: '100%', maskImage: 'linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)' }}>
      <motion.div
        style={{ display: 'flex', gap: '2.5rem', whiteSpace: 'nowrap', width: 'max-content' }}
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
      >
        {loop.map((item, i) => (
          <span key={i} style={{ fontFamily: 'JetBrains Mono', fontSize: '0.8rem', color: i % 3 === 0 ? '#00d4ff' : '#606080' }}>
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export function TiltCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ rx: 0, ry: 0 });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setT({ rx: -py * 10, ry: px * 12 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setT({ rx: 0, ry: 0 })}
      animate={{ rotateX: t.rx, rotateY: t.ry }}
      transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      style={{ transformStyle: 'preserve-3d', transformPerspective: 900, ...style }}
    >
      {children}
    </motion.div>
  );
}
