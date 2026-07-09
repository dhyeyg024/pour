/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  outputFileTracingRoot: import.meta.dirname,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000, // 1 year – images are static assets
    deviceSizes: [375, 640, 750, 1080, 1200, 1920],
    imageSizes: [64, 128, 256, 384]
  }
};

export default nextConfig;
