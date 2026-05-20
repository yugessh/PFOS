/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },

  allowedDevOrigins: [
    "192.168.0.102"
  ]
};

export default nextConfig;