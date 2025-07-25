/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    typedRoutes: true
  },
  images: {
    domains: ['images.example.com']
  }
};

module.exports = nextConfig;
