// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Biswodip Goj
// Shared motion: pointer tilt, word-by-word 3D headings, the drifting phase-number backdrop.
// Every effect is off under prefers-reduced-motion.
'use client';

import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionStyle, type MotionValue } from 'framer-motion';

/** A plain surface (the pointer tilt was removed: it moved cards without telling you anything). */
export function Tilt({ children, className, style }: { children: React.ReactNode; className?: string; max?: number; lift?: number; style?: MotionStyle }) {
  return <motion.div className={className} style={style}>{children}</motion.div>;
}

/** A heading that fades up once when it scrolls into view. */
export function FlipWords({ text, as = 'h2', id, className }: { text: string; as?: 'h1' | 'h2'; id?: string; className?: string }) {
  const H = as === 'h1' ? motion.h1 : motion.h2;
  return (
    <H id={id} className={className} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
      <motion.span className="hl" initial={{ backgroundSize: '0% 34%' }} whileInView={{ backgroundSize: '100% 34%' }} viewport={{ once: true, amount: 0.8 }} transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}>{text}</motion.span>
    </H>
  );
}

/** Eyebrow + heading + lede, animated in together. */
export function SectionHead({ eyebrow, title, id, children }: { eyebrow: string; title: string; id: string; children?: React.ReactNode }) {
  return (
    <div className="band-head">
      <motion.p className="eyebrow" initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>{eyebrow}</motion.p>
      <FlipWords text={title} id={id} />
      {children ? (
        <motion.div className="lede" initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55, delay: 0.25 }}>{children}</motion.div>
      ) : null}
    </div>
  );
}

// The 14 lifecycle phase numbers, scattered at different depths; nearer ones drift faster.
const DIGITS = [
  { n: '00', x: 6, y: 4, d: 0.9 }, { n: '01', x: 78, y: 9, d: 0.4 }, { n: '02', x: 40, y: 15, d: 0.65 }, { n: '03', x: 88, y: 24, d: 1 },
  { n: '04', x: 12, y: 31, d: 0.5 }, { n: '05', x: 60, y: 37, d: 0.8 }, { n: '06', x: 30, y: 45, d: 0.35 }, { n: '07', x: 84, y: 52, d: 0.7 },
  { n: '08', x: 4, y: 58, d: 1 }, { n: '09', x: 52, y: 64, d: 0.45 }, { n: '10', x: 74, y: 72, d: 0.9 }, { n: '11', x: 20, y: 79, d: 0.6 },
  { n: '12', x: 64, y: 86, d: 0.4 }, { n: '13', x: 36, y: 93, d: 0.85 },
];

function Digit({ n, x, y, d, p }: { n: string; x: number; y: number; d: number; p: MotionValue<number> }) {
  const ty = useTransform(p, [0, 1], ['0vh', `${-160 * d}vh`]);
  return <motion.span className="bg-digit" style={{ left: `${x}%`, top: `${y * 1.8}vh`, y: ty, fontSize: `${4 + d * 7}rem`, opacity: 0.04 + d * 0.06 }}>{n}</motion.span>;
}

/**
 * The page's colour field: a teal pool and an apricot pool that drift toward each other as you scroll.
 * Only `transform` changes, so the browser composites it without repainting. Static under reduced motion.
 */
export function GradientMesh() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const tx = useTransform(scrollYProgress, [0, 1], ['0vw', '38vw']);
  const ty = useTransform(scrollYProgress, [0, 1], ['0vh', '55vh']);
  const ax = useTransform(scrollYProgress, [0, 1], ['0vw', '-34vw']);
  const ay = useTransform(scrollYProgress, [0, 1], ['0vh', '-60vh']);
  return (
    <div className="mesh" aria-hidden>
      <motion.div className="mesh-blob mesh-blob--teal" style={reduce ? undefined : { x: tx, y: ty }} />
      <motion.div className="mesh-blob mesh-blob--apricot" style={reduce ? undefined : { x: ax, y: ay }} />
    </div>
  );
}

/** Inertial smooth scrolling (Lenis) for the whole page; off under reduced motion. Anchor links land below the header. */
export function SmoothScroll() {
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95, anchors: { offset: -72 }, autoRaf: true });
    return () => lenis.destroy();
  }, [reduce]);
  return null;
}

/** Counts up to `to` the first time it scrolls into view. */
export function Counter({ to, className }: { to: number; className?: string }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? to : 0);
  const spring = useSpring(mv, { stiffness: 60, damping: 18 });
  const text = useTransform(spring, (v) => Math.round(v).toString());
  return (
    <motion.span className={className} onViewportEnter={() => mv.set(to)} viewport={{ once: true }}>
      {reduce ? to : <motion.span>{text}</motion.span>}
    </motion.span>
  );
}

/** An endless horizontal ribbon; pauses on hover, stops under reduced motion. */
export function Marquee({ children, seconds = 40, reverse = false }: { children: React.ReactNode; seconds?: number; reverse?: boolean }) {
  return (
    <div className="marquee" style={{ ['--dur' as string]: `${seconds}s`, ['--dir' as string]: reverse ? 'reverse' : 'normal' }}>
      <div className="marquee-track">{children}</div>
      <div className="marquee-track" aria-hidden>{children}</div>
    </div>
  );
}

/** Fixed layer behind the page: the phase numbers of the lifecycle, drifting in parallax as you scroll. */
export function DepthBackdrop() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  if (reduce) return null;
  return (
    <div className="bg-digits" aria-hidden>
      {DIGITS.map((g) => <Digit key={g.n} {...g} p={scrollYProgress} />)}
    </div>
  );
}

/** Slot-machine word: cycles through `words` (the lifecycle verbs), sliding each in from below. */
export function VerbRotator({ words, every = 1800 }: { words: string[]; every?: number }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setI((n) => (n + 1) % words.length), every);
    return () => clearInterval(t);
  }, [reduce, words.length, every]);
  return (
    <span className="rotator" aria-live="off">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={words[i]} className="rotator-word grad-text" initial={{ y: '70%', opacity: 0, rotateX: -60 }} animate={{ y: 0, opacity: 1, rotateX: 0 }} exit={{ y: '-70%', opacity: 0, rotateX: 60 }} transition={{ type: 'spring', stiffness: 420, damping: 28 }}>
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
