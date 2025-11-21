import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Routes publiques (pas besoin d'authentification)
const publicRoutes = [
  '/', // Page d'accueil
  '/login',
  '/register',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/auth/callback',
  '/launchpad', // Page Launchpad (publique)
  '/exchange', // Page Exchange (publique)
];

export function middleware(request: NextRequest) {
  // Appliquer le middleware i18n
  const response = intlMiddleware(request);

  // Vérifier l'authentification pour les routes protégées
  const { pathname } = request.nextUrl;
  
  // Extraire le chemin sans le locale (ex: /fr/login -> /login)
  const pathSegments = pathname.split('/').filter(Boolean);
  const locale = pathSegments[0];
  const pathWithoutLocale = '/' + pathSegments.slice(1).join('/') || '/';
  
  // Vérifier si l'utilisateur est connecté (a un cookie access_token)
  const token = request.cookies.get('access_token')?.value;
  const isAuthenticated = !!token;
  
  // Si l'utilisateur est connecté et essaie d'accéder à /login ou /register, rediriger vers /wallet
  if (isAuthenticated && (pathWithoutLocale === '/login' || pathWithoutLocale === '/register')) {
    const currentLocale = locale && routing.locales.includes(locale as any) ? locale : routing.defaultLocale;
    return NextResponse.redirect(new URL(`/${currentLocale}/wallet`, request.url));
  }
  
  // Vérifier si c'est une route publique
  const isPublicRoute = publicRoutes.some((route) => {
    if (route === '/') {
      // Pour la route racine, vérifier que c'est exactement la racine ou juste le locale
      return pathWithoutLocale === '/' || pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathWithoutLocale.startsWith(route);
  });

  // Si ce n'est pas une route publique, vérifier le token
  if (!isPublicRoute) {
    // SÉCURITÉ : Vérifier uniquement le cookie httpOnly
    // Le middleware ne peut pas accéder à localStorage (côté serveur)
    // Si pas de cookie httpOnly, rediriger vers login
    if (!token) {
      // Rediriger vers login avec le locale
      const currentLocale = locale && routing.locales.includes(locale as any) ? locale : routing.defaultLocale;
      return NextResponse.redirect(new URL(`/${currentLocale}/login`, request.url));
    }
  }

  return response;
}

export const config = {
  // Matcher toutes les routes sauf les fichiers statiques et API
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
