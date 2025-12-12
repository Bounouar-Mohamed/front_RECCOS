import { css } from '@/styled-system/css';

export const productPageStyles = {
  container: css({
    width: '100%',
    bg: '#000000',
    color: '#ffffff',
    px: { base: 4, md: 6, lg: 8 },
    paddingTop: { base: 'calc(2vh + 60px) !important', md: 'calc(2vh + 80px) !important' },
    paddingBottom: { base: 8, md: 12, lg: 16 },
    minHeight: '100vh',
    overflow: 'visible',
    display: 'flex',
    flexDirection: 'column',
  }),

  content: css({
    width: '100%',
    maxW: '1600px',
    margin: '0 auto',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    // overflow: 'hidden',
  }),

  // Grille bento avec 3 colonnes
  bentoGrid: css({
    display: 'grid',
    gridTemplateColumns: { base: '1fr', lg: 'repeat(3, 1fr)' },
    gap: { base: 4, md: 6, lg: 8 },
    width: '100%',
    flex: 1,
    alignItems: 'stretch',
    minHeight: 0,
    // overflow: 'hidden',
  }),

  // Première colonne (gauche)
  leftColumn: css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: { base: 4, md: 6 },
    height: '100%',
    minHeight: 0,
    overflow: 'visible',
  }),

  // Breadcrumb en haut
  breadcrumb: css({
    fontFamily: 'var(--font-inter), sans-serif',
    fontWeight: 200, // Inter ExtraLight
    fontSize: { base: '0.65rem', md: '0.75rem' },
    lineHeight: 1.2,
    color: 'rgba(255, 255, 255, 0.6)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    whiteSpace: 'nowrap',
  }),

  breadcrumbSeparator: css({
    color: 'rgba(255, 255, 255, 0.4)',
  }),

  // Nom du bien
  productTitle: css({
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    fontSize: { base: '3rem', md: '4rem', lg: '5rem' },
    lineHeight: 1,
    letterSpacing: '0.04em',
    color: '#ffffff',
    marginTop: { base: 4, md: 6 },
  }),

  // Section description en bas
  descriptionSection: css({
    display: 'flex',
    flexDirection: 'column',
    gap: { base: 3, md: 4 },
    marginTop: 'auto',
  }),

  descriptionLabel: css({
    fontFamily: 'var(--font-inter), sans-serif',
    fontWeight: 400, // Inter Regular
    fontSize: { base: '0.75rem', md: '0.8125rem' },
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: 'rgba(255, 255, 255, 0.5)',
  }),

  builtByContainer: css({
    display: 'inline-block',
    width: 'fit-content',
  }),

  builtByLabel: css({
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    fontSize: { base: '3rem', md: '4rem', lg: '5rem' },
    letterSpacing: '0.04em',
    lineHeight: 1,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: "10px",
  }),

  developerLogoWrapper: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    maxW: { base: '220px', md: '260px' },
    minH: { base: '64px', md: '80px' },
    paddingBlock: { base: '8px', md: '10px' },
  }),

  developerLogo: css({
    width: 'auto',
    height: 'auto',
    opacity: 0.8,
    display: 'block',
    maxWidth: '100%',
    maxH: { base: '60px', md: '72px' },
    objectFit: 'contain',
  }),

  developerLogoFallback: css({
    width: '100%',
    minH: { base: '80px', md: '100px' },
    borderRadius: '18px',
    background: 'rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    fontSize: { base: '2rem', md: '2.5rem' },
    letterSpacing: '0.1em',
    color: 'rgba(255, 255, 255, 0.85)',
  }),

  developerName: css({
    fontFamily: 'var(--font-inter), sans-serif',
    fontSize: { base: '0.875rem', md: '1rem' },
    fontWeight: 400,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: { base: 2, md: 3 },
  }),

  // Colonne du milieu - Carousel d'images
  middleColumn: css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: { base: 4, md: 6 },
    position: 'relative',
    height: '100%',
    minHeight: 0,
    overflow: 'visible',
  }),

  imageCarousel: css({
    position: 'relative',
    width: '100%',
    flex: 1,
    minHeight: { base: '300px', md: '400px' },
    maxHeight: { base: 'none', lg: '70%' },
    borderRadius: { base: '24px', md: '32px', lg: '40px' },
    overflow: 'hidden',
    bg: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    flexShrink: 0,
  }),

  carouselImage: css({
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  }),

  // Bouton "View on map" avec effet liquid glass
  viewMapButton: css({
    position: 'absolute',
    top: { base: '16px', md: '20px', lg: '24px' },
    left: { base: '16px', md: '20px', lg: '24px' },
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: { base: '10px 16px', md: '12px 20px' },
    fontFamily: 'var(--font-inter), sans-serif',
    fontWeight: 400,
    fontSize: { base: '0.8125rem', md: '0.875rem' },
    color: 'rgba(255, 255, 255, 0.92)',
    borderRadius: '999px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px) saturate(160%)',
    background: 'rgba(255, 255, 255, 0.06)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    border: 'none',
    zIndex: 20,
    _before: {
      content: "''",
      position: 'absolute',
      inset: 0,
      borderRadius: '999px',
      padding: '1px',
      background:
        'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.25) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.25) 75%, rgba(255,255,255,0.9) 100%)',
      WebkitMask:
        'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
      WebkitMaskComposite: 'xor',
      maskComposite: 'exclude',
      pointerEvents: 'none',
      zIndex: -1,
    },
    _hover: {
      background: 'rgba(255, 255, 255, 0.1)',
      transform: 'scale(1.05)',
    },
    _active: {
      transform: 'scale(0.95)',
    },
  } as any),

  viewMapIcon: css({
    width: { base: '16px', md: '18px' },
    height: { base: '16px', md: '18px' },
    flexShrink: 0,
    opacity: 0.9,
  }),

  carouselDots: css({
    position: 'absolute',
    bottom: { base: '12px', md: '16px' },
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  }),

  carouselDot: css({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    bg: 'rgba(255, 255, 255, 0.4)',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    padding: 0,
    _hover: {
      bg: 'rgba(255, 255, 255, 0.6)',
      transform: 'scale(1.2)',
    },
  }),

  carouselDotActive: css({
    bg: 'rgba(255, 255, 255, 0.9)',
    width: '10px',
    height: '10px',
  }),

  // Wrapper pour les infos (localisation + description)
  infoWrapper: css({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: { base: 3, md: 4 },
    marginTop: 'auto',
    zIndex: 10,
  }),

  // Informations sous l'image
  locationInfo: css({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }),

  locationIcon: css({
    width: '16px',
    height: '16px',
    flexShrink: 0,
    color: '#BABABA',
  }),

  locationText: css({
    fontFamily: 'var(--font-inter), sans-serif',
    fontWeight: 400, // Inter Regular
    fontSize: { base: '0.875rem', md: '0.9375rem' },
    color: '#BABABA',
    lineHeight: 1.4,
  }),

  locationInfoOverlay: css({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: { base: '10px', md: '12px' },
  }),

  // Card COMPACTE (dans le flux normal)
  descriptionCard: css({
    position: 'relative',
    borderRadius: { base: '16px', md: '20px' },
    background: 'rgba(255, 255, 255, 0)',
    backdropFilter: 'blur(18px) saturate(180%)',
    boxShadow: '0 14px 40px rgba(0, 0, 0, 0.35)',
    zIndex: 10,
  }),

  // 🧊 OVERLAY qui passe par-dessus l'image
  descriptionOverlay: css({
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 'auto',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    pointerEvents: 'none', // le fond ne capte pas
    zIndex: 40, // > imageCarousel (qui est zIndex 0 par défaut)
  }),

  descriptionOverlayInner: css({
    pointerEvents: 'auto', // seule la card capte les clics
    width: '100%',
    maxWidth: '100%', // ✅ pleine largeur comme la card compacte
    margin: { base: '0 0 12px 0', md: '0 0 16px 0' },
    padding: { base: '18px 16px', md: '22px 20px' },
    borderRadius: { base: '18px', md: '22px' },
    background: 'rgba(0, 0, 0, 0.82)',
    backdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: '0 -18px 50px rgba(0, 0, 0, 0.65)',
    maxHeight: { base: '65vh', md: '60vh' },
    overflowY: 'auto',
  }),

  productDescription: css({
    fontFamily: 'var(--font-inter), sans-serif',
    fontWeight: 400,
    fontSize: { base: '0.875rem', md: '0.9375rem', lg: '1rem' },
    color: '#FFFFFF',
    lineHeight: { base: 1.6, md: 1.7 },
    margin: 0,
  }),

  productDescriptionWrapper: css({
    position: 'relative',
  }),

  productDescriptionCollapsed: css({
    position: 'relative',
    display: 'block',
  }),

  descriptionToggle: css({
    display: 'inline',
    background: 'none',
    border: 'none',
    color: '#ffffff',
    fontFamily: 'var(--font-inter), sans-serif',
    fontSize: { base: '0.875rem', md: '0.9375rem' },
    fontWeight: 400,
    letterSpacing: '0.01em',
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
    cursor: 'pointer',
    padding: 0,
    marginLeft: '0.35em',
    opacity: 0.85,
    transition: 'opacity 0.3s ease',
    whiteSpace: 'nowrap',
    _hover: {
      opacity: 1,
    },
  }),

  descriptionToggleBlock: css({
    display: 'block',
    marginTop: { base: '12px', md: '16px' },
    background: 'none',
    border: 'none',
    color: '#ffffff',
    fontFamily: 'var(--font-inter), sans-serif',
    fontSize: { base: '0.875rem', md: '0.9375rem' },
    fontWeight: 400,
    letterSpacing: '0.01em',
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
    cursor: 'pointer',
    padding: 0,
    opacity: 0.85,
    transition: 'opacity 0.3s ease',
    _hover: {
      opacity: 1,
    },
  }),

  rightColumn: css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    gap: { base: 4, md: 6 },
    height: { base: 'auto', lg: 'calc(100vh - 80px - 32px)' }, // 100vh moins le padding top navbar et padding bottom
    minHeight: 0,
    overflow: 'visible',
  }),

  // Prix par share en haut
  priceSection: css({
    display: 'flex',
    flexDirection: 'column',
    gap: { base: 3, md: 4 },
    flexShrink: 0,
  }),

  priceRow: css({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }),

  priceText: css({
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    fontSize: { base: '1.5rem', md: '2rem', lg: '2.25rem', xl: '2.5rem' },
    lineHeight: 1,
    letterSpacing: '0.04em',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  }),

  aedIcon: css({
    width: { base: '18px', md: '22px', lg: '24px' },
    height: { base: '22px', md: '26px', lg: '28px' },
    flexShrink: 0,
  }),

  priceSeparator: css({
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 'inherit',
    lineHeight: 1,
  }),

  // Description du bien
  propertyDescription: css({
    fontFamily: 'var(--font-inter), sans-serif',
    fontWeight: 400,
    fontSize: { base: '0.875rem', md: '0.9375rem', lg: '1rem' },
    color: '#FFFFFF',
    lineHeight: { base: 1.6, md: 1.7 },
    marginTop: { base: 4, md: 6 },
  }),

  // Mots-clés juste en dessous du prix
  keywordsSection: css({
    display: 'flex',
    flexDirection: 'column',
    gap: { base: 2, md: 3 },
    flexShrink: 0,
  }),

  keywordsRow: css({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  }),

  keywordItem: css({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'var(--font-inter), sans-serif',
    fontWeight: 400,
    fontSize: { base: '0.8125rem', md: '0.875rem' },
    color: 'rgba(255, 255, 255, 0.5)',
    lineHeight: 1.4,
  }),

  keywordIcon: css({
    width: '16px',
    height: '16px',
    flexShrink: 0,
    color: 'rgba(255, 255, 255, 0.5)',
  }),

  keywordSeparator: css({
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: '0.875rem',
  }),

  // Container Liquid Glass pour Features & Lifestyle
  liquidGlassContainer: css({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    border: 'none',
    overflow: 'hidden',
    flex: '1 1 0',
    minHeight: 0,
  } as any),

  // Titre du container
  liquidGlassTitle: css({
    position: 'relative',
    zIndex: 1,
    marginBottom: "5px",
    paddingBottom: "5px",
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  }),

  liquidGlassTitleText: css({
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    fontSize: { base: '1.5rem', md: '1.75rem', lg: '2rem' },
    fontWeight: 400,
    letterSpacing: '0.05em',
    color: 'rgba(255, 255, 255, 0.95)',
    textTransform: 'uppercase',
    display: 'block',
  }),

  // Contenu du container
  liquidGlassContent: css({
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    flex: '1 1 0',
    minHeight: 0,
    overflow: 'hidden',
  }),

  liquidGlassScrollArea: css({
    width: '100%',
    flex: '1 1 0',
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingRight: { base: '6px', md: '8px', lg: '10px' },
    paddingBottom: { base: '48px', md: '56px' },
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
    position: 'relative',
    zIndex: 1,
    scrollBehavior: 'smooth',
    overscrollBehavior: 'contain',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'thin',
    scrollbarColor: '#6e6e6e #181818',
    '&::-webkit-scrollbar': {
      width: '9px',
    },
    '&::-webkit-scrollbar-track': {
      background: '#181818',
      borderRadius: '999px',
      margin: { base: '8px 2px', md: '10px 2px' },
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#6e6e6e',
      borderRadius: '999px',
      border: '2px solid #181818',
      minHeight: '40px',
      transition: 'background 0.2s ease',
      '&:hover': {
        background: '#8a8a8a',
      },
    },
  } as any),

  liquidGlassFade: css({
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '30%',
    pointerEvents: 'none',
    background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 100%)',
    zIndex: 2,
  }),

  // Item dans le container
  liquidGlassItem: css({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
  }),

  liquidGlassItemContent: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: "5px",
  }),

  liquidGlassItemTitle: css({
    fontFamily: 'var(--font-inter), sans-serif',
    fontWeight: 700,
    fontSize: { base: '0.9375rem', md: '1rem' },
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: '-0.01em',
    lineHeight: 1.4,
  }),

  liquidGlassItemDescription: css({
    fontFamily: 'var(--font-inter), sans-serif',
    fontWeight: 400,
    fontSize: { base: '0.8125rem', md: '0.875rem' },
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: '-0.005em',
    lineHeight: 1.5,
    margin: 0,
  }),


  // Preview des images avec parallaxe 3D
  imagePreviewSection: css({
    display: 'flex',
    flexDirection: 'column',
    gap: { base: 3, md: 4 },
    marginTop: 'auto',
    flexShrink: 0,
  }),

  imagePreviewContainer: css({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: { base: 3, md: 4 },
    perspective: '1200px',
    minHeight: { base: '140px', md: '180px' },
  }),

  imagePreviewWrapper: css({
    position: 'relative',
    display: 'flex',
    flex: 1,
    height: { base: '120px', md: '160px' },
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 1,
    pointerEvents: 'none',
    transformStyle: 'preserve-3d',
    perspective: '1200px',
    '& > *': {
      pointerEvents: 'auto',
    },
  }),

  imagePreviewItem: css({
    position: 'absolute',
    width: { base: '100px', md: '140px' },
    height: { base: '100px', md: '140px' },
    borderRadius: { base: '16px', md: '20px' },
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    transformStyle: 'preserve-3d',
    willChange: 'transform',
  }),

  imagePreviewItemActive: css({
    borderColor: 'rgba(255, 255, 255, 0.6)',
    zIndex: 15,
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
  }),

  imagePreviewImage: css({
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  }),

  previewNavButtons: css({
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    flexShrink: 0,
    height: { base: '36px', md: '44px' },
    width: { base: '80px', md: '100px' },
    zIndex: 300,
    pointerEvents: 'auto',
    isolation: 'isolate',
  }),

  previewNavButton: css({
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: { base: '36px', md: '44px' },
    height: { base: '36px', md: '44px' },
    borderRadius: '50%',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    background: 'rgba(255, 255, 255, 0.06)',
    backdropFilter: 'blur(10px) saturate(160%)',
    color: 'rgba(255, 255, 255, 0.9)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    transformStyle: 'preserve-3d',
    zIndex: 300,
    pointerEvents: 'auto',
    userSelect: 'none',
    _before: {
      content: "''",
      position: 'absolute',
      inset: 0,
      borderRadius: '50%',
      padding: '1px',
      background:
        'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.25) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.25) 75%, rgba(255,255,255,0.9) 100%)',
      WebkitMask:
        'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
      WebkitMaskComposite: 'xor',
      maskComposite: 'exclude',
      pointerEvents: 'none',
      zIndex: -1,
    },
    _hover: {
      background: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.4)',
      transform: 'scale(1.1)',
    },
    _disabled: {
      opacity: 0.3,
      cursor: 'not-allowed',
      _hover: {
        transform: 'scale(1)',
      },
    },
  } as any),

  previewNavButtonActive: css({
    border: '1px solid rgba(255, 255, 255, 1)',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
  }),

  previewNavIcon: css({
    width: { base: '16px', md: '20px' },
    height: { base: '16px', md: '20px' },
  }),

  loading: css({
    fontSize: { base: '1rem', md: '1.125rem' },
    fontWeight: 400,
    color: 'rgba(255, 255, 255, 0.6)',
    fontFamily: 'var(--font-inter), sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minH: '100vh',
  }),

  // Slide to unlock button
  slideToUnlockContainer: css({
    marginTop: { base: 8, md: 10 },
    width: '100%',
    flexShrink: 0,
  }),

  slideContainer: css({
    position: 'relative',
    width: '100%',
    height: { base: '56px', md: '64px' },
    borderRadius: '9999px',
    background: 'linear-gradient(135deg, rgba(117, 117, 117, 0.5) 0%, rgba(0, 0, 0, 1) 100%)',
    backdropFilter: 'blur(10px) saturate(160%)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    _before: {
      content: "''",
      position: 'absolute',
      inset: 0,
      borderRadius: '9999px',
      padding: '1px',
      background:
        'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.25) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.25) 75%, rgba(255,255,255,0.9) 100%)',
      WebkitMask:
        'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
      WebkitMaskComposite: 'xor',
      maskComposite: 'exclude',
      pointerEvents: 'none',
      zIndex: 1,
    },
  }),

  slideSilverEffect: css({
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: '9999px',
    background: 'linear-gradient(90deg, rgba(90, 90, 90, 0.5) 0%, rgba(255, 255, 255, 0.7) 50%, rgba(192, 192, 192, 0.5) 100%)',
    backgroundSize: '200% 100%',
    backdropFilter: 'blur(8px) saturate(180%)',
    boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.4), 0 0 30px rgba(255, 255, 255, 0.3)',
    zIndex: 3,
    pointerEvents: 'none',
    animation: 'shimmer 2s ease-in-out infinite',
    '@keyframes shimmer': {
      '0%': {
        backgroundPosition: '-200% 0',
      },
      '100%': {
        backgroundPosition: '200% 0',
      },
    },
  } as any),

  slideButton: css({
    position: 'absolute',
    left: { base: '4px', md: '6px' },
    top: '50%',
    width: { base: '48px', md: '52px' },
    height: { base: '48px', md: '52px' },
    borderRadius: '50%',
    background: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'grab',
    transition: 'transform 0.2s ease-out',
    zIndex: 11,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
    userSelect: 'none',

    '&:active': {
      cursor: 'grabbing',
    },
    '& svg': {
      flexShrink: 0,
      pointerEvents: 'none',
    },
  }),

  slideText: css({
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    fontSize: { base: '1.25rem', md: '1.5rem' },
    fontWeight: 400,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    pointerEvents: 'none',
    zIndex: 12,
  }),
};

