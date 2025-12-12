import { css } from '@/styled-system/css';

export const launchpadPageStyles = {
  container: css({
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    bg: '#000000',
    color: '#ffffff',
  }),

  // Style pour wrapper chaque section avec espacement uniforme
  sectionWrapper: css({
    width: '100%',
    display: 'block',
    py: '2.5vh',
  }),

  // Style pour Skiper32 sans padding-top
  sectionWrapperNoTopPadding: css({
    paddingTop: '0 !important',
    width: '100%',
    display: 'block',
  }),

  // Style pour la première section avec espacement supplémentaire pour la navbar
  firstSectionWrapper: css({
    paddingTop: { base: 'calc(5vh + 100px) !important', md: 'calc(5vh + 110px) !important' },
    width: '100%',
    display: 'block',
  }),

  grid: css({
    display: 'grid',
    gridTemplateColumns: { base: '1fr', lg: '400px 1fr 1fr' },
    gap: { base: '24px !important', md: '32px !important', lg: '48px !important' },
    width: { base: '100% !important', lg: 'auto !important' },
    maxW: '1920px',
    marginLeft: 'auto !important',
    marginRight: 'auto !important',
    height: { base: 'calc(100vh - 64px) !important', md: 'calc(100vh - 96px) !important', lg: 'calc(100vh - 128px) !important' },
    minHeight: { base: '600px !important', md: '700px !important' },
  }),

  leftColumn: css({
    display: 'flex',
    flexDirection: 'column',
    height: '100% !important',
    maxHeight: '100% !important',
    bg: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px !important',
    padding: { base: '24px !important', md: '24px !important', lg: '24px !important' },
    overflow: 'visible !important',
  }),

  header: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px !important',
    paddingBottom: '24px !important',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  }),

  typeSelector: css({
    flex: 1,
  }),

  typeSelect: css({
    w: '100%',
    bg: 'transparent',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '4px !important',
    padding: { base: '8px 16px !important', md: '8px 16px !important' },
    fontSize: '0.875rem',
    fontWeight: 400,
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    letterSpacing: '0.02em',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    _hover: {
      borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    _focus: {
      outline: 'none',
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    '& option': {
      bg: '#000000',
      color: '#ffffff',
    },
  }),

  icons: css({
    display: 'flex',
    gap: '8px !important',
    marginLeft: '16px !important',
  }),

  iconButton: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    w: '40px',
    h: '40px',
    bg: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '4px !important',
    padding: '0 !important',
    color: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    _hover: {
      borderColor: 'rgba(255, 255, 255, 0.4)',
      color: '#ffffff',
      bg: 'rgba(255, 255, 255, 0.05)',
    },
    _focus: {
      outline: 'none',
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
  }),

  propertiesList: css({
    flex: '1 1 0 !important',
    minHeight: '0 !important',
    height: '100% !important',
    width: '100% !important',
    position: 'relative',
    overflow: 'visible !important',
    display: 'flex',
    flexDirection: 'column',
  }),

  propertyCard: css({
    display: 'flex',
    gap: { base: '16px !important', md: '16px !important' },
    bg: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px !important',
    padding: { base: '16px !important', md: '16px !important' },
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    _hover: {
      bg: 'rgba(255, 255, 255, 0.05)',
      borderColor: 'rgba(255, 255, 255, 0.15)',
      transform: 'translateY(-2px)',
    },
  }),

  propertyImageContainer: css({
    position: 'relative',
    w: '120px',
    h: '120px',
    flexShrink: 0,
    borderRadius: '6px !important',
    overflow: 'hidden',
    bg: 'rgba(255, 255, 255, 0.05)',
  }),

  propertyImage: css({
    objectFit: 'cover',
  }),

  propertyInfo: css({
    display: 'flex',
    flexDirection: 'column',
    gap: { base: '12px !important', md: '12px !important' },
    flex: 1,
  }),

  propertyName: css({
    fontSize: '1.125rem',
    fontWeight: 400,
    letterSpacing: '-0.01em',
    lineHeight: 1.3,
    color: '#ffffff',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    m: 0,
  }),

  propertyType: css({
    fontSize: '0.75rem',
    fontWeight: 400,
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    m: 0,
  }),

  propertyDetails: css({
    display: 'flex',
    flexDirection: 'column',
    gap: { base: '8px !important', md: '8px !important' },
    marginTop: 'auto !important',
  }),

  propertyDetailItem: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),

  propertyDetailLabel: css({
    fontSize: '0.75rem',
    fontWeight: 400,
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }),

  propertyDetailValue: css({
    fontSize: '0.875rem',
    fontWeight: 400,
    color: '#ffffff',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    letterSpacing: '0.02em',
  }),

  rightColumns: css({
    display: { base: 'none', lg: 'grid' },
    gridTemplateColumns: '1fr 1fr',
    gap: { base: '32px !important', md: '32px !important' },
  }),

  rightColumn: css({
    height: '100% !important',
    width: '100% !important',
    position: 'relative',
    overflow: 'hidden',
  }),

  // Styles conservés pour compatibilité
  content: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    maxW: '680px',
    gap: { base: 6, md: 8 },
  }),

  title: css({
    fontSize: { base: '3rem', md: '4.5rem', lg: '5.5rem' },
    fontWeight: 300,
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
    color: '#ffffff',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }),

  comingSoon: css({
    fontSize: { base: '1.125rem', md: '1.25rem' },
    fontWeight: 400,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    textTransform: 'uppercase',
    letterSpacing: '0.15em',
  }),

  stickyCardWrapper: css({
    minHeight: '400vh',
    width: '100%',
    position: 'relative',
  }),
};

