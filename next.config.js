/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.ctfassets.net'],
  },
  typescript:{
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig
