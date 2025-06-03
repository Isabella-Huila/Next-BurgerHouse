import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    dirs: ["src/app", "src/components", "src/lib"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.postimg.cc",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
