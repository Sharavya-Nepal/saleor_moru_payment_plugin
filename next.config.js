/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@saleor/app-sdk"],
  output: "standalone",
};

module.exports = nextConfig;
