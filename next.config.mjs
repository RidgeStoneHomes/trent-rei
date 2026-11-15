/** @type {import('next').NextConfig} */

// Each home has its own address, e.g. reynoldsretreats.com/ironwood-acres, served by
// /stays/[slug]. Keep this list in sync with the slugs in src/config/site.ts.
const homes = "ironwood-acres|the-fog-line";

const nextConfig = {
  serverExternalPackages: ["@prisma/client", "qrcode"],
  async redirects() {
    return [
      // Old addresses (the second home's placeholder names, and /stays/<home>)
      { source: "/stays/the-overlook", destination: "/the-fog-line", permanent: false },
      { source: "/stays/the-lake-house", destination: "/the-fog-line", permanent: false },
      { source: `/stays/:slug(${homes})`, destination: "/:slug", permanent: false },
    ];
  },
  async rewrites() {
    return [{ source: `/:slug(${homes})`, destination: "/stays/:slug" }];
  },
};
export default nextConfig;
