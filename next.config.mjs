/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@prisma/client", "qrcode"],
  // The second home's placeholder page used to live here
  async redirects() {
    return [
      { source: "/stays/the-overlook", destination: "/stays/the-fog-line", permanent: false },
      { source: "/stays/the-lake-house", destination: "/stays/the-fog-line", permanent: false },
    ];
  },
};
export default nextConfig;
