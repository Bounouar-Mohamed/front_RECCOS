import { css } from '@/styled-system/css';

const filterBarSelectColor = '#000000';

export const filterBarStyles = {
  container: css({
    position: 'relative',
    width: '100%',
    backgroundColor: '#000000',
    py: { base: '24px', md: '32px' },
    zIndex: 10, // Z-index élevé pour passer au-dessus des cartes sticky
  }),

  content: css({
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    maxW: { base: '100%' },
    mx: 'auto',
    gap: { base: '12px', sm: '16px', md: '20px' }, // espace entre chaque bloc
  }),

  // Content pour titre à gauche - sans gap pour ligne continue
  contentTitleLeft: css({
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    maxW: { base: '100%' },
    mx: 'auto',
    gap: { base: '12px', sm: '16px', md: '20px' },
  }),

  // petit trait entre le bord et le label
  leftLine: css({
    height: '1px',
    backgroundColor: '#FFFFFF',
    flexShrink: 0,
    flexBasis: '40px',
  }),

  label: css({
    color: '#FFFFFF',
    fontSize: { base: '2.5rem', sm: '3rem', md: '3.5rem' },
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    lineHeight: 0.85,
    display: 'flex',
    alignItems: 'center',
  }),

  // ligne entre le label et les selects (prend tout l'espace dispo)
  centerLine: css({
    height: '1px',
    backgroundColor: '#FFFFFF',
    flex: '1 1 auto',
    minWidth: '40px',
  }),

  // bloc des deux selects ou titre
  rightSection: css({
    display: 'flex',
    alignItems: 'center',
    gap: { base: '12px', sm: '16px', md: '20px' }, // espace entre les éléments
    flexShrink: 0,
  }),

  // Style pour le titre à droite
  title: css({
    color: '#FFFFFF',
    fontSize: { base: '2.5rem', sm: '3rem', md: '3.5rem' },
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    lineHeight: 0.85,
    display: 'flex',
    alignItems: 'center',
  }),

  // Ligne continue depuis le bord gauche quand il n'y a pas de label
  fullLine: css({
    height: '1px',
    backgroundColor: '#FFFFFF',
    flex: '1 1 auto',
    minWidth: '40px',
  }),

  // Ligne continue jusqu'au bord droit (pour titre à gauche)
  fullLineRight: css({
    height: '1px',
    backgroundColor: '#FFFFFF',
    flex: '1 1 auto',
    minWidth: '40px',
  }),

  // trait après les selects jusqu'au bord droit
  rightLine: css({
    height: '1px',
    backgroundColor: '#FFFFFF',
    flex: '1 1 auto',
    minWidth: '40px',
  }),

  selectWrapper: css({
    flexShrink: 0,
    minW: { base: '140px', sm: '160px', md: '180px' },
    maxW: { base: '100%', sm: '200px' },
    position: 'relative',
    padding: { base: '4px', md: '6px' },
    borderRadius: '9999px',
    backgroundColor: '#FFFFFF', // maquette pill
  }),

  select: css({
    borderRadius: '999px',
    border: '1px solid rgba(255, 255, 255, 0.14)',
    background: 'rgb(255, 255, 255)',
    fontSize: '0.85rem',
    color: `${filterBarSelectColor} !important`,
    outline: 'none',
    cursor: 'pointer',
    '& ~ [data-arrow] path': {
      stroke: `${filterBarSelectColor} !important`,
    },
  }),
};