// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Biswodip Goj
import type { Metadata, Viewport } from 'next';
import { Fredoka, Nunito, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const sans = Nunito({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-sans', display: 'swap' });
const display = Fredoka({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-display', display: 'swap' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'Biswodip Goj Unified Engineering — /dip for Claude Code',
  description:
    'Eight Claude Code skills, a /dip command and specialist agents that plan the work, build it, attack it, and hold the release until every claim has a command, a result and an artifact behind it.',
  keywords: ['claude code', 'skills', 'release gate', 'security review', 'pentest', 'evidence'],
};

export const viewport: Viewport = { themeColor: '#c9b8f0' };

const favicon =
  "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect x='2' y='2' width='28' height='28' rx='9' fill='%23ffd23f' stroke='%231b1340' stroke-width='3'/><text x='16' y='21' text-anchor='middle' font-family='monospace' font-weight='700' font-size='12' fill='%231b1340'>dip</text></svg>";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <head>
        <link rel="icon" href={favicon} />
      </head>
      <body>{children}</body>
    </html>
  );
}
