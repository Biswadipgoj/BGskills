'use client';

// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Biswodip Goj
// CSS 3D rotating cube — one face per upstream integration, auto-rotating with a
// hover pause and an active-face highlight. Pure CSS transforms, no JavaScript
// animation loop. Technique adapted from the CSS-3D cube idea in 3D-Web-Prompts.

import { useState } from 'react';

const FACES = [
  { label: 'Taste', sub: 'MIT · design', color: '#f472b6' },
  { label: 'Emil', sub: 'MIT · motion', color: '#22d3ee' },
  { label: 'Slop', sub: 'MIT · copy', color: '#22c55e' },
  { label: 'Headroom', sub: 'Apache · context', color: '#6366f1' },
  { label: 'Strix', sub: 'Apache · pentest', color: '#f59e0b' },
  { label: 'dip', sub: 'router', color: '#94a3b8' },
];

export default function IntegrationCube({ size = 150 }: { size?: number }) {
  const [paused, setPaused] = useState(false);
  const half = size / 2;
  const depth = size;

  const transforms = [
    `rotateY(0deg) translateZ(${half}px)`,
    `rotateY(90deg) translateZ(${half}px)`,
    `rotateY(180deg) translateZ(${half}px)`,
    `rotateY(-90deg) translateZ(${half}px)`,
    `rotateX(90deg) translateZ(${half}px)`,
    `rotateX(-90deg) translateZ(${half}px)`,
  ];

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0 2rem' }}>
      <style>{`
        @keyframes cube-spin {
          0%   { transform: rotateX(-18deg) rotateY(0deg); }
          100% { transform: rotateX(-18deg) rotateY(360deg); }
        }
      `}</style>
      <div style={{ perspective: 900, width: size, height: size }}>
        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          style={{
            position: 'relative',
            width: size,
            height: size,
            transformStyle: 'preserve-3d',
            animation: 'cube-spin 22s linear infinite',
            animationPlayState: paused ? 'paused' : 'running',
          }}
        >
          {FACES.map((f, i) => (
            <div
              key={f.label}
              style={{
                position: 'absolute',
                inset: 0,
                transform: transforms[i],
                background: `linear-gradient(150deg, ${f.color}22, rgba(15,27,46,0.94))`,
                border: `1px solid ${f.color}55`,
                borderRadius: 12,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                backfaceVisibility: 'hidden',
              }}
            >
              <span className="mono" style={{ fontSize: '0.82rem', fontWeight: 600, color: f.color }}>{f.label}</span>
              <span className="mono" style={{ fontSize: '0.55rem', color: 'var(--dim)', letterSpacing: '0.08em' }}>{f.sub}</span>
            </div>
          ))}
        </div>
      </div>
      <span style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', fontSize: '0.58rem', color: 'var(--dim)', letterSpacing: '0.16em', whiteSpace: 'nowrap' }} className="mono">
        {paused ? 'paused' : 'six faces · five upstream + the router'}
      </span>
    </div>
  );
}
