// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Biswodip Goj
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Copy } from 'lucide-react';
import { GithubMark } from './icons';
import HeroTerminal from './HeroTerminal';
import { DepthStage, VerbRotator } from './fx';
import { GITHUB, RAW } from './links';

const TABS = [
  { id: 'bash', label: 'macOS / Linux', cmd: `curl -fsSL ${RAW}/install.sh | bash` },
  { id: 'ps', label: 'Windows', cmd: `irm ${RAW}/install.ps1 | iex` },
  { id: 'npx', label: 'npx', cmd: 'npx --yes github:Biswadipgoj/BISWODIP-ENGINEERING-skills dip install --root .' },
  { id: 'skills', label: 'Skills only', cmd: 'npx skills add Biswadipgoj/BISWODIP-ENGINEERING-skills' },
] as const;

function CopyCommand() {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('bash');
  const [copied, setCopied] = useState(false);
  const cmd = TABS.find((t) => t.id === tab)!.cmd;

  const copy = async () => {
    try { await navigator.clipboard.writeText(cmd); setCopied(true); window.setTimeout(() => setCopied(false), 1600); }
    catch { setCopied(false); }
  };

  return (
    <div className="install">
      <div className="install-tabs" role="tablist" aria-label="Install method">
        {TABS.map((t) => (
          <button key={t.id} role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id} aria-controls="install-panel" className="install-tab" onClick={() => setTab(t.id)}>
            {t.label}
            {tab === t.id ? <motion.span layoutId="tab-underline" className="install-tab-line" /> : null}
          </button>
        ))}
      </div>
      <div className="install-cmd" role="tabpanel" id="install-panel" aria-labelledby={`tab-${tab}`}>
        <code>{cmd}</code>
        <button className="btn install-copy" onClick={copy}>{copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}{copied ? 'Copied' : 'Copy'}</button>
        <span className="sr-only" aria-live="polite">{copied ? 'Command copied' : ''}</span>
      </div>
      <p className="install-note muted">
        {tab === 'skills'
          ? 'Skills only — no /dip command or agents. Use one of the other tabs for the full setup.'
          : 'Installs 8 skills, /dip, 8 agents, and clones the 5 upstream projects at pinned commits. Nothing is added to your package.json.'}
      </p>
    </div>
  );
}

export default function InstallHero() {
  return (
    <section id="install" className="hero">
      <div className="wrap hero-grid">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="hero-copy">
          <p className="eyebrow">Claude Code · skills · /dip</p>
          <h1>Your agent says it’s done.<br />Make it <VerbRotator words={['prove', 'test', 'attack', 'fix', 'ship']} /> it.</h1>
          <p className="lede">
            Eight skills, a <code>/dip</code> command and specialist agents that plan the work, build it, attack it,
            and hold the release until every claim has a command, a result and an artifact behind it.
          </p>
          <CopyCommand />
          <div className="hero-links">
            <a className="btn" href="#plan">Try the planner <ArrowRight size={18} aria-hidden /></a>
            <a className="btn btn--ghost" href={GITHUB}><GithubMark /> Source on GitHub</a>
          </div>
        </motion.div>
        <motion.div className="hero-live" initial={{ opacity: 0, y: 30, rotate: 1.5 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}>
          <DepthStage max={9}>
            {/* the two files /dip writes, stacked behind the terminal in real depth */}
            <div className="depth-sheet depth-sheet--json" aria-hidden><b>.biswodip/plan.json</b><code>{`{ "skills": [ … ],
  "entries": [ … ],
  "waves": 4 }`}</code></div>
            <div className="depth-sheet depth-sheet--md" aria-hidden><b>.biswodip/PLAN.md</b><span>Skills to load</span><span>Stack picked — only what this goal needs</span><span>Waves · Installs · LLM gateway</span></div>
            <div className="depth-front"><HeroTerminal /></div>
          </DepthStage>
        </motion.div>
      </div>
    </section>
  );
}
