import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    '@placegraph/types',
    '@placegraph/core',
    '@placegraph/qloo',
    '@placegraph/agents',
    '@placegraph/db'
  ]
};

export default nextConfig;
