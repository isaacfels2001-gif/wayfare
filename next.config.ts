import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project so Next.js doesn't get confused
  // by an unrelated lockfile in a parent directory.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
