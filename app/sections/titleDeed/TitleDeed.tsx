'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { titleDeedStyles } from './titleDeed.styles';

interface TitleDeedItem {
  /** Nom de la propriété */
  name: string;
  /** ID unique du titre de propriété */
  id: string;
  /** URL du PDF (optionnel) - s'ouvre au clic */
  pdfUrl?: string;
}

interface TitleDeedProps {
  className?: string;
  items?: TitleDeedItem[];
}

const defaultItems: TitleDeedItem[] = [
  {
    name: 'Marina Heights',
    id: 'TD-2024-0892',
    pdfUrl: '/docs/Example_UAE_Title_Deed.pdf',
  },
  {
    name: 'Palm Residences',
    id: 'TD-2024-0756',
    pdfUrl: '/docs/Example_UAE_Title_Deed.pdf',
  },
  {
    name: 'Downtown Views',
    id: 'TD-2024-1203',
    pdfUrl: '/docs/Example_UAE_Title_Deed.pdf',
  },
  {
    name: 'Jumeirah Bay',
    id: 'TD-2024-0445',
    pdfUrl: '/docs/Example_UAE_Title_Deed.pdf',
  },
  {
    name: 'Creek Harbour',
    id: 'TD-2024-0671',
    pdfUrl: '/docs/Example_UAE_Title_Deed.pdf',
  },
  {
    name: 'Business Bay',
    id: 'TD-2024-0998',
    pdfUrl: '/docs/Example_UAE_Title_Deed.pdf',
  },
  {
    name: 'DIFC Living',
    id: 'TD-2024-1127',
    pdfUrl: '/docs/Example_UAE_Title_Deed.pdf',
  },
  {
    name: 'Bluewaters',
    id: 'TD-2024-0334',
    pdfUrl: '/docs/Example_UAE_Title_Deed.pdf',
  },
  {
    name: 'City Walk',
    id: 'TD-2024-0567',
    pdfUrl: '/docs/Example_UAE_Title_Deed.pdf',
  },
];

// Icône document minimaliste
const DocumentIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const TitleDeed = ({ className, items = defaultItems }: TitleDeedProps) => {
  return (
    <div className={cn(titleDeedStyles.root, className)}>
      <HoverExpand items={items} />
    </div>
  );
};

interface HoverExpandProps {
  items: TitleDeedItem[];
  className?: string;
}

const HoverExpand = ({ items, className }: HoverExpandProps) => {
  const t = useTranslations('wallet.titleDeed');
  const [activeIndex, setActiveIndex] = useState<number | null>(1);

  const handleCardClick = (index: number, pdfUrl?: string) => {
    if (activeIndex === index && pdfUrl) {
      window.open(pdfUrl, '_blank');
    } else {
      setActiveIndex(index);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        duration: 0.3,
        delay: 0.5,
      }}
      className={cn(titleDeedStyles.container, className)}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={titleDeedStyles.innerWrapper}
      >
        <div className={titleDeedStyles.cardsContainer}>
          {items.map((item, index) => {
            const isActive = activeIndex === index;

            return (
              <motion.div
                key={item.id}
                className={titleDeedStyles.card}
                initial={{ width: '2.5rem', height: '20rem' }}
                animate={{
                  width: isActive ? '24rem' : '5rem',
                  height: isActive ? '24rem' : '24rem',
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                onClick={() => handleCardClick(index, item.pdfUrl)}
                onHoverStart={() => setActiveIndex(index)}
              >
                {/* Glow effect */}
                <div className={titleDeedStyles.cardGlow} />

                {/* Document icon */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <DocumentIcon className={titleDeedStyles.cardDocIcon} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Contenu principal */}
                <div className={titleDeedStyles.cardInner}>
                  <AnimatePresence mode="wait">
                    {isActive ? (
                      <motion.div
                        key="expanded"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                        }}
                      >
                        <span className={titleDeedStyles.cardId}>{item.id}</span>
                        <span className={titleDeedStyles.cardName}>{item.name}</span>
                      </motion.div>
                    ) : (
                      <motion.span
                        key="collapsed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className={cn(titleDeedStyles.cardName, titleDeedStyles.cardNameVertical)}
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {/* Badge PDF */}
                <AnimatePresence>
                  {isActive && item.pdfUrl && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                      className={titleDeedStyles.cardBadge}
                    >
                      <DocumentIcon className={titleDeedStyles.cardBadgeIcon} />
                      <span className={titleDeedStyles.cardBadgeText}>{t('openPdf')}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export { TitleDeed, HoverExpand };

/**
 * TitleDeed HoverExpand — React + Framer Motion
 * Adapted from Skiper 52 by Gurvinder Singh
 *
 * License & Usage:
 * - Free to use and modify in both personal and commercial projects.
 * - Attribution to Skiper UI is required when using the free version.
 * - No attribution required with Skiper UI Pro.
 *
 * Author: @gurvinder-singh02
 * Website: https://gxuri.in
 * Twitter: https://x.com/Gur__vi
 */
