/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  outputFileTracingRoot: import.meta.dirname,
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg", "bcryptjs", "razorpay", "resend"],
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000, // 1 year – images are static assets
    deviceSizes: [375, 640, 750, 1080, 1200, 1920],
    imageSizes: [64, 128, 256, 384]
  }
};

export default nextConfig;
