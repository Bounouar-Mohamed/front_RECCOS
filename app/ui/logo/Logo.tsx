'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import { logoStyles } from './logo.styles';

export const Logo = () => {
  const locale = useLocale();

  return (
    <Link href={`/${locale}`} className={logoStyles.link}>
      <div className={logoStyles.container}>
        <span className={logoStyles.text}>RECCOS</span>
      </div>
    </Link>
  );
};

