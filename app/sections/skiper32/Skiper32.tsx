'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';
import { skiper32Styles } from './skiper32.styles';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface Skiper32Props {
  className?: string;
}

const Skiper32 = ({ className }: Skiper32Props) => (
  <div className={cn(skiper32Styles.root, className)}>
    <WithGsap />
  </div>
);

interface IconSVGProps extends React.SVGProps<SVGSVGElement> {
  isExpanded?: boolean;
}

const IconSVG = ({ isExpanded = false, ...props }: IconSVGProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    fill="none"
    viewBox="0 0 20 20"
    {...props}
  >
    <circle cx="10" cy="10" r="10" fill="#D9D9D9" />
    {isExpanded ? (
      // Croix
      <g fill="#000">
        <rect
          width="8"
          height="1.5"
          x="6"
          y="9.25"
          rx=".75"
          transform="rotate(45 10 10)"
        />
        <rect
          width="8"
          height="1.5"
          x="6"
          y="9.25"
          rx=".75"
          transform="rotate(-45 10 10)"
        />
      </g>
    ) : (
      // Flèche
      <g fill="#000">
        <rect width="5" height="1" x="8.898" y="6.101" rx=".5" />
        <rect
          width="5"
          height="1"
          x="12.898"
          y="11.101"
          rx=".5"
          transform="rotate(-90 12.898 11.101)"
        />
        <rect
          width="9.32"
          height="1"
          x="6.101"
          y="13.191"
          rx=".5"
          transform="rotate(-45 6.1 13.191)"
        />
      </g>
    )}
  </svg>
);

const WithGsap = () => {
  const gridFullRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const timelinesRef = useRef<gsap.core.Timeline[]>([]);
  const textTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [expandedCardIndex, setExpandedCardIndex] = useState<number | null>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const settleAnimationRef = useRef<gsap.core.Tween | gsap.core.Timeline | null>(null);
  const settlingPromiseRef = useRef<Promise<void> | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const animateGridFullRef = useRef<(() => void) | null>(null);
  const storedYPercentRef = useRef<number[]>([]);
  const storedScrollProgressRef = useRef(0);
  const shouldRestoreProgressRef = useRef(false);

  const smoothRestorePyramid = () => {
    const gridFull = gridFullRef.current;
    if (!gridFull) {
      shouldRestoreProgressRef.current = true;
      animateGridFullRef.current?.();
      return;
    }

    const gridItems = Array.from(gridFull.querySelectorAll<HTMLElement>('[data-grid-item]'));
    const targets = storedYPercentRef.current;
    
    if (!gridItems.length || !targets.length) {
      shouldRestoreProgressRef.current = true;
      animateGridFullRef.current?.();
      return;
    }

    shouldRestoreProgressRef.current = true;

    // Organiser les cards par colonnes pour un effet de stagger pyramidal
    const numColumns = 7;
    const middleColumnIndex = Math.floor(numColumns / 2);
    const columns: { item: HTMLElement; targetY: number }[][] = Array.from({ length: numColumns }, () => []);

    gridItems.forEach((item, index) => {
      const columnIndex = index % numColumns;
      columns[columnIndex].push({
        item,
        targetY: targets[index] ?? 0,
      });
    });

    const restoreTimeline = gsap.timeline({
      onComplete: () => {
        storedYPercentRef.current = [];
        // Nettoyer les transforms inline avant de relancer ScrollTrigger
        gridItems.forEach((item) => {
          gsap.set(item, { clearProps: 'yPercent' });
        });
        animateGridFullRef.current?.();
      },
    });

    // Animer chaque colonne avec un délai basé sur la distance au centre
    columns.forEach((columnData, columnIndex) => {
      if (!columnData.length) return;

      const distanceFromCenter = Math.abs(columnIndex - middleColumnIndex);
      const columnDelay = distanceFromCenter * 0.08;

      columnData.forEach((data, itemIndex) => {
        const itemDelay = columnDelay + itemIndex * 0.03;

        restoreTimeline.to(
          data.item,
          {
            yPercent: data.targetY,
            duration: 0.7,
            ease: 'power2.inOut',
          },
          itemDelay,
        );
      });
    });
  };

  const animateGridFull = () => {
      const gridFull = gridFullRef.current;
      if (!gridFull) return;

      const gridFullItems = gridFull.querySelectorAll<HTMLElement>('[data-grid-item]');
      if (!gridFullItems.length) return;

      const numColumns = 7;
      const middleColumnIndex = Math.floor(numColumns / 2);
      const columns: HTMLElement[][] = Array.from({ length: numColumns }, () => []);

      gridFullItems.forEach((item, index) => {
        const columnIndex = index % numColumns;
        columns[columnIndex].push(item);
      });

      timelinesRef.current.forEach((timeline) => timeline.kill());
      timelinesRef.current = columns
        .filter((columnItems) => columnItems.length)
        .map((columnItems, columnIndex) => {
          const delayFactor = Math.abs(columnIndex - middleColumnIndex) * 0.2;
          const images = columnItems.map((item) => item.querySelector<HTMLElement>('[data-grid-img]')).filter(Boolean);

          const timeline = gsap.timeline({
            scrollTrigger: {
              trigger: gridFull,
              start: 'top bottom',
              end: 'center center',
              scrub: true,
            },
          });

          timeline.from(
            columnItems,
            {
              yPercent: 450,
              autoAlpha: 0,
              ease: 'sine',
            },
            delayFactor,
          );

          if (images.length) {
            timeline.from(
              images,
              {
                transformOrigin: '50% 0%',
                ease: 'sine',
              },
              delayFactor,
            );
          }

          return timeline;
        });

      resizeObserverRef.current = new ResizeObserver(() => ScrollTrigger.refresh());
      resizeObserverRef.current.observe(gridFull);

      if (shouldRestoreProgressRef.current) {
        const progress = storedScrollProgressRef.current;
        requestAnimationFrame(() => {
          timelinesRef.current.forEach((timeline) => {
            if (timeline.scrollTrigger) {
              (timeline.scrollTrigger as any).progress = progress;
              timeline.scrollTrigger.update();
            }
          });
          shouldRestoreProgressRef.current = false;
        });
      }
    };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const animateTextElement = () => {
      if (!textRef.current) return;
      const chars = textRef.current.querySelectorAll<HTMLElement>('[data-char]');
      if (!chars.length) return;

      textTimelineRef.current?.kill();
      textTimelineRef.current = gsap
        .timeline({
          scrollTrigger: {
            trigger: textRef.current,
            start: 'top bottom',
            end: 'center center-=25%',
            scrub: true,
          },
        })
        .from(chars, {
          ease: 'sine',
          yPercent: 300,
          autoAlpha: 0,
          stagger: {
            each: 0.04,
            from: 'center',
          },
        });
    };

    // Stocker la fonction dans la ref pour pouvoir la réutiliser
    animateGridFullRef.current = animateGridFull;

    const timer = window.setTimeout(() => {
      animateTextElement();
      animateGridFull();
      window.scrollTo({ top: 0, behavior: 'auto' });
    }, 100);

    return () => {
      window.clearTimeout(timer);
      timelinesRef.current.forEach((timeline) => timeline.kill());
      timelinesRef.current = [];
      textTimelineRef.current?.kill();
      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;
      settleAnimationRef.current?.kill();
      settlingPromiseRef.current = null;
    };
  }, []);

  const settleGridBeforeFlip = () => {
    if (!gridFullRef.current) {
      return Promise.resolve();
    }

    if (settlingPromiseRef.current) {
      return settlingPromiseRef.current;
    }

    const gridItems = Array.from(
      gridFullRef.current.querySelectorAll<HTMLElement>('[data-grid-item]'),
    );

    if (!gridItems.length) {
      return Promise.resolve();
    }

    storedYPercentRef.current = gridItems.map(
      (item) => Number(gsap.getProperty(item, 'yPercent')) || 0,
    );

    if (timelinesRef.current.length) {
      const firstTimeline = timelinesRef.current.find((timeline) => !!timeline.scrollTrigger);
      if (firstTimeline?.scrollTrigger) {
        storedScrollProgressRef.current = firstTimeline.scrollTrigger.progress;
      }
    }

    timelinesRef.current.forEach((timeline) => {
      timeline.scrollTrigger?.disable();
      timeline.scrollTrigger?.kill();
      timeline.kill();
    });
    timelinesRef.current = [];

    const promise = new Promise<void>((resolve) => {
      settleAnimationRef.current?.kill();

      const numColumns = 7;
      const columns: HTMLElement[][] = Array.from({ length: numColumns }, () => []);
      gridItems.forEach((item, index) => {
        columns[index % numColumns]?.push(item);
      });

      // Animation plus rapide pour réduire le délai
      const alignTimeline = gsap.timeline({
        defaults: {
          duration: 0.25,
          ease: 'power2.out',
        },
        onComplete: () => {
          settleAnimationRef.current = null;
          settlingPromiseRef.current = null;
          resolve();
        },
      });

      columns.forEach((columnItems, columnIndex) => {
        if (!columnItems.length) return;
        alignTimeline.to(
          columnItems,
          {
            yPercent: 0,
            xPercent: 0,
            autoAlpha: 1,
            stagger: {
              each: 0.02,
              from: 'start',
            },
          },
          columnIndex * 0.04,
        );
      });

      if (!alignTimeline.totalDuration()) {
        alignTimeline.kill();
        settleAnimationRef.current = null;
        settlingPromiseRef.current = null;
        resolve();
        return;
      }

      settleAnimationRef.current = alignTimeline;
    });

    settlingPromiseRef.current = promise;
    return promise;
  };

  const handleCardClick = async (index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    
    const gridElement = gridFullRef.current;
    const cardElement = cardRefs.current[index];
    if (!cardElement || !gridElement) return;

    // Démarrer le settling en arrière-plan mais ne pas attendre pour l'agrandissement
    const settlingPromise = settleGridBeforeFlip();
    
    const gridRect = gridElement.getBoundingClientRect();
    const allCards = Array.from(cardRefs.current).filter(Boolean) as HTMLElement[];

    if (expandedCardIndex === index) {
      // Réduire la card - Animation FLIP
      // Étape 1: Capturer les positions actuelles (relatives à la grille)
      const firstPositions = allCards.map((card) => {
        const rect = card.getBoundingClientRect();
        return {
          left: rect.left - gridRect.left,
          top: rect.top - gridRect.top,
        };
      });
      
      // Étape 2: Changer les propriétés grid
      cardElement.style.gridColumn = 'span 1';
      cardElement.style.gridRow = 'span 1';
      setExpandedCardIndex(null);
      
      // Forcer le reflow
      requestAnimationFrame(() => {
        // Étape 3: Capturer les nouvelles positions
        const lastPositions = allCards.map((card) => {
          const rect = card.getBoundingClientRect();
          return {
            left: rect.left - gridRect.left,
            top: rect.top - gridRect.top,
          };
        });
        
        // Animer l'overlay pour disparaître
        if (overlayRef.current) {
          gsap.to(overlayRef.current, {
            opacity: 0,
            duration: 0.4,
            ease: 'power2.out',
            onComplete: () => {
              if (overlayRef.current) {
                overlayRef.current.style.pointerEvents = 'none';
              }
            },
          });
        }

        // Étape 4: Animer toutes les cards avec une animation plus fluide
        const masterTimeline = gsap.timeline({
          onComplete: () => {
            // Nettoyer les transforms x/y avant de passer au yPercent
            allCards.forEach((card) => {
              gsap.set(card, { clearProps: 'x,y' });
            });
            
            ScrollTrigger.refresh();
            
            // Petit délai pour laisser le DOM se stabiliser
            requestAnimationFrame(() => {
              smoothRestorePyramid();
            });
          },
        });

        allCards.forEach((card, i) => {
          const first = firstPositions[i];
          const last = lastPositions[i];
          const deltaX = first.left - last.left;
          const deltaY = first.top - last.top;
          
          // Réinitialiser la transformation avant l'animation
          gsap.set(card, { x: deltaX, y: deltaY });
          
          masterTimeline.to(
            card,
            {
              x: 0,
              y: 0,
              zIndex: 10,
              duration: 0.6,
              ease: 'power2.out',
            },
            i * 0.008,
          );
        });
      });
    } else {
      // Agrandir la card - Animation FLIP
      // Réduire la card précédemment agrandie si elle existe
      if (expandedCardIndex !== null) {
        const prevCard = cardRefs.current[expandedCardIndex];
        if (prevCard) {
          prevCard.style.gridColumn = 'span 1';
          prevCard.style.gridRow = 'span 1';
        }
      }
      
      // Étape 1: Capturer les positions actuelles (relatives à la grille)
      const firstPositions = allCards.map((card) => {
        const rect = card.getBoundingClientRect();
        return {
          left: rect.left - gridRect.left,
          top: rect.top - gridRect.top,
        };
      });
      
      // Étape 2: Changer les propriétés grid immédiatement
      setExpandedCardIndex(index);
      cardElement.style.gridColumn = 'span 2';
      cardElement.style.gridRow = 'span 2';
      
      // Animer l'overlay immédiatement (en parallèle)
      if (overlayRef.current) {
        overlayRef.current.style.pointerEvents = 'auto';
        gsap.fromTo(
          overlayRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.35,
            ease: 'power2.out',
          },
        );
      }

      // Faire le FLIP immédiatement sans attendre le settling
      // Le settling continue en arrière-plan
      requestAnimationFrame(() => {
        // Étape 3: Capturer les nouvelles positions
        const lastPositions = allCards.map((card) => {
          const rect = card.getBoundingClientRect();
          return {
            left: rect.left - gridRect.left,
            top: rect.top - gridRect.top,
          };
        });

        // Étape 4: Animer toutes les cards avec une animation plus fluide
        const masterTimeline = gsap.timeline({
          onComplete: () => {
            ScrollTrigger.refresh();
            
            // Attendre que le layout soit complètement mis à jour avant de scroller
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                // Calculer la position finale de la card agrandie
                const finalCardRect = cardElement.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const cardCenterY = finalCardRect.top + finalCardRect.height / 2;
                const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
                const targetScrollY = currentScrollY + cardCenterY - viewportHeight / 2;

                // Scroller pour centrer la card de manière fluide avec GSAP
                const scrollObj = { y: currentScrollY };
                gsap.to(scrollObj, {
                  y: targetScrollY,
                  duration: 1,
                  ease: 'power3.out',
                  onUpdate: () => {
                    window.scrollTo(0, scrollObj.y);
                  },
                });
              });
            });
          },
        });

        allCards.forEach((card, i) => {
          const first = firstPositions[i];
          const last = lastPositions[i];
          const deltaX = first.left - last.left;
          const deltaY = first.top - last.top;
          
          // Réinitialiser la transformation avant l'animation
          gsap.set(card, { x: deltaX, y: deltaY });
          
          masterTimeline.to(
            card,
            {
              x: 0,
              y: 0,
              zIndex: card === cardElement ? 100 : 10,
              duration: 0.6,
              ease: 'power3.out',
            },
            i * 0.005,
          );
        });
      });
    }
  };

  const handleOutsideClick = () => {
    if (expandedCardIndex !== null && gridFullRef.current) {
      const cardElement = cardRefs.current[expandedCardIndex];
      if (!cardElement) return;

      const gridRect = gridFullRef.current.getBoundingClientRect();
      const allCards = Array.from(cardRefs.current).filter(Boolean) as HTMLElement[];
      
      // Étape 1: Capturer les positions actuelles (relatives à la grille)
      const firstPositions = allCards.map((card) => {
        const rect = card.getBoundingClientRect();
        return {
          left: rect.left - gridRect.left,
          top: rect.top - gridRect.top,
        };
      });
      
      // Étape 2: Changer les propriétés grid
      cardElement.style.gridColumn = 'span 1';
      cardElement.style.gridRow = 'span 1';
      setExpandedCardIndex(null);
      
      // Forcer le reflow
      requestAnimationFrame(() => {
        // Étape 3: Capturer les nouvelles positions
        const lastPositions = allCards.map((card) => {
          const rect = card.getBoundingClientRect();
          return {
            left: rect.left - gridRect.left,
            top: rect.top - gridRect.top,
          };
        });
        
        // Animer l'overlay pour disparaître
        if (overlayRef.current) {
          gsap.to(overlayRef.current, {
            opacity: 0,
            duration: 0.4,
            ease: 'power2.out',
            onComplete: () => {
              if (overlayRef.current) {
                overlayRef.current.style.pointerEvents = 'none';
              }
            },
          });
        }

        // Étape 4: Animer toutes les cards avec une animation plus fluide
        const masterTimeline = gsap.timeline({
          onComplete: () => {
            // Nettoyer les transforms x/y avant de passer au yPercent
            allCards.forEach((card) => {
              gsap.set(card, { clearProps: 'x,y' });
            });
            
            ScrollTrigger.refresh();
            
            // Petit délai pour laisser le DOM se stabiliser
            requestAnimationFrame(() => {
              smoothRestorePyramid();
            });
          },
        });

        allCards.forEach((card, i) => {
          const first = firstPositions[i];
          const last = lastPositions[i];
          const deltaX = first.left - last.left;
          const deltaY = first.top - last.top;
          
          // Réinitialiser la transformation avant l'animation
          gsap.set(card, { x: deltaX, y: deltaY });
          
          masterTimeline.to(
            card,
            {
              x: 0,
              y: 0,
              zIndex: 10,
              duration: 0.6,
              ease: 'power2.out',
            },
            i * 0.008,
          );
        });
      });
    }
  };

  return (
    <div className={cn(skiper32Styles.gsapRoot)} onClick={handleOutsideClick}>
      <section className={cn(skiper32Styles.gsapSection)}>
        <div ref={gridFullRef} className={cn(skiper32Styles.gsapGridWrapper)}>
          {gsapImages.map((img, index) => (
            <figure
              key={`skiper-gsap-${img}-${index}`}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              className={cn(
                skiper32Styles.gridFullItem,
                expandedCardIndex === index && skiper32Styles.gridFullItemExpanded,
              )}
              data-grid-item
            >
              <IconSVG
                className={cn(skiper32Styles.cardIcon)}
                isExpanded={expandedCardIndex === index}
                onClick={(e) => handleCardClick(index, e)}
              />
              <img
                src={img}
                alt=""
                data-grid-img
                className={cn(skiper32Styles.gridItemImg)}
                loading="lazy"
                decoding="async"
              />
            </figure>
          ))}
        </div>
        {/* Overlay avec blur */}
        <div
          ref={overlayRef}
          className={cn(skiper32Styles.blurOverlay)}
          style={{ pointerEvents: expandedCardIndex !== null ? 'auto' : 'none' }}
          onClick={handleOutsideClick}
        />
      </section>
    </div>
  );
};

const availableImages = [
  '/images/TowerJBR.png',
  '/images/TowerBlock.png',
  '/images/Burj.jpg',
  '/images/Grue.jpg',
  '/images/NoorIA.jpg',
  '/images/howItsWork.jpg',
  '/images/musee-du-futur-hd.png',
  '/images/skyline.jpg',
  '/images/skyline.png',
  '/images/stempTitleDeedV2.jpg',
];

const createImageSet = (count: number) =>
  Array.from({ length: count }, (_, index) => availableImages[index % availableImages.length]);

const gsapImages = createImageSet(35);


export { Skiper32 };