#!/usr/bin/env bash
# SPDX-License-Identifier: Apache-2.0
# Copyright (c) 2026 Biswodip Goj — Biswodip Goj Unified Engineering
#
# One-command install into any project.
#
#   curl -fsSL https://raw.githubusercontent.com/Biswadipgoj/BISWODIP-ENGINEERING-skills/main/install.sh | bash
#   curl -fsSL …/install.sh | bash -s -- /path/to/project --latest
#   bash install.sh /path/to/project
#
# Installs: 8 skills + /dip commands + @dip agents, and clones the five upstream projects at their
# pinned, reviewed commits (pass --latest for upstream HEAD). Nothing is added to your package.json.
set -euo pipefail

REPO="${BISWODIP_REPO:-https://github.com/Biswadipgoj/BISWODIP-ENGINEERING-skills.git}"
HOME_DIR="${BISWODIP_HOME:-$HOME/.biswodip-goj-unified-engineering}"
TARGET="."
ARGS=()
while [ $# -gt 0 ]; do
  case "$1" in
    --only|--agent|--retries|--from-snapshot) [ $# -ge 2 ] || { echo "$1 needs a value" >&2; exit 2; }; ARGS+=("$1" "$2"); shift 2 ;;
    -*) ARGS+=("$1"); shift ;;
    *) TARGET="$1"; shift ;;
  esac
done

say()  { printf '\033[36m›\033[0m %s\n' "$1"; }
warn() { printf '\033[33m!\033[0m %s\n' "$1" >&2; }
die()  { printf '\033[31m✖\033[0m %s\n' "$1" >&2; exit 1; }

command -v git  >/dev/null 2>&1 || die "git is required (https://git-scm.com)."
command -v node >/dev/null 2>&1 || die "Node.js >= 18.17 is required (https://nodejs.org)."
node -e 'const [a,b]=process.versions.node.split(".").map(Number);process.exit(a>18||(a===18&&b>=17)?0:1)' \
  || die "Node.js >= 18.17 is required — found $(node -v)."
[ -d "$TARGET" ] || die "target directory not found: $TARGET"

# BASH_SOURCE is empty when piped from curl — then there is no local copy and we use the managed clone.
SELF="${BASH_SOURCE[0]:-}"
if [ -n "$SELF" ] && [ -f "$(dirname "$SELF")/bin/biswodip.mjs" ]; then
  PKG="$(cd "$(dirname "$SELF")" && pwd)"                       # running from a clone or an unzipped copy
elif [ -d "$HOME_DIR/.git" ]; then
  say "updating $HOME_DIR"
  git -C "$HOME_DIR" pull --quiet --ff-only || warn "could not update $HOME_DIR (offline or local changes) — using the copy already there"
  PKG="$HOME_DIR"
elif [ -e "$HOME_DIR" ]; then
  die "$HOME_DIR exists but is not a git clone — move it aside or set BISWODIP_HOME to another folder."
else
  say "cloning $REPO → $HOME_DIR"
  git clone --quiet --depth 1 "$REPO" "$HOME_DIR" || die "could not clone $REPO — check your network, or set BISWODIP_REPO."
  PKG="$HOME_DIR"
fi

TARGET="$(cd "$TARGET" && pwd)"
say "installing into $TARGET"
node "$PKG/bin/biswodip.mjs" install --root "$TARGET" "${ARGS[@]+"${ARGS[@]}"}" \
  || die "install did not finish cleanly — the INTEGRATION RECORD above says which step failed. Re-running is safe."
printf '\n\033[32m✔\033[0m Ready. Open Claude Code in \033[1m%s\033[0m and run \033[1m/dip <your goal>\033[0m (or \033[1m@dip\033[0m).\n' "$TARGET"
