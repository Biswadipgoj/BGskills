// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Biswodip Goj
'use client';

import { useState } from 'react';
import {
  BadgeCheck, Bug, ClipboardList, CodeXml, Download, Gauge, Palette, Rocket, Scale, ScanSearch, ShieldAlert, ShieldCheck, Swords, Wrench,
  type LucideIcon,
} from 'lucide-react';

/** One icon per lifecycle phase, in lifecycle/00–13 order. */
export const PHASE_ICON: Record<string, LucideIcon> = {
  '00': Download, '01': ClipboardList, '02': ScanSearch, '03': ShieldAlert, '04': CodeXml, '05': BadgeCheck, '06': Palette,
  '07': Gauge, '08': ShieldCheck, '09': Bug, '10': Wrench, '11': Swords, '12': Scale, '13': Rocket,
};

/** GitHub's own mark (Octicons, MIT) — lucide no longer ships brand icons. */
export function GithubMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

/** The real GitHub avatar of a repository's owner; a monogram if it cannot load (offline, blocked). */
export function OwnerAvatar({ repo, size = 32, className }: { repo: string; size?: number; className?: string }) {
  const owner = repo.replace(/^https:\/\/github\.com\//, '').split('/')[0] || '?';
  const [failed, setFailed] = useState(false);
  if (failed) return <span className={`avatar avatar--mono ${className || ''}`} style={{ width: size, height: size }} aria-hidden>{owner.slice(0, 2)}</span>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={`avatar ${className || ''}`} src={`https://github.com/${owner}.png?size=${size * 2}`} width={size} height={size} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
  );
}
