// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Biswodip Goj
import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Sans_Condensed, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const sans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-sans', display: 'swap' });
const display = IBM_Plex_Sans_Condensed({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-display', display: 'swap' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'Biswodip Goj Unified Engineering — /dip for Claude Code',
  description:
    'Eight Claude Code skills, a /dip command and specialist agents that plan the work, build it, attack it, and hold the release until every claim has a command, a result and an artifact behind it.',
  keywords: ['claude code', 'skills', 'release gate', 'security review', 'pentest', 'evidence'],
};

export const viewport: Viewport = { themeColor: '#cdbb90' };

const favicon =
  "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect x='2' y='2' width='28' height='28' rx='4' fill='%23e6dab9' stroke='%231f1a12' stroke-width='3'/><text x='16' y='21' text-anchor='middle' font-family='monospace' font-weight='700' font-size='12' fill='%231f1a12'>dip</text></svg>";

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
