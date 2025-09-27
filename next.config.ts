/** @type {import('next').NextConfig} */
const dev = process.env.NODE_ENV === 'development';

const nextConfig = {
  output: dev ? undefined : 'export',  // samo za build/export
  basePath: dev ? '' : '/my-os',       // samo za deploy
  assetPrefix: dev ? '' : '/my-os',   // samo za deploy
};

export default nextConfig;
