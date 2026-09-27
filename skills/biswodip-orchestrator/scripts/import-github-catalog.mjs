#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Biswodip Goj — Biswodip Goj Unified Engineering
// Imports every real GitHub repository with at least MIN_STARS stars in the areas this system works in —
// design, design feedback, planning, security, penetration testing, quality, devops, agents/skills — into
// integrations/catalog.json. Star counts come from the GitHub API at import time; nothing is invented.
//
// Imported entries are `catalogOnly`: they appear in `dip catalog` and on the site, and /dip uses one only when
// the goal names it, so a big catalog never turns into a big plan. Hand-curated entries are never overwritten,
// and re-running replaces the previous import.
//
//   node scripts/import-github-catalog.mjs [--min-stars 20000] [--dry-run]
//   GITHUB_TOKEN=… node scripts/import-github-catalog.mjs   # faster: 30 searches/min instead of 10

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = path.join(ROOT, 'integrations', 'catalog.json');
const args = process.argv.slice(2);
const MIN_STARS = Number(args[args.indexOf('--min-stars') + 1]) || 20000;
const DRY = args.includes('--dry-run');
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const PAUSE = TOKEN ? 2200 : 6500; // stay under the search rate limit

// Topic queries per area. A repo found under several areas is filed under the most specific one (ORDER).
const AREAS = {
  pentest: ['penetration-testing', 'pentest', 'pentesting', 'hacking', 'red-team', 'bug-bounty', 'ctf', 'osint', 'reverse-engineering', 'fuzzing', 'exploit', 'infosec', 'hacking-tool'],
  feedback: ['accessibility', 'a11y', 'lighthouse', 'web-performance', 'visual-regression', 'storybook', 'stylelint', 'performance-monitoring', 'core-web-vitals', 'usability'],
  security: ['security', 'security-tools', 'vulnerability-scanner', 'sast', 'secrets', 'devsecops', 'static-analysis', 'cybersecurity', 'authentication', 'encryption', 'appsec'],
  agents: ['claude-code', 'agent-skills', 'claude-skills', 'mcp', 'model-context-protocol', 'ai-agents', 'llm-agent', 'coding-assistant', 'ai-coding'],
  planning: ['project-management', 'kanban', 'productivity', 'diagrams', 'documentation', 'knowledge-base', 'note-taking', 'roadmap', 'mindmap', 'task-manager', 'whiteboard'],
  devops: ['devops', 'ci-cd', 'kubernetes', 'docker', 'infrastructure-as-code', 'observability', 'monitoring', 'terraform', 'gitops'],
  quality: ['testing', 'e2e-testing', 'test-automation', 'code-review', 'code-quality', 'linter', 'unit-testing'],
  design: ['ui', 'design-system', 'design', 'figma', 'css-framework', 'ui-components', 'component-library', 'react-components', 'tailwindcss', 'icons', 'animation', 'ux', 'design-tools', 'svg'],
};
const ORDER = ['pentest', 'feedback', 'security', 'agents', 'planning', 'devops', 'quality', 'design'];
const OWNER = { pentest: 'dip-quality', feedback: 'dip-frontend', security: 'dip-quality', agents: 'dip-planner', planning: 'dip-planner', devops: 'dip-infra', quality: 'dip-quality', design: 'dip-frontend' };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function search(topic, page) {
  const q = encodeURIComponent(`topic:${topic} stars:>=${MIN_STARS} fork:false archived:false`);
  const url = `https://api.github.com/search/repositories?q=${q}&sort=stars&order=desc&per_page=100&page=${page}`;
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'biswodip-catalog-import', ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}) } });
    if (res.ok) return res.json();
    if (res.status === 403 || res.status === 429) {
      const reset = Number(res.headers.get('x-ratelimit-reset')) * 1000;
      const wait = Math.max(5000, (reset || Date.now() + 60000) - Date.now() + 1000);
      console.warn(`\n  rate limited on ${topic}; waiting ${Math.round(wait / 1000)}s`);
      await sleep(wait);
      continue;
    }
    throw new Error(`GitHub search failed for ${topic}: ${res.status} ${await res.text()}`);
  }
  throw new Error(`GitHub search kept failing for ${topic}`);
}

const found = new Map(); // full_name → { repo, areas:Set }
const all = ORDER.flatMap((a) => AREAS[a].map((t) => [a, t]));
let n = 0;
for (const [area, topic] of all) {
  n++;
  for (let page = 1; page <= 10; page++) {
    const r = await search(topic, page);
    for (const it of r.items || []) {
      const key = it.full_name.toLowerCase();
      if (!found.has(key)) found.set(key, { repo: it, areas: new Set() });
      found.get(key).areas.add(area);
    }
    process.stdout.write(`\r  [${n}/${all.length}] topic:${topic} → ${r.total_count} · unique so far ${found.size}      `);
    await sleep(PAUSE);
    if ((r.items || []).length < 100 || page * 100 >= r.total_count) break;
  }
}
process.stdout.write('\n');

const cat = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const curated = cat.entries.filter((e) => e.source !== 'github-top');
const curatedRepos = new Set(curated.map((e) => e.repo.toLowerCase().replace(/\.git$/, '')));
const ids = new Set(curated.map((e) => e.id));
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const clean = (s) => String(s || '').replace(/\s+/g, ' ').replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').trim();

const imported = [];
for (const { repo: r, areas } of found.values()) {
  const url = r.html_url;
  if (curatedRepos.has(url.toLowerCase())) continue;
  const section = ORDER.find((a) => areas.has(a));
  let id = slug(r.name);
  if (ids.has(id)) id = slug(`${r.owner.login}-${r.name}`);
  if (ids.has(id)) continue;
  ids.add(id);
  const desc = clean(r.description) || `${r.full_name} on GitHub.`;
  imported.push({
    id, name: r.name, repo: url, stars: r.stargazers_count, section, agent: OWNER[section],
    kind: /^awesome/i.test(r.name) ? 'reference' : 'tool', catalogOnly: true,
    use: desc.length > 240 ? `${desc.slice(0, 237).trimEnd()}…` : desc,
    docs: r.homepage && /^https:\/\//.test(r.homepage) ? r.homepage : url,
    topics: (r.topics || []).slice(0, 8), license: r.license?.spdx_id || null,
    signals: { keywords: [] }, source: 'github-top',
  });
}
imported.sort((a, b) => b.stars - a.stars);

const bySection = Object.fromEntries(ORDER.map((a) => [a, imported.filter((e) => e.section === a).length]));
console.log(`imported ${imported.length} repositories with ≥${MIN_STARS} stars (curated entries kept: ${curated.length})`);
console.log(bySection);
if (DRY) process.exit(0);

cat.entries = [...curated, ...imported];
cat.githubImport = { source: 'GitHub search API', minStars: MIN_STARS, importedAt: new Date().toISOString(), count: imported.length, areas: Object.keys(AREAS) };
fs.writeFileSync(FILE, JSON.stringify(cat, null, 2) + '\n');
console.log(`written: ${path.relative(ROOT, FILE)} (${cat.entries.length} entries)`);
