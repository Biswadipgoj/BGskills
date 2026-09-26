// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Biswodip Goj
// Rewrites the REPOS + category blocks in site/src/app/page.tsx to use the
// generated capability data (single source of truth: integrations/catalog.json).

import fs from 'node:fs';

const p = 'site/src/app/page.tsx';
let c = fs.readFileSync(p, 'utf8');

const start = c.indexOf('const REPOS = [');
const end = c.indexOf('];', start) + 2;
if (start === -1) throw new Error('REPOS block not found');

const replacement = `const REPOS = CAPABILITIES.map((cap) => ({
  id: cap.id,
  name: cap.name,
  color: CAPABILITY_COLOR[cap.section],
  desc: cap.desc,
  section: cap.section,
  required: cap.required,
  stars: cap.stars,
}));`;

c = c.slice(0, start) + replacement + c.slice(end);

// Replace category block
const cStart = c.indexOf('const REPO_CATEGORY');
const cEnd = c.indexOf('];', c.indexOf('const REPO_CATEGORIES')) + 2;
if (cStart === -1) throw new Error('category block not found');

const catReplacement = `const REPO_CATEGORIES: { label: string; key: string }[] = [
  { label: 'All', key: 'all' },
  ...CAPABILITY_SECTIONS.map((s) => ({ label: CAPABILITY_LABEL[s], key: s })),
];`;

c = c.slice(0, cStart) + catReplacement + c.slice(cEnd);

// Add the data import after the framer-motion import
c = c.replace(
  "import { motion, useInView, AnimatePresence } from 'framer-motion';",
  "import { motion, useInView, AnimatePresence } from 'framer-motion';\nimport {\n  CAPABILITIES,\n  CAPABILITY_COLOR,\n  CAPABILITY_LABEL,\n  CAPABILITY_SECTIONS,\n  CAPABILITY_TOTAL,\n  CAPABILITY_REQUIRED,\n} from '@/data/capabilities';"
);

fs.writeFileSync(p, c);
console.log('page.tsx updated to use generated capability data');
