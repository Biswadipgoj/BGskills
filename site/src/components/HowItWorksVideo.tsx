// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Biswodip Goj
'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { SectionHead } from './fx';

/**
 * The walk-through, recorded from the pipeline animation: frontend → testing → security → devops → release.
 * Plays on its own, muted and looping, like part of the page; pauses when scrolled away. Reduced motion: poster only.
 */
export default function HowItWorksVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { v.removeAttribute('autoplay'); v.pause(); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) void v.play().catch(() => {}); else v.pause(); }, { threshold: 0.25 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <section id="video" className="band" aria-labelledby="video-title">
      <div className="wrap">
        <SectionHead eyebrow="How it works" title="One change, from first component to release." id="video-title">
          /dip builds the screen, proves it with the test suite, attacks it, fixes what it finds, and hands CI a release gate that only passes on evidence.
        </SectionHead>
        <motion.div className="video" initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          <video ref={ref} src="media/how-it-works.mp4" poster="media/how-it-works.jpg" autoPlay muted loop playsInline preload="auto" aria-label="Animation: /dip taking one change through frontend, testing, security and devops to a release decision" />
        </motion.div>
      </div>
    </section>
  );
}
