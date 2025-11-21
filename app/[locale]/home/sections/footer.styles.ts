import { css } from '@/styled-system/css';

export const footerStyles = {
  footer: css({
    position: 'relative',
    w: '100%',
    bg: 'black',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  }),

  mainContent: css({
    display: 'flex',
    flexDirection: { base: 'column', lg: 'row' },
    w: '100%',
    gap: { base: 12, lg: 16 },
    paddingX: "5% !important",
  }),

  navigationSection: css({
    display: 'flex',
    flexDirection: 'column',
    w: { base: '100%', lg: '50%' },
  }),

  navigationTitle: css({
    fontSize: { base: 'xl', md: '2xl', lg: '3xl' },
    fontWeight: 500, // Inter Medium
    fontFamily: 'var(--font-inter), sans-serif',
    background: 'linear-gradient(to right, #FFFFFF 0%, #656565 50%, #FFFFFF 100%)',
    backgroundClip: 'text',
    color: 'transparent',
    textAlign: 'left',
    mb: 8,
    // @ts-ignore - Propriétés webkit nécessaires pour le gradient sur texte
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  } as any),

  navigation: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  }),

  navLink: css({
    fontSize: { base: 'base', md: 'lg', lg: 'xl' },
    fontWeight: 400, // Inter Regular
    fontFamily: 'var(--font-inter), sans-serif',
    color: 'rgba(255, 255, 255, 0.8)',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    position: 'relative',
    display: 'inline-block',
    w: 'fit-content',
    py: 2,
    px: 0,
    _hover: {
      color: 'white',
      transform: 'translateX(6px)',
      _after: {
        w: '100%',
      },
    },
    _after: {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      w: 0,
      h: '2px',
      bg: 'rgba(255, 255, 255, 0.6)',
      transition: 'width 0.3s ease',
    },
  }),

  newsletterSection: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    w: { base: '100%', lg: '50%' },
    gap: 0,
  }),

  newsletterTitle: css({
    fontSize: { base: 'xl', md: '2xl', lg: '3xl' },
    fontWeight: 500, // Inter Medium
    fontFamily: 'var(--font-inter), sans-serif',
    background: 'linear-gradient(to right, #FFFFFF 0%, #656565 50%, #FFFFFF 100%)',
    backgroundClip: 'text',
    color: 'transparent',
    textAlign: 'left',
    mb: 4,
    // @ts-ignore - Propriétés webkit nécessaires pour le gradient sur texte
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  } as any),

  newsletterDescription: css({
    fontSize: { base: 'sm', md: 'base' },
    fontWeight: 200, // Inter ExtraLight
    fontFamily: 'var(--font-inter), sans-serif',
    color: 'rgba(255, 255, 255, 0.65)',
    textAlign: 'left',
    mb: 8,
    lineHeight: 1.7,
    maxW: { base: '100%', lg: '32rem' },
  }),

  bottomSection: css({
    position: 'relative',
    w: '100%',
    p: { base: 6, md: 8, lg: 12 },
    pb: 0, // Pas de padding bottom pour éviter l'espace blanc
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    minH: '200px',
    overflow: 'hidden', // Empêche le débordement
    gap: 4,
  }),

  vanishFormContainer: css({
    display: 'flex',
    h: { base: '3.5rem', lg: '5.5rem' },
    w: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
    zIndex: 2,
  }),

  vanishFormWrapper: css({
    w: { base: '100%', lg: '100%' },
    maxW: { base: '100%', lg: '32rem' },
    borderBottom: '1px solid',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    mt: '1em !important',
  }),

  reccosText: css({
    alignSelf: 'flex-start', // Positionné à gauche
    mt: 'auto', // Pousse vers le bas grâce au flexbox
    mb: '-0.3em !important', // Ajustement pour coller au bas comme avant
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    fontSize: { base: 'clamp(4rem, 15vw, 12rem)', md: 'clamp(6rem, 20vw, 16rem)', lg: 'clamp(8rem, 25vw, 20rem)' },
    fontWeight: 400,
    letterSpacing: '-0.02em',
    background: 'linear-gradient(to right, #FFFFFF 0%, #656565 50%, #FFFFFF 100%)',
    backgroundClip: 'text',
    whiteSpace: 'nowrap',
    lineHeight: 1,

    overflow: 'visible',
    color: 'transparent',
    // @ts-ignore - Propriétés webkit nécessaires pour le gradient sur texte
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  } as any),

  copyrightText: css({
    position: 'relative',
    zIndex: 2,
    fontSize: { base: 'xs', md: 'sm' },
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    letterSpacing: '0.05em',
    alignSelf: 'flex-end', // Aligné en bas comme RECCOS
  }),
};

