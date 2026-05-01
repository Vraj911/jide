/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        "monaco-editor",
        "monaco-languageclient",
        "vscode-languageclient",
      ];
    }
    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
      },
    ];
  },
}

module.exports = nextConfig
