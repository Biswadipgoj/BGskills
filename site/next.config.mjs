// SPDX-License-Identifier: Apache-2.0
// Copyright (c) 2026 Biswodip Goj
// NEXT_PUBLIC_BASE_PATH is set by the GitHub Pages workflow (the site lives at /<repo>/ there);
// local builds and Vercel leave it empty and serve from /.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
