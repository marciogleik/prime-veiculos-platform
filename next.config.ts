import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'zllitpmsdfjgtbuittvy.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 's3.carro57.com.br',
      },
      {
        protocol: 'https',
        hostname: 'app.revendamais.com.br',
      },
    ],
  },
};

export default nextConfig;
