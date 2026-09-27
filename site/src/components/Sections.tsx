// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Biswodip Goj
'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import repo from '@/data/repo.json';
import planner from '@/data/planner-catalog.json';
import { CAPABILITIES, CAPABILITY_COLOR, CAPABILITY_LABEL, CAPABILITY_SECTIONS, CAPABILITY_TOTAL, type CapabilitySection } from '@/data/capabilities';
import { GITHUB, blob } from './links';
import { Counter, Marquee, SectionHead, Tilt } from './fx';
import { OwnerAvatar, GithubMark } from './icons';
import { Bot, Boxes, GitBranch, Layers, Route, Search, Terminal } from 'lucide-react';
import { RAW } from './links';

const NAV = [
  ['install', 'Install'], ['how', 'How it works'], ['plan', 'Planner'], ['lifecycle', 'Lifecycle'], ['gate', 'Release gate'], ['upstreams', 'Upstreams'], ['catalog', 'Catalog'], ['commands', 'Commands'],
] as const;

export function Header() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 });
  const [current, setCurrent] = useState<string>('install');

  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setCurrent(e.target.id); }), { rootMargin: '-40% 0px -55% 0px' });
    NAV.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  return (
    <header className="top">
      <a className="skip" href="#main">Skip to content</a>
      <div className="wrap top-inner">
        <a href="#install" className="brand"><span className="brand-mark">dip</span><span className="brand-name">Biswodip Goj Unified Engineering</span></a>
        <nav className="nav" aria-label="Sections">
          {NAV.map(([id, label]) => <a key={id} href={`#${id}`} aria-current={current === id ? 'true' : undefined}>{label}</a>)}
        </nav>
        <a className="btn btn--ghost top-gh" href={GITHUB}><GithubMark size={16} /> GitHub</a>
      </div>
      <div className="meter" aria-hidden><motion.span style={{ scaleX }} /></div>
    </header>
  );
}

/** Fades a block in the first time it scrolls into view. Reduced motion is honoured through MotionConfig. */
export function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

export function Upstreams() {
  return (
    <section id="upstreams" className="band" aria-labelledby="up-title">
      <div className="wrap">
        <SectionHead eyebrow="integrations/manifest.json" title="Five upstream projects, pinned to reviewed commits." id="up-title">
          Their skills run inside your agent, so the installer checks out the exact commits recorded here and verifies the remote, the expected files and the licence. <code>--latest</code> takes upstream HEAD instead.
        </SectionHead>
        <ul className="folders">
          {repo.upstreams.map((u, i) => (
            <motion.li key={u.id} className="folder" initial={{ opacity: 0, rotateX: 80, y: 40 }} whileInView={{ opacity: 1, rotateX: 0, y: 0 }} whileHover={{ y: -10, rotateZ: i % 2 ? 1.5 : -1.5 }} viewport={{ once: true, amount: 0.3 }} transition={{ delay: i * 0.1, type: 'spring', stiffness: 140, damping: 16 }}>
              <span className="folder-tab mono">{u.id}</span>
              <div className="folder-body panel">
                <div className="folder-head"><OwnerAvatar repo={u.repo} size={40} /><h3>{u.name}</h3></div>
                <dl>
                  <dt>pinned</dt><dd className="mono">{(u.commit || '—').slice(0, 12)}</dd>
                  {u.version ? <><dt>version</dt><dd className="mono">{u.version}</dd></> : null}
                  <dt>skills</dt><dd className="mono">{u.skills || 'CLI only'}</dd>
                  <dt>licence</dt><dd><span className="tag s-verified">{u.license}</span></dd>
                </dl>
                <a href={u.repo}>{u.repo.replace('https://github.com/', '')}</a>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const GROUP: Record<string, string | undefined> = Object.fromEntries(planner.entries.map((e) => [e.id, (e as { group?: string }).group]));

export function Catalog() {
  const [section, setSection] = useState<CapabilitySection | 'all'>('all');
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(24);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const hits = CAPABILITIES.filter((c) => (section === 'all' || c.section === section) && (!s || `${c.name} ${c.desc} ${c.id}`.toLowerCase().includes(s)));
    return section === 'all' ? [...hits].sort((a, b) => (b.stars || 0) - (a.stars || 0)) : hits;
  }, [section, q]);
  // render in batches: 599 animated cards at once would stutter
  const shown = list.slice(0, q ? 96 : limit);

  return (
    <section id="catalog" className="band band--alt" aria-labelledby="cat-title">
      <div className="wrap">
        <SectionHead eyebrow={'integrations/catalog.json · ' + CAPABILITY_TOTAL + ' entries'} title="A catalog the planner picks from — a few at a time." id="cat-title">
          Every GitHub project with 20,000+ stars in design, design feedback, planning, security, penetration testing, testing, DevOps and agent skills — plus the hand-picked tools the planner reaches for. A plan still takes only what your goal needs: one CSS framework, one animation library, and a big project only when you name it.
        </SectionHead>
        <div className="cat-controls">
          <div className="examples" role="group" aria-label="Filter by area">
            <button className="chip" aria-pressed={section === 'all'} onClick={() => setSection('all')}>All</button>
            {CAPABILITY_SECTIONS.map((s) => (
              <button key={s} className="chip" aria-pressed={section === s} onClick={() => setSection(s)}>
                <i className="dot" style={{ background: CAPABILITY_COLOR[s] }} aria-hidden />{CAPABILITY_LABEL[s]}
              </button>
            ))}
          </div>
          <label className="sr-only" htmlFor="cat-q">Search the catalog</label>
          <input id="cat-q" type="search" className="input cat-q" placeholder="Search: auth, animation, scrape…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <p className="muted cat-count" aria-live="polite">{list.length} {list.length === 1 ? 'entry' : 'entries'}</p>
        <motion.ul layout className="cat-grid">
          <AnimatePresence initial={false} mode="popLayout">
            {shown.map((c) => (
              <motion.li key={c.id} layout initial={{ opacity: 0, rotateY: -70, z: -80 }} animate={{ opacity: 1, rotateY: 0, z: 0 }} exit={{ opacity: 0, rotateY: 70 }} whileHover={{ y: -6, rotateX: 6 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }} className="cap panel">
                <div className="cap-head">
                  <OwnerAvatar repo={c.repo} size={28} />
                  <a href={c.repo} className="cap-name">{c.name}</a>
                  {c.stars ? <span className="muted mono cap-stars">★ {c.stars >= 1000 ? `${(c.stars / 1000).toFixed(1)}k` : c.stars}</span> : null}
                </div>
                <p className="cap-desc">{c.desc}</p>
                <div className="cap-tags">
                  <span className="tag" style={{ color: CAPABILITY_COLOR[c.section] }}>{CAPABILITY_LABEL[c.section]}</span>
                  {GROUP[c.id] ? <span className="tag">one of: {GROUP[c.id]!.replace(/-/g, ' ')}</span> : null}
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
        {list.length > shown.length ? (
          <button className="btn btn--ghost cat-more" onClick={() => setLimit((n) => n + 48)}>{q ? `Showing the top ${shown.length} — refine the search` : `Show 48 more · ${list.length - shown.length} left`}</button>
        ) : null}
      </div>
    </section>
  );
}

export function Commands() {
  return (
    <section id="commands" className="band" aria-labelledby="cmd-title">
      <div className="wrap">
        <SectionHead eyebrow="templates/claude" title="What you type in Claude Code." id="cmd-title" />
        <div className="grid grid-2">
          <Tilt className="panel cmd-list" max={4}>
            <h3 className="plan-h"><Terminal size={18} aria-hidden /> Commands</h3>
            <dl>{repo.commands.map((c, i) => <motion.div key={c.name} initial={{ opacity: 0, rotateX: -60, y: 16 }} whileInView={{ opacity: 1, rotateX: 0, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}><dt className="mono">{c.name}</dt><dd>{c.description}</dd></motion.div>)}</dl>
          </Tilt>
          <Tilt className="panel cmd-list" max={4}>
            <h3 className="plan-h"><Bot size={18} aria-hidden /> Agents</h3>
            <dl>{repo.agents.map((a, i) => <motion.div key={a.name} initial={{ opacity: 0, rotateX: -60, y: 16 }} whileInView={{ opacity: 1, rotateX: 0, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}><dt className="mono">{a.name}</dt><dd>{a.description.split('. ')[0].replace(/\.$/, '')}.</dd></motion.div>)}</dl>
          </Tilt>
        </div>
        <p className="muted cmd-foot">Keys for tools that need a model are saved once with <code>/dip-setapi</code>, outside the repository, and passed to tools through <code>dip exec</code> — never printed, never committed.</p>
      </div>
    </section>
  );
}

/** The lifecycle in six verbs, sliding past between sections. */
export function LifecycleRibbon() {
  const verbs = ['plan', 'build', 'test', 'attack', 'fix', 'release'];
  const row = verbs.map((v, i) => <span key={v} className={i % 2 ? 'ribbon-word ribbon-word--cool' : 'ribbon-word'}>{v}<i aria-hidden>→</i></span>);
  return (
    <div className="ribbon" aria-label="plan, build, test, attack, fix, release">
      <Marquee seconds={36}>{row}</Marquee>
    </div>
  );
}

/** Real numbers from the repo, counted up as they arrive. */
export function Stats() {
  const items = [
    { n: 8, l: 'installable skills', I: Layers },
    { n: repo.commands.length + repo.agents.length, l: 'commands & agents', I: Terminal },
    { n: repo.lifecycle.length, l: 'lifecycle phases', I: Route },
    { n: CAPABILITY_TOTAL, l: 'catalog entries', I: Boxes },
    { n: repo.upstreams.length, l: 'pinned upstreams', I: GitBranch },
  ];
  return (
    <div className="wrap">
      <ul className="stats" role="list">
        {items.map(({ n, l, I }, i) => (
          <motion.li key={l} className="stat panel" initial={{ opacity: 0, y: 30, rotateX: -40 }} whileInView={{ opacity: 1, y: 0, rotateX: 0 }} whileHover={{ y: -6, rotate: i % 2 ? 1 : -1 }} viewport={{ once: true }} transition={{ delay: i * 0.08, type: 'spring', stiffness: 200, damping: 18 }}>
            <Counter to={n} className="stat-n grad-text" />
            <span className="stat-l"><I size={16} aria-hidden /> {l}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/** The actual people and organisations behind the catalog, as a moving ribbon of their GitHub avatars. */
export function Owners() {
  const seen = new Set<string>();
  const owners = CAPABILITIES.filter((c) => { const o = c.repo.split('/')[3]; if (!o || seen.has(o)) return false; seen.add(o); return true; });
  const half = Math.ceil(owners.length / 2);
  const row = (list: typeof owners) => list.map((c) => (
    <a key={c.id} className="pill" href={c.repo}><OwnerAvatar repo={c.repo} size={28} />{c.name}</a>
  ));
  return (
    <div className="owners" aria-label="Projects in the catalog">
      <Marquee seconds={70}>{row(owners.slice(0, half))}</Marquee>
      <Marquee seconds={80} reverse>{row(owners.slice(half))}</Marquee>
    </div>
  );
}

export function Cta() {
  return (
    <section className="cta band" aria-labelledby="cta-title">
      <div className="wrap">
        <motion.h2 id="cta-title" initial={{ opacity: 0, scale: 0.9, rotateX: -30 }} whileInView={{ opacity: 1, scale: 1, rotateX: 0 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 140, damping: 16 }}>
          Stop taking <span className="grad-text">&ldquo;it works&rdquo;</span> for an answer.
        </motion.h2>
        <div className="field">
          <a className="btn" href="#install"><Terminal size={18} aria-hidden /> Install in one line</a>
          <a className="btn btn--ghost" href={`${RAW}/install.sh`}><Search size={18} aria-hidden /> Read the installer first</a>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap foot-inner">
        <span>v{repo.version} · {repo.license} · © 2026 Biswodip Goj</span>
        <span className="foot-links">
          <a href={GITHUB}>GitHub</a>
          <a href={blob('THIRD-PARTY-NOTICES.md')}>Third-party notices</a>
          <a href={blob('SECURITY.md')}>Security policy</a>
        </span>
      </div>
    </footer>
  );
}
