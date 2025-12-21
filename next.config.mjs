import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const distDir = process.env.NEXT_DIST_DIR || '.next';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SECURITY HEADERS - Protection contre les attaques courantes
 * ═══════════════════════════════════════════════════════════════════════════════
 */
const securityHeaders = [
  // Protection XSS - Bloque l'exécution de scripts inline malveillants
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  // Empêche le MIME-sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Protection contre le clickjacking
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  // Contrôle les informations envoyées lors de la navigation
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Permissions Policy - Limite l'accès aux fonctionnalités du navigateur
  {
    key: 'Permissions-Policy',
    value: 'camera=(self), microphone=(self), geolocation=(self), payment=()',
  },
  // Strict Transport Security - Force HTTPS en production
  ...(process.env.NODE_ENV === 'production'
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains; preload',
        },
      ]
    : []),
  // Content Security Policy - Contrôle strict des ressources chargées
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js nécessite unsafe-eval en dev
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.openai.com wss://api.openai.com https://*.reccos.ae wss://*.reccos.ae http://localhost:* ws://localhost:*",
      "media-src 'self' blob:",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir,
  images: {
    domains: [],
  },
  // Support for PandaCSS
  transpilePackages: ['@pandacss/dev'],
  
  // Headers de sécurité pour toutes les routes
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  
  // Désactiver x-powered-by header
  poweredByHeader: false,
};

export default withNextIntl(nextConfig);
