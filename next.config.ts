import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // As per existing config
  },
  eslint: {
    ignoreDuringBuilds: true, // As per existing config
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '', // Empty string means any port for that protocol
        pathname: '/**', // Allow any path on this hostname
      },
    ],
  },
};

export default nextConfig;
