'use client';

import type { MotionValue } from 'framer-motion';
import { useScroll, useTransform, motion } from 'framer-motion';
import { useRef, useState, useEffect, useCallback, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { parallaxStickyContainerStyles } from './parallaxStickyContainer.styles';

export interface ParallaxStickyContainerProps<T> {
  /**
   * Tableau d'éléments à afficher
   */
  items: T[];
  /**
   * Fonction pour rendre chaque élément
   */
  renderItem: (item: T, index: number) => ReactNode;
  /**
   * Nombre d'éléments par ligne (peut être un nombre ou une fonction pour calculer dynamiquement)
   */
  itemsPerRow?: number | (() => number);
  /**
   * Taille d'un élément (en px) - utilisé pour calculer itemsPerRow si itemsPerRow est une fonction
   */
  itemSize?: number;
  /**
   * Espacement horizontal entre les éléments (en px)
   */
  itemGap?: number;
  /**
   * Taille verticale d'un élément (en px) - utilisé pour calculer la hauteur de scroll
   */
  itemHeight?: number;
  /**
   * Décalage vertical entre les lignes (en px)
   */
  rowVerticalOffset?: number;
  /**
   * Hauteur de scroll par ligne (en px) - si non défini, calculé comme itemHeight + 40
   */
  rowScrollHeight?: number;
  /**
   * Position top de base (peut être un nombre ou une fonction pour calculer dynamiquement)
   */
  topOffset?: number | (() => number);
  /**
   * Échelle minimale pour la dernière ligne (entre 0 et 1)
   */
  minScale?: number;
  /**
   * Réduction d'échelle par ligne (entre 0 et 1)
   */
  scaleReduction?: number;
  /**
   * Classes CSS pour le wrapper principal
   */
  wrapperClassName?: string;
  /**
   * Classes CSS pour le container interne
   */
  containerClassName?: string;
  /**
   * Classes CSS pour le container sticky de chaque ligne
   */
  rowContainerClassName?: string;
  /**
   * Classes CSS pour le wrapper de chaque ligne
   */
  rowWrapperClassName?: string;
  /**
   * Style inline pour le wrapper principal
   */
  wrapperStyle?: React.CSSProperties;
  /**
   * Style inline pour le container interne
   */
  containerStyle?: React.CSSProperties;
  /**
   * Fonction pour calculer le range de scroll pour chaque ligne
   */
  calculateRange?: (rowIndex: number, totalRows: number) => [number, number];
  /**
   * Fonction pour calculer l'espace en bas nécessaire
   */
  calculateBottomSpacing?: (totalRows: number, topOffset: number, itemHeight: number, rowVerticalOffset: number) => number;
}

/**
 * Fonction utilitaire pour grouper les éléments en lignes
 */
function groupItemsIntoRows<T>(items: T[], itemsPerRow: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += itemsPerRow) {
    rows.push(items.slice(i, i + itemsPerRow));
  }
  return rows;
}

/**
 * Hook pour calculer le nombre d'éléments par ligne de manière responsive
 */
function useResponsiveItemsPerRow(
  itemSize: number,
  itemGap: number,
  customItemsPerRow?: number | (() => number)
): number {
  const [itemsPerRow, setItemsPerRow] = useState(2);

  const calculateItemsPerRow = useCallback(() => {
    if (customItemsPerRow !== undefined) {
      if (typeof customItemsPerRow === 'function') {
        return customItemsPerRow();
      }
      return customItemsPerRow;
    }

    if (typeof window === 'undefined') return 2;
    const width = window.innerWidth;
    const padding = 40; // px de padding total
    const availableWidth = width - padding;
    
    // Calcule combien d'éléments peuvent tenir
    const possibleItems = Math.floor((availableWidth + itemGap) / (itemSize + itemGap));
    
    // Minimum 1, maximum 4 éléments par ligne
    return Math.max(1, Math.min(4, possibleItems));
  }, [itemSize, itemGap, customItemsPerRow]);

  useEffect(() => {
    setItemsPerRow(calculateItemsPerRow());

    if (typeof customItemsPerRow === 'function' || customItemsPerRow === undefined) {
      const handleResize = () => {
        setItemsPerRow(calculateItemsPerRow());
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [calculateItemsPerRow, customItemsPerRow]);

  return itemsPerRow;
}

/**
 * Hook pour calculer la position top adaptative
 */
function useAdaptiveTopPosition(
  itemSize: number,
  customTopOffset?: number | (() => number)
): number {
  const [topOffset, setTopOffset] = useState(0);

  const calculateTopOffset = useCallback(() => {
    if (customTopOffset !== undefined) {
      if (typeof customTopOffset === 'function') {
        return customTopOffset();
      }
      return customTopOffset;
    }

    if (typeof window === 'undefined') return 0;
    
    const viewportHeight = window.innerHeight;
    let vhPercentage = 0.25; // 25vh par défaut
    
    if (viewportHeight < 900) {
      vhPercentage = 0.15;
    } else if (viewportHeight < 1100) {
      vhPercentage = 0.18;
    }
    
    const calculatedTop = (viewportHeight * vhPercentage) - (itemSize / 2);
    const minTop = 20;
    
    return Math.max(calculatedTop, minTop);
  }, [itemSize, customTopOffset]);

  useEffect(() => {
    setTopOffset(calculateTopOffset());

    if (typeof customTopOffset === 'function' || customTopOffset === undefined) {
      const handleResize = () => {
        setTopOffset(calculateTopOffset());
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [calculateTopOffset, customTopOffset]);

  return topOffset;
}

/**
 * Hook pour calculer l'espace nécessaire en bas
 */
function useBottomSpacing(
  totalRows: number,
  topOffset: number,
  itemHeight: number,
  rowVerticalOffset: number,
  customCalculate?: (totalRows: number, topOffset: number, itemHeight: number, rowVerticalOffset: number) => number
): number {
  const [bottomSpacing, setBottomSpacing] = useState(0);

  const calculateBottomSpacing = useCallback(() => {
    if (customCalculate) {
      return customCalculate(totalRows, topOffset, itemHeight, rowVerticalOffset);
    }

    if (typeof window === 'undefined' || totalRows === 0) return 0;
    
    const viewportHeight = window.innerHeight;
    const lastRowTop = topOffset + ((totalRows - 1) * rowVerticalOffset);
    const lastItemBottom = lastRowTop + itemHeight;
    
    let safetyMargin;
    if (viewportHeight < 900) {
      safetyMargin = Math.max(200, viewportHeight * 0.2);
    } else {
      safetyMargin = Math.max(150, viewportHeight * 0.15);
    }
    const spaceNeeded = lastItemBottom - viewportHeight + safetyMargin;
    
    const minSpacing = viewportHeight < 900 
      ? viewportHeight * 0.3
      : viewportHeight * 0.25;
    
    return Math.max(spaceNeeded, minSpacing);
  }, [totalRows, topOffset, itemHeight, rowVerticalOffset, customCalculate]);

  useEffect(() => {
    setBottomSpacing(calculateBottomSpacing());

    const handleResize = () => {
      setBottomSpacing(calculateBottomSpacing());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateBottomSpacing]);

  return bottomSpacing;
}

/**
 * Composant interne pour une ligne avec animation parallax
 */
function ParallaxRow<T>({
  rowIndex,
  rowItems,
  scrollYProgress,
  range,
  targetScale,
  topPosition,
  rowScrollHeight,
  itemGap,
  rowContainerClassName,
  rowWrapperClassName,
  renderItem,
  calculatedItemsPerRow,
}: {
  rowIndex: number;
  rowItems: T[];
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
  range: [number, number];
  targetScale: number;
  topPosition: number;
  rowScrollHeight: number;
  itemGap: number;
  rowContainerClassName?: string;
  rowWrapperClassName?: string;
  renderItem: (item: T, index: number) => ReactNode;
  calculatedItemsPerRow: number;
}) {
  // Animation de scale basée sur le progress du scroll
  const scale = useTransform(scrollYProgress, range, [1, targetScale]);

  return (
    <div
      className={cn(parallaxStickyContainerStyles.stickyContainer, rowContainerClassName)}
      style={{
        height: `${rowScrollHeight}px`,
      }}
    >
      <motion.div
        style={{
          scale,
          top: `${topPosition}px`,
          gap: `${itemGap}px`,
        }}
        className={cn(parallaxStickyContainerStyles.rowWrapper, rowWrapperClassName)}
      >
        {rowItems.map((item, itemIndex) => {
          const globalIndex = rowIndex * calculatedItemsPerRow + itemIndex;
          return renderItem(item, globalIndex);
        })}
      </motion.div>
    </div>
  );
}

/**
 * Composant réutilisable pour créer un container avec effet parallax 3D sticky
 * 
 * @example
 * ```tsx
 * <ParallaxStickyContainer
 *   items={cards}
 *   renderItem={(card) => <Card key={card.id} card={card} />}
 *   itemSize={450}
 *   itemHeight={450}
 *   itemGap={24}
 * />
 * ```
 */
export function ParallaxStickyContainer<T>({
  items,
  renderItem,
  itemsPerRow,
  itemSize = 450,
  itemGap = 24,
  itemHeight = 450,
  rowVerticalOffset = 35,
  rowScrollHeight,
  topOffset,
  minScale = 0.5,
  scaleReduction = 0.1,
  wrapperClassName,
  containerClassName,
  rowContainerClassName,
  rowWrapperClassName,
  wrapperStyle,
  containerStyle,
  calculateRange,
  calculateBottomSpacing: _customCalculateBottomSpacing, // plus utilisé, on le garde juste pour compat
}: ParallaxStickyContainerProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const list = items ?? [];

  if (!list.length) {
    return null;
  }

  // 1) Combien d’items par ligne (toujours responsive)
  const calculatedItemsPerRow = useResponsiveItemsPerRow(
    itemSize,
    itemGap,
    itemsPerRow,
  );

  // 2) On groupe en lignes
  const rows = groupItemsIntoRows(list, calculatedItemsPerRow);
  const totalRows = rows.length;

  // 3) Géométrie proportionnelle aux cards (rien en vh)
  // Hauteur de la pile : 1 ligne + décalage pour chaque ligne suivante
  const stackHeight =
    itemHeight + (Math.max(totalRows, 1) - 1) * rowVerticalOffset;

  // Marge verticale au-dessus et en dessous, proportionnelle à la hauteur d’une card
  const verticalMargin = itemHeight * 0.6; // tu peux jouer sur 0.4 / 0.8 etc.

  // Position de base du premier "rowWrapper"
  const baseTop =
    typeof topOffset === 'number'
      ? topOffset
      : verticalMargin;

  // Hauteur de scroll de chaque ligne : aussi proportionnelle
  const calculatedRowScrollHeight =
    rowScrollHeight ?? (itemHeight + rowVerticalOffset * 2);

  // 4) Progress du scroll sur toute la section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // 5) Range par défaut pour chaque ligne (inchangé)
  const defaultCalculateRange = (
    rowIndex: number,
    totalRows: number,
  ): [number, number] => {
    const rangeStart = rowIndex * (0.8 / totalRows);
    const rangeEnd = Math.min(0.2 + (rowIndex + 1) * (0.8 / totalRows), 1);
    return [rangeStart, rangeEnd];
  };

  // 6) Scale cible par ligne (inchangé)
  const calculateTargetScale = (
    rowIndex: number,
    totalRows: number,
  ): number => {
    return Math.max(minScale, 1 - (totalRows - rowIndex - 1) * scaleReduction);
  };

  return (
    <main
      ref={containerRef}
      className={cn(wrapperClassName)}
      style={{
        // Espace sous la section proportionnel à la hauteur des cards
        paddingBottom: `${verticalMargin}px`,
        // Si tu veux aussi un peu de marge au-dessus de la section :
        // paddingTop: `${verticalMargin * 0.3}px`,
        ...wrapperStyle,
      }}
    >
      <div className={cn(containerClassName)} style={containerStyle}>
        {rows.map((rowItems, rowIndex) => {
          const targetScale = calculateTargetScale(rowIndex, totalRows);
          const range = calculateRange
            ? calculateRange(rowIndex, totalRows)
            : defaultCalculateRange(rowIndex, totalRows);

          // Position verticale de la ligne, uniquement basée sur la géométrie des cards
          const topPosition = baseTop + rowIndex * rowVerticalOffset;

          return (
            <ParallaxRow
              key={`row_${rowIndex}_${calculatedItemsPerRow}`}
              rowIndex={rowIndex}
              rowItems={rowItems}
              scrollYProgress={scrollYProgress}
              range={range}
              targetScale={targetScale}
              topPosition={topPosition}
              rowScrollHeight={calculatedRowScrollHeight}
              itemGap={itemGap}
              rowContainerClassName={rowContainerClassName}
              rowWrapperClassName={rowWrapperClassName}
              renderItem={renderItem}
              calculatedItemsPerRow={calculatedItemsPerRow}
            />
          );
        })}
      </div>
    </main>
  );
}
