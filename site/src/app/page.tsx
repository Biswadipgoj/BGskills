// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Biswodip Goj
'use client';

import { MotionConfig } from 'framer-motion';
import InstallHero from '@/components/InstallHero';
import Planner from '@/components/Planner';
import Lifecycle from '@/components/Lifecycle';
import ReleaseGate from '@/components/ReleaseGate';
import { Catalog, Commands, Cta, Footer, Header, LifecycleRibbon, Stats, Upstreams } from '@/components/Sections';
import { SmoothScroll } from '@/components/fx';
import HowItWorksVideo from '@/components/HowItWorksVideo';

export default function Home() {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll />
      <div className="mesh" aria-hidden />
      <Header />
      <main id="main">
        <InstallHero />
        <LifecycleRibbon />
        <HowItWorksVideo />
        <Stats />
        <Planner />
        <Lifecycle />
        <ReleaseGate />
        <Upstreams />
        <Catalog />
        <Commands />
        <Cta />
      </main>
      <Footer />
    </MotionConfig>
  );
}
