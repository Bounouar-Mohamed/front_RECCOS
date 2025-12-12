'use client';

import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Plus,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from '@/app/ui/carousel';
import { useIsMobile } from '@/lib/hooks/useIsMobile';
import { featuresCarouselStyles } from './featuresCarousel.styles';

// Dots Navigation Component for Mobile
const MobileDotsNavigation = ({
  total,
  activeIndex,
  onDotClick,
}: {
  total: number;
  activeIndex: number;
  onDotClick: (index: number) => void;
}) => {
  return (
    <div className={featuresCarouselStyles.mobileDotsContainer}>
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          onClick={() => onDotClick(index)}
          className={cn(
            featuresCarouselStyles.mobileDot,
            index === activeIndex && featuresCarouselStyles.mobileDotActive,
          )}
          aria-label={`Go to slide ${index + 1}`}
        />
      ))}
    </div>
  );
};

// Helper function to format title with punctuation
const formatTitle = (title: string): string => {
  const trimmedTitle = title.trim();
  const lastChar = trimmedTitle[trimmedTitle.length - 1];
  // Si le titre se termine déjà par . ? ! ou —, ne pas ajouter de point
  if (lastChar === '.' || lastChar === '?' || lastChar === '!' || lastChar === '—') {
    return trimmedTitle;
  }
  return trimmedTitle + '.';
};

// Typewriter effect component
const TypewriterText = ({ text, isActive }: { text: string; isActive: boolean }) => {
  const [displayedText, setDisplayedText] = useState('');
  const words = text.split(' ');

  useEffect(() => {
    if (!isActive) {
      setDisplayedText('');
      return;
    }

    let currentWordIndex = 0;
    const interval = setInterval(() => {
      if (currentWordIndex < words.length) {
        setDisplayedText(
          words.slice(0, currentWordIndex + 1).join(' ') + 
          (currentWordIndex < words.length - 1 ? ' ' : '')
        );
        currentWordIndex++;
      } else {
        clearInterval(interval);
      }
    }, 50); // Vitesse d'apparition des mots (50ms par mot)

    return () => clearInterval(interval);
  }, [isActive, text]);

  return <>{displayedText}</>;
};

// Component for expandable description in mobile
const ExpandableDescription = ({ desc }: { desc: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const t = useTranslations('home.features');
  const maxLength = 120; // Nombre de caractères avant troncature
  const shouldTruncate = desc.length > maxLength;
  const truncatedDesc = shouldTruncate ? desc.slice(0, maxLength) : desc;
  const additionalText = shouldTruncate ? desc.slice(maxLength) : '';

  const handleExpand = () => {
    setIsExpanded(true);
    // Démarrer l'animation typewriter après un court délai pour laisser la box s'agrandir
    setTimeout(() => setShouldAnimate(true), 200);
  };

  const handleCollapse = () => {
    setShouldAnimate(false);
    setIsExpanded(false);
  };

  return (
    <motion.div 
      className={featuresCarouselStyles.mobileDescriptionContainer}
      layout
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
    >
      <motion.div 
        className={featuresCarouselStyles.mobileDescription}
        layout
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
      >
        {isExpanded ? (
          <>
            {truncatedDesc}
            {shouldTruncate && additionalText && (
              <>
                {' '}
                <TypewriterText text={additionalText} isActive={shouldAnimate} />
              </>
            )}
            {shouldTruncate && (
              <button
                onClick={handleCollapse}
                className={featuresCarouselStyles.mobileReadMoreButton}
              >
                {' '}{t('readLess')}
              </button>
            )}
          </>
        ) : (
          <>
            {truncatedDesc}
            {shouldTruncate && (
              <>
                {'... '}
                <button
                  onClick={handleExpand}
                  className={featuresCarouselStyles.mobileReadMoreButton}
                >
                  {t('readMore')}
                </button>
              </>
            )}
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

// Carousel component that syncs with isActive state
const CarouselWithActiveSync = ({
  isActive,
  setIsActive,
  FEATURES,
}: {
  isActive: number;
  setIsActive: (index: number) => void;
  FEATURES: {
    id: number;
    name: string;
    desc: string;
    src: string;
  }[];
}) => {
  const [api, setApi] = useState<CarouselApi | null>(null);

  // Listen to carousel slide changes and update isActive
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      const currentIndex = api.selectedScrollSnap();
      setIsActive(currentIndex);
    };

    api.on('select', onSelect);
    onSelect(); // Set initial state

    return () => {
      api.off('select', onSelect);
    };
  }, [api, setIsActive]);

  // Scroll to active slide when isActive changes externally
  useEffect(() => {
    if (!api) return;

    const currentIndex = api.selectedScrollSnap();
    if (currentIndex !== isActive) {
      api.scrollTo(isActive);
    }
  }, [api, isActive]);

  return (

        <Carousel className={featuresCarouselStyles.fullWidth} setApi={setApi}>
          <CarouselContent className={featuresCarouselStyles.carouselContent}>
            {FEATURES.map((feature, index) => (
              <CarouselItem
                key={index}
                className={featuresCarouselStyles.carouselItem}
              >
                <motion.div
                  layout
                  transition={{
                    type: 'spring',
                    duration: 0.7,
                    bounce: 0.3,
                  }}
                  style={{
                    borderRadius: '25px',
                  }}
                  className={cn(
                    featuresCarouselStyles.featureItem({ isActive: isActive === index }),
                    featuresCarouselStyles.mobileFeatureItem,
                  )}
                >
                    <motion.div
                      key="name"
                      initial={{ opacity: 0, filter: 'blur(2px)' }}
                      animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                      transition={{
                        duration: 0.5,
                        delay: 0.25,
                        y: {
                          duration: 0.5,
                          delay: 0.25,
                        },
                      }}
                      className={cn(
                        featuresCarouselStyles.featureExpanded,
                        featuresCarouselStyles.mobileFeatureExpanded,
                      )}
                    >
                      <div className={featuresCarouselStyles.featureTitle}>
                        <b className={featuresCarouselStyles.capitalize}>{formatTitle(feature.name)}</b>
                      </div>
                      <ExpandableDescription desc={feature.desc} />
                    </motion.div>
               
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
    
  );
};

const FeaturesCarousel = () => {
  const tReccos = useTranslations('home.features.reccos');
  const tOwnership = useTranslations('home.features.ownership');
  const tMarketplace = useTranslations('home.features.marketplace');
  const tNoor = useTranslations('home.features.noor');
  const tWhyDubai = useTranslations('home.features.whyDubai');
  const tHowItWorks = useTranslations('home.features.howItWorks');
  const tSecurity = useTranslations('home.features.security');
  
  const FEATURES = [
    {
      id: 1,
      name: tReccos('name'),
      desc: tReccos('desc'),
      src: '/animations/JBR.webm',
    },
    {
      id: 2,
      name: tOwnership('name'),
      desc: tOwnership('desc'),
      src: '/images/stempTitleDeedV2.jpg',
    },
    {
      id: 3,
      name: tMarketplace('name'),
      desc: tMarketplace('desc'),
      src: '/animations/Marketplace.webm',
    },
    {
      id: 4,
      name: tNoor('name'),
      desc: tNoor('desc'),
      src: '/images/Noor_x4.png',
    },
    {
      id: 5,
      name: tWhyDubai('name'),
      desc: tWhyDubai('desc'),
      src: '/animations/light.webm',
    },
    {
      id: 6,
      name: tHowItWorks('name'),
      desc: tHowItWorks('desc'),
      src: '/images/howItsWork.jpg',
    },
    {
      id: 7,
      name: tSecurity('name'),
      desc: tSecurity('desc'),
      src: '/animations/security.webm',
    },
  ];

  const [isActive, setIsActive] = useState<number>(0);
  const [isInViewport, setIsInViewport] = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const { isMobile, isLoading } = useIsMobile();
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeFeature = FEATURES[isActive] ?? FEATURES[0];
  const isMarketplaceVideo = activeFeature?.src?.includes('Marketplace');
  const isVideoFeature = /\.(mp4|webm)$/i.test(activeFeature?.src ?? '');

  // Initialiser les refs pour toutes les vidéos
  useEffect(() => {
    videoRefs.current = videoRefs.current.slice(0, FEATURES.length);
  }, []);

  // Observer pour détecter quand le composant entre dans le viewport
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInViewport(true);
          } else {
            setIsInViewport(false);
          }
        });
      },
      {
        threshold: 0.3, // Déclencher quand 30% du composant est visible
        rootMargin: '0px',
      }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Lancer la première vidéo quand le composant entre dans le viewport pour la première fois
  useEffect(() => {
    if (isInViewport && !hasPlayedOnce && isActive === 0) {
      const currentVideo = videoRefs.current[0];
      if (currentVideo) {
        currentVideo.currentTime = 0;
        currentVideo.playbackRate = 1.75;
        currentVideo.play().catch(() => {
          // Ignorer les erreurs de lecture automatique
        });
        setHasPlayedOnce(true);
      }
    }
  }, [isInViewport, hasPlayedOnce, isActive]);

  // Définir la vitesse de lecture : 1.75x pour JBR (première vidéo), 1.5x pour les autres
  useEffect(() => {
    videoRefs.current.forEach((videoRef, index) => {
      if (videoRef) {
        // La première vidéo (JBR) à 1.75x, les autres à 1.5x
        videoRef.playbackRate = index === 0 ? 1.75 : 1.5;
      }
    });
  }, []);

  // Relancer la vidéo active quand on change de feature (sauf pour la première qui est gérée par le viewport)
  useEffect(() => {
    // Si c'est la première vidéo et qu'on n'a pas encore joué, laisser l'observer gérer
    if (isActive === 0 && !hasPlayedOnce) return;
    
    const currentVideo = videoRefs.current[isActive];
    if (currentVideo) {
      // Remettre la vidéo au début
      currentVideo.currentTime = 0;
      // La première vidéo (JBR) à 1.75x, les autres à 1.5x
      currentVideo.playbackRate = isActive === 0 ? 1.75 : 1.5;
      currentVideo.play().catch(() => {
        // Ignorer les erreurs de lecture automatique
      });
    }
  }, [isActive, hasPlayedOnce]);

  return (
    <MotionConfig
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 30,
      }}
    >
      <div className={featuresCarouselStyles.root} ref={containerRef}>
        <div className={featuresCarouselStyles.container}>
          <div className={featuresCarouselStyles.contentWrapper}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ ease: 'easeOut', duration: 0.3 }}
              className={featuresCarouselStyles.navButtonsContainer}
            >
                <button
                  onClick={() => {
                    if (isActive > 0) {
                      setIsActive(isActive - 1);
                    }
                  }}
                  disabled={isActive === 0}
                  className={cn(
                    featuresCarouselStyles.navButton,
                    isActive === 0 && featuresCarouselStyles.navButtonDisabled,
                  )}
                >
                  <ChevronUp className={featuresCarouselStyles.iconSize6} strokeWidth={3} />
                </button>
                <button
                  onClick={() => {
                    if (isActive < FEATURES.length - 1) {
                      setIsActive(isActive + 1);
                    }
                  }}
                  disabled={isActive === FEATURES.length - 1}
                  className={cn(
                    featuresCarouselStyles.navButton,
                    isActive === FEATURES.length - 1 &&
                      featuresCarouselStyles.navButtonDisabled,
                  )}
                >
                  <ChevronDown className={featuresCarouselStyles.iconSize6} strokeWidth={3} />
                </button>
            </motion.div>

            {/* desktop */}
            <ul className={featuresCarouselStyles.desktopList}>
              {FEATURES.map((feature, index) => (
                <motion.li
                  key={index}
                  layout
                  transition={{
                    type: 'spring',
                    duration: 0.7,
                    bounce: 0.3,
                  }}
                  style={{
                    borderRadius: '25px',
                  }}
                  className={featuresCarouselStyles.featureItem({ isActive: isActive === index })}
                >
                  {isActive === index ? (
                    <motion.div
                      key="name"
                      initial={{ opacity: 0, filter: 'blur(2px)' }}
                      animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                      transition={{
                        duration: 0.5,
                        delay: 0.25,
                        y: {
                          duration: 0.5,
                          delay: 0.25,
                        },
                      }}
                      className={featuresCarouselStyles.featureExpanded}
                    >
                      <div className={featuresCarouselStyles.featureTitle}>
                        <b className={featuresCarouselStyles.capitalize}>{formatTitle(feature.name)}</b>
                      </div>
                      <div className={featuresCarouselStyles.featureDescription}>
                        {feature.desc}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="btn"
                      initial={{ opacity: 0, filter: 'blur(2px)' }}
                      animate={{ opacity: 1, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, filter: 'blur(2px)' }}
                      transition={{ duration: 0.3, delay: 0.25 }}
                      onClick={() => setIsActive(index)}
                      className={featuresCarouselStyles.featureButton}
                    >
                      <PlusAdd />
                      <span className={featuresCarouselStyles.featureName}>
                        {feature.name}
                      </span>
                    </motion.button>
                  )}
                </motion.li>
              ))}
            </ul>

            {/* mobile */}
            {isMobile && (
              <div className={featuresCarouselStyles.mobileCarouselContainer}>
                <div className={featuresCarouselStyles.mobileCarouselWrapper}>
                  <CarouselWithActiveSync
                    isActive={isActive}
                    setIsActive={setIsActive}
                    FEATURES={FEATURES}
                  />
                </div>
                <MobileDotsNavigation
                  total={FEATURES.length}
                  activeIndex={isActive}
                  onDotClick={setIsActive}
                />
              </div>
            )}
          </div>

          <div className={featuresCarouselStyles.imageContainer}>
            <AnimatePresence mode="popLayout">
              <motion.div
                initial={{
                  opacity: 0,
                  x: '15%',
                  scale: 0.9,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  transition: {
                    delay: 0.2,
                    type: 'spring',
                    stiffness: 350,
                    damping: 30,
                  },
                }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                }}
                exit={{
                  opacity: 0,
                  x: '-15%',
                  scale: 0.9,
                }}
                key={isActive}
                className={cn(featuresCarouselStyles.image)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'visible',
                }}
              >
                {isVideoFeature ? (
                  <video
                    ref={(el) => {
                      videoRefs.current[isActive] = el;
                    }}
                    src={activeFeature.src}
                    autoPlay={isActive !== 0 || hasPlayedOnce}
                    muted
                    loop={isMarketplaceVideo}
                    playsInline
                    preload="auto"
                    onLoadedMetadata={(e) => {
                      // La première vidéo (JBR) à 1.75x, les autres à 1.5x
                      e.currentTarget.playbackRate = isActive === 0 ? 1.75 : 1.5;
                    }}
                    onEnded={(e) => {
                      if (isMarketplaceVideo) return;
                      // S'assurer que la vidéo reste sur la dernière frame
                      const video = e.currentTarget;
                      video.pause();
                      // Forcer la vidéo à rester sur la dernière frame
                      video.currentTime = video.duration;
                    }}
                    style={{
                      objectFit: 'contain',
                      width: 'auto',
                      height: '100%',
                      maxHeight: '100%',
                      maxWidth: '100%',
                    }}
                    className={featuresCarouselStyles.imageTranslated}
                  />
                ) : (
                  <img
                    src={activeFeature.src}
                    alt=""
                    className={featuresCarouselStyles.imageTranslated}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
};

export { FeaturesCarousel };

const PlusAdd = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      version="1.1"
      width="24px"
      height="24px"
      viewBox="0 0 24 24"
      {...props}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="11.3"
        fill="none"
        stroke="white"
      ></circle>
      <g transform="translate(7 7)" fill="white" stroke="none">
        <path d="m9 4h-3v-3c0-0.553-0.447-1-1-1s-1 0.447-1 1v3h-3c-0.553 0-1 0.447-1 1s0.447 1 1 1h3v3c0 0.553 0.447 1 1 1s1-0.447 1-1v-3h3c0.553 0 1-0.447 1-1s-0.447-1-1-1"></path>
      </g>
    </svg>
  );
};