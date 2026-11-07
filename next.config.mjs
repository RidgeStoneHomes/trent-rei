/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@prisma/client", "qrcode"],
  // The second home's placeholder page used to live here
  async redirects() {
    return [{ source: "/stays/the-overlook", destination: "/stays/the-lake-house", permanent: false }];
  },
};
export default nextConfig;
