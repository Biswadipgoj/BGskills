// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Biswodip Goj
'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { blob } from './links';
import { SectionHead, Tilt } from './fx';

// Weights, caps, bands and the four statuses, as written in skills-src/biswodip-release-gate.md.
const CATEGORIES = [
  ['Security', 25], ['Correctness / business integrity', 20], ['Reliability / failure handling', 15], ['Test / evidence quality', 15],
  ['Architecture / maintainability', 10], ['Performance', 5], ['Accessibility / responsive UX', 5], ['Design / interaction', 5],
] as const;
const CAPS = [
  ['Unresolved Critical', 49], ['Unresolved High in an exposed path', 69], ['Authorization bypass', 49], ['Exposed production secret', 49],
  ['Unsafe financial state transition', 49], ['Fabricated or missing critical evidence', 59],
] as const;

type Status = 'RELEASE READY' | 'RELEASE READY WITH DOCUMENTED ACCEPTED RISKS' | 'NOT RELEASE READY' | 'BLOCKED — INSUFFICIENT EVIDENCE';
const TONE: Record<Status, string> = {
  'RELEASE READY': 's-verified', 'RELEASE READY WITH DOCUMENTED ACCEPTED RISKS': 's-open',
  'NOT RELEASE READY': 's-blocked', 'BLOCKED — INSUFFICIENT EVIDENCE': 's-unverified',
};

export default function ReleaseGate() {
  const reduce = useReducedMotion();
  const [scores, setScores] = useState<number[]>(CATEGORIES.map(() => 8));
  const [missing, setMissing] = useState<boolean[]>(CATEGORIES.map(() => false));
  const [caps, setCaps] = useState<boolean[]>(CAPS.map(() => false));
  const [accepted, setAccepted] = useState(false);

  const r = useMemo(() => {
    const raw = CATEGORIES.reduce((sum, [, w], i) => sum + (missing[i] ? 0 : (w * scores[i]) / 10), 0);
    const cap = CAPS.reduce<number>((m, [, c], i) => (caps[i] ? Math.min(m, c) : m), 100);
    const score = Math.round(Math.min(raw, cap));
    const band = score >= 90 ? 'Gate may pass: no blocker and all mandatory evidence.' : score >= 80 ? 'Strong — gates still required.' : score >= 70 ? 'Substantial work remains.' : 'Blocked.';
    let status: Status;
    if (missing.some(Boolean)) status = 'BLOCKED — INSUFFICIENT EVIDENCE';
    else if (cap < 100 || score < 90) status = 'NOT RELEASE READY';
    else status = accepted ? 'RELEASE READY WITH DOCUMENTED ACCEPTED RISKS' : 'RELEASE READY';
    return { raw: Math.round(raw), cap, score, band, status };
  }, [scores, missing, caps, accepted]);

  const set = <T,>(arr: T[], i: number, v: T) => arr.map((x, j) => (j === i ? v : x));

  return (
    <section id="gate" className="band band--alt" aria-labelledby="gate-title">
      <div className="wrap">
        <SectionHead eyebrow="Phases 12–13 · biswodip-release-gate" title="The score is a measurement, not a mood." id="gate-title">
          Move the evidence and watch the verdict. A category with no evidence scores 0, and one open Critical caps everything at 49 — no matter how good the rest looks.
        </SectionHead>

        <div className="gate-grid">
          <div className="panel gate-inputs">
            <h3 className="plan-h">Evidence per category <span className="muted">(0–10 × weight)</span></h3>
            <ul className="cats">
              {CATEGORIES.map(([name, w], i) => (
                <motion.li key={name} className={missing[i] ? 'cat is-missing' : 'cat'} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <label htmlFor={`cat-${i}`} className="cat-name">{name} <span className="muted mono">×{w}</span></label>
                  <input id={`cat-${i}`} type="range" min={0} max={10} step={1} value={missing[i] ? 0 : scores[i]} disabled={missing[i]} onChange={(e) => setScores(set(scores, i, Number(e.target.value)))} aria-valuetext={`${missing[i] ? 0 : scores[i]} of 10`} />
                  <span className="cat-val mono">{missing[i] ? '—' : scores[i]}</span>
                  <label className="cat-missing"><input type="checkbox" checked={missing[i]} onChange={(e) => setMissing(set(missing, i, e.target.checked))} /> no evidence</label>
                </motion.li>
              ))}
            </ul>
            <h3 className="plan-h">Caps that override the number</h3>
            <ul className="caps">
              {CAPS.map(([name, c], i) => (
                <li key={name}>
                  <label><input type="checkbox" checked={caps[i]} onChange={(e) => setCaps(set(caps, i, e.target.checked))} /> {name} <span className="muted mono">→ max {c}</span></label>
                </li>
              ))}
              <li><label><input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} /> Remaining risk accepted in writing by the owner, with an expiry</label></li>
            </ul>
          </div>

          <Tilt className="panel gate-out" max={6}>
            <div className="gate-score">
              <motion.span key={r.score} className="gate-num mono" initial={reduce ? false : { y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>{r.score}</motion.span>
              <span className="muted mono">/ 100</span>
            </div>
            <div className="gate-meter" aria-hidden>
              <motion.span animate={{ width: `${r.score}%` }} transition={{ type: 'spring', stiffness: 200, damping: 30 }} />
              <i style={{ left: '70%' }} /><i style={{ left: '80%' }} /><i style={{ left: '90%' }} />
            </div>
            <p className="muted">{r.cap < 100 ? `Weighted ${r.raw}, capped at ${r.cap}. ` : ''}{r.band}</p>
            <div className="gate-stamp" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.span key={r.status} className={`stamp stamp--big ${TONE[r.status]}`}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.8, rotate: -14, rotateX: -60, z: 260 }}
                  animate={{ opacity: 1, scale: 1, rotate: -4, rotateX: 0, z: 0 }} exit={reduce ? { opacity: 0 } : { opacity: 0, rotateX: 70, y: 30 }}
                  transition={reduce ? { duration: 0.15 } : { type: 'spring', stiffness: 520, damping: 22 }}>
                  {r.status}
                </motion.span>
              </AnimatePresence>
            </div>
            <p className="gate-foot muted">Exactly one of four statuses. Never &ldquo;looks good&rdquo;. Rules: <a href={blob('skills/biswodip-release-gate/SKILL.md')}>biswodip-release-gate</a>.</p>
          </Tilt>
        </div>
      </div>
    </section>
  );
}
