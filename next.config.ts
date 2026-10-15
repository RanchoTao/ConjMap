import type { NextConfig } from 'next';
const staticSite = process.env.CONJMAP_STATIC_EXPORT === '1';
const config: NextConfig = {
  poweredByHeader: false,
  turbopack: { root: process.cwd() },
  ...(staticSite
    ? {
        output: 'export' as const,
        basePath: '/ConjMap',
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
};
export default config;
