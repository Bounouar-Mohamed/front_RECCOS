'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useMemo, useRef } from 'react';
import { heroStyles } from './hero.styles';

export const HeroContent = () => {
  const t = useTranslations('home.hero');
  const hasAnimatedRef = useRef(false);

  const steps = useMemo(() => [
    {
      number: '01',
      title: t('steps.choose.title'),
      description: t('steps.choose.description'),
    },
    {
      number: '02',
      title: t('steps.invest.title'),
      description: t('steps.invest.description'),
    },
    {
      number: '03',
      title: t('steps.own.title'),
      description: t('steps.own.description'),
    },
    {
      number: '04',
      title: t('steps.trade.title'),
      description: t('steps.trade.description'),
    },
  ], [t]);

  // Mémoriser les variants pour éviter leur recréation à chaque render
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 1.0,
      },
    },
  }), []);

  const cardVariants = useMemo(() => ({
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.96,
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  }), []);

  return (
    <>
      {/* Boxes en bas */}
      <motion.div 
        className={heroStyles.bottomContentArea}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        onAnimationComplete={() => {
          hasAnimatedRef.current = true;
        }}
      >
        <div className={heroStyles.stepsContainer}>
          <div className={heroStyles.stepsGrid}>
            {steps.map((step) => (
              <motion.div 
                key={`step-${step.number}`}
                className={heroStyles.stepCard}
                variants={cardVariants}
                style={{ WebkitBackdropFilter: 'blur(20px)' } as React.CSSProperties}
              >
                <div className={heroStyles.stepNumber}>{step.number}</div>
                <h3 className={heroStyles.stepTitle}>{step.title}</h3>
                <p className={heroStyles.stepDescription}>{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
};

