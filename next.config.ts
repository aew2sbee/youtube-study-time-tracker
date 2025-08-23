import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        child_process: false,
        stream: false,
        constants: false,
        path: false,
        os: false,
      };
    }

    // better-sqlite3を外部パッケージとして扱う（サーバーサイドでのみ）
    if (isServer) {
      config.externals = [...(config.externals || []), 'better-sqlite3'];
    }

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'yt3.ggpht.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
