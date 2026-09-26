// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Biswodip Goj — Biswodip Goj Unified Engineering
// Adds top-starred repositories per section to integrations/catalog.json.
// Star counts captured 2026-09-25 from GitHub topic pages (most-stars sort).

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.argv[2] || '.');
const file = path.join(ROOT, 'integrations', 'catalog.json');
const cat = JSON.parse(fs.readFileSync(file, 'utf8'));
const have = new Set(cat.entries.map((e) => e.id));

const entry = (id, name, repo, agent, kind, use, keywords, docs, stars, section, notes = '') => ({
  id,
  name,
  repo,
  agent,
  kind,
  use,
  install: {},
  signals: { keywords },
  docs,
  required: false,
  planner_triggers: keywords,
  integration_type: 'knowledge-reference',
  security_notes: notes,
  stars,
  section,
});

const additions = [
  // --- Browser automation (section: browser) ---
  entry('lightpanda-browser', 'Lightpanda Browser', 'https://github.com/lightpanda-io/browser', 'dip-browser', 'tool',
    'Headless browser built for AI and automation in Zig. Extremely low memory and fast startup; CDP-compatible so it drops in where Chromium would.',
    ['headless', 'cdp', 'browser', 'automation', 'lightweight'], 'https://lightpanda.io/docs', 35600, 'browser'),
  entry('stagehand', 'Browserbase Stagehand', 'https://github.com/browserbase/stagehand', 'dip-browser', 'library',
    'SDK to extract data and interact with any site using natural language plus code. Pairs with Playwright/CDP for agent-driven browsing.',
    ['browser', 'extract', 'agent', 'automation', 'stagehand'], 'https://docs.stagehand.dev', 25400, 'browser'),
  entry('skyvern', 'Skyvern', 'https://github.com/Skyvern-AI/skyvern', 'dip-browser', 'service',
    'Automate browser-based workflows with AI and computer vision. Resilient to layout changes; good for form-heavy workflows.',
    ['browser', 'workflow', 'automation', 'vision', 'rpa'], 'https://docs.skyvern.com', 23100, 'browser'),
  entry('steel-browser', 'Steel Browser', 'https://github.com/steel-dev/steel-browser', 'dip-browser', 'service',
    'Open-source browser API and sandbox for AI agents and apps. Batteries-included session management without owning infrastructure.',
    ['browser', 'sandbox', 'api', 'agent', 'session'], 'https://docs.steel.dev', 7700, 'browser'),
  entry('browsermcp', 'Browser MCP', 'https://github.com/BrowserMCP/mcp', 'dip-browser', 'plugin',
    'MCP server that lets AI applications control the browser through an extension. Useful for interactive visual QA.',
    ['mcp', 'browser', 'automation', 'extension'], 'https://browsermcp.io', 7100, 'browser'),

  // --- Animation (section: animation) ---
  entry('react-spring', 'React Spring', 'https://github.com/pmndrs/react-spring', 'dip-frontend', 'library',
    'Spring-physics based React animation library. Use for physics-driven, interruptible motion where springs read better than keyframes.',
    ['animation', 'spring', 'react', 'physics', 'motion'], 'https://react-spring.dev', 29200, 'animation'),
  entry('react-flip-toolkit', 'React Flip Toolkit', 'https://github.com/aholachek/react-flip-toolkit', 'dip-frontend', 'library',
    'Lightweight magic-move library for configurable layout transitions (FLIP technique). Ideal for list reordering and shared-element transitions.',
    ['animation', 'flip', 'layout', 'transition', 'react'], 'https://github.com/aholachek/react-flip-toolkit', 4200, 'animation'),
  entry('dotlottie-web', 'dotLottie Web', 'https://github.com/LottieFiles/dotlottie-web', 'dip-frontend', 'library',
    'High-performance Lottie and dotLottie player powered by Rust + WASM. Use for designer-authored vector animation on the web.',
    ['animation', 'lottie', 'wasm', 'vector', 'motion'], 'https://docs.lottiefiles.com', 884, 'animation'),

  // --- CSS / design (section: design) ---
  entry('tailwindcss', 'Tailwind CSS', 'https://github.com/tailwindlabs/tailwindcss', 'dip-frontend', 'framework',
    'Utility-first CSS framework for rapid, consistent UI. Composable, purge-friendly, and the base for shadcn/ui and daisyUI.',
    ['css', 'tailwind', 'utility', 'design', 'responsive'], 'https://tailwindcss.com/docs', 97700, 'design'),
  entry('daisyui', 'daisyUI', 'https://github.com/saadeghi/daisyui', 'dip-frontend', 'library',
    'Component library on top of Tailwind CSS. Semantic class names for buttons, cards, modals and themes.',
    ['css', 'tailwind', 'components', 'ui', 'theme'], 'https://daisyui.com', 42500, 'design'),
  entry('bulma', 'Bulma', 'https://github.com/jgthms/bulma', 'dip-frontend', 'framework',
    'Modern Flexbox-based CSS framework with no JavaScript dependency. Good when a project wants CSS-only components.',
    ['css', 'flexbox', 'framework', 'responsive'], 'https://bulma.io/documentation', 50100, 'design'),
  entry('pico-css', 'Pico CSS', 'https://github.com/picocss/pico', 'dip-frontend', 'framework',
    'Minimal CSS framework for semantic HTML. Near-zero classes, dark mode built in — excellent for content-first pages.',
    ['css', 'minimal', 'semantic', 'dark-mode'], 'https://picocss.com/docs', 16900, 'design'),
  entry('semantic-ui', 'Semantic UI', 'https://github.com/Semantic-Org/Semantic-UI', 'dip-frontend', 'framework',
    'Component framework built around natural-language principles. Reference for semantic naming and component APIs.',
    ['css', 'components', 'semantic', 'ui'], 'https://semantic-ui.com', 51000, 'design'),

  // --- Security (section: security) ---
  entry('trivy', 'Trivy', 'https://github.com/aquasecurity/trivy', 'dip-quality', 'cli',
    'Find vulnerabilities, misconfigurations, secrets and SBOM issues across containers, Kubernetes, IaC and repositories. Primary dependency/container scanner.',
    ['security', 'vulnerability', 'scanner', 'sbom', 'container', 'iac'], 'https://trivy.dev', 38100, 'security'),
  entry('gitleaks', 'Gitleaks', 'https://github.com/gitleaks/gitleaks', 'dip-quality', 'cli',
    'Detect hardcoded secrets and credentials in git history and working trees. Gate on findings before release.',
    ['security', 'secrets', 'leaks', 'git', 'scan'], 'https://gitleaks.io', 29500, 'security'),
  entry('trufflehog', 'TruffleHog', 'https://github.com/trufflesecurity/trufflehog', 'dip-quality', 'cli',
    'Find, verify and analyze leaked credentials. Verification reduces false positives versus plain regex scanners.',
    ['security', 'credentials', 'secrets', 'verify', 'scan'], 'https://trufflesecurity.com/trufflehog', 28100, 'security'),
  entry('shannon', 'Shannon', 'https://github.com/KeygraphHQ/shannon', 'dip-quality', 'service',
    'AI pentester for web apps and APIs: reads source, identifies attack vectors, executes real exploits to prove vulnerabilities before production. Authorized targets only.',
    ['security', 'pentest', 'exploit', 'owasp', 'appsec'], 'https://github.com/KeygraphHQ/shannon', 48400, 'security',
    'AUTHORIZED-ONLY. Runs real exploits. Requires written authorization and a disposable target.'),
  entry('web-check', 'Web-Check', 'https://github.com/lissy93/web-check', 'dip-quality', 'tool',
    'All-in-one OSINT tool for analysing any website: headers, DNS, TLS, cookies, security posture. Use for passive recon of authorized targets.',
    ['security', 'osint', 'recon', 'headers', 'tls'], 'https://web-check.xyz', 34900, 'security',
    'Passive recon only. Do not probe hosts you do not own or have permission to test.'),
  entry('spiderfoot', 'SpiderFoot', 'https://github.com/smicallef/spiderfoot', 'dip-quality', 'tool',
    'Automates OSINT for threat intelligence and attack-surface mapping. Reference for external footprint analysis.',
    ['security', 'osint', 'recon', 'threat-intel', 'footprint'], 'https://www.spiderfoot.net', 22500, 'security',
    'Passive recon only, authorized targets.'),
  entry('skillspector', 'NVIDIA SkillSpector', 'https://github.com/NVIDIA/SkillSpector', 'dip-quality', 'tool',
    'Security scanner for AI agent skills: detects prompt injection, data exfiltration and supply-chain risk in Claude/Codex/MCP skills before install.',
    ['security', 'agent-skills', 'prompt-injection', 'supply-chain', 'scan'], 'https://github.com/NVIDIA/SkillSpector', 18300, 'security'),
  entry('lynis', 'Lynis', 'https://github.com/CISOfy/lynis', 'dip-infra', 'cli',
    'Security auditing and hardening tool for Linux, macOS and UNIX. Compliance-oriented (HIPAA, ISO 27001, PCI DSS).',
    ['security', 'audit', 'hardening', 'compliance', 'linux'], 'https://cisofy.com/lynis', 16400, 'security',
    'Audits only systems you administer.'),
  entry('prowler', 'Prowler', 'https://github.com/prowler-cloud/prowler', 'dip-infra', 'cli',
    'Open-source cloud security platform: automates security and compliance assessment across AWS, Azure and GCP.',
    ['security', 'cloud', 'compliance', 'cspm', 'aws', 'azure', 'gcp'], 'https://docs.prowler.com', 14900, 'security',
    'Requires read-only credentials scoped to the account being audited.'),
  entry('wazuh', 'Wazuh', 'https://github.com/wazuh/wazuh', 'dip-infra', 'service',
    'Open-source XDR and SIEM platform for endpoints and cloud workloads. Unified detection, response and compliance monitoring.',
    ['security', 'siem', 'xdr', 'monitoring', 'detection', 'compliance'], 'https://documentation.wazuh.com', 17000, 'security'),
  entry('rustscan', 'RustScan', 'https://github.com/bee-san/RustScan', 'dip-quality', 'cli',
    'Modern port scanner that feeds results into Nmap. Fast discovery phase for authorized network testing.',
    ['security', 'port-scan', 'nmap', 'recon', 'network'], 'https://github.com/bee-san/RustScan', 20500, 'security',
    'AUTHORIZED-ONLY. Scanning networks you do not own may be illegal.'),
  entry('fail2ban', 'Fail2ban', 'https://github.com/fail2ban/fail2ban', 'dip-infra', 'service',
    'Intrusion-prevention daemon that bans hosts causing repeated authentication failures. Standard server hardening.',
    ['security', 'intrusion', 'hardening', 'server', 'ban'], 'https://github.com/fail2ban/fail2ban', 18700, 'security'),
  entry('x64dbg', 'x64dbg', 'https://github.com/x64dbg/x64dbg', 'dip-quality', 'tool',
    'Open-source user-mode debugger for Windows, optimized for reverse engineering and malware analysis. Reference for binary analysis.',
    ['security', 'debugger', 'reverse-engineering', 'malware', 'binary'], 'https://x64dbg.com', 49600, 'security',
    'Analysis of binaries you own or are licensed to examine.'),
  entry('scapy', 'Scapy', 'https://github.com/secdev/scapy', 'dip-quality', 'library',
    'Python packet manipulation program and library. Craft, send, sniff and dissect network traffic for protocol testing.',
    ['security', 'network', 'packet', 'pcap', 'protocol'], 'https://scapy.readthedocs.io', 12600, 'security',
    'Capture only on networks you own or are authorized to monitor.'),

  // --- Agent skills / workflow (section: quality) ---
  entry('anthropics-skills', 'Anthropic Agent Skills', 'https://github.com/anthropics/skills', 'dip-planner', 'reference',
    'Public reference repository for the Agent Skills format. The canonical model for how a skill declares scope and triggers.',
    ['skills', 'agent', 'anthropic', 'reference', 'format'], 'https://github.com/anthropics/skills', 178000, 'quality'),
  entry('addyosmani-agent-skills', 'Addy Osmani Agent Skills', 'https://github.com/addyosmani/agent-skills', 'dip-quality', 'reference',
    'Production-grade engineering skills for AI coding agents. Strong reference for code-quality and review workflows.',
    ['skills', 'engineering', 'quality', 'review', 'agents'], 'https://github.com/addyosmani/agent-skills', 99000, 'quality'),
  entry('awesome-claude-skills', 'Awesome Claude Skills', 'https://github.com/ComposioHQ/awesome-claude-skills', 'dip-quality', 'reference',
    'Curated list of Claude skills, resources and tools for customizing agent workflows. Discovery source for new capabilities.',
    ['skills', 'claude', 'awesome', 'workflow', 'discovery'], 'https://github.com/ComposioHQ/awesome-claude-skills', 75600, 'quality'),
  entry('awesome-agent-skills', 'Awesome Agent Skills', 'https://github.com/VoltAgent/awesome-agent-skills', 'dip-quality', 'reference',
    '1000+ agent skills from official teams and the community, compatible with Claude Code, Codex, Gemini CLI and Cursor.',
    ['skills', 'agents', 'awesome', 'registry', 'discovery'], 'https://github.com/VoltAgent/awesome-agent-skills', 34900, 'quality'),
  entry('wshobson-agents', 'wshobson/agents', 'https://github.com/wshobson/agents', 'dip-planner', 'reference',
    'Multi-harness agentic plugin marketplace and subagent patterns for Claude Code, Codex and Cursor. Reference for agent decomposition.',
    ['agents', 'subagents', 'marketplace', 'orchestration', 'plugins'], 'https://github.com/wshobson/agents', 40000, 'quality'),
  entry('awesome-copilot', 'GitHub Awesome Copilot', 'https://github.com/github/awesome-copilot', 'dip-quality', 'reference',
    'Community-contributed instructions, agents and skills from GitHub. Reference for instruction-file conventions.',
    ['copilot', 'instructions', 'agents', 'awesome', 'conventions'], 'https://github.com/github/awesome-copilot', 39400, 'quality'),
  entry('open-design', 'Open Design', 'https://github.com/nexu-io/open-design', 'dip-frontend', 'tool',
    'Local-first design engine that turns a coding agent into a design engine: prototypes, landing pages, dashboards, slides, exports.',
    ['design', 'prototyping', 'ui', 'local-first', 'export'], 'https://github.com/nexu-io/open-design', 98100, 'design'),
  entry('ponytail', 'Ponytail', 'https://github.com/DietrichGebert/ponytail', 'dip-quality', 'skill',
    'Agent skill that enforces YAGNI: the best code is the code you never wrote. Useful as a minimalism counterweight during planning.',
    ['yagni', 'minimalism', 'simplicity', 'review', 'skill'], 'https://github.com/DietrichGebert/ponytail', 146000, 'quality'),
  entry('humanizer', 'Humanizer', 'https://github.com/blader/humanizer', 'dip-quality', 'skill',
    'Agent skill that removes signs of AI-generated writing from text. Use when polishing user-facing copy and docs.',
    ['writing', 'copy', 'editing', 'docs', 'skill'], 'https://github.com/blader/humanizer', 52000, 'quality'),
  entry('book-to-skill', 'Book to Skill', 'https://github.com/virgiliojr94/book-to-skill', 'dip-planner', 'skill',
    'Turn a technical book PDF into a reusable agent skill. Reference for building durable knowledge skills from long-form sources.',
    ['knowledge', 'skill', 'pdf', 'reference', 'learning'], 'https://github.com/virgiliojr94/book-to-skill', 32400, 'quality'),
  entry('diagram-design', 'Diagram Design', 'https://github.com/cathrynlavery/diagram-design', 'dip-quality', 'skill',
    'Editorial diagram design skill producing self-contained HTML + SVG. Complements Archify for crisp architecture visuals.',
    ['diagram', 'svg', 'design', 'architecture', 'skill'], 'https://github.com/cathrynlavery/diagram-design', 42400, 'quality'),

  // --- Web / app frameworks (section: backend) ---
  entry('angular', 'Angular', 'https://github.com/angular/angular', 'dip-frontend', 'framework',
    'Batteries-included TypeScript web framework with dependency injection, routing and forms. Use when a project already targets Angular.',
    ['angular', 'framework', 'typescript', 'spa', 'frontend'], 'https://angular.dev', 101000, 'design'),
  entry('hono', 'Hono', 'https://github.com/honojs/hono', 'dip-backend', 'framework',
    'Ultrafast web framework built on Web Standards. Runs on Cloudflare Workers, Deno, Bun and Node — ideal for edge APIs.',
    ['hono', 'api', 'edge', 'workers', 'backend', 'typescript'], 'https://hono.dev', 32300, 'backend'),
  entry('flask', 'Flask', 'https://github.com/pallets/flask', 'dip-backend', 'framework',
    'Python micro-framework for web applications. Minimal core with a large extension ecosystem; good for Python services and APIs.',
    ['flask', 'python', 'api', 'backend', 'wsgi'], 'https://flask.palletsprojects.com', 74800, 'backend'),
  entry('phoenix', 'Phoenix', 'https://github.com/phoenixframework/phoenix', 'dip-backend', 'framework',
    'Elixir web framework with first-class realtime (LiveView, channels). Strong for concurrent, realtime applications.',
    ['phoenix', 'elixir', 'realtime', 'backend', 'websocket'], 'https://hexdocs.pm/phoenix', 23200, 'backend'),
  entry('flutter', 'Flutter', 'https://github.com/flutter/flutter', 'dip-mobile', 'framework',
    'Cross-platform UI toolkit for mobile, web and desktop from one Dart codebase. Consider alongside React Native/Expo for mobile goals.',
    ['flutter', 'dart', 'mobile', 'cross-platform', 'ui'], 'https://docs.flutter.dev', 179000, 'backend'),
];

let added = 0;
for (const a of additions) {
  if (have.has(a.id)) continue;
  cat.entries.push(a);
  have.add(a.id);
  added++;
}

cat.catalogVersion = (cat.catalogVersion || 3) + 1;
cat.catalogTopStarred = additions.length;
cat.catalogStarSource = 'GitHub topic pages, most-stars sort, captured 2026-09-25';

fs.writeFileSync(file, JSON.stringify(cat, null, 2));

const required = cat.entries.filter((e) => e.required).length;
const sections = {};
for (const e of cat.entries) {
  const s = e.section || (e.required ? 'specification' : 'other');
  (sections[s] ||= []).push(e);
}
console.log(`added ${added} top-starred entries`);
console.log(`total ${cat.entries.length} entries (${required} required, ${cat.entries.length - required} supplementary)`);
for (const [s, list] of Object.entries(sections).sort((a, b) => b[1].length - a[1].length)) {
  const top = list.filter((e) => e.stars).sort((a, b) => b.stars - a.stars).slice(0, 3).map((e) => `${e.id}(${Math.round(e.stars / 1000)}k)`);
  console.log(`  ${s}: ${list.length}${top.length ? ' | top: ' + top.join(', ') : ''}`);
}
