import type { NextConfig } from "next";
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import CompressionPlugin from 'compression-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';

const isDev = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';
const analyzeBundle = process.env.ANALYZE === 'true';

const nextConfig: NextConfig = {
  // Performance optimizations
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // Enable SWC minification for production
  swcMinify: true,

  // Optimize production builds
  productionBrowserSourceMaps: false,

  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@mui/material', '@mui/icons-material', 'lodash', 'recharts', 'plotly.js'],
    scrollRestoration: true,
    webpackBuildWorker: true,
    parallelServerCompiles: true,
    parallelServerBuildTraces: true,
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  },

  // Compiler options for better performance
  compiler: {
    removeConsole: !isDev && !isTest ? { exclude: ['error', 'warn'] } : false,
    reactRemoveProperties: !isDev && !isTest,
  },

  // Disable ESLint during build for now
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript checking during build for now
  typescript: {
    ignoreBuildErrors: true,
  },

  // Advanced webpack configuration for performance and module handling
  webpack: (config, { isServer, dev }) => {
    // Performance optimizations for production
    if (!dev) {
      // Optimize bundle splitting
      config.optimization = {
        ...config.optimization,
        minimize: true,
        minimizer: [
          new TerserPlugin({
            terserOptions: {
              compress: {
                drop_console: !isTest,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info'],
              },
              mangle: {
                safari10: true,
              },
              format: {
                comments: false,
              },
            },
            extractComments: false,
          }),
        ],
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|next)[\\/]/,
              priority: 40,
              enforce: true,
            },
            mui: {
              name: 'mui',
              test: /[\\/]node_modules[\\/]@mui[\\/]/,
              chunks: 'all',
              priority: 35,
              reuseExistingChunk: true,
            },
            charts: {
              name: 'charts',
              test: /[\\/]node_modules[\\/](recharts|plotly\.js|d3|@mui\/x-charts)[\\/]/,
              chunks: 'all',
              priority: 30,
              reuseExistingChunk: true,
            },
            ml: {
              name: 'ml',
              test: /[\\/]node_modules[\\/](@huggingface|ml-|@tensorflow)[\\/]/,
              chunks: 'all',
              priority: 25,
              reuseExistingChunk: true,
            },
            commons: {
              name: 'commons',
              chunks: 'all',
              minChunks: 2,
              priority: 20,
              reuseExistingChunk: true,
            },
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name(module: any) {
                const packageName = module.context.match(
                  /[\\/]node_modules[\\/](.*?)(?:[\\/]|$)/
                )?.[1];
                return `npm.${packageName?.replace('@', '')}`;
              },
              priority: 10,
              minChunks: 1,
              reuseExistingChunk: true,
            },
          },
        },
        runtimeChunk: {
          name: 'runtime',
        },
        moduleIds: 'deterministic',
      };

      // Add compression plugin
      config.plugins.push(
        new CompressionPlugin({
          filename: '[path][base].gz',
          algorithm: 'gzip',
          test: /\.(js|css|html|svg|json)$/,
          threshold: 8192,
          minRatio: 0.8,
        })
      );
    }

    // Bundle analyzer for optimization insights
    if (analyzeBundle && !isServer) {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: './analyze/client.html',
          openAnalyzer: false,
        })
      );
    }
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

      // Exclude phantom-ml-core from client bundle completely
      config.externals = config.externals || [];
      config.externals.push('@phantom-spire/ml-core');
      config.externals.push('@phantom-spire/ml-core-win32-x64-msvc');
      config.externals.push('../phantom-ml-core/index.js');
      config.externals.push('../phantom-ml-core/nextgen/index.js');
      config.externals.push('../phantom-ml-core/nextgen/phantom-ml-core.win32-x64-msvc.node');
      config.externals.push(/^.*\.node$/);
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

  // Headers for security and caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects for better routing
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
