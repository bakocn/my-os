import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   output: 'export',
  basePath: '/my-os', // ime repoa
  assetPrefix: '/my-os/', 
  eslint: {
    ignoreDuringBuilds: true, // ignorise ESLint tokom build-a
  },
};

export default nextConfig;
