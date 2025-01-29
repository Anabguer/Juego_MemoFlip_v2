import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://colisan.com/sistema_apps_upload' : '',
  basePath: process.env.NODE_ENV === 'production' ? '' : '',
};

export default nextConfig;
