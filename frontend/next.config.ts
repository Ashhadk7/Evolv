import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "@phosphor-icons/react", "@iconify/react"],
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
