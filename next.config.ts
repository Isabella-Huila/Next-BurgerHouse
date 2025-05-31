import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.postimg.cc",
      },
      {
         protocol: 'https',
         hostname: '**',
      },
    ],
  },
};

export default nextConfig;
