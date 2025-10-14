/** @type {import('next').NextConfig} */
const nextConfig = {
  // Export estático puro (Pages Router)
  output: 'export',

  // Para APK: SIN basePath ni assetPrefix (rutas relativas)
  // Los assets estarán en /assets/public/ dentro de la APK
  basePath: '',
  assetPrefix: '',

  images: { unoptimized: true },
  trailingSlash: true,
};

module.exports = nextConfig;


