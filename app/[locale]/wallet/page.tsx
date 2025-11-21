'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store/auth-store';
import { walletPageStyles } from './walletPage.styles';

// IMPORTANT :
// - La protection d'accès à /wallet est gérée par le middleware (cookie httpOnly)
// - Ici, on n'effectue PLUS de redirection vers /login pour éviter les boucles
// - Si l'utilisateur n'est pas encore hydraté côté client, on affiche juste un état de chargement

export default function WalletPage() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return (
      <main className={walletPageStyles.container}>
        <motion.p
          className={walletPageStyles.loading}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {tCommon('loading')}
        </motion.p>
      </main>
    );
  }

  return (
    <main className={walletPageStyles.container}>
      <motion.div
        className={walletPageStyles.content}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <motion.h1
          className={walletPageStyles.title}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {t('welcome')}
        </motion.h1>
        
        <motion.p
          className={walletPageStyles.welcomeText}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {user.firstName} {user.lastName}
        </motion.p>

        <motion.div
          className={walletPageStyles.userInfo}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className={walletPageStyles.userInfoItem}>
            <span className={walletPageStyles.userInfoLabel}>{t('email')}</span>
            <span className={walletPageStyles.userInfoValue}>{user.email}</span>
          </div>
          
          {user.username && (
            <div className={walletPageStyles.userInfoItem}>
              <span className={walletPageStyles.userInfoLabel}>{t('username')}</span>
              <span className={walletPageStyles.userInfoValue}>{user.username}</span>
            </div>
          )}
          
          <div className={walletPageStyles.userInfoItem}>
            <span className={walletPageStyles.userInfoLabel}>{t('role')}</span>
            <span className={walletPageStyles.userInfoValue}>{user.role}</span>
          </div>
          
          <div className={walletPageStyles.userInfoItem}>
            <span className={walletPageStyles.userInfoLabel}>{t('emailVerified')}</span>
            <span className={walletPageStyles.userInfoValue}>
              {user.emailVerified ? t('yes') : t('no')}
            </span>
          </div>
          
          <div className={walletPageStyles.userInfoItem}>
            <span className={walletPageStyles.userInfoLabel}>{t('accountActive')}</span>
            <span className={walletPageStyles.userInfoValue}>
              {user.isActive ? t('yes') : t('no')}
            </span>
          </div>
        </motion.div>

        <motion.p
          className={walletPageStyles.comingSoon}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {t('comingSoon')}
        </motion.p>
      </motion.div>
    </main>
  );
}

