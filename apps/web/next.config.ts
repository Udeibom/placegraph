import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

module.exports = {
  transpilePackages: ['@placegraph/types', '@placegraph/core', '@placegraph/qloo', '@placegraph/agents', '@placegraph/db']
}
