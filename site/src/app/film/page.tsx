// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Biswodip Goj
// The pipeline animation on its own page — the source the how-it-works MP4 is recorded from.
import type { Metadata } from 'next';
import FilmStage from './FilmStage';

export const metadata: Metadata = { title: '/dip — one change, start to finish', robots: { index: false } };

export default function FilmPage() {
  return <FilmStage />;
}
