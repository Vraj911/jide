const path = require("path");
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    externalDir: true,
  },
  outputFileTracingRoot: path.join(__dirname, "../"),
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        "monaco-editor",
      ];
    }

    return config;
  },
};
module.exports = nextConfig;