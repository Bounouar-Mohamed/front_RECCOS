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
    mt: { base: '80px', md: '120px' },
    pt: { base: 12, md: 16 },
  }),

  mainContent: css({
    display: 'flex',
    flexDirection: { base: 'column', lg: 'row' },
    w: '100%',
    gap: { base: 12, lg: 16 },
    paddingX: '5% !important',
    pb: { base: 12, md: 16 },
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  }),

  // Newsletter section
  newsletterSection: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    w: { base: '100%', lg: '40%' },
    gap: 0,
  }),

  sectionTitle: css({
    fontSize: { base: 'xl', md: '2xl' },
    fontWeight: 600,
    fontFamily: 'var(--font-inter), sans-serif',
    color: 'white',
    textAlign: 'left',
    mb: 4,
  }),

  newsletterDescription: css({
    fontSize: { base: 'sm', md: 'base' },
    fontWeight: 400,
    fontFamily: 'var(--font-inter), sans-serif',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'left',
    mb: 6,
    lineHeight: 1.7,
    maxW: { base: '100%', lg: '28rem' },
  }),

  vanishFormWrapper: css({
    w: { base: '100%', lg: '100%' },
    maxW: { base: '100%', lg: '28rem' },
    borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
  }),

  // Links sections
  linksSection: css({
    display: 'flex',
    flexDirection: { base: 'column', sm: 'row' },
    flexWrap: 'wrap',
    w: { base: '100%', lg: '60%' },
    gap: { base: 10, sm: 8, md: 12 },
    justifyContent: { base: 'flex-start', lg: 'flex-end' },
  }),

  linksColumn: css({
    display: 'flex',
    flexDirection: 'column',
    minW: { base: '140px', sm: '150px' },
    gap: 4,
  }),

  linksTitle: css({
    fontSize: { base: 'sm', md: 'base' },
    fontWeight: 600,
    fontFamily: 'var(--font-inter), sans-serif',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    mb: 2,
  }),

  navigation: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  }),

  navLink: css({
    fontSize: { base: 'sm', md: 'base' },
    fontWeight: 400,
    fontFamily: 'var(--font-inter), sans-serif',
    color: 'rgba(255, 255, 255, 0.6)',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    _hover: {
      color: 'white',
    },
  }),

  // Contact info
  contactInfo: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  }),

  contactLink: css({
    fontSize: { base: 'sm', md: 'base' },
    fontWeight: 400,
    fontFamily: 'var(--font-inter), sans-serif',
    color: 'rgba(255, 255, 255, 0.6)',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    _hover: {
      color: '#D4AF37',
    },
  }),

  contactText: css({
    fontSize: { base: 'xs', md: 'sm' },
    fontWeight: 400,
    fontFamily: 'var(--font-inter), sans-serif',
    color: 'rgba(255, 255, 255, 0.5)',
    lineHeight: 1.5,
  }),

  // Social links
  socialLinks: css({
    display: 'flex',
    gap: 4,
    mt: 4,
  }),

  socialLink: css({
    fontSize: { base: 'xs', md: 'sm' },
    fontWeight: 500,
    fontFamily: 'var(--font-inter), sans-serif',
    color: 'rgba(255, 255, 255, 0.6)',
    textDecoration: 'none',
    padding: '6px 12px',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    transition: 'all 0.2s ease',
    _hover: {
      color: 'white',
      borderColor: 'rgba(255, 255, 255, 0.4)',
      bg: 'rgba(255, 255, 255, 0.05)',
    },
  }),

  // Bottom section
  bottomSection: css({
    position: 'relative',
    w: '100%',
    p: { base: 6, md: 8, lg: 12 },
    pt: { base: 8, md: 10 },
    pb: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    minH: '200px',
    overflow: 'hidden',
    gap: 4,
  }),

  reccosText: css({
    alignSelf: 'flex-start',
    mt: 'auto',
    mb: '-0.3em !important',
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
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  } as any),

  copyrightWrapper: css({
    display: 'flex',
    flexDirection: { base: 'column', sm: 'row' },
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    w: '100%',
    gap: { base: 2, sm: 4 },
    position: 'absolute',
    bottom: 2,
    right: { base: 4, md: 8 },
  }),

  copyrightText: css({
    fontSize: { base: 'xs', md: 'sm' },
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: 'var(--font-inter), sans-serif',
    fontWeight: 400,
  }),

  copyrightLinks: css({
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  }),

  copyrightLink: css({
    fontSize: { base: 'xs', md: 'sm' },
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: 'var(--font-inter), sans-serif',
    fontWeight: 400,
    textDecoration: 'none',
    transition: 'color 0.2s ease',
    _hover: {
      color: 'rgba(255, 255, 255, 0.8)',
    },
  }),

  copyrightSeparator: css({
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 'xs',
  }),

  // Legacy styles for compatibility
  navigationSection: css({
    display: 'flex',
    flexDirection: 'column',
    w: { base: '100%', lg: '50%' },
  }),

  navigationTitle: css({
    fontSize: { base: 'xl', md: '2xl', lg: '3xl' },
    fontWeight: 500,
    fontFamily: 'var(--font-inter), sans-serif',
    background: 'linear-gradient(to right, #FFFFFF 0%, #656565 50%, #FFFFFF 100%)',
    backgroundClip: 'text',
    color: 'transparent',
    textAlign: 'left',
    mb: 8,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  } as any),

  newsletterTitle: css({
    fontSize: { base: 'xl', md: '2xl', lg: '3xl' },
    fontWeight: 500,
    fontFamily: 'var(--font-inter), sans-serif',
    background: 'linear-gradient(to right, #FFFFFF 0%, #656565 50%, #FFFFFF 100%)',
    backgroundClip: 'text',
    color: 'transparent',
    textAlign: 'left',
    mb: 4,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  } as any),

  vanishFormContainer: css({
    display: 'flex',
    h: { base: '3.5rem', lg: '5.5rem' },
    w: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
    zIndex: 2,
  }),
};
