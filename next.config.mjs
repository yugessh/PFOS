/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },

  allowedDevOrigins: [
    "192.168.1.105"
  ],
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;