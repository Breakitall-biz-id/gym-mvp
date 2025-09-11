/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['@supabase/ssr'],
  },
  output: 'standalone',
};

module.exports = nextConfig;
