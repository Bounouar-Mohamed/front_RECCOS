'use client';

import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { navbarStyles } from './navbar.styles';
import { useAuthStore } from '@/lib/store/auth-store';

const publicLinks = [
  { key: 'home', href: '/' },
  { key: 'properties', href: '/launchpad' },
  { key: 'marketplace', href: '/exchange' },
];

const authenticatedLinks = [
  { key: 'home', href: '/' },
  { key: 'properties', href: '/launchpad' },
  { key: 'marketplace', href: '/exchange' },
  { key: 'dashboard', href: '/wallet' },
];

export const Navbar = () => {
  const t = useTranslations('navbar');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuth, logout } = useAuthStore();

  // Vérifier l'état d'authentification au montage
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = async () => {
    await logout();
    router.push(`/${locale}`);
  };

  // Utiliser les liens appropriés selon l'état de connexion
  const links = isAuthenticated ? authenticatedLinks : publicLinks;

  return (
    <header className={navbarStyles.root}>
      <nav className={navbarStyles.nav} aria-label={t('ariaLabel')}>
        {links.map(({ key, href }) => {
          const fullHref = href === '/' ? `/${locale}` : `/${locale}${href}`;
          // Gère les pathnames avec locale (ex: /fr ou /fr/home)
          const isActive = key === 'home' 
            ? pathname === `/${locale}` || pathname === `/${locale}/`
            : pathname === fullHref || pathname?.startsWith(fullHref + '/');
          return (
            <Link 
              key={key} 
              href={fullHref} 
              className={isActive ? navbarStyles.linkActive : navbarStyles.link}
            >
              {t(`links.${key}`)}
            </Link>
          );
        })}
        
        {/* Afficher login si non connecté, dashboard/logout si connecté */}
        {!isLoading && (
          <>
            {!isAuthenticated ? (
              <Link href={`/${locale}/login`} className={navbarStyles.cta}>
                {t('links.login')}
              </Link>
            ) : (
              <>
                <button 
                  onClick={handleLogout}
                  className={navbarStyles.logoutButton}
                  type="button"
                >
                  {t('links.logout')}
                </button>
              </>
            )}
          </>
        )}
      </nav>
    </header>
  );
};