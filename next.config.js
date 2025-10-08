/** @type {import('next').NextConfig} */
const nextConfig = {
  // Export estático puro (Pages Router)
  output: 'export',

  // Paths para Hostalia
  basePath: '/sistema_apps_upload/memoflip_static',
  assetPrefix: '/sistema_apps_upload/memoflip_static',

  images: { unoptimized: true },
  trailingSlash: true,
};

module.exports = nextConfig;

