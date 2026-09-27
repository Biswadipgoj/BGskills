// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Biswodip Goj
// The hero's live terminal: types a goal, then streams the plan the real /dip planner returns for it.
// Cycles through examples until you type your own. Pauses off-screen; reduced motion shows one finished plan.
'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import catalog from '@/data/planner-catalog.json';
import { planCore } from '@/data/plan-core.mjs';

const EXAMPLES = [
  'booking website with login and payments',
  'android app for a gym with login',
  'security review and pentest before launch',
  'landing page for a coffee shop with scroll animations',
  'scrape competitor prices every night',
];
const EMPTY_REPO = { deps: new Set<string>(), langs: [] as string[] };

type Tone = 'dim' | 'acc' | 'ok' | 'warm' | undefined;
interface Out { t: string; c?: Tone }
interface Picked { entry: { name: string }; owner: string }
interface PlanLike { skills: string[]; chosen: Picked[]; waves: { wave: number; name: string; agents: { agent: string }[] }[]; notes: string[]; vague: boolean }

function planLines(goal: string): Out[] {
  const p = planCore({ catalog, goal, scan: EMPTY_REPO }) as unknown as PlanLike;
  const lines: Out[] = [{ t: '› planning against the catalog…', c: 'dim' }];
  if (p.vague) lines.push({ t: '! open goal → offering 3 options first', c: 'warm' });
  lines.push({ t: `skills   ${p.skills.map((s) => s.replace('biswodip-', '')).join(' · ')}` });
  if (p.chosen.length) p.chosen.slice(0, 4).forEach((s, i) => lines.push({ t: `${i ? '         ' : 'stack    '}${s.entry.name}  → @${s.owner}`, c: 'acc' }));
  else lines.push({ t: 'stack    nothing extra — the phase skills cover it', c: 'dim' });
  if (p.notes[0]) lines.push({ t: `skipped  ${p.notes[0].replace(/ skipped — .*/, '')} (one per job)`, c: 'dim' });
  for (const w of p.waves) lines.push({ t: `wave ${w.wave}   ${w.name.padEnd(7)} ${w.agents.map((a) => (a.agent === 'main' ? 'you' : '@' + a.agent)).join('  ')}` });
  lines.push({ t: '✔ written .biswodip/PLAN.md', c: 'ok' });
  return lines;
}

export default function HeroTerminal() {
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const inView = useInView(box, { amount: 0.3 });
  const [typed, setTyped] = useState('');
  const [out, setOut] = useState<Out[]>([]);
  const [mine, setMine] = useState<string | null>(null);   // the visitor's own goal, once they type one
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(false);
  const run = useRef(0);

  // Autoplay: type an example, stream its plan, hold, next. Restarts cleanly whenever it is interrupted.
  useEffect(() => {
    if (!inView || editing) return;
    const id = ++run.current;
    const alive = () => run.current === id;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      let i = 0;
      while (alive()) {
        const goal = mine ?? EXAMPLES[i % EXAMPLES.length];
        const lines = planLines(goal);
        if (reduce) { setTyped(goal); setOut(lines); return; }
        setOut([]);
        for (let k = 0; k <= goal.length && alive(); k++) { setTyped(goal.slice(0, k)); await wait(32); }
        await wait(260);
        for (let k = 1; k <= lines.length && alive(); k++) { setOut(lines.slice(0, k)); await wait(k === 1 ? 420 : 150); }
        await wait(mine ? 60000 : 2600);
        i++;
      }
    })();
    return () => { run.current++; };
  }, [inView, editing, mine, reduce]);

  const submit = () => { const g = draft.trim(); setEditing(false); if (g) setMine(g); };

  return (
    <div className="term hero-term" ref={box}>
      <div className="term-bar" aria-hidden><i /><i /><i /><span>claude code — ~/code/my-app</span></div>
      <div className="term-body" aria-live="polite">
        {editing ? (
          <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="term-form">
            <span className="acc">&gt; /dip </span>
            <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={submit} maxLength={120} placeholder="type your goal and press Enter" aria-label="Your goal for /dip" spellCheck={false} />
          </form>
        ) : (
          <button className="term-goal" onClick={() => { setDraft(''); setEditing(true); }} title="Type your own goal">
            <span className="acc">&gt; /dip </span>{typed}<span className="caret" />
          </button>
        )}
        {out.map((l, i) => <div key={i} className={`term-line ${l.c ?? ''}`}>{l.t}</div>)}
      </div>
      <p className="term-hint">{mine ? 'Your goal, planned by the same code /dip runs.' : 'Live: the real planner. Click the prompt to try your own goal.'}</p>
    </div>
  );
}
