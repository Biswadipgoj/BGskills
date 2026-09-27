// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Biswodip Goj
'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform, type MotionValue } from 'framer-motion';
import { BadgeCheck, Bug, CodeXml, FlaskConical, Pause, Play, RotateCcw, ServerCog, ShieldCheck } from 'lucide-react';
import { SectionHead } from './fx';

// One timeline, four chapters: what /dip does to a change, from the first component to the release gate.
const CHAPTERS = [
  { key: 'frontend', label: 'Frontend', Icon: CodeXml },
  { key: 'testing', label: 'Testing', Icon: FlaskConical },
  { key: 'security', label: 'Security', Icon: ShieldCheck },
  { key: 'devops', label: 'DevOps', Icon: ServerCog },
] as const;
const SECONDS_PER_CHAPTER = 6.5;
const TOTAL = CHAPTERS.length;

// Real test names from test/orchestration.test.mjs.
const TESTS = [
  'website goals never get a mobile agent',
  'one pick per alternative group, and the repo’s own choice wins',
  'the website runs the same planner as /dip (no drift)',
  'CLI accepts a leading "dip" and install defaults to pinned',
  'installers point at the real repository',
  'PLAN.md never contains the key',
];
// Real job steps from .github/workflows/ci.yml.
const CI = [
  'Package self-verification', 'Unit tests', 'Installer dry run', 'Offline install into a scratch project',
  'Strix guard refuses a non-loopback target', 'Security gates on this repository', 'Clone all five upstreams at pinned commits', 'shellcheck · PSScriptAnalyzer',
];

const Line = ({ show, children }: { show: boolean; children: React.ReactNode }) => (
  <AnimatePresence initial={false}>
    {show ? <motion.div className="film-line" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>{children}</motion.div> : null}
  </AnimatePresence>
);

function Title({ kicker, title, children, Icon }: { kicker: string; title: string; children: React.ReactNode; Icon: React.ComponentType<{ size?: number }> }) {
  return (
    <motion.div className="film-title" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
      <span className="film-kicker"><Icon size={14} /> {kicker}</span>
      <h3>{title}</h3>
      <p>{children}</p>
    </motion.div>
  );
}

const cardIn = { initial: { opacity: 0, rotateY: -18, x: 40 }, animate: { opacity: 1, rotateY: 0, x: 0 }, exit: { opacity: 0, x: -40 }, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } };

function Frontend({ p }: { p: number }) {
  const states = ['loading', 'empty', 'error', 'success'];
  const on = Math.min(3, Math.floor(p * 4.4));
  return (
    <>
      <Title kicker="@dip-frontend · /dip:design" title="Build the screen, every state of it." Icon={CodeXml}>
        Components follow the repo&rsquo;s own system. Loading, empty, error and success are built before anything is called done.
      </Title>
      <motion.div className="film-card film-ui" {...cardIn}>
        <div className="film-ui-bar"><i /><i /><i /></div>
        <motion.div className="film-ui-hero" animate={{ scaleX: Math.min(1, p * 2.2) }} transition={{ duration: 0.3 }} />
        <div className="film-ui-row">
          {[0.3, 0.4, 0.5].map((t) => <motion.span key={t} animate={{ opacity: p > t ? 1 : 0.15, y: p > t ? 0 : 10 }} transition={{ duration: 0.35 }} />)}
        </div>
        <div className="film-states">{states.map((s, i) => <span key={s} className={`film-state${i === on ? ' on' : ''}`}>{s}</span>)}</div>
        <Line show={p > 0.62}><span className="ok">✔</span> keyboard-only walkthrough</Line>
        <Line show={p > 0.74}><span className="ok">✔</span> prefers-reduced-motion honoured</Line>
        <Line show={p > 0.86}><span className="ok">✔</span> 320px → 1440px, long content</Line>
      </motion.div>
    </>
  );
}

function Testing({ p }: { p: number }) {
  const shown = Math.floor(p * (TESTS.length + 2));
  return (
    <>
      <Title kicker="@dip-quality · npm test" title="Prove it with the suite, not a screenshot." Icon={FlaskConical}>
        Every acceptance criterion gets a test or an honest UNVERIFIED. What cannot run here is named, not hidden.
      </Title>
      <motion.div className="film-card" {...cardIn}>
        <div className="film-line"><span className="acc">$</span> node --test test/tooling.test.mjs test/orchestration.test.mjs</div>
        {TESTS.map((t, i) => <Line key={t} show={shown > i}><span className="ok">✔</span> {t}</Line>)}
        <Line show={p > 0.82}><span className="dim">ℹ</span> <b>{Math.round(Math.min(1, (p - 0.8) * 6) * 54)}</b> pass</Line>
        <Line show={p > 0.9}><span className="warn">ℹ</span> <span className="dim">4 need the bundled upstream snapshots → UNVERIFIED here</span></Line>
      </motion.div>
    </>
  );
}

function Security({ p }: { p: number }) {
  const clean = p > 0.62;
  return (
    <>
      <Title kicker="@dip · /dip:security · /dip:pentest" title={clean ? 'Found, fixed, re-run: clean.' : 'Attack it before anyone else does.'} Icon={clean ? BadgeCheck : Bug}>
        Secrets, dependencies and risky code paths are gated; pentests only run against targets you authorized. Example project shown.
      </Title>
      <motion.div className="film-card" {...cardIn}>
        <div className="film-line"><span className="acc">$</span> dip gates --root . --fail-on high</div>
        <Line show={p > 0.12}><span className="bad">✖ HIGH</span> secret · src/config.ts:12 · sk_live_••••4f2a</Line>
        <Line show={p > 0.22}><span className="bad">✖ MED</span> dependency · lodash@4.17.20</Line>
        <Line show={p > 0.4}><span className="acc">→</span> key moved to env + rotated · lodash 4.17.21</Line>
        <Line show={p > 0.52}><span className="acc">$</span> dip gates --root . --fail-on high</Line>
        <Line show={clean}><span className="ok">✔</span> 0 findings at or above high</Line>
        <Line show={p > 0.74}><span className="acc">$</span> dip strix --app-url http://127.0.0.1:3000</Line>
        <Line show={p > 0.84}><span className="ok">✔</span> loopback target · authorization recorded</Line>
        <Line show={p > 0.92}><span className="dim">evidence → .biswodip/evidence/security-gates-…/report.md</span></Line>
      </motion.div>
    </>
  );
}

function DevOps({ p }: { p: number }) {
  const step = p * (CI.length + 1);
  return (
    <>
      <Title kicker="CI · ubuntu · macos · windows" title="Same checks, every push, three OSes." Icon={ServerCog}>
        The workflow re-runs the package check, the tests, a real install and the security gates — then the release gate decides.
      </Title>
      <motion.div className="film-pipe" {...cardIn}>
        {CI.map((c, i) => {
          const state = step > i + 1 ? 'done' : step > i ? 'run' : '';
          return (
            <motion.div key={c} className={`film-node ${state}`} animate={{ opacity: step > i - 0.5 ? 1 : 0.35, x: state === 'run' ? 6 : 0 }} transition={{ duration: 0.3 }}>
              <span className="dot" />{c}<small>{state === 'done' ? 'passed' : state === 'run' ? 'running' : 'queued'}</small>
            </motion.div>
          );
        })}
      </motion.div>
    </>
  );
}

function Bar({ t, i }: { t: MotionValue<number>; i: number }) {
  const scaleX = useTransform(t, (v) => Math.max(0, Math.min(1, v - i)));
  return <span className="film-bar"><motion.span style={{ scaleX }} /></span>;
}

export default function PipelineFilm() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.45 });
  const t = useMotionValue(0);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const run = useRef<ReturnType<typeof animate> | null>(null);

  // The scene re-renders at 25 steps per chapter; the chapter bars read the motion value directly, every frame.
  useMotionValueEvent(t, 'change', (v) => setFrame(Math.round(v * 25) / 25));

  const play = () => {
    run.current?.stop();
    if (t.get() >= TOTAL - 0.001) t.set(0);
    const from = t.get();
    setPlaying(true);
    run.current = animate(t, TOTAL, { duration: (TOTAL - from) * SECONDS_PER_CHAPTER, ease: 'linear', onComplete: () => setPlaying(false) });
  };
  const pause = () => { run.current?.stop(); setPlaying(false); };
  const seek = (v: number) => { const wasPlaying = playing; pause(); t.set(v); if (wasPlaying) play(); };

  // Autoplay when it scrolls into view (unless the viewer paused it); stop when it leaves. Reduced motion: no autoplay.
  useEffect(() => {
    if (reduce) return;
    if (inView && !userPaused && t.get() < TOTAL - 0.001) play();
    if (!inView) pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce]);
  useEffect(() => () => run.current?.stop(), []);

  const ch = Math.min(TOTAL - 1, Math.floor(frame));
  const p = frame >= TOTAL ? 1 : frame - ch;
  const Scene = [Frontend, Testing, Security, DevOps][ch];
  const done = frame >= TOTAL - 0.02;
  const secs = Math.round(frame * SECONDS_PER_CHAPTER);

  return (
    <section id="film" className="band" aria-labelledby="film-title">
      <div className="wrap">
        <SectionHead eyebrow="What /dip does to one change" title="Frontend → testing → security → devops, in one take." id="film-title">
          Twenty-six seconds, four chapters, the commands and checks the system actually runs. Press play, scrub, or jump to a chapter.
        </SectionHead>

        <div className="film" ref={ref}>
          <div className="film-screen" role="region" aria-label={`Pipeline film, chapter ${ch + 1} of 4: ${CHAPTERS[ch].label}`}>
            <div className="film-chapters">
              {CHAPTERS.map((c, i) => (
                <button key={c.key} className="film-chapter" aria-current={i === ch ? 'true' : undefined} onClick={() => seek(i + 0.001)}>
                  <Bar t={t} i={i} />
                  <span><c.Icon size={12} /> {c.label}</span>
                </button>
              ))}
            </div>
            <div className="film-scene" style={{ perspective: 1000 }}>
              <AnimatePresence mode="wait">
                <Scene key={ch} p={p} />
              </AnimatePresence>
            </div>
            <AnimatePresence>
              {ch === 3 && p > 0.93 ? (
                <motion.span className="stamp film-stamp" initial={{ opacity: 0, scale: 1.8, rotate: -14 }} animate={{ opacity: 1, scale: 1, rotate: -4 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 520, damping: 20 }}>
                  RELEASE READY
                </motion.span>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="film-controls">
            <button className="btn film-play" onClick={() => { if (playing) { pause(); setUserPaused(true); } else { setUserPaused(false); play(); } }} aria-label={playing ? 'Pause' : done ? 'Replay' : 'Play'}>
              {playing ? <Pause size={20} /> : done ? <RotateCcw size={20} /> : <Play size={20} />}
            </button>
            <label className="sr-only" htmlFor="film-scrub">Position in the film</label>
            <input id="film-scrub" className="film-scrub" type="range" min={0} max={TOTAL * 100} step={1} value={Math.round(frame * 100)} onChange={(e) => seek(Number(e.target.value) / 100)} />
            <span className="film-time">0:{String(secs).padStart(2, '0')} / 0:{Math.round(TOTAL * SECONDS_PER_CHAPTER)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
