// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Biswodip Goj
'use client';

import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { SectionHead } from './fx';
import { PHASE_ICON } from './icons';
import repo from '@/data/repo.json';
import { blob } from './links';

const PHASES = repo.lifecycle;
const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function Gate({ text, on, delay }: { text: string; on: boolean; delay: number }) {
  return (
    <li className="gate">
      <svg viewBox="0 0 20 20" className="gate-box" aria-hidden>
        <rect x="1.5" y="1.5" width="17" height="17" rx="2" />
        <motion.path d="M5 10.5l3.2 3.2L15 6.5" initial={false} animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }} transition={{ duration: 0.35, delay: on ? delay : 0 }} />
      </svg>
      <span>{text}</span>
    </li>
  );
}

const PhaseCard = memo(function PhaseCard({ p, active, done }: { p: (typeof PHASES)[number]; active: boolean; done: boolean }) {
  const Icon = PHASE_ICON[p.n];
  return (
    <article className={`phase panel${active ? ' is-active' : ''}`} aria-current={active ? 'step' : undefined}>
      <header className="phase-head">
        <motion.span className="phase-icon" animate={active ? { rotate: [0, -8, 8, 0], scale: [1, 1.12, 1] } : { rotate: 0, scale: 1 }} transition={{ duration: 0.6 }}>
          {Icon ? <Icon size={22} aria-hidden /> : null}
        </motion.span>
        <div>
          <span className="phase-n mono">{p.n}</span>
          <h3>{p.title}</h3>
          {p.phase ? <p className="muted phase-sub mono">{p.phase}</p> : null}
        </div>
      </header>
      <p className="phase-gate-label mono">Exit gate</p>
      <ul className="gates">
        {p.gates.map((g, i) => <Gate key={g} text={g} on={active || done} delay={0.12 * i} />)}
      </ul>
      <a className="phase-file mono" href={blob(p.file)}>{p.file}</a>
    </article>
  );
});

/** Coverflow slot: flat when it is the current phase, swung away in depth the further it is from it. */
function CoverCard({ i, pos, children }: { i: number; pos: MotionValue<number>; children: React.ReactNode }) {
  const rotateY = useTransform(pos, (v) => Math.max(-65, Math.min(65, (i - v) * -32)));
  const z = useTransform(pos, (v) => -Math.min(3, Math.abs(i - v)) * 110);
  const scale = useTransform(pos, (v) => 1 - Math.min(0.12, Math.abs(i - v) * 0.04));
  return <motion.div className="lc-card3d" style={{ rotateY, z, scale, transformPerspective: 1100 }}>{children}</motion.div>;
}

/** Desktop: a pinned track that scrolls sideways through the 14 phases. Phone / reduced motion: a plain list. */
export default function Lifecycle() {
  const reduce = useReducedMotion();
  const [wide, setWide] = useState(false);
  const outer = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const [geo, setGeo] = useState({ step: 400, card: 380, view: 1000 });
  const [active, setActive] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)');
    const on = () => setWide(mq.matches);
    on(); mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  const pinned = wide && !reduce;

  useIso(() => {
    if (!pinned || !track.current) return;
    const measure = () => {
      const t = track.current; const first = t?.children[0] as HTMLElement | undefined; const second = t?.children[1] as HTMLElement | undefined;
      if (!t?.parentElement || !first) return;
      setGeo({ card: first.offsetWidth, step: second ? second.offsetLeft - first.offsetLeft : first.offsetWidth, view: t.parentElement.clientWidth });
    };
    measure();
    const ro = new ResizeObserver(measure); ro.observe(track.current);
    return () => ro.disconnect();
  }, [pinned]);

  const { scrollYProgress } = useScroll({ target: outer, offset: ['start start', 'end end'] });
  // pos runs 0 → 13 as the section scrolls; the track slides so phase `pos` sits in the middle.
  const pos = useTransform(scrollYProgress, [0.04, 0.96], [0, PHASES.length - 1], { clamp: true });
  const x = useTransform(pos, (v) => geo.view / 2 - geo.card / 2 - v * geo.step);
  useMotionValueEvent(pos, 'change', (v) => { if (pinned) setActive(Math.round(v)); });

  // List mode: the card crossing the middle of the screen is the active one.
  useEffect(() => {
    if (pinned) return;
    const cards = Array.from(document.querySelectorAll<HTMLElement>('.phase'));
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setActive(cards.indexOf(e.target as HTMLElement)); }), { rootMargin: '-45% 0px -45% 0px' });
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [pinned]);

  const cur = PHASES[active];
  return (
    <section id="lifecycle" className="band lifecycle" aria-labelledby="lc-title">
      <div className="wrap">
        <SectionHead eyebrow="14 phases · lifecycle/00–13" title="Every phase ends at an exit gate." id="lc-title">
          Scroll through the lifecycle the agent follows. A phase is done when its gate items are answered from evidence — not when the code looks finished.
        </SectionHead>
      </div>

      <div ref={outer} className={pinned ? 'lc-outer is-pinned' : 'lc-outer'} style={pinned ? { height: `${PHASES.length * 34 + 70}vh` } : undefined}>
        <div className="lc-sticky">
          {pinned ? (
            <div className="wrap lc-status" aria-hidden>
              <span className="lc-big mono">{cur.n}</span>
              <span className="lc-title">{cur.title}</span>
              <div className="lc-rail">
                <motion.span style={{ scaleX: scrollYProgress }} />
                {PHASES.map((p, i) => <i key={p.n} className={i <= active ? 'on' : ''} style={{ left: `${(i / (PHASES.length - 1)) * 100}%` }} />)}
              </div>
            </div>
          ) : null}
          <div className="lc-viewport">
            <motion.ol ref={track} className="lc-track" style={pinned ? { x } : undefined}>
              {PHASES.map((p, i) => (
                <li key={p.n}>
                  {pinned ? (
                    <CoverCard i={i} pos={pos}><PhaseCard p={p} active={i === active} done={i < active} /></CoverCard>
                  ) : (
                    <motion.div initial={{ opacity: 0, rotateX: 55, y: 40 }} whileInView={{ opacity: 1, rotateX: 0, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ type: 'spring', stiffness: 160, damping: 20 }} style={{ transformOrigin: '50% 100%' }}>
                      <PhaseCard p={p} active={i === active} done={i < active} />
                    </motion.div>
                  )}
                </li>
              ))}
            </motion.ol>
          </div>
        </div>
      </div>
    </section>
  );
}
