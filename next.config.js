/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: true,
  // webpack: (config, { isServer }) => {
  //   // Fixes npm packages that depend on `fs` module
  //   if (!isServer) {
  //     config.resolve.fallback = {
  //       fs: false,
  //       module: false,
  //       process: require.resolve("process/browser")
  //     };
  //   }

  //   return config;
  // },
  experimental: {
    instrumentationHook: true,
    serverComponentsExternalPackages: ['pdfkit']
  },
}

module.exports = nextConfig
