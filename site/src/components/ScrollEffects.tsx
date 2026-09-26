'use client';

// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Biswodip Goj
// Scroll choreography for the space journey.
//
// ZoomSection wraps each section of the page: as it enters the viewport it scales
// up from deep space, sharpens, and settles — so every scroll reads as an object
// travelling toward you. ScrollReveal staggers the children inside it.

import { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

export function ZoomSection({
  id,
  eyebrow,
  title,
  lead,
  children,
}: {
  id?: string;
  eyebrow?: string;
  title?: React.ReactNode;
  lead?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  // Enter from depth: small and far → full size, then recede slightly as it leaves.
  const scale = useTransform(scrollYProgress, [0, 0.35, 0.72, 1], [0.82, 1, 1, 0.94]);
  const opacity = useTransform(scrollYProgress, [0, 0.28, 0.75, 1], [0, 1, 1, 0.25]);
  const z = useTransform(scrollYProgress, [0, 0.35, 0.72, 1], [-140, 0, 0, -80]);
  const blur = useTransform(scrollYProgress, [0, 0.3, 0.78, 1], [6, 0, 0, 5]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);

  return (
    <section
      id={id}
      ref={ref}
      style={{ padding: '7rem 2rem', maxWidth: 1240, margin: '0 auto', position: 'relative', zIndex: 2, perspective: 1200 }}
    >
      <motion.div style={{ scale, opacity, z, filter, transformStyle: 'preserve-3d', willChange: 'transform, opacity, filter' }}>
        {(eyebrow || title) && (
          <header style={{ marginBottom: '2.6rem', maxWidth: 760 }}>
            {eyebrow && <div className="section-label">{eyebrow}</div>}
            {title && <h2 className="text-3xl md:text-5xl" style={{ marginBottom: lead ? '0.9rem' : 0 }}>{title}</h2>}
            {lead && <p style={{ color: 'var(--muted)', fontSize: '0.92rem', lineHeight: 1.7, maxWidth: 680 }}>{lead}</p>}
          </header>
        )}
        {children}
      </motion.div>
    </section>
  );
}

export function ScrollReveal({
  children,
  delay = 0,
  y = 26,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y, filter: 'blur(5px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ height: '100%' }}
    >
      {children}
    </motion.div>
  );
}
