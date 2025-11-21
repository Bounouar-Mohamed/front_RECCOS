import { css } from '@/styled-system/css';

export const projectsGalleryStyles = {
  section: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    h: { base: '100%', lg: '80vh' },
    w: '100%', // w-full

    color: '#F1F1F1', // text-[#F1F1F1]

  }),

  container: css({
    overflow: 'hidden',
    h: '100%',
    bg: '#121212', // bg-[#121212]
    padding: { base: '16px', lg: '10px' },
    borderRadius: '3xl',
  }),

  projectsWrapper: css({
    display: 'flex',
    mx: 'auto',
    w: '100%',
    flexDirection: { base: 'column', lg: 'row' },
    h: '100%',
  }),

  projectItem: css({
    position: 'relative',
    h: '100%',
    w: '100%',
    cursor: 'pointer',
    border: 0,
    padding: '10px !important', // md:pb-[1.3vw]
    borderColor: 'rgba(241, 241, 241, 0.3)',
    lg: {
      borderRight: '1px solid',
      borderRightColor: 'rgba(241, 241, 241, 0.3)',
      '&:last-of-type': {
        borderRight: 'none',
      },
    },
  }),

  projectLabel: css({
    position: 'absolute',
    bottom: 0,
    left: { base: 0, lg: '50%' }, // À gauche en mobile, centré en desktop
    display: 'flex',
    w: { base: '100%', lg: 'calc(80vh - 2.6vw)' }, // base: pleine largeur, md+: hauteur de la section
    transformOrigin: '0 50%', // origin-[0_50%]
    justifyContent: { base: 'flex-start', lg: 'space-between' },
    alignItems: 'center',
    px: { base: 4, lg: 0 },
    pr: { base: 4, lg: 5 },
    fontSize: { base: '1rem', lg: '1.5vw' }, // Taille fixe sur mobile, vw sur desktop
    fontWeight: 'medium',
    letterSpacing: '-0.03em', // tracking-[-0.03em]
    lg: {
      transform: 'rotate(-90deg)', // md:-rotate-90
    },
  }),

  projectLabelText: css({
    w: { base: '100%', lg: 'auto' },
    borderBottom: { base: '1px solid', lg: 'none' },
    borderBottomColor: {
      base: 'rgba(255, 255, 255, 0.3)',
      lg: 'transparent',
    },
    py: { base: 2, lg: 0 }, // py-2 md:py-0
    fontSize: { base: '1rem', lg: 'inherit' }, // Taille lisible sur mobile
    color: { base: 'rgba(241, 241, 241, 0.9)', lg: 'inherit' }, // Plus visible sur mobile
  }),

  projectYear: css({}), // géré par framer-motion

  imageContainer: css({
    position: 'relative',
    h: { base: '100%', lg: '100%' }, // h-[92%] md:h-[100%]
    rounded: '0.6vw', // rounded-[0.6vw] (pas 1.2vw)
    objectFit: 'cover',
    bg: '#000000', // Fond noir derrière l'image
    // Padding autour de l'image pour l'effet de survol

    overflow: 'hidden', // Pour que la box blur reste dans les limites
  }),

  image: css({
    w: '100%', // w-full
    rounded: 'xl', // rounded-xl (pas 1vw)
    // height et objectFit sont dans style inline dans le code source
  }),

  hoverInfoBox: css({
    position: 'absolute',
    bottom: 0,
    left: '2.5%', // Centré horizontalement
    // transform: 'translateX(-50%)', // Ajustement pour centrer parfaitement
    width: '95%',
    // Padding généreux dans la box pour éloigner le texte des bords
    p: '10px !important',
    // Marges importantes autour de la box pour l'éloigner des bords de l'image
    bg: 'rgba(18, 18, 18, 0.75)', // Fond semi-transparent
    backdropFilter: 'blur(12px)', // Effet blur
    rounded: 'xl', // Border radius sur tous les côtés
    border: '1px solid',
    borderColor: 'rgba(241, 241, 241, 0.1)',
    zIndex: 10,
  }),

  hoverTitle: css({
    fontSize: { base: 'xl', lg: '1.5rem' },
    fontWeight: 'bold',
    color: '#F1F1F1',
    mb: 2,
    lineHeight: 1.2,
  }),

  hoverYear: css({
    fontSize: { base: 'sm', lg: '0.875rem' },
    color: 'rgba(241, 241, 241, 0.6)',
    mb: 3,
    fontWeight: 'medium',
  }),

  hoverDescription: css({
    fontSize: { base: 'sm', lg: '0.9rem' },
    color: 'rgba(241, 241, 241, 0.8)',
    lineHeight: 1.6,
  }),
};