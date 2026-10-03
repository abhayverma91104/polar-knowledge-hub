import type { NextConfig } from "next";

let rawUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").trim();
if (rawUrl && !rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
  rawUrl = `https://${rawUrl}`;
}
const API_URL = rawUrl.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/polar-ai",
        destination: "/assistant",
      },
      {
        source: "/api/:path*",
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

