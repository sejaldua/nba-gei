import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/nba-gei",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
