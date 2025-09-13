import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enterprise security headers
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' ws: wss:; frame-ancestors 'none';"
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          }
        ]
      }
    ]
  },

  // Environment-specific configuration
  env: {
    ENTERPRISE_MODE: process.env.ENTERPRISE_MODE || 'true',
    MULTI_TENANT_ENABLED: process.env.MULTI_TENANT_ENABLED || 'true',
    AUDIT_LOGGING_ENABLED: process.env.AUDIT_LOGGING_ENABLED || 'true',
    COMPLIANCE_FRAMEWORK: process.env.COMPLIANCE_FRAMEWORK || 'SOC2',
    ENCRYPTION_ENABLED: process.env.ENCRYPTION_ENABLED || 'true',
    HA_MODE: process.env.HA_MODE || 'true'
  },

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false
  },

  // Experimental features for enterprise
  experimental: {
    serverComponentsExternalPackages: ['phantom-ml-core'],
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js'
        }
      }
    }
  },

  // Output configuration for containerization
  output: process.env.DOCKER_BUILD ? 'standalone' : undefined,

  // Image optimization for enterprise deployment
  images: {
    domains: ['localhost', 'phantom-ml.enterprise.com'],
    minimumCacheTTL: 60,
    formats: ['image/webp', 'image/avif']
  },

  // Webpack configuration for enterprise features
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          },
          mui: {
            test: /[\\/]node_modules[\\/]@mui[\\/]/,
            name: 'mui',
            chunks: 'all'
          }
        }
      }
    }

    // Enterprise security configurations
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer')
    }

    return config
  },

  // Redirect configuration for enterprise deployment
  redirects: async () => {
    return [
      {
        source: '/admin',
        destination: '/enterprise/admin',
        permanent: false
      },
      {
        source: '/compliance',
        destination: '/enterprise/compliance',
        permanent: false
      }
    ]
  },

  // Rewrites for API routing in enterprise mode
  rewrites: async () => {
    return [
      {
        source: '/api/v1/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL + '/api/v1/:path*'
      },
      {
        source: '/api/enterprise/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL + '/api/enterprise/:path*'
      }
    ]
  },

  // TypeScript configuration
  typescript: {
    // Strict type checking in production
    ignoreBuildErrors: false
  },

  // ESLint configuration
  eslint: {
    // Strict linting in enterprise mode
    ignoreDuringBuilds: false
  },

  // PoweredByHeader disabled for security
  poweredByHeader: false,

  // Compression enabled for performance
  compress: true,

  // Generate etags for caching
  generateEtags: true,

  // HTTP keep alive timeout
  httpAgentOptions: {
    keepAlive: true,
    keepAliveMsecs: 1000
  }
}

export default nextConfig