'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Logo } from '@/app/ui/logo';
import { useAuthStore } from '@/lib/store/auth-store';

import { navbarStyles } from './navbar.styles';

type NavLink = {
  key: string;
  href: string;
};

const publicLinks: NavLink[] = [
  { key: 'home', href: '/' },
  { key: 'properties', href: '/launchpad' },
  { key: 'marketplace', href: '/exchange' },
  { key: 'noor', href: '/noor' },
];

const authenticatedLinks: NavLink[] = [
  ...publicLinks,
  { key: 'dashboard', href: '/wallet' },
];

const availableLocales = ['fr', 'en', 'ar'] as const;


export const Navbar = () => {
  const t = useTranslations('navbar');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  
  // État d'authentification simplifié
  // La vérification se fait via /api/auth/me au chargement
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const [closedHeight, setClosedHeight] = useState(79);
  const [isNavHidden, setIsNavHidden] = useState(false);
  const lastScrollYRef = useRef(0);

  // NOTE: checkAuth() est maintenant appelé par AuthProvider au niveau de l'app
  // Plus besoin de l'appeler ici - cela évite les appels multiples

  // Mesurer la hauteur réelle de la navbar pour calculer la hauteur fermée
  useEffect(() => {
    const updateClosedHeight = () => {
      if (navRef.current) {
        const navHeight = navRef.current.offsetHeight;
        // Padding responsive : 12px sur mobile, 16px sur desktop
        const padding = window.innerWidth >= 768 ? 16 : 12;
        // Hauteur fermée = padding top + navbar + gap (1px)
        const calculatedHeight = padding + navHeight + 1;
        setClosedHeight(calculatedHeight);
      }
    };

    updateClosedHeight();
    window.addEventListener('resize', updateClosedHeight);
    return () => window.removeEventListener('resize', updateClosedHeight);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      setIsNavHidden(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const revealThreshold = 10;

    const handleScroll = () => {
      if (isOpen) {
        return;
      }

      const currentY = Math.max(0, window.scrollY);
      const delta = currentY - lastScrollYRef.current;
      const isScrollingDown = delta > 0.5;
      const isScrollingUp = delta < -0.5;

      if (isScrollingDown && currentY > 0) {
        setIsNavHidden(true);
      } else if (
        isScrollingUp &&
        currentY < Math.max(0, lastScrollYRef.current - revealThreshold)
      ) {
        setIsNavHidden(false);
      } else if (currentY <= 0) {
        setIsNavHidden(false);
      }

      lastScrollYRef.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [closedHeight, isOpen]);

  const closeMenu = useCallback(() => setIsOpen(false), []);

  useOnClickOutside(menuRef, closeMenu);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    closeMenu();
    
    try {
      await logout();
      // Utiliser window.location.href pour une navigation complète
      // Cela garantit que le middleware vérifie les cookies correctement
      window.location.href = `/${locale}`;
    } catch (error) {
      console.error('[Navbar] Logout error:', error);
      // En cas d'erreur, rediriger quand même
      window.location.href = `/${locale}`;
    }
  }, [closeMenu, locale, logout, isLoggingOut]);

  const role = user?.role;
  const isAdmin = role === 'admin' || role === 'superadmin';
  const isSuperAdmin = role === 'superadmin';
  
  // SÉCURITÉ: Vérification avant d'afficher les liens sensibles
  // isLoading === false && isAuthenticated === true signifie que /api/auth/me a confirmé la session
  const isVerifiedAuthenticated = !isLoading && isAuthenticated;

  const baseLinks = useMemo(
    () => (isVerifiedAuthenticated ? authenticatedLinks : publicLinks),
    [isVerifiedAuthenticated],
  );

  const adminLinks = useMemo(() => {
    const items: { key: string; href: string }[] = [];

    // SÉCURITÉ BIG APP: Les liens admin nécessitent une vérification SERVEUR
    // On utilise isVerifiedAuthenticated (= vérifié par /api/auth/me) pour les zones sensibles
    // Cela empêche d'afficher les liens admin même si le localStorage est compromis

    // Espace admin (gestion propriétés / promoteurs / performances)
    if (isVerifiedAuthenticated && isAdmin) {
      items.push({ key: 'admin', href: '/admin' });
    }

    // Espace gestion des comptes & rôles (superadmin uniquement)
    if (isVerifiedAuthenticated && isSuperAdmin) {
      items.push({ key: 'adminUsers', href: '/admin/users' });
    }

    return items;
  }, [isVerifiedAuthenticated, isAdmin, isSuperAdmin]);

  const localePathSuffix = useMemo(() => {
    if (!pathname) {
      return '';
    }

    const segments = pathname.split('/').filter(Boolean);

    if (segments.length <= 1) {
      return '';
    }

    const [, ...rest] = segments;
    return rest.length ? `/${rest.join('/')}` : '';
  }, [pathname]);

  const handleLocaleChange = useCallback(
    (targetLocale: string) => {
      if (targetLocale === locale) {
        return;
      }

      router.push(`/${targetLocale}${localePathSuffix}`);
      closeMenu();
    },
    [closeMenu, locale, localePathSuffix, router],
  );

  const shouldPrefetchLink = useCallback((href: string) => {
    const protectedPrefixes = ['/wallet', '/admin'];
    return !protectedPrefixes.some((prefix) => href.startsWith(prefix));
  }, []);

  return (
    <motion.div
      ref={menuRef}
      className={navbarStyles.shell}
      initial={{ height: closedHeight, y: 0 }}
      animate={{
        height: isOpen ? '100vh' : closedHeight,
        y: isNavHidden ? -closedHeight : 0,
      }}
      transition={{ duration: 0.3, ease: [0.45, 0, 0.55, 1] }}
    >
      <motion.div
        className={navbarStyles.overlay}
        animate={{ gap: isOpen ? '8px' : '1px' }}
        transition={{ duration: 0.3, ease: [0.45, 0, 0.55, 1] }}
        style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
      >
        <nav
          ref={navRef}
          className={navbarStyles.navbar}
          aria-label={t('ariaLabel')}
        >
          <Logo />

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className={navbarStyles.menuToggle}
            aria-expanded={isOpen}
            aria-controls="navbar-menu-panel"
          >
            {isOpen ? t('actions.close') : t('actions.menu')}
          </button>
        </nav>

        <motion.div
          initial={false}
          animate={{
            gap: isOpen ? '0.75rem' : '0.25rem',
          }}
          transition={{ duration: 0.3, ease: [0.45, 0, 0.55, 1] }}
          className={navbarStyles.canvas}
          style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
        >
          <ul
            id="navbar-menu-panel"
            aria-hidden={!isOpen}
            className={navbarStyles.menuList}
          >
            {/* Liens publics / généraux */}
            {baseLinks.map(({ key, href }) => {
              const fullHref =
                href === '/' ? `/${locale}` : `/${locale}${href}`;
              const isActive =
                key === 'home'
                  ? pathname === `/${locale}` || pathname === `/${locale}/`
                  : pathname === fullHref ||
                    pathname?.startsWith(`${fullHref}/`);

              return (
                <li key={key} className={navbarStyles.menuItem}>
                  <Link
                    href={fullHref}
                    prefetch={shouldPrefetchLink(href)}
                    onClick={closeMenu}
                    data-active={isActive}
                    className={navbarStyles.menuItemInner}
                  >
                    <span className={navbarStyles.menuItemTitle}>
                      {t(`links.${key}`)}
                    </span>
                  </Link>
                </li>
              );
            })}

            {/* Séparateur ultra épuré pour les sections sensibles (admin) */}
            {isVerifiedAuthenticated && adminLinks.length > 0 && (
              <li className={navbarStyles.adminDivider} aria-hidden="true">
                <span className={navbarStyles.adminDividerLine} />
                <span className={navbarStyles.adminDividerLabel}>
                  {t('meta.adminSection')}
                </span>
                <span className={navbarStyles.adminDividerLine} />
              </li>
            )}

            {/* Liens admin / sensibles */}
            {adminLinks.map(({ key, href }) => {
              const fullHref =
                href === '/' ? `/${locale}` : `/${locale}${href}`;
              const isActive =
                pathname === fullHref ||
                pathname?.startsWith(`${fullHref}/`);

              return (
                <li key={key} className={navbarStyles.menuItem}>
                  <Link
                    href={fullHref}
                    prefetch={shouldPrefetchLink(href)}
                    onClick={closeMenu}
                    data-active={isActive}
                    className={navbarStyles.menuItemInner}
                  >
                    <span className={navbarStyles.menuItemTitle}>
                      {t(`links.${key}`)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className={navbarStyles.metaRow}>
            <p>{t('meta.privacy')}</p>
            <p>{t('meta.terms')}</p>
          </div>

          <div className={navbarStyles.localeRow}>
            {availableLocales.map((code) => {
              const isCurrent = code === locale;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleLocaleChange(code)}
                  className={navbarStyles.localeButton}
                  data-active={isCurrent}
                  aria-pressed={isCurrent}
                >
                  {code.toUpperCase()}
                </button>
              );
            })}

            {!isLoading &&
              (!isAuthenticated ? (
                <Link
                  href={`/${locale}/login`}
                  className={navbarStyles.loginButton}
                  onClick={closeMenu}
                >
                  {t('links.login')}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handleLogout}
                  className={navbarStyles.logoutButton}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? '...' : t('links.logout')}
                </button>
              ))}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const useOnClickOutside = (ref: RefObject<HTMLElement>, handler: () => void) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [handler, ref]);
};