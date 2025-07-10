import { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  // Update to use remotePatterns instead of deprecated domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'snpygntfpumljzhikwym.supabase.co',
        pathname: '**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default config;
