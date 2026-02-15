/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tell Next.js to target modern JS
  experimental: {
    esmExternals: true, // ES Modules for external packages
  },

  // Turbopack rules (your SVG setup)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Next.js optimizations
  compiler: {
    // Only needed if using styled-components or emotion
    styledComponents: true,
  },

  swcMinify: true, // faster JS minification, smaller payload
  reactStrictMode: true,
  output: 'standalone', // optional, good for deployment
};

module.exports = nextConfig;
