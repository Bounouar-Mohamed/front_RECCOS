'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { footerStyles } from './footer.styles';
import { VanishForm } from '@/components/ui/vanishForm';

const links = [
  { key: 'home', href: '/' },
  { key: 'properties', href: '/launchpad' },
  { key: 'marketplace', href: '/exchange' },
  { key: 'login', href: '/login' },
];

export const Footer = () => {
  const t = useTranslations('navbar');
  const locale = useLocale();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Gestion du changement d'email pour newsletter
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: Implémenter l'inscription à la newsletter
  };

  return (
    <footer className={footerStyles.footer}>
      {/* Main content section with navigation and newsletter */}
      <div className={footerStyles.mainContent}>
      

        {/* Newsletter section - Right */}
        <div className={footerStyles.newsletterSection}>
          <h2 className={footerStyles.newsletterTitle}>
            Stay updated with RECCOS
          </h2>
          <p className={footerStyles.newsletterDescription}>
            Receive the latest updates, insights, and content that RECCOS shares
          </p>
          <div className={footerStyles.vanishFormWrapper}>
            <VanishForm
              placeholder="yo@gxuri.in"
              onChange={handleChange}
              onSubmit={onSubmit}
            />
          </div>
        </div>
          {/* Navigation links section - Left */}
          <div className={footerStyles.navigationSection}>
          <h2 className={footerStyles.navigationTitle}>
            Navigation
          </h2>
          <nav className={footerStyles.navigation}>
            {links.map(({ key, href }) => {
              const fullHref = href === '/' ? `/${locale}` : `/${locale}${href}`;
              return (
                <Link 
                  key={key} 
                  href={fullHref} 
                  className={footerStyles.navLink}
                >
                  {t(`links.${key}`)}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom section avec RECCOS et copyright */}
      <div className={footerStyles.bottomSection}>
        <div className={footerStyles.reccosText}>RECCOS</div>
     
        <div className={footerStyles.copyrightText}>
          2025. All Rights Reserved. RECCOS…
        </div>
      </div>
    </footer>
  );
};