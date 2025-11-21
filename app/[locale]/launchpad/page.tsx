'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { launchpadPageStyles } from './launchpadPage.styles';

export default function LaunchpadPage() {
  const t = useTranslations('navbar.links');
  const tCommon = useTranslations('auth');

  return (
    <main className={launchpadPageStyles.container}>
      <motion.div
        className={launchpadPageStyles.content}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <motion.h1
          className={launchpadPageStyles.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {t('properties')}
        </motion.h1>
        <motion.p
          className={launchpadPageStyles.comingSoon}
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


