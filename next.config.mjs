/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://[::1]:3000',
    'http://192.168.0.102:3000',
    'http://192.168.0.102',
    'http://0.0.0.0:3000',
  ],
}

export default nextConfig
