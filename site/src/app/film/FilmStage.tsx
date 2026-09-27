// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Biswodip Goj
'use client';

import { MotionConfig } from 'framer-motion';
import PipelineFilm from '@/components/PipelineFilm';

export default function FilmStage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="mesh" aria-hidden />
      <main className="film-page">
        <PipelineFilm />
      </main>
    </MotionConfig>
  );
}
