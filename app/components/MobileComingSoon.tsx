'use client';

import { useLocale } from 'next-intl';
import { css } from '@/styled-system/css';

const mobileComingSoonStyles = {
  container: css({
    position: 'fixed',
    inset: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(to bottom, #000000 0%, #131313 50%, #1D1D1D 100%)',
    zIndex: 999999,
    padding: '2rem',
    textAlign: 'center',
    color: 'white',
  }),
  logo: css({
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    fontSize: '4rem',
    fontWeight: 400,
    letterSpacing: '0.02em',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: '2rem',
  }),
  title: css({
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    fontSize: '2.5rem',
    fontWeight: 400,
    letterSpacing: '0.02em',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: '1.5rem',
    lineHeight: 1.2,
  }),
  message: css({
    fontFamily: 'var(--font-inter), Inter, sans-serif',
    fontSize: '1.125rem',
    fontWeight: 300,
    letterSpacing: '0.01em',
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 1.6,
    maxWidth: '400px',
    marginBottom: '2rem',
  }),
  comingSoon: css({
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    fontSize: '1.5rem',
    fontWeight: 400,
    letterSpacing: '0.1em',
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
  }),
};

const messages = {
  fr: {
    title: 'Version mobile\nbientôt disponible',
    message: 'Notre site est actuellement optimisé pour les écrans desktop et tablette. La version mobile sera disponible prochainement.',
    comingSoon: 'Bientôt disponible',
  },
  en: {
    title: 'Mobile version\ncoming soon',
    message: 'Our site is currently optimized for desktop and tablet screens. The mobile version will be available soon.',
    comingSoon: 'Coming Soon',
  },
  ar: {
    title: 'النسخة المحمولة\nقريباً',
    message: 'موقعنا محسّن حاليًا لشاشات سطح المكتب والجهاز اللوحي. ستكون النسخة المحمولة متاحة قريبًا.',
    comingSoon: 'قريباً',
  },
};

export const MobileComingSoon = () => {
  const locale = useLocale();
  const t = messages[locale as keyof typeof messages] || messages.en;

  return (
    <div className={mobileComingSoonStyles.container}>
      <div className={mobileComingSoonStyles.logo}>RECCOS</div>
      <h1 className={mobileComingSoonStyles.title}>
        {t.title.split('\n').map((line, i) => (
          <span key={i}>
            {line}
            {i < t.title.split('\n').length - 1 && <br />}
          </span>
        ))}
      </h1>
      <p className={mobileComingSoonStyles.message}>
        {t.message}
      </p>
      <div className={mobileComingSoonStyles.comingSoon}>{t.comingSoon}</div>
    </div>
  );
};

