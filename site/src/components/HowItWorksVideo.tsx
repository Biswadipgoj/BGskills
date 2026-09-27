// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Biswodip Goj
'use client';

import { SectionHead } from './fx';
import PipelineFilm from './PipelineFilm';

/**
 * How it works: the pipeline animation (frontend → testing → security → devops → release), rendered live on the
 * page and looping — no media file to load, no autoplay policy to trip over, sharp at any size. It starts when it
 * scrolls into view and pauses when it leaves. The same animation is recorded to media/how-it-works.mp4 for sharing.
 */
export default function HowItWorksVideo() {
  return (
    <section id="how" className="band" aria-labelledby="how-title">
      <div className="wrap">
        <SectionHead eyebrow="How it works" title="One change, from first component to release." id="how-title">
          /dip builds the screen, proves it with the test suite, attacks it, fixes what it finds, and hands CI a release gate that only passes on evidence.
        </SectionHead>
        <PipelineFilm embed />
      </div>
    </section>
  );
}
