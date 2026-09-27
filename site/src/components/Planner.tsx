// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Biswodip Goj
'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import catalog from '@/data/planner-catalog.json';
import { planCore, whyOf } from '@/data/plan-core.mjs';
import { SectionHead, Tilt } from './fx';

// The browser has no repository to read, so the plan is made as if for an empty one — in a real
// project `/dip` also reads package.json / requirements.txt and keeps what is already in use.
const EMPTY_REPO = { deps: new Set<string>(), langs: [] as string[] };

const EXAMPLES = [
  'restaurant booking website with login',
  'android app for a gym with login and animations',
  'landing page for a coffee shop with scroll animations and icons',
  'scrape competitor prices and automate the browser',
  'security review and pentest before launch',
  'web app with login, database and search',
];

interface Scored { entry: { id: string; name: string; kind: string; docs?: string; repo: string; use: string; group?: string }; owner: string; keywords: string[]; deps: string[]; files: string[] }
interface WaveAgent { agent: string; task: string; picked: Scored[] }
interface Wave { wave: number; name: string; parallel: boolean; agents: WaveAgent[] }
interface Plan { platform: { mobile: boolean; web: boolean }; notes: string[]; vague: boolean; chosen: Scored[]; waves: Wave[]; skills: string[]; externalSkills: string[] }

const AGENT_NOTE: Record<string, string> = { ...(catalog.agents as Record<string, string>), dip: 'Security review of the combined diff.', main: 'You: merge the reports, fix, run the release gate.' };

export default function Planner() {
  const [goal, setGoal] = useState(EXAMPLES[0]);
  const deferred = useDeferredValue(goal);
  const plan = useMemo(() => planCore({ catalog, goal: deferred, scan: EMPTY_REPO }) as unknown as Plan, [deferred]);
  const cli = `/dip ${deferred.trim() || '(no goal: repository forensics)'}`;

  return (
    <section id="plan" className="band band--alt" aria-labelledby="plan-title">
      <div className="wrap">
        <SectionHead eyebrow="Step 3 of /dip — the planner" title="Type a goal. Get the plan /dip would write." id="plan-title">
          This box runs the same planner file the command runs. It picks only what the goal needs — one CSS framework,
          one animation library, no mobile agent for a website — and says why.
        </SectionHead>

        <form className="field" onSubmit={(e) => e.preventDefault()} role="search">
          <label htmlFor="goal" className="sr-only">Goal</label>
          <input id="goal" className="input" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g. booking website with login and payments" autoComplete="off" spellCheck={false} maxLength={200} />
        </form>
        <div className="examples" aria-label="Example goals">
          {EXAMPLES.map((g) => (
            <button key={g} type="button" className="chip" aria-pressed={goal === g} onClick={() => setGoal(g)}>{g}</button>
          ))}
        </div>

        <div className="plan-grid">
          <Tilt className="panel plan-doc" max={4} lift={10}>
            <div className="plan-doc-head">
              <span className="mono">.biswodip/PLAN.md</span>
              <span className="plan-platform">
                {plan.platform.web ? <span className="tag s-open">web</span> : null}
                {plan.platform.mobile ? <span className="tag s-verified">mobile</span> : null}
              </span>
            </div>

            {plan.vague ? (
              <p className="plan-vague"><span className="stamp s-unverified">Open goal</span> /dip offers three concrete options and waits for your pick before building.</p>
            ) : null}

            <h3 className="plan-h">Skills to load</h3>
            <ul className="plan-skills">
              <AnimatePresence initial={false}>
                {[...plan.skills, ...plan.externalSkills].map((s) => (
                  <motion.li key={s} layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="mono">{s}</motion.li>
                ))}
              </AnimatePresence>
            </ul>

            <h3 className="plan-h">Stack picked <span className="muted">— only what this goal needs</span></h3>
            {plan.chosen.length ? (
              <ul className="plan-stack">
                <AnimatePresence initial={false} mode="popLayout">
                  {plan.chosen.map((s) => (
                    <motion.li key={s.entry.id} layout initial={{ opacity: 0, rotateX: -80, y: 10 }} animate={{ opacity: 1, rotateX: 0, y: 0 }} exit={{ opacity: 0, rotateX: 80 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }} style={{ transformOrigin: '50% 0%' }}>
                      <a href={s.entry.docs || s.entry.repo} className="plan-stack-name">{s.entry.name}</a>
                      <span className="tag">{s.entry.kind}</span>
                      <span className="muted plan-why">{whyOf(s)} → @{s.owner}</span>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            ) : (
              <p className="muted">No catalog entry needed — the phase skills cover this goal.</p>
            )}

            {plan.notes.length ? (
              <>
                <h3 className="plan-h">Left out, on purpose</h3>
                <ul className="plan-notes">
                  {plan.notes.map((n) => <li key={n}>{n}</li>)}
                </ul>
              </>
            ) : null}
          </Tilt>

          <LayoutGroup>
            <ol className="waves" aria-label="Waves of subagents">
              {plan.waves.map((w) => (
                <motion.li key={w.name} layout className="wave" initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: w.wave * 0.12, type: 'spring', stiffness: 200, damping: 22 }}>
                  <div className="wave-label">
                    <span className="wave-n mono">{w.wave}</span>
                    <span>{w.name}</span>
                    {w.parallel ? <span className="tag">parallel</span> : null}
                  </div>
                  <ul className="wave-agents">
                    <AnimatePresence initial={false} mode="popLayout">
                      {w.agents.map((a) => (
                        <motion.li key={a.agent} layout initial={{ opacity: 0, rotateY: -90, x: -20 }} animate={{ opacity: 1, rotateY: 0, x: 0 }} exit={{ opacity: 0, rotateY: 90 }} whileHover={{ y: -4, rotateZ: -1 }} transition={{ type: 'spring', stiffness: 320, damping: 22 }} className="agent">
                          <span className="agent-name mono">{a.agent === 'main' ? 'you (main)' : `@${a.agent}`}</span>
                          <span className="agent-task">{AGENT_NOTE[a.agent] || a.task}</span>
                          {a.picked.length ? <span className="agent-uses mono">uses {a.picked.map((p) => p.entry.id).join(', ')}</span> : null}
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                </motion.li>
              ))}
            </ol>
          </LayoutGroup>
        </div>

        <p className="plan-cli">
          <span className="muted">In Claude Code:</span> <code>{cli}</code>
          <span className="muted"> — in a real project it also reads your dependencies and keeps what you already use.</span>
        </p>
      </div>
    </section>
  );
}
