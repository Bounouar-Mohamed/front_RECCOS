'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { projectsGalleryStyles } from './projectsGallery.styles';

// Clés de traduction correspondant aux 14 éléments
const PROJECT_KEYS = [
  'globalHub',
  'diversifying',
  'masterPlan',
  'fractional',
  'freehold',
  'goldenVisa',
  'tourism',
  'dirhams',
  'legalFramework',
  'offPlan',
  'population',
  'security',
  'globalCapital',
  'taxAdvantages',
] as const;

// Images correspondantes
const PROJECT_IMAGES = [
  '/images/Reccos_AGlobalHubBetweenEuropeAsiaAndAfrica.jpg',
  '/images/Reccos_DiversifyingBeyondEurope.jpg',
  '/images/Reccos_DubaiUrbanMasterPlan2040.jpg',
  '/images/Reccos_FractionalRealEstateInvesting.jpg',
  '/images/Reccos_FreeholdOwnershipInTheUAE.jpg',
  '/images/Reccos_GoldenVisa&Residency.jpg',
  '/images/Reccos_HighEndTourism.jpg',
  '/images/Reccos_InvestingInDirhams.jpg',
  '/images/Reccos_LegalFramework&Transparency.jpg',
  '/images/Reccos_OffPlanProperty.jpg',
  '/images/Reccos_PopulationGrowth.jpg',
  '/images/Reccos_SecurityStabilityandVisibility.jpg',
  '/images/Reccos_UAEHasBecomeaMagnetforGlobalCapital.jpg',
  '/images/Reccos_UnderstandingtheUAEFiscalFramework.jpg',
];

// Nombre de caractères max avant troncature
const MAX_CHARS = 150;

// Fonction pour tronquer le texte au dernier mot complet
const truncateText = (text: string, maxChars: number): { truncated: string; isTruncated: boolean } => {
  if (text.length <= maxChars) {
    return { truncated: text, isTruncated: false };
  }
  
  // Couper au maxChars
  let truncated = text.slice(0, maxChars);
  
  // Trouver le dernier espace pour couper au mot complet
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  if (lastSpaceIndex > 0) {
    truncated = truncated.slice(0, lastSpaceIndex);
  }
  
  return { truncated, isTruncated: true };
};

const ProjectsGallery = () => {
  const t = useTranslations('projectsGallery');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const isMobile = useMediaQuery('(max-width: 767px)');

  const handleMouseEnter = (index: number) => {
    if (!isMobile) {
      setSelectedIndex(index);
      // Réinitialiser l'expansion quand on change d'élément
      if (expandedIndex !== index) {
        setExpandedIndex(null);
      }
    }
  };

  const toggleExpand = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section className={projectsGalleryStyles.section}>
      <div className={projectsGalleryStyles.container}>
        <motion.div className={projectsGalleryStyles.projectsWrapper}>
          {PROJECT_KEYS.map((key, index) => {
            const title = t(`items.${key}.title`);
            const subtitle = t(`items.${key}.subtitle`);
            const description = t(`items.${key}.description`);
            const link = t(`items.${key}.link`);
            const image = PROJECT_IMAGES[index];
            const isExpanded = expandedIndex === index;
            const { truncated, isTruncated } = truncateText(description, MAX_CHARS);

            return (
              <motion.div
                key={key}
                className={projectsGalleryStyles.projectItem}
                onClick={isMobile ? () => setSelectedIndex(index) : undefined}
                onMouseEnter={!isMobile ? () => handleMouseEnter(index) : undefined}
                layout
                style={
                  isMobile
                    ? { width: '100%' }
                    : {
                        width: selectedIndex === index ? 'fit-content' : '4rem',
                        minWidth: selectedIndex === index ? undefined : '4rem',
                        maxWidth: selectedIndex === index ? '100%' : '4rem',
                      }
                }
                initial={isMobile ? { height: '4rem' } : { height: '100%' }}
                animate={
                  isMobile
                    ? { height: selectedIndex === index ? '500px' : '4rem' }
                    : { height: '100%' }
                }
                transition={{
                  stiffness: 200,
                  damping: 25,
                  type: 'spring',
                  layout: { type: 'spring', stiffness: 200, damping: 25 },
                }}
              >
                {/* Label vertical - seulement visible quand la colonne n'est PAS sélectionnée */}
                {selectedIndex !== index && (
                  <motion.div
                    className={projectsGalleryStyles.projectLabel}
                    animate={{
                      color: 'rgba(241, 241, 241, 0.3)',
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className={projectsGalleryStyles.projectLabelText}>{title}</p>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{
                    opacity: selectedIndex === index ? 1 : 0,
                  }}
                  className={projectsGalleryStyles.imageContainer}
                >
                  <motion.img
                    key={key}
                    src={image}
                    alt={title}
                    className={projectsGalleryStyles.image}
                    style={
                      isMobile
                        ? {
                            height: '100%',
                            width: 'auto',
                            maxWidth: '100%',
                            objectFit: 'contain',
                          }
                        : {
                            height: 'auto',
                            maxHeight: '100%',
                            width: 'auto',
                            maxWidth: '100%',
                            objectFit: 'contain',
                          }
                    }
                    initial={{ opacity: 0 }}
                    animate={{ opacity: selectedIndex === index ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />

                  {/* Box blur avec titre, sous-titre, description et lien au hover */}
                  <AnimatePresence>
                    {selectedIndex === index && !isMobile && (
                      <motion.div
                        className={projectsGalleryStyles.hoverInfoBox}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        layout
                      >
                        <h3 className={projectsGalleryStyles.hoverTitle}>{title}</h3>
                        <p className={projectsGalleryStyles.hoverSubtitle}>{subtitle}</p>
                        
                        <motion.p
                          className={projectsGalleryStyles.hoverDescription}
                          layout
                        >
                          {isExpanded || !isTruncated ? (
                            <>
                              {description}
                              {isTruncated && (
                                <>
                                  {' '}
                                  <button
                                    onClick={(e) => toggleExpand(index, e)}
                                    className={projectsGalleryStyles.expandLink}
                                  >
                                    <span>{t('less')}</span>
                                    <ChevronUp size={14} />
                                  </button>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              {truncated}...{' '}
                              <button
                                onClick={(e) => toggleExpand(index, e)}
                                className={projectsGalleryStyles.expandLink}
                              >
                                <span>{t('more')}</span>
                                <ChevronDown size={14} />
                              </button>
                            </>
                          )}
                        </motion.p>

                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={projectsGalleryStyles.hoverLink}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>{t('learnMore')}</span>
                          <ExternalLink size={14} />
                        </a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export { ProjectsGallery };
