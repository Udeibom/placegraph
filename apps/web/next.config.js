const path = require('path');
const { loadEnvConfig } = require('@next/env');

loadEnvConfig(path.join(__dirname, '../..'));
loadEnvConfig(__dirname);

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@placegraph/types',
    '@placegraph/core',
    '@placegraph/qloo',
    '@placegraph/agents',
    '@placegraph/db'
  ],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@placegraph/types': path.resolve(__dirname, '../../packages/types/src'),
      '@placegraph/core': path.resolve(__dirname, '../../packages/core/src'),
      '@placegraph/qloo': path.resolve(__dirname, '../../packages/qloo/src'),
      '@placegraph/agents': path.resolve(__dirname, '../../packages/agents/src'),
      '@placegraph/db': path.resolve(__dirname, '../../packages/db/src')
    };
    return config;
  }
};

module.exports = nextConfig;
