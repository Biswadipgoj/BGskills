# Handoff — BISWODIP-GOJ-UNIFIED-ENGINEERING

_Last updated: 2026-09-27T17:54:30.058Z_

Read this first. Verify section 2 against the repository (`git status`, run the build) before trusting it, then continue from section 6.

## 1) Goal

<!-- biswodip:goal -->

Maintain the Biswodip Goj Unified Engineering system: one evidence-driven operating system for AI coding agents, installable from GitHub as a set of small skills, orchestrating five upstream projects (Taste, Emil Kowalski, No AI Slop, Headroom, Strix) under one release gate.

- **Objective:** an agent can be pointed at any repository and take it from "it runs" to "explained, verified, monitored, recoverable" — with every claim backed by a recorded command, result and artifact.
- **Acceptance criteria:**
  - `node bin/biswodip.mjs verify-package` passes with zero FAILED.
  - `node --test test/tooling.test.mjs` passes.
  - The installer clones **all five** upstream repositories, verifies each, and never duplicates what is already installed.
  - Every skill's `SKILL.md` stays under the context budget (14,000 chars ≈ 3.5k tokens).
  - The v1.2.0 material is preserved verbatim in `references/`, including all 2,215 verification gates.
  - Upstream licences and notices are never modified; attribution holds.
- **Out of scope:** modifying anything under `upstream/` by hand; certifying legal compliance; promising any software is unhackable; running security tests against targets the user has not authorized.

## 2) Current state

<!-- biswodip:state -->

<!-- biswodip:auto:start -->

> Facts below are refreshed by `biswodip handoff update`. Everything outside this block is written by hand — do not let the tool own your reasoning.

- **Branch / commit:** `release/v2.4.0` @ `bbf60fb` — Site: candy-pop redesign — lilac/pink page, plum ink, pink/yellow/mint accents, sticker cards, bouncy pill buttons, Fredoka + Nunito; fix rotating headline verb; re-record how-it-works video in the new style
- **Last commit at:** 2026-09-27T20:19:40+05:30 · unpushed commits: 0
- **Uncommitted changes:** 0

**Recent commits**

- `bbf60fb Site: candy-pop redesign — lilac/pink page, plum ink, pink/yellow/mint accents, sticker cards, bouncy pill buttons, Fredoka + Nunito; fix rotating headline verb; re-record how-it-works video in the new style`
- `fc44b68 Site: 3D depth without objects — hero terminal on a 3D stage with PLAN.md/plan.json layered behind, sections rise in with perspective (scroll-driven CSS), cards lift in 3D, lifecycle ribbon tilted into the page`
- `f982dd5 v2.4.0: working installers, lean /dip plans, 599-entry catalog, rebuilt site`
- `58057ad Refresh handoff.md for v2.3.0 and the portfolio site/catalog work`
- `3169fe7 Add capability catalog expansion and Next.js portfolio site`
- `2015740 bug fixed`
- `9cedcaa Merge pull request #1 from Biswadipgoj/claude/determined-tesla-tbxxn3`
- `8530484 Add /dip auto-planning, specialist subagents and /dip-setapi gateway`

**Evidence:** 3 commands logged in `.biswodip/evidence/commands.log`
  - `2026-09-27T12:57:22.575Z · exit=0 · 97ms · node -e process.exit(process.env.OCR_LLM_MODEL === 'ci-model' ? 0 : 1)`
  - `2026-09-27T12:57:24.795Z · exit=1 · 358ms · npm.cmd audit --json --omit=dev`
  - `2026-09-27T12:58:16.408Z · exit=1 · 644ms · npm.cmd audit --json --omit=dev`

**Gate reports**

- `.biswodip/evidence/security-gates-2026-09-27T12-57-23-591Z/report.md`
- `.biswodip/evidence/security-gates-2026-09-27T12-58-15-182Z/report.md`

**Strix runs**

- `.biswodip/evidence/strix-2026-09-27T12-57-23-436Z.json`

_Refreshed 2026-09-27T17:54:30.053Z_

<!-- biswodip:auto:end -->

- **Version:** 2.4.0 on branch `release/v2.4.0` (pushed). **Not merged into `main` yet** — until it is, the one-line installers on GitHub still serve the old, broken URL.
- **Lifecycle phase:** 13 — release; waiting on the PR merge and the site deploy.
- **Builds / tests (2026-09-27, Windows 11, Node 24):** `verify-package` → 79/84, 0 FAILED. `npm test` → 55 pass, 0 fail, 4 skipped (snapshot-dependent; skip reason printed). Site: `tsc --noEmit` clean, `next build` ≈30 s, `npm audit` 0 vulnerabilities.
- **Verified by running (this session):** real pinned installs via `install.ps1`, piped `install.sh` and the CLI into scratch projects; `/dip plan` from the installed skill; every step of the main CI job run locally (all pass, incl. security gates); site checked in Chrome — 59 fps scroll benchmark, no console messages, video autoplays muted/looping.
- **UNVERIFIED:** CI on GitHub for this branch (not observed); macOS/Linux runs of `install.sh` (tested under Git Bash only); `shellcheck`/PSScriptAnalyzer (not installed here).
- **BLOCKED:** nothing.
- **OPEN:** merge the PR; deploy the site (`site/vercel.json`); the catalog import's area labels come from GitHub topics, so a few entries are filed oddly (e.g. `ohmyzsh` under planning).

## 3) Active files

<!-- biswodip:files -->

| File | Role | State |
|---|---|---|
| `MASTER-PROMPT.md` | The operating system, §0–§43. Canonical source of the router skill. | Stable — edit here, never in `skills/` |
| `skills-src/*.md` | Body of each of the 7 skills (frontmatter is generated). | Stable |
| `scripts/lib/skills.mjs` | Skill catalogue: which files each skill carries, budget check. | Stable |
| `scripts/lib/core.mjs` | Detect / install / verify engine — clone, retries, pinning, snapshot fallback, lock file. | Stable |
| `scripts/lib/gates.mjs` | Secret rules, risk heuristics, dependency audits, evidence output. | Stable |
| `scripts/lib/strix.mjs` | Guarded pentest runner (target guard, `run.json` verdict). | Stable |
| `scripts/lib/handoff.mjs` | This file's tooling. | New in 2.1.0 |
| `integrations/manifest.json` | Pinned commits, expected paths, skill lists, install strategies. | Regenerate with `refresh-snapshots` |
| `upstream/**` | Exact vendored snapshots of 5 repos. | **Do not edit.** Regenerate only |
| `references/01–06` | v1.2.0 content, verbatim. | **Do not rewrite.** Add, don't replace |

## 4) Changes made

<!-- biswodip:changes -->

1. **v2.0.0 — rebuilt from v1.2.0.** Merged the master operating prompt with the old 531 KB `SKILL.md`; split that file verbatim into `references/01–06` (line-by-line check: every non-empty line survives, 2,215 gates intact); added §41 AI/LLM security, §42 agent self-safety, §43 writing quality.
2. Built `lifecycle/00–13`, `security/` (6 deep-dives), `reports/` (7 templates), `integrations/` (5 briefs + manifest + guarded Strix runner).
3. Vendored all five upstream repos into `upstream/` via `git archive` at recorded commits; tree hashes in `upstream/SNAPSHOTS.json`.
4. Wrote the tooling: `bin/biswodip.mjs` + `scripts/lib/*` (detect, install, verify, gates, strix, package verify, snapshot refresh) and `.sh`/`.ps1`/`.mjs` entry points for the four scripts.
5. Relicensed from MIT to **Apache-2.0 under Biswodip Goj**, added `NOTICE`, corrected `THIRD-PARTY-NOTICES.md` (v1.2.0 wrongly claimed Emil Kowalski's repo had no licence — it is MIT).
6. Fixed v1.2.0 defects: missing YAML frontmatter, `citeturn0view0` corruption, literal `\n` escapes, duplicate section numbers, a reference to a `run-local-pentest.ps1` that did not exist, automatic `npm install` into the user's project, no retries or verification in the installer, a stale `.tgz` inside the package.
7. **v2.1.0 — context surgery.** Split the monolith into 7 GitHub-installable skills; the router's `SKILL.md` went from ~12,900 to ~1,365 tokens on trigger (−89%). Added `handoff.md` tooling, `docs/GITHUB.md`, `docs/CONTEXT-BUDGET.md`, and a per-skill budget check in `verify-package`.
8. Evidence: `.biswodip/evidence/` in any project the tooling runs against; the build ran `verify-package`, `node --test`, a live pinned install, an offline install, and the Strix guard checks.
9. **v2.2.0 / v2.3.0 — distribution + orchestration.** Added the `/dip` entry layer and installers (v2.2.0), then auto-planning, specialist subagents and the `/dip-setapi` LLM gateway (v2.3.0). See `CHANGELOG.md`.
10. **Portfolio site + catalog expansion (2026-09-26, commit `3169fe7`).** Expanded `integrations/catalog.json` with 44 top-starred repos (89 capabilities, 45 required) via `scripts/add-top-starred.mjs`; the catalog is the single source of truth. `scripts/generate-site-capabilities.mjs` → `site/src/data/capabilities.ts` → `scripts/wire-site-capabilities.mjs` wires it into `site/src/app/page.tsx`. Added the Next.js site under `site/` (React 18, framer-motion, three.js, Tailwind; 3D visuals; static export). Catalog + scripts propagated to all 7 `skills/biswodip-*` mirrors. `.kilo/` (Kilo Code worktree metadata) is now gitignored.
11. **v2.4.0 (2026-09-27, branch `release/v2.4.0`).** Installers pointed at the real repo (they cloned a non-existent `BISWODIP-GOJ-UNIFIED-ENGINEERING`); `npx … dip install` works (leading `dip` accepted); installs are pinned by default (`--latest` for HEAD); `install.ps1` is `irm | iex`-safe and ASCII-only. Planner core moved to `scripts/lib/plan-core.mjs` (shared with the site; drift test guards the copy): no mobile agent for web goals, one pick per `group`, ideas only for vague goals. Catalog 89 → 599 via `scripts/import-github-catalog.mjs` (510 real repos ≥20k stars, `catalogOnly` = used only when named). Design skill + frontend/mobile agents: visuals must show the product. CI: snapshot tests skip with a reason, live pinned install, gates exclude only `test/tooling.test.mjs` fixtures. Site rebuilt (candy-pop design, live `/dip` terminal, autoplay video recorded from `/film`, planner, lifecycle, release gate, catalog); Next 16 / React 19; three.js removed; `wire-site-capabilities.mjs` deleted.

## 5) Failed attempts

<!-- biswodip:failed -->

- **`node --test test/` and bare `node --test`** — the first failed with `MODULE_NOT_FOUND` on Node 22; the second auto-discovered `upstream/headroom/sdk/typescript/test/**` and tried to run vendored Vitest suites (34 failures that were not ours). Fixed by naming the file: `node --test test/tooling.test.mjs`. If you add a test file, add it to the `test` script explicitly — do not go back to directory discovery.
- **`rsync` for the upstream snapshots** — not installed in the build container. `git archive HEAD | tar -x` is better anyway: it exports exactly the tracked files at the commit, with no `.git` and no local dirt.
- **Checking the `skills` CLI flags from npm** — `npm view skills` returns `403 Forbidden` behind the proxy. Read the flags from the `vercel-labs/skills` README instead. Do not assume registry access exists.
- **Delivering the full 42.8 MB zip in chat** — rejected, 30 MiB limit. Now shipped as a 396 KB core build plus two split parts; `scripts/lib/package.mjs` understands an `upstream/.snapshots-omitted` marker so the core build still verifies honestly instead of reporting FAILED.
- **PowerShell validation** — no `pwsh` in the container and it cannot be installed through the proxy. Left as `UNVERIFIED` rather than assumed-good; the CI matrix parses the `.ps1` files on Windows.
- **Installing `headroom-ai` automatically when a `package.json` exists** (inherited from v1.2.0) — that silently mutates the user's dependencies. Removed; now opt-in behind `--with-headroom-sdk`.
- **Scanning everything under `.claude/skills` in the gates** — 36 vendored skills produced hint noise that buried the real planted finding. Those directories are now excluded unless `--include-skills` is passed.
- **Site design churn (2026-09-27)** — kraft, periwinkle, multi-spectrum, teal/apricot, teal/mint and warm/cool palettes were each rejected; a full-page WebGL fly-through read as "a weird object". The owner picked **candy pop** from previews — ask with previews before the next redesign instead of guessing.
- **Site jank** — 75 `backdrop-filter` surfaces + animated conic borders + `background-attachment: fixed` gave ~5 fps scrolling. Keep motion to transform/opacity; no per-frame repaints.
- **Recording video with Playwright** — `recordVideo` needs Playwright's own ffmpeg; install it with `PLAYWRIGHT_BROWSERS_PATH=<scratch> npx playwright-core install ffmpeg`, encode with `ffmpeg-static`. Serve a *copy* of `site/out` — a server on `out/` locks it and breaks `next build` (EBUSY).

## 6) Next steps

<!-- biswodip:next -->

0. **Rename the GitHub repo to `BGskills` first** (Settings → General → Repository name). All links, installers and the Pages base path already use `Biswadipgoj/BGskills`; GitHub redirects old → new, never the reverse, so merging before the rename breaks the one-liners. Then enable Pages: Settings → Pages → Source: GitHub Actions (`.github/workflows/pages.yml`).
1. **Merge `release/v2.4.0` into `main`** (PR: github.com/Biswadipgoj/BGskills/pull/new/release/v2.4.0) and confirm CI is green there; then `curl …/install.sh | bash` in an empty folder to prove the public one-liner.
2. **Deploy the site.** `site/` builds a static export (`npm run build` → `site/out`, `vercel.json` present). When the catalog changes: edit `integrations/catalog.json` (or `npm run catalog:import`), then `node scripts/generate-site-capabilities.mjs .` — never hand-edit `site/src/data/*`. To re-record the video, run the `/film` page and record it (see §5).
3. **Verify the install path from GitHub** in a scratch project: `npx skills add Biswadipgoj/BGskills`, then confirm the skill folders appear in `.claude/skills` and the router triggers by description.
4. **Run the Windows leg** once: `scripts\install-integrations.ps1 -Root .` and `integrations\strix\run-local-pentest.ps1 -DryRun` on a real Windows host, then move PowerShell parsing from UNVERIFIED to VERIFIED.
5. **Exercise Strix end to end** on a disposable local app with Docker running and `STRIX_LLM` / `LLM_API_KEY` set — confirm `run.json` classification for a findings run (exit 2) and a clean one.
6. **Refresh upstream** before any release: `node bin/biswodip.mjs refresh-snapshots` then `verify-package`. Never refresh immediately before shipping.

---

_Maintained with the Biswodip Goj Unified Engineering system (`biswodip handoff update`). No secrets in this file — reference the environment variable name instead._
