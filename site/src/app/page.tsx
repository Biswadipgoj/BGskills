'use client';

// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Biswodip Goj
// Site for BISWODIP-ENGINEERING-skills. Every visual represents a real artifact
// in the repository — no invented scenery, per the design skill's anti-slop rule
// (references/06 §14.1: "no fake 3D, no decoration without purpose").
//
// Palette is the repository's own: assets/banner.svg uses navy #0B1220→#15243C
// with cyan #22D3EE and indigo #6366F1.

import { useRef, useState, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  CAPABILITIES,
  CAPABILITY_LABEL,
  CAPABILITY_SECTIONS,
  CAPABILITY_TOTAL,
  CAPABILITY_REQUIRED,
} from '@/data/capabilities';
import { ScrollProgress, CustomCursor } from '@/components/Cinematic';
import { ZoomSection, ScrollReveal } from '@/components/ScrollEffects';
import { GateTally, SecurityBoard, CommandLog, ReleaseGateMeter } from '@/components/RepoVisuals';

const PipelineScene3D = dynamic(() => import('@/components/PipelineScene3D'), { ssr: false });
const CapabilityGraph3D = dynamic(() => import('@/components/CapabilityGraph3D'), { ssr: false });
const LifecycleTunnel = dynamic(() => import('@/components/LifecycleTunnel'), { ssr: false });
const IntegrationCube = dynamic(() => import('@/components/IntegrationCube'), { ssr: false });

/* ── Content straight from the repository ───────────────────────────────── */

const LAWS = [
  ['Evidence or it did not happen', 'A claim needs a recorded command, result and artifact — otherwise UNVERIFIED.', 'references/02'],
  ['Load the least context', 'A router skill plus one phase file: under 4k tokens to start, not 12,900.', 'skills/biswodip-unified-engineering'],
  ['One owner per file area', 'Parallel subagents never write the same file; the planner assigns disjoint scopes.', 'lifecycle/01-plan.md'],
  ['Security is continuous', 'Threat model before code, review after, authorized attack before release.', 'security/'],
  ['Statuses, not adjectives', 'PASS · FAIL · UNVERIFIED · BLOCKED · NOT-RUN. "Should be fine" is not a status.', 'reports/EVIDENCE-MATRIX-TEMPLATE.md'],
  ['Never rewrite working code', 'Understand it, preserve the behaviour, improve it, integrate it.', 'MASTER-PROMPT.md §12'],
  ['Nothing ships on a guess', 'The release gate is 100 weighted points with hard caps for unresolved criticals.', 'lifecycle/12-score.md'],
  ['The diff is the truth', 'Review the actual change, not the summary of it.', 'lifecycle/13-release.md'],
];

const PHASES = [
  ['00', 'Bootstrap', 'Detect stack, clone and verify the five upstream integrations, write the lock file.'],
  ['01', 'Plan', 'Acceptance criteria, task split, one owner per file area.'],
  ['02', 'Inspect', 'Read the real repository: architecture, conventions, existing behaviour.'],
  ['03', 'Threat model', 'Server authority, authorization, financial controls, webhooks, data protection.'],
  ['04', 'Implement', 'Execute the plan, preserve working code, write evidence as you go.'],
  ['05', 'Verify', 'Tests, type checks, lint, browser QA against acceptance criteria.'],
  ['06', 'Design', 'States, accessibility, motion, copy — against the design skill.'],
  ['07', 'Performance', 'Bundle, runtime and context efficiency; Headroom compression.'],
  ['08', 'Security review', 'Every control in the catalogue, each with an explicit status.'],
  ['09', 'Pentest', 'Authorized attack with Strix behind a hard target guard.'],
  ['10', 'Fix', 'Root-cause each finding, add a regression test, re-run.'],
  ['11', 'Adversarial', 'Break your own work before someone else does.'],
  ['12', 'Score', 'Evidence matrix, weighted score, blockers, caps.'],
  ['13', 'Release', 'One honest status: RELEASE READY or NOT, with the report.'],
];

const GATE_DOMAINS = ['Authentication', 'Authorization', 'Payments', 'Webhooks', 'Data protection', 'File uploads', 'Rate limiting', 'Sessions', 'Secrets', 'Input validation', 'Logging', 'Dependencies'];

const INTEGRATIONS = [
  { name: 'Taste Skill', license: 'MIT', phase: 'Design', commit: '5217fb45' },
  { name: 'Emil Kowalski', license: 'MIT', phase: 'Design + motion', commit: '85e8e236' },
  { name: 'No AI Slop', license: 'MIT', phase: 'Copy · docs', commit: 'pinned' },
  { name: 'Headroom', license: 'Apache-2.0', phase: 'Context compression', commit: 'pinned' },
  { name: 'Strix', license: 'Apache-2.0', phase: 'Authorized pentest', commit: 'pinned' },
];

const LAYERS = [
  ['01', 'Entry', 'templates/claude/', 'Slash commands and the @dip agent — pointers only.'],
  ['02', 'Router skill', 'skills/biswodip-unified-engineering/', 'Laws, phase order, scoring model, routing table. ~1,365 tokens.'],
  ['03', 'Phase skills', 'skills/', 'Eight independently installable skills, one per phase group.'],
  ['04', 'Procedures', 'lifecycle/00–13', 'Entry criteria, steps, exact commands, evidence, exit gate.'],
  ['05', 'Deep dives', 'security/', 'Six topics: authority, authz, financial, webhooks, data, attacks.'],
  ['06', 'References', 'references/01–07', 'v1.2.0 verbatim plus the 2,215-gate shipping catalogue.'],
  ['07', 'Tooling', 'bin/ · scripts/lib/', 'detect · install · verify · gates · strix · handoff · skills.'],
  ['08', 'Integrations', 'integrations/ · upstream/', 'Five upstream projects, pinned commits, licences intact.'],
  ['09', 'Evidence', '.biswodip/', 'Command log, gate reports, lock file — every claim traceable.'],
];

const PROJECTS = [
  { name: 'BISWODIP-ENGINEERING-skills', desc: 'Router skill, 14 lifecycle procedures, six security deep-dives, 2,215 verification gates, nine layers.', tags: ['Skills', 'Security', 'Release gate'] },
  { name: 'Guarded pentest runner', desc: 'Strix behind a target guard: verdict in run.json, the API key never printed, a hard stop before someone else\u2019s machine.', tags: ['Pentest', 'Guardrails'] },
  { name: 'Capability registry', desc: `${CAPABILITY_TOTAL} registered capabilities across six sections, each with planner triggers and security notes; ${CAPABILITY_REQUIRED} required.`, tags: ['Registry', 'Planner'] },
];

const SECTION_COLORS: Record<string, string> = {
  browser: '#22d3ee', animation: '#6366f1', design: '#f472b6',
  backend: '#2dd4bf', security: '#22c55e', quality: '#f59e0b',
};

/* ── Page ───────────────────────────────────────────────────────────────── */

export default function Home() {
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <ScrollProgress />
      <CustomCursor />
      <div style={{ position: 'relative', zIndex: 2 }}>
        <Navbar />
        <Hero />
        <ManifestStrip />
        <Laws />
        <Lifecycle />
        <Gates />
        <SecuritySection />
        <GraphSection />
        <Registry />
        <Architecture />
        <Integrations />
        <Evidence />
        <Projects />
        <Colophon />
      </div>
    </div>
  );
}

/* ── Nav ────────────────────────────────────────────────────────────────── */

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    ['Laws', '#laws'], ['Lifecycle', '#lifecycle'], ['Gates', '#gates'],
    ['Security', '#security'], ['Registry', '#registry'], ['Architecture', '#architecture'],
  ];

  return (
    <motion.nav
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0.85rem 2rem',
        background: scrolled ? 'rgba(11, 18, 32, 0.82)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'transparent'}`,
        transition: 'background 0.35s, border-color 0.35s',
      }}
    >
      <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="#top" className="mono" style={{ fontSize: '0.78rem', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: 'linear-gradient(135deg, var(--cyan), var(--indigo))' }} />
          <span style={{ color: 'var(--text-soft)' }}>BISWODIP<span style={{ color: 'var(--dim)' }}> / </span>UNIFIED ENGINEERING</span>
        </a>

        <div className="hidden md:flex items-center" style={{ gap: '1.8rem' }}>
          {links.map(([label, href], i) => (
            <motion.a
              key={label}
              href={href}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.04 }}
              whileHover={{ color: 'var(--cyan)' }}
              style={{ fontSize: '0.75rem', color: 'var(--muted)', transition: 'color 0.25s' }}
            >
              {label}
            </motion.a>
          ))}
          <motion.a href="#registry" whileHover={{ y: -2 }} className="btn btn-primary" style={{ fontSize: '0.72rem', padding: '0.5rem 1.05rem' }}>
            {CAPABILITY_TOTAL} capabilities
          </motion.a>
        </div>

        <button
          className="md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 8, padding: '0.4rem 0.65rem', color: 'var(--cyan)', cursor: 'pointer' }}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden"
            style={{ overflow: 'hidden', marginTop: '0.75rem', borderTop: '1px solid var(--border)' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '0.6rem' }}>
              {links.map(([label, href]) => (
                <a key={label} href={href} onClick={() => setOpen(false)} style={{ padding: '0.6rem 0', fontSize: '0.85rem', color: 'var(--muted)' }}>{label}</a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

/* ── Hero: the 3D pipeline, framed like a schematic ─────────────────────── */

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '26%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section id="top" ref={ref} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '7rem 2rem 3rem', position: 'relative' }}>
      <div className="grid-veil" style={{ position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1240, margin: '0 auto', width: '100%', position: 'relative' }}>
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <motion.div style={{ y, opacity }}>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <span className="tag" style={{ borderColor: 'var(--border-strong)', color: 'var(--cyan)' }}>
                v2.3.0 · Apache-2.0 · MASTER-PROMPT.md §0–§43
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl md:text-5xl lg:text-6xl"
              style={{ margin: '1.4rem 0 1rem' }}
            >
              Every claim carries
              <br />
              <span className="gradient-text">a receipt.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.42 }}
              style={{ color: 'var(--text-soft)', fontSize: '1rem', maxWidth: 520, marginBottom: '2rem' }}
            >
              An autonomous engineering system: a router skill, fourteen lifecycle procedures,
              six security deep-dives, {CAPABILITY_TOTAL} registered capabilities and a
              2,215-item verification catalogue. Nothing is called done without evidence.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.56 }}
              className="flex flex-wrap gap-3"
            >
              <motion.a href="#lifecycle" whileHover={{ y: -2 }} className="btn btn-primary">Walk the lifecycle</motion.a>
              <motion.a href="#architecture" whileHover={{ y: -2 }} className="btn btn-outline">Read the architecture</motion.a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              style={{ display: 'flex', gap: '2.4rem', marginTop: '3rem', flexWrap: 'wrap' }}
            >
              {[['14', 'phases'], ['2,215', 'gates'], [String(CAPABILITY_TOTAL), 'capabilities'], ['9', 'layers']].map(([n, l], i) => (
                <motion.div key={l} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 + i * 0.07 }}>
                  <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--cyan)' }}>{n}</div>
                  <div style={{ fontSize: '0.62rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--dim)', marginTop: 2 }}>{l}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* The 3D scene is the repo's own architecture diagram, live */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="panel"
            style={{ height: 460, position: 'relative' }}
          >
            <div style={{ position: 'absolute', top: 14, left: 18, zIndex: 3 }}>
              <span className="mono" style={{ fontSize: '0.58rem', color: 'var(--dim)', letterSpacing: '0.14em' }}>
                ARCHITECTURE.md · 9 LAYERS
              </span>
            </div>
            <PipelineScene3D />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ── Manifest strip: real paths, not decoration ─────────────────────────── */

function ManifestStrip() {
  const items = [
    'MASTER-PROMPT.md', 'lifecycle/00-bootstrap.md', 'lifecycle/13-release.md',
    'security/ATTACK-CATALOG.md', 'references/02-master-shipping-gate.md',
    'bin/biswodip.mjs', 'integrations/manifest.json', 'repositories/INDEX.md',
    'skills/biswodip-unified-engineering/', 'templates/claude/commands/dip.md',
    '.biswodip/evidence/', 'reports/RELEASE-REPORT-TEMPLATE.md',
  ];
  const loop = [...items, ...items];
  return (
    <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '0.85rem 0', overflow: 'hidden', background: 'rgba(16, 27, 46, 0.5)' }}>
      <motion.div
        style={{ display: 'flex', gap: '2.8rem', width: 'max-content', whiteSpace: 'nowrap' }}
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 64, repeat: Infinity, ease: 'linear' }}
      >
        {loop.map((item, i) => (
          <span key={i} className="mono" style={{ fontSize: '0.64rem', color: i % 4 === 0 ? 'var(--cyan)' : 'var(--dim)', letterSpacing: '0.06em' }}>
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ── Laws ───────────────────────────────────────────────────────────────── */

function Laws() {
  return (
    <ZoomSection id="laws" eyebrow="01 — The laws" title={<>Eight rules, <span className="gradient-text">enforced everywhere</span></>} lead="Carried in the router skill. Every phase, every subagent and every report obeys them.">
      <div className="grid md:grid-cols-2 gap-4">
        {LAWS.map(([title, desc, src], i) => (
          <ScrollReveal key={title} delay={i * 0.045}>
            <motion.div whileHover={{ x: 4 }} className="card" style={{ padding: '1.5rem', height: '100%' }}>
              <div style={{ display: 'flex', gap: '0.9rem' }}>
                <span className="mono" style={{ color: 'var(--cyan)', fontSize: '0.68rem', paddingTop: 3, opacity: 0.75 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.35rem' }}>{title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '0.6rem' }}>{desc}</p>
                  <span className="artifact">{src}</span>
                </div>
              </div>
            </motion.div>
          </ScrollReveal>
        ))}
      </div>
    </ZoomSection>
  );
}

/* ── Lifecycle: the tunnel is the phase path ────────────────────────────── */

function Lifecycle() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 45%'] });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <ZoomSection id="lifecycle" eyebrow="02 — Lifecycle" title={<>Fourteen phases, <span className="gradient-text">entry gate to release</span></>} lead="lifecycle/00-bootstrap.md through 13-release.md. Each has entry criteria, numbered steps, exact commands, evidence to record and an exit gate you can tick.">
      <ScrollReveal>
        <div style={{ marginBottom: '3rem' }}>
          <LifecycleTunnel height={400} />
        </div>
      </ScrollReveal>

      <div ref={ref} style={{ position: 'relative', paddingLeft: '2.2rem' }}>
        <div style={{ position: 'absolute', left: 6, top: 6, bottom: 6, width: 1, background: 'var(--border)' }} />
        <motion.div style={{ position: 'absolute', left: 6, top: 6, width: 1, background: 'linear-gradient(var(--cyan), var(--indigo))', height: lineHeight }} />

        {PHASES.map(([num, title, desc], i) => (
          <ScrollReveal key={num} delay={0.015}>
            <div style={{ position: 'relative', paddingBottom: i === PHASES.length - 1 ? 0 : '1.7rem' }}>
              <motion.span
                whileInView={{ scale: [0.5, 1] }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                style={{ position: 'absolute', left: '-2.2rem', top: 6, width: 13, height: 13, borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--cyan)' }} />
              </motion.span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.7rem', flexWrap: 'wrap' }}>
                <span className="mono" style={{ fontSize: '0.66rem', color: 'var(--cyan)', opacity: 0.8 }}>{num}</span>
                <h3 style={{ fontSize: '0.96rem', fontWeight: 700 }}>{title}</h3>
                <span className="artifact" style={{ fontSize: '0.56rem' }}>lifecycle/{num}-*.md</span>
              </div>
              <p style={{ fontSize: '0.81rem', color: 'var(--muted)', marginTop: '0.25rem', maxWidth: 600, lineHeight: 1.6 }}>{desc}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </ZoomSection>
  );
}

/* ── Gates ──────────────────────────────────────────────────────────────── */

function Gates() {
  return (
    <ZoomSection id="gates" eyebrow="03 — Verification" title={<>The catalogue that <span className="gradient-text">refuses adjectives</span></>} lead="references/02-master-shipping-gate.md is roughly 120,000 tokens of gates and attack variants. It exists to be grepped by section, never loaded whole.">
      <div className="grid lg:grid-cols-3 gap-5">
        <ScrollReveal>
          <GateTally total={2215} domains={GATE_DOMAINS} label="verification gates" source="references/02-master-shipping-gate.md" />
        </ScrollReveal>
        <div className="lg:col-span-2 grid sm:grid-cols-3 gap-4">
          {[
            ['101', 'gate domains', 'grep "^### " references/02'],
            ['17', 'secret-scan rules', 'scripts/lib/gates.mjs'],
            ['12', 'risk heuristics', 'scripts/lib/gates.mjs'],
          ].map(([value, label, note], i) => (
            <ScrollReveal key={label} delay={0.1 + i * 0.08}>
              <div className="card" style={{ padding: '1.6rem', height: '100%' }}>
                <div className="mono" style={{ fontSize: '1.7rem', fontWeight: 600, color: 'var(--cyan)', marginBottom: '0.35rem' }}>{value}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>{label}</div>
                <span className="artifact">{note}</span>
              </div>
            </ScrollReveal>
          ))}
          <ScrollReveal delay={0.34}>
            <div className="card" style={{ padding: '1.6rem', gridColumn: 'span 3' }}>
              <div className="artifact" style={{ marginBottom: '0.8rem' }}>the five statuses this system uses</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="status pass">PASS</span>
                <span className="status fail">FAIL</span>
                <span className="status unverified">UNVERIFIED</span>
                <span className="status blocked">BLOCKED</span>
                <span className="status open">NOT-RUN</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </ZoomSection>
  );
}

/* ── Security ───────────────────────────────────────────────────────────── */

function SecuritySection() {
  return (
    <ZoomSection id="security" eyebrow="04 — Security deep-dives" title={<>Six surfaces, <span className="gradient-text">each with a status</span></>} lead="security/ holds the concrete patterns, the anti-patterns that appear in real repositories, and the test that proves each defence.">
      <ScrollReveal>
        <SecurityBoard />
      </ScrollReveal>
    </ZoomSection>
  );
}

/* ── Capability graph ───────────────────────────────────────────────────── */

function GraphSection() {
  const nodes = CAPABILITIES.map((c) => ({ id: c.id, name: c.name, section: c.section, required: c.required, stars: c.stars }));
  return (
    <ZoomSection id="graph" eyebrow="05 — Capability graph" title={<>The registry, <span className="gradient-text">as a graph</span></>} lead={`${CAPABILITY_TOTAL} capabilities across six sections. Drag to orbit, scroll to zoom, hover a node. Brighter nodes are the ${CAPABILITY_REQUIRED} required references.`}>
      <ScrollReveal>
        <div className="panel" style={{ height: 540 }}>
          <CapabilityGraph3D nodes={nodes} height={540} />
        </div>
      </ScrollReveal>
    </ZoomSection>
  );
}

/* ── Registry ───────────────────────────────────────────────────────────── */

function Registry() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? CAPABILITIES : CAPABILITIES.filter((c) => c.section === filter);

  return (
    <ZoomSection id="registry" eyebrow="06 — Capability registry" title={<>{CAPABILITY_TOTAL} capabilities, <span className="gradient-text">{CAPABILITY_REQUIRED} required</span></>} lead="Registered is not installed. The planner evaluates every entry and activates only what the goal needs. Security entries are permission-aware.">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.6rem' }}>
        <Filter active={filter === 'all'} onClick={() => setFilter('all')} label="All" color="var(--cyan)" />
        {CAPABILITY_SECTIONS.map((s) => (
          <Filter key={s} active={filter === s} onClick={() => setFilter(s)} label={CAPABILITY_LABEL[s]} color={SECTION_COLORS[s]} />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map((c, i) => {
          const color = SECTION_COLORS[c.section];
          return (
            <ScrollReveal key={c.id} delay={Math.min(i * 0.01, 0.35)}>
              <motion.a
                href={c.repo}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor-hover
                whileHover={{ y: -4, borderColor: `${color}66` }}
                style={{ display: 'block', height: '100%', background: 'rgba(15, 27, 46, 0.6)', border: `1px solid ${color}22`, borderRadius: 13, padding: '1.1rem' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.55rem' }}>
                  <span className="mono" style={{ fontSize: '0.58rem', color: 'var(--dim)' }}>{c.section}</span>
                  {c.stars && <span className="mono" style={{ fontSize: '0.58rem', color: 'var(--dim)' }}>★ {c.stars >= 1000 ? `${Math.round(c.stars / 1000)}k` : c.stars}</span>}
                </div>
                <h3 style={{ fontSize: '0.84rem', fontWeight: 700, color, marginBottom: '0.3rem' }}>{c.name}</h3>
                <p style={{ fontSize: '0.72rem', color: 'var(--muted)', lineHeight: 1.55 }}>{c.desc}</p>
                {c.required && <span className="status pass" style={{ marginTop: '0.65rem', display: 'inline-block' }}>REQUIRED</span>}
              </motion.a>
            </ScrollReveal>
          );
        })}
      </div>
    </ZoomSection>
  );
}

function Filter({ active, onClick, label, color }: { active: boolean; onClick: () => void; label: string; color: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="mono"
      style={{
        fontSize: '0.63rem', letterSpacing: '0.07em', textTransform: 'uppercase', cursor: 'pointer',
        padding: '0.34rem 0.8rem', borderRadius: 999,
        border: `1px solid ${active ? color : 'var(--border)'}`,
        background: active ? `${color}14` : 'transparent',
        color: active ? color : 'var(--muted)',
        transition: 'all 0.28s',
      }}
    >
      {label}
    </motion.button>
  );
}

/* ── Architecture ───────────────────────────────────────────────────────── */

function Architecture() {
  return (
    <ZoomSection id="architecture" eyebrow="07 — Architecture" title={<>Nine layers, <span className="gradient-text">under 4k tokens to start</span></>} lead="Detail lives on disk, not in the context window. The router answers what is allowed, in what order, and where the detail is — nothing else.">
      <div className="grid md:grid-cols-2 gap-3">
        {LAYERS.map(([num, name, path, desc], i) => (
          <ScrollReveal key={num} delay={i * 0.035}>
            <motion.div whileHover={{ borderColor: 'var(--border-strong)' }} className="card" style={{ padding: '1.25rem 1.4rem', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.65rem', marginBottom: '0.4rem' }}>
                <span className="mono" style={{ fontSize: '0.64rem', color: 'var(--cyan)', opacity: 0.75 }}>{num}</span>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{name}</h3>
              </div>
              <div className="mono" style={{ fontSize: '0.62rem', color: 'var(--indigo)', marginBottom: '0.5rem' }}>{path}</div>
              <p style={{ fontSize: '0.78rem', color: 'var(--muted)', lineHeight: 1.6 }}>{desc}</p>
            </motion.div>
          </ScrollReveal>
        ))}
      </div>
    </ZoomSection>
  );
}

/* ── Integrations ───────────────────────────────────────────────────────── */

function Integrations() {
  return (
    <ZoomSection eyebrow="08 — Upstream" title={<>Five projects, <span className="gradient-text">pinned and licensed</span></>} lead="integrations/manifest.json is the machine-readable truth: repo, pinned commit, expected files, licence. upstream/ holds an exact export with tree hashes in SNAPSHOTS.json.">
      <ScrollReveal>
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <IntegrationCube size={140} />
        </div>
      </ScrollReveal>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {INTEGRATIONS.map((int, i) => (
          <ScrollReveal key={int.name} delay={i * 0.055}>
            <motion.div whileHover={{ y: -4 }} className="card" style={{ padding: '1.3rem 1rem', textAlign: 'center', height: '100%' }}>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem' }}>{int.name}</h3>
              <div className="mono" style={{ fontSize: '0.58rem', color: 'var(--muted)', marginBottom: '0.35rem' }}>{int.phase}</div>
              <div className="mono" style={{ fontSize: '0.55rem', color: 'var(--dim)' }}>{int.license} · {int.commit}</div>
            </motion.div>
          </ScrollReveal>
        ))}
      </div>
    </ZoomSection>
  );
}

/* ── Evidence ───────────────────────────────────────────────────────────── */

function Evidence() {
  return (
    <ZoomSection eyebrow="09 — Evidence" title={<>It turns “it’s secure” into <span className="gradient-text">a command and a result</span></>} lead="Every command, exit code and artifact is written to .biswodip/. Someone else can re-run it and get the same answer.">
      <div className="grid lg:grid-cols-2 gap-5">
        <ScrollReveal>
          <CommandLog />
        </ScrollReveal>
        <ScrollReveal delay={0.12}>
          <ReleaseGateMeter />
        </ScrollReveal>
      </div>
    </ZoomSection>
  );
}

/* ── Projects ───────────────────────────────────────────────────────────── */

function Projects() {
  return (
    <ZoomSection eyebrow="10 — Work" title={<>What the system <span className="gradient-text">ships</span></>}>
      <div className="grid md:grid-cols-3 gap-5">
        {PROJECTS.map((p, i) => (
          <ScrollReveal key={p.name} delay={i * 0.09}>
            <motion.div whileHover={{ y: -5 }} className="card" style={{ height: '100%' }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--cyan)', marginBottom: '0.5rem' }}>{p.name}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '1rem' }}>{p.desc}</p>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {p.tags.map((t) => (
                  <span key={t} className="mono" style={{ fontSize: '0.56rem', padding: '0.18rem 0.55rem', borderRadius: 999, border: '1px solid var(--border)', color: 'var(--muted)' }}>{t}</span>
                ))}
              </div>
            </motion.div>
          </ScrollReveal>
        ))}
      </div>
    </ZoomSection>
  );
}

/* ── Colophon: owner link, never printed as a raw URL ───────────────────── */

function Colophon() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const opacity = useTransform(scrollYProgress, [0, 0.55], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.55], [36, 0]);
  const [revealed, setRevealed] = useState(false);

  return (
    <section ref={ref} style={{ padding: '6rem 2rem 4rem', position: 'relative', zIndex: 2 }}>
      <motion.div style={{ opacity, y, maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <hr className="hairline" style={{ marginBottom: '3rem' }} />

        {/* Owner seal — a monogram, not a printed link */}
        <motion.button
          onClick={() => setRevealed(true)}
          onMouseEnter={() => setRevealed(true)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.98 }}
          aria-label="Reveal owner contact"
          style={{
            width: 84, height: 84, borderRadius: '50%', margin: '0 auto 1.4rem', cursor: 'pointer',
            background: 'radial-gradient(circle at 35% 30%, rgba(34,211,238,0.16), rgba(99,102,241,0.1))',
            border: '1px solid var(--border-strong)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
          }}
        >
          <motion.span
            className="mono"
            animate={{ opacity: revealed ? 0 : 1, scale: revealed ? 0.7 : 1 }}
            style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--cyan)', position: 'absolute' }}
          >
            BG
          </motion.span>
          <motion.span
            className="mono"
            initial={false}
            animate={{ opacity: revealed ? 1 : 0, scale: revealed ? 1 : 0.7 }}
            style={{ fontSize: '0.62rem', letterSpacing: '0.1em', color: 'var(--cyan)', position: 'absolute' }}
          >
            OPEN
          </motion.span>
        </motion.button>

        <h2 className="text-2xl md:text-3xl" style={{ marginBottom: '0.9rem' }}>
          The repository is the documentation.
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.86rem', marginBottom: '1.8rem', lineHeight: 1.7 }}>
          Everything on this page is drawn from the repository — MASTER-PROMPT.md §0–§43,
          lifecycle/00–13, security/, references/, integrations/, and the {CAPABILITY_TOTAL}-capability registry.
        </p>

        <AnimatePresence>
          {revealed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.8rem' }}>
                {/* The owner site is linked by name, never printed as a bare URL */}
                <motion.a
                  href="https://biswadip.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -2 }}
                  className="btn btn-primary"
                >
                  biswadip<span style={{ opacity: 0.6 }}>.in</span>
                </motion.a>
                <motion.a
                  href="https://github.com/Biswadipgoj/BISWODIP-ENGINEERING-skills"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -2 }}
                  className="btn btn-outline"
                >
                  Repository on GitHub
                </motion.a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mono" style={{ fontSize: '0.58rem', color: 'var(--dim)', lineHeight: 1.9 }}>
          Apache-2.0 · Copyright (c) 2026 Biswodip Goj<br />
          Upstream projects remain owned by their authors — see THIRD-PARTY-NOTICES.md
        </p>
      </motion.div>
    </section>
  );
}
