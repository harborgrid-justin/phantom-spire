import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Webpack configuration to handle NAPI modules properly
  webpack: (config, { isServer }) => {
    // Exclude NAPI modules from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
      };

      // Exclude phantom-ml-core from client bundle
      config.externals = config.externals || [];
      config.externals.push('@phantom-spire/ml-core');
      config.externals.push('../phantom-ml-core/index.js');
    }

    // Handle node: protocol imports
    config.resolve.alias = {
      ...config.resolve.alias,
      'node:fs': 'fs',
      'node:path': 'path',
      'node:os': 'os',
      'node:crypto': 'crypto',
      'node:stream': 'stream',
      'node:buffer': 'buffer',
      'node:util': 'util',
      'node:module': false,
    };

    // Ignore warnings from phantom-ml-core
    config.ignoreWarnings = [
      /phantom-ml-core/,
      /Critical dependency: the request of a dependency is an expression/,
    ];

    return config;
  },

  // External packages for server components
  serverExternalPackages: ['@phantom-spire/ml-core'],

  // Output file tracing to handle the lockfile warning
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
