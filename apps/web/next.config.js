/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@placegraph/types',
    '@placegraph/core',
    '@placegraph/qloo',
    '@placegraph/agents',
    '@placegraph/db'
  ]
};

module.exports = nextConfig;
