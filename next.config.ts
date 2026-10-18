import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use standalone output for Docker / self-hosted environments.
  // On Vercel, process.env.VERCEL is defined, so default Vercel serverless output is used.
  output: process.env.VERCEL ? undefined : "standalone",
};

export default nextConfig;
