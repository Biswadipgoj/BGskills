// GENERATED copy of scripts/lib/plan-core.mjs — do not edit; re-run scripts/generate-site-capabilities.mjs.
// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Biswodip Goj — Biswodip Goj Unified Engineering
// The pure part of `dip plan`: goal + catalog + what the repo uses → skills, stack entries, owners and waves.
// No Node imports on purpose — the CLI planner wraps it, and the website runs the same file in the browser
// (copied to site/src/data/plan-core.mjs by scripts/generate-site-capabilities.mjs; do not edit that copy).

// Goal → this system's own phase skills. The router always loads.
export const SKILL_RULES = [
  ['biswodip-security-review', ['security', 'secure', 'harden', 'auth', 'authorization', 'permission', 'vulnerab', 'secret', 'payment', 'webhook', 'audit', 'codex', 'sast', 'cloudflare', 'waf', 'ddos', 'zero-trust']],
  ['biswodip-pentest', ['pentest', 'penetration', 'exploit', 'attack', 'sqlmap', 'sqli', 'sql injection', 'ctf', 'hacking', 'offensive']],
  ['biswodip-design-review', ['design', 'ui', 'ux', 'accessib', 'a11y', 'responsive', 'animation', 'polish', 'landing', 'page', 'screen', 'creative']],
  ['biswodip-release-gate', ['release', 'production ready', 'production-ready', 'ship', 'score', 'grade', 'launch']],
  ['biswodip-handoff', ['handoff', 'hand off', 'continue later', 'new session']],
  ['biswodip-bootstrap', ['setup', 'set up', 'install', 'bootstrap', 'integrations']],
];

// Goal words that pull in an agent even when no single catalog entry matched.
export const AGENT_RULES = [
  ['dip-frontend', ['frontend', 'front-end', 'website', 'web app', 'ui', 'page', 'css', 'component', 'landing', 'dashboard', 'portfolio']],
  ['dip-mobile', ['android', 'ios', 'mobile', 'apk', 'play store', 'app store', 'iphone', 'react native', 'expo', 'flutter']],
  ['dip-backend', ['api', 'backend', 'server', 'database', 'endpoint', 'data model']],
  ['dip-browser', ['browser', 'scrape', 'crawl', 'automate the web']],
  ['dip-infra', ['deploy', 'kubernetes', 'scale', 'infrastructure', 'workflow automation']],
  ['dip-quality', ['test', 'review', 'refactor', 'bug', 'debug', 'quality']],
];
export const BUILD_AGENTS = ['dip-frontend', 'dip-mobile', 'dip-backend', 'dip-browser', 'dip-infra'];

const MOBILE_WORDS = AGENT_RULES.find(([a]) => a === 'dip-mobile')[1];
const WEB_WORDS = ['web', 'website', 'web app', 'browser', 'landing', 'css', 'html', 'frontend', 'front-end', 'site', 'portfolio', 'dashboard'];
const MOBILE_DEPS = ['expo', 'react-native', 'flutter'];
const VAGUE_WORDS = ['idea', 'ideas', 'something', 'anything', 'what should i build'];

const norm = (s) => ` ${String(s || '').toLowerCase().replace(/[^a-z0-9+#./-]+/g, ' ')} `;
/** Whole-word/phrase match, with a prefix match for stems like "accessib". */
export function goalHits(goal, words) {
  const g = norm(goal);
  return words.filter((w) => { const k = String(w).toLowerCase(); return g.includes(` ${k} `) || g.includes(` ${k}s `) || (k.length >= 6 && g.includes(` ${k}`)); });
}

/**
 * Score every catalog entry against the goal and the repo.
 * `scan` is { deps: Set<string>, langs: string[] }; `fileExists(relPath)` checks the repo (the browser passes () => false).
 */
// Words too common to count as naming a project (an imported repo called "ui" or "docs" must not hijack a plan).
const COMMON = new Set(['ui', 'app', 'api', 'web', 'docs', 'design', 'security', 'test', 'tests', 'core', 'next', 'node', 'react', 'vue', 'go', 'code', 'tools', 'awesome', 'server', 'client', 'cli', 'kit', 'lab', 'hub', 'home', 'desktop', 'mobile', 'website', 'dashboard', 'docker']);
const namesIt = (goal, e) => goalHits(goal, [e.name, e.id]).filter((n) => n.length >= 4 && !COMMON.has(n.toLowerCase()));

export function scoreEntries(catalog, goal, scan, fileExists = () => false) {
  return catalog.entries.map((e) => {
    // Imported (catalogOnly) entries count only when the goal names them; curated ones also match their keywords.
    const kw = e.catalogOnly ? namesIt(goal, e) : goalHits(goal, e.signals?.keywords || []).concat(goalHits(goal, [e.id, e.name]));
    const dep = (e.signals?.deps || []).filter((d) => scan.deps.has(d.toLowerCase()));
    const files = (e.signals?.files || []).filter((f) => fileExists(f));
    const lang = e.lang && scan.langs?.includes(e.lang) ? 1 : 0;
    return { entry: e, keywords: [...new Set(kw)], deps: dep, files, lang, score: kw.length * 2 + dep.length * 5 + files.length * 3 + lang * 3 + (e.priority || 0) * 0.5 };
  });
}

/** Which platforms the work is for: from the goal first, then from what the repo already is. */
export function platformOf(goal, scan) {
  const mobileGoal = goalHits(goal, MOBILE_WORDS).length > 0;
  const webGoal = goalHits(goal, WEB_WORDS).length > 0;
  const mobileRepo = MOBILE_DEPS.some((d) => scan.deps.has(d));
  const mobile = mobileGoal || (!webGoal && mobileRepo);
  return { mobile, web: webGoal || !mobile, mobileOnly: mobile && !webGoal };
}

/**
 * Who owns an entry for this goal. Mobile frameworks only exist on a mobile goal; a shared service the catalog
 * files under dip-mobile (Appwrite) belongs to dip-backend when the goal is a website.
 */
export function ownerOf(e, platform) {
  if (e.agent !== 'dip-mobile' || platform.mobile) return e.agent;
  return e.kind === 'framework' ? null : 'dip-backend';
}

export function planCore({ catalog, goal = '', scan, fileExists = () => false, max = 6 }) {
  const notes = [];
  const platform = platformOf(goal, scan);
  const scored = scoreEntries(catalog, goal, scan, fileExists);
  const vague = (!goal.trim() && !scan.langs.length) || goalHits(goal, VAGUE_WORDS).length > 0;

  // Drop what does not fit this goal before anything is ranked.
  const drop = (s) => { s.keywords = []; s.deps = []; s.files = []; s.score = 0; };
  for (const s of scored) {
    s.owner = ownerOf(s.entry, platform);
    if (!s.owner) drop(s);
    else if (s.entry.whenVague && !vague) drop(s);
  }
  if (platform.mobileOnly && scored.some((s) => s.entry.platform === 'web' && s.keywords.length)) {
    notes.push('Mobile goal: web-only libraries skipped. Animation → react-native-reanimated (`npx expo install react-native-reanimated`); icons → @expo/vector-icons (ships with Expo).');
    for (const s of scored) if (s.entry.platform === 'web') drop(s);
  }

  // Agents the goal asks for, directly or through a matched entry.
  const agents = new Set(AGENT_RULES.filter(([a, w]) => goalHits(goal, w).length && (a !== 'dip-mobile' || platform.mobile)).map(([a]) => a));
  for (const s of scored) if (s.keywords.length) agents.add(s.owner);
  if (platform.mobileOnly && !goalHits(goal, WEB_WORDS).length && !scored.some((s) => s.owner === 'dip-frontend' && s.score > 0)) agents.delete('dip-frontend');

  // Entries count only when the goal names them, or the repo uses them in an area the goal touches.
  // No goal: repository forensics — what the repo already uses.
  const relevant = scored.filter((s) => s.owner && (goal.trim() ? s.keywords.length || ((s.deps.length || s.files.length) && agents.has(s.owner)) : s.deps.length || s.files.length));
  const ranked = relevant.sort((a, b) => b.score - a.score || a.entry.id.localeCompare(b.entry.id));
  // One per alternative group (one CSS framework, one animation library, one icon set…); the repo's own choice wins.
  const seenGroups = new Map();
  const deduped = ranked.filter((s) => {
    const g = s.entry.group;
    if (!g) return true;
    if (seenGroups.has(g)) { if (s.keywords.length) notes.push(`${s.entry.name} skipped — one ${g.replace(/-/g, ' ')} is enough (${seenGroups.get(g)}).`); return false; }
    seenGroups.set(g, s.entry.name); return true;
  });
  const ids = new Set(deduped.map((s) => s.entry.id));
  const chosen = deduped.filter((s) => {
    if (!s.entry.fallbackFor || !ids.has(s.entry.fallbackFor)) return true;
    notes.push(`${s.entry.name} is the fallback if ${s.entry.fallbackFor} cannot run.`);
    return false;
  }).slice(0, Math.max(1, max));
  for (const s of chosen) agents.add(s.owner);

  const skills = ['biswodip-unified-engineering', ...SKILL_RULES.filter(([, w]) => goalHits(goal, w).length).map(([s]) => s)];
  if ((agents.has('dip-frontend') || agents.has('dip-mobile')) && !skills.includes('biswodip-design-review')) skills.push('biswodip-design-review');
  if (!skills.includes('biswodip-security-review') && (agents.has('dip-backend') || agents.has('dip-mobile'))) skills.push('biswodip-security-review');

  const build = BUILD_AGENTS.filter((a) => agents.has(a));
  const pick = (a) => chosen.filter((s) => s.owner === a);
  const waves = [
    { name: 'Plan', parallel: false, agents: [{ agent: 'dip-planner', task: 'Read the repo and this plan. Confirm or cut entries, write acceptance criteria, split the work into tasks with one owner per file area, and flag anything that needs the user.', picked: pick('dip-planner') }] },
    { name: 'Build', parallel: build.length > 1, agents: build.map((a) => ({ agent: a, task: catalog.agents[a], picked: pick(a) })) },
    { name: 'Verify', parallel: true, agents: [
      { agent: 'dip-quality', task: 'Run the build, types, lint and tests; add missing tests for the changed behaviour; review the diff.', picked: pick('dip-quality') },
      { agent: 'dip', task: `Security review of the changed code with ${skills.includes('biswodip-security-review') ? 'biswodip-security-review' : 'the router laws'}; report a status per control.`, picked: [] },
    ] },
    { name: 'Gate', parallel: false, agents: [{ agent: 'main', task: 'Merge the reports, fix what they found, then run biswodip-release-gate and give one release status.', picked: [] }] },
  ].filter((w) => w.agents.length).map((w, i) => ({ ...w, wave: i + 1 }));

  return {
    platform, notes, vague, chosen, waves, skills: [...new Set(skills)],
    externalSkills: chosen.filter((s) => ['skill', 'plugin'].includes(s.entry.kind)).map((s) => s.entry.id),
    skipped: scored.filter((s) => s.score > 0 && !chosen.includes(s)).map((s) => s.entry.id),
  };
}

export function whyOf(s) {
  const r = [];
  if (s.deps.length) r.push(`already in use (${s.deps.join(', ')})`);
  if (s.files.length) r.push(`found ${s.files.join(', ')}`);
  if (s.keywords.length) r.push(`goal mentions ${s.keywords.slice(0, 3).map((k) => `"${k}"`).join(', ')}`);
  return r.join('; ');
}
