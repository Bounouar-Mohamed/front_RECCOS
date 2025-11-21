'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { exchangePageStyles } from './exchangePage.styles';

export default function ExchangePage() {
  const t = useTranslations('navbar.links');
  const tCommon = useTranslations('auth');

  return (
    <main className={exchangePageStyles.container}>
      <motion.div
        className={exchangePageStyles.content}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <motion.h1
          className={exchangePageStyles.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {t('marketplace')}
        </motion.h1>
        <motion.p
          className={exchangePageStyles.comingSoon}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {tCommon('comingSoon')}
        </motion.p>
      </motion.div>
    </main>
  );
}


