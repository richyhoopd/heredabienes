/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Preparado para una fase posterior. En FASE 1 seguimos usando <img> nativo
    // en los ~34 hotlinks de Unsplash para no alterar el layout actual.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
