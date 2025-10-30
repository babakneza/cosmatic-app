/** @type {import('next').NextConfig} */
const path = require('path');
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
    // === TURBOPACK CONFIGURATION ===
    // For Next.js 16+, Turbopack is the default dev compiler
    // Explicitly set turbopack root to project directory
    turbopack: {
        // Windows path resolution for Turbopack
        root: __dirname,
        // Resolve aliases for module imports
        resolveAlias: {
            '@': path.join(__dirname, 'src'),
        },
    },

    // === WEBPACK FALLBACK (for production builds) ===
    // Used when compiling for production or if Turbopack encounters issues
    webpack: (config, { isServer }) => {
        if (!config.resolve.alias) {
            config.resolve.alias = {};
        }
        config.resolve.alias['@'] = path.join(__dirname, 'src');
        return config;
    },

    // === REACT SETTINGS ===
    // Enable strict mode to catch potential issues during development
    reactStrictMode: true,

    // === SOURCE MAPS ===
    // Disable browser source maps in production for security/performance
    productionBrowserSourceMaps: false,

    // === TYPESCRIPT ===
    // Ignore TypeScript build errors in development (faster dev experience)
    // Note: Errors will still show in the IDE and browser console
    typescript: {
        ignoreBuildErrors: process.env.NODE_ENV === 'development',
    },

    // === IMAGE OPTIMIZATION ===
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'admin.buyjan.com',
                pathname: '/assets/**',
            },
            {
                protocol: 'https',
                hostname: 'admin.buyjan.com',
                pathname: '/files/**',
            },
            {
                protocol: 'https',
                hostname: 'buyjan.com',
                pathname: '/**',
            },
            // Allow local images in development
            ...(process.env.NODE_ENV === 'development' ? [
                {
                    protocol: 'http',
                    hostname: 'localhost',
                },
                {
                    protocol: 'http',
                    hostname: '127.0.0.1',
                }
            ] : []),
        ],
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [320, 375, 425, 640, 750, 828, 1080, 1200],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        // Skip optimization in development for faster rebuilds
        unoptimized: process.env.NODE_ENV === 'development',
    },

    // === CONSOLE LOGS REMOVAL ===
    // Remove console.log in production, but keep error and warn
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
    },

    // === DEVELOPMENT SERVER OPTIMIZATION ===
    // Only apply in development mode for faster page loading
    ...(process.env.NODE_ENV === 'development' && {
        onDemandEntries: {
            maxInactiveAge: 60 * 1000,  // 1 minute
            pagesBufferLength: 5,
        },
    }),
};

module.exports = withNextIntl(nextConfig);