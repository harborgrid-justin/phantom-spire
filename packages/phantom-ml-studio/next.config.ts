import type { NextConfig } from "next";
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env['ANALYZE'] === 'true',
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material', 'lodash', 'recharts', 'plotly.js'],
    // P.17: Enable Partial Prerendering for enhanced prefetch performance
    clientSegmentCache: false, // Enable when ready for production testing
  },
  // P.7: Cache configuration for prefetched content
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: process.env.NODE_ENV === 'production'
            ? 'public, max-age=300, stale-while-revalidate=300' // 5 minute TTL for prefetched content
            : 'no-cache',
        },
      ],
    },
  ],
  // External packages for server components
  serverExternalPackages: ['@phantom-spire/ml-core'],
  // Bundle analysis for server/client separation monitoring
  webpack: (config, { isServer, dev }) => {
    // Externalize server-only packages from client bundle
    if (!isServer) {
      config.externals = [
        ...config.externals,
        '@phantom-spire/ml-core',
        '@phantom-spire/xdr-core',
        // Externalize all platform-specific NAPI packages
        /@phantom-spire\/ml-core-.*/,
        /phantom-.*-core-.*/,
        // Externalize local .node files
        /^.*\.node$/,
        '../phantom-ml-core/nextgen/phantom-ml-core.win32-x64-msvc.node',
        '../phantom-xdr-core/phantom-xdr-core.win32-x64-gnu.node',
      ];
    }

    // Exclude .node files from bundling
    config.externals.push(/^.*\.node$/);
    
    // Ignore missing optional dependencies during bundling
    config.ignoreWarnings = [
      /Module not found.*@phantom-spire.*-core-.*/,
      /Module not found.*phantom-.*-core-.*/,
      /Can't resolve.*\.node$/,
      /Can't resolve.*phantom-.*-core.wasi.cjs$/,
    ];

    // Add bundle analysis in development
    if (dev && !isServer) {
      config.optimization = config.optimization || {};
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }

    return config;
  },
  // Enable static optimization
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
};

export default withBundleAnalyzer(nextConfig);
