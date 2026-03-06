import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/dashboard/admin/settings', destination: '/dashboard/admin/annonces', permanent: true },
      { source: '/dashboard/admin/communication', destination: '/dashboard/admin/annonces', permanent: true },
    ];
  },
};

export default nextConfig;
