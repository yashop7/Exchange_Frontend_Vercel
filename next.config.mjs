/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['coin-images.coingecko.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/tickers',
        destination: 'https://api.backpack.exchange/api/v1/tickers',
      },
      {
        source: '/api/engine/:path*',
        destination: `${process.env.API_BASE_URL}/:path*`,
      },
    ];
  },
  reactStrictMode: false,
};

export default nextConfig;
