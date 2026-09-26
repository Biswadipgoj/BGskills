// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Biswodip Goj
import fs from 'node:fs';

const read = (p) => fs.readFileSync(p, 'utf8');
const write = (p, c) => fs.writeFileSync(p, c);

// Cinematic → brand palette
let c = read('src/components/Cinematic.tsx');
c = c.replace("background: 'linear-gradient(90deg, #c9a961, #3fb8af, #6b7fd7)'", "background: 'linear-gradient(90deg, #22d3ee, #6366f1)'");
c = c.replace(/rgba\(201,169,97,0\.9\)/g, 'rgba(34,211,238,0.9)');
c = c.replace(/rgba\(63,184,175,0\.5\)/g, 'rgba(99,102,241,0.55)');
c = c.replace("background: '#c9a961'", "background: '#22d3ee'");
c = c.replace("boxShadow: '0 0 12px #c9a961'", "boxShadow: '0 0 12px #22d3ee'");
c = c.replace("border: '1px solid rgba(63,184,175,0.5)'", "border: '1px solid rgba(99,102,241,0.55)'");
write('src/components/Cinematic.tsx', c);

// CapabilityGraph3D
let g = read('src/components/CapabilityGraph3D.tsx');
g = g.replace('browser: 0x3fb8af', 'browser: 0x22d3ee')
     .replace('animation: 0x6b7fd7', 'animation: 0x6366f1')
     .replace('design: 0xa8607a', 'design: 0xf472b6')
     .replace('backend: 0x7f8ca8', 'backend: 0x2dd4bf')
     .replace('security: 0xb87352', 'security: 0x22c55e')
     .replace('quality: 0xc9a961', 'quality: 0xf59e0b')
     .replace(/0x0a0a0f/g, '0x0b1220')
     .replace(/0x3a3a55/g, '0x334155');
write('src/components/CapabilityGraph3D.tsx', g);

// LifecycleTunnel
let t = read('src/components/LifecycleTunnel.tsx');
t = t.replace(/0x04050a/g, '0x0b1220')
     .replace(/0x6b7fd7/g, '0x6366f1')
     .replace(/0xc9a961/g, '0x22d3ee')
     .replace(/0x3fb8af/g, '0x22c55e')
     .replace(/0x7f8ca8/g, '0x94a3b8')
     .replace(/rgba\(4, 5, 10, 0\.6\)/g, 'rgba(15, 27, 46, 0.6)');
write('src/components/LifecycleTunnel.tsx', t);

// IntegrationCube
let i = read('src/components/IntegrationCube.tsx');
i = i.replace("color: '#a8607a'", "color: '#f472b6'")
     .replace("color: '#c9a961'", "color: '#22d3ee'")
     .replace("color: '#3fb8af'", "color: '#22c55e'")
     .replace("color: '#6b7fd7'", "color: '#6366f1'")
     .replace("color: '#b87352'", "color: '#f59e0b'")
     .replace("color: '#7f8ca8'", "color: '#94a3b8'")
     .replace(/rgba\(8,10,18,0\.92\)/g, 'rgba(15,27,46,0.94)');
write('src/components/IntegrationCube.tsx', i);

// ScrollEffects blur wording stays; nothing to change
console.log('palette updated across components');
