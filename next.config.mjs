import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const distDir = process.env.NEXT_DIST_DIR || '.next';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir,
  images: {
    domains: [],
  },
  // Support for PandaCSS
  transpilePackages: ['@pandacss/dev'],
};

export default withNextIntl(nextConfig);
