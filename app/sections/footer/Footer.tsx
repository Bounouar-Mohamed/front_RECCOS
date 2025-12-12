'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { footerStyles } from './footer.styles';
import { VanishForm } from '@/app/ui/vanishForm';

const navigationLinks = [
  { key: 'home', href: '/' },
  { key: 'properties', href: '/launchpad' },
  { key: 'marketplace', href: '/exchange' },
  { key: 'dashboard', href: '/wallet' },
];

const legalLinks = [
  { key: 'terms', href: '/legal/terms' },
  { key: 'privacy', href: '/legal/privacy' },
  { key: 'cookies', href: '/legal/cookies' },
  { key: 'legalNotice', href: '/legal/notice' },
];

const socialLinks = [
  { key: 'linkedin', href: 'https://linkedin.com/company/reccos', icon: 'LinkedIn' },
  { key: 'twitter', href: 'https://twitter.com/reccos_ae', icon: 'X' },
  { key: 'instagram', href: 'https://instagram.com/reccos.ae', icon: 'Instagram' },
];

export const Footer = () => {
  const t = useTranslations('footer');
  const tNav = useTranslations('navbar.links');
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
      {/* Main content section */}
      <div className={footerStyles.mainContent}>
        {/* Newsletter section */}
        <div className={footerStyles.newsletterSection}>
          <h2 className={footerStyles.sectionTitle}>
            {t('newsletter.title')}
          </h2>
          <p className={footerStyles.newsletterDescription}>
            {t('newsletter.description')}
          </p>
          <div className={footerStyles.vanishFormWrapper}>
            <VanishForm
              placeholder={t('newsletter.placeholder')}
              onChange={handleChange}
              onSubmit={onSubmit}
            />
          </div>
        </div>

        {/* Navigation links section */}
        <div className={footerStyles.linksSection}>
          <div className={footerStyles.linksColumn}>
            <h3 className={footerStyles.linksTitle}>{t('navigation.title')}</h3>
            <nav className={footerStyles.navigation}>
              {navigationLinks.map(({ key, href }) => {
                const fullHref = href === '/' ? `/${locale}` : `/${locale}${href}`;
                return (
                  <Link 
                    key={key} 
                    href={fullHref} 
                    className={footerStyles.navLink}
                  >
                    {tNav(key)}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className={footerStyles.linksColumn}>
            <h3 className={footerStyles.linksTitle}>{t('legal.title')}</h3>
            <nav className={footerStyles.navigation}>
              {legalLinks.map(({ key, href }) => (
                <Link 
                  key={key} 
                  href={`/${locale}${href}`} 
                  className={footerStyles.navLink}
                >
                  {t(`legal.${key}`)}
                </Link>
              ))}
            </nav>
          </div>

          <div className={footerStyles.linksColumn}>
            <h3 className={footerStyles.linksTitle}>{t('contact.title')}</h3>
            <div className={footerStyles.contactInfo}>
              <a href="mailto:contact@reccos.ae" className={footerStyles.contactLink}>
                contact@reccos.ae
              </a>
              <p className={footerStyles.contactText}>
                {t('contact.address')}
              </p>
              <p className={footerStyles.contactText}>
                {t('contact.rera')}
              </p>
            </div>
            
            {/* Social links */}
            <div className={footerStyles.socialLinks}>
              {socialLinks.map(({ key, href, icon }) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footerStyles.socialLink}
                  aria-label={icon}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section avec RECCOS et copyright */}
      <div className={footerStyles.bottomSection}>
        <div className={footerStyles.reccosText}>RECCOS</div>
     
        <div className={footerStyles.copyrightWrapper}>
          <div className={footerStyles.copyrightText}>
            © {new Date().getFullYear()} RECCOS. {t('copyright.allRights')}
          </div>
          {/* <div className={footerStyles.copyrightLinks}>
            <Link href={`/${locale}/legal/terms`} className={footerStyles.copyrightLink}>
              {t('legal.terms')}
            </Link>
            <span className={footerStyles.copyrightSeparator}>•</span>
            <Link href={`/${locale}/legal/privacy`} className={footerStyles.copyrightLink}>
              {t('legal.privacy')}
            </Link>
          </div> */}
        </div>
      </div>
    </footer>
  );
};
