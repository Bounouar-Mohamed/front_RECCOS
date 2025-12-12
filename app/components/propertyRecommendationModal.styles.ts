import { css } from '@/styled-system/css';

export const propertyRecommendationModalStyles = {
  overlay: css({
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(8px)',
    zIndex: 10001,
    cursor: 'pointer',
  }),

  modal: css({
    position: 'fixed',
    inset: { base: '12px', md: '20px', lg: '24px' },
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(20px) saturate(180%)',
    borderRadius: { base: '24px', md: '32px', lg: '40px' },
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), inset 0 0 100px rgba(255, 255, 255, 0.03)',
    zIndex: 10002,
    overflow: 'visible',
    display: 'flex',
    flexDirection: 'column',
    _before: {
      content: "''",
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      padding: '1px',
      background:
        'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.05) 75%, rgba(255,255,255,0.2) 100%)',
      WebkitMask:
        'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
      WebkitMaskComposite: 'xor',
      maskComposite: 'exclude',
      pointerEvents: 'none',
      zIndex: -1,
    },
  } as any),

  hiddenMapContainer: css({
    position: 'absolute',
    top: '-9999px',
    left: '-9999px',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
    opacity: 0,
    pointerEvents: 'none',
    zIndex: -1,
  }),

  modalLayout: css({
    display: 'flex',
    flexDirection: 'row', // Changé de column à row pour une disposition horizontale
    width: '100%',
    height: '100%',
    overflow: 'visible',
    position: 'relative',
  }),

  mapSection: css({
    width: '50%', // 50% de la largeur au lieu de 50% de la hauteur
    height: '100%', // Prend toute la hauteur disponible
    padding: { base: '12px', md: '16px', lg: '20px' },
    paddingRight: { base: '8px', md: '12px', lg: '16px' }, // Padding à droite au lieu de bottom
    // Le borderRadius est géré par le mapContainer dans PropertyMap
    overflow: 'visible', // Permettre au borderRadius de s'afficher
    '& > div': {
      borderRadius: { base: '20px', md: '24px', lg: '28px' },
      overflow: 'hidden',
      isolation: 'isolate', // Créer un nouveau contexte de stacking
    },
  } as any),

  content: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    padding: { base: '24px', md: '32px' },
  }),

  textWrapper: css({
    position: 'relative',
    display: 'inline-block',
    overflow: 'hidden',
  }),

  preloaderText: css({
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    fontSize: { base: '1.5rem', md: '2rem', lg: '2.5rem' },
    fontWeight: 400,
    letterSpacing: '0.05em',
    background: 'linear-gradient(90deg, #FFFFFF 0%, #999999 50%, #FFFFFF 100%)',
    backgroundSize: '200% 100%',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textAlign: 'center',
    lineHeight: 1.2,
    animation: 'gradientShift 4s ease-in-out infinite',
    display: 'inline-block',
    position: 'relative',
    zIndex: 1,
    isolation: 'isolate',
    '@keyframes gradientShift': {
      '0%': {
        backgroundPosition: '-100% 0%',
      },
      '100%': {
        backgroundPosition: '100% 0%',
      },
    },
  } as any),

  blackRayText: css({
    position: 'absolute',
    top: 0,
    left: 0,
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    fontSize: { base: '1.5rem', md: '2rem', lg: '2.5rem' },
    fontWeight: 400,
    letterSpacing: '0.05em',
    lineHeight: 1.2,
    textAlign: 'center',
    background: 'linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.2) 20%, rgba(0, 0, 0, 0.2) 80%, transparent 100%)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    pointerEvents: 'none',
    zIndex: 2,
    whiteSpace: 'nowrap',
  } as any),

  kpisContainer: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    width: '50%', // 50% de la largeur pour occuper l'autre moitié
    height: '100%', // Prend toute la hauteur disponible
    padding: { base: '12px', md: '16px', lg: '20px' },
    paddingLeft: { base: '8px', md: '12px', lg: '16px' }, // Padding à gauche
    paddingBottom: { base: '16px', md: '20px', lg: '24px' },
    minHeight: 0,
    color: '#FFFFFF',
    overflowX: 'hidden',
    overflowY: 'hidden', // Le panelCardWrapper gère le scroll
    position: 'relative',
    // Empêcher la propagation du scroll vers la page parente
    touchAction: 'pan-y',
    overscrollBehavior: 'contain',
  }),

  kpisContainerCtaSpacer: css({
    paddingBottom: { base: '96px', md: '110px', lg: '120px' },
  }),

  panelCardWrapper: css({
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    // Scrollbar invisible mais fonctionnel
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  }),

  panelCard: css({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: { base: '12px', md: '16px' },
    padding: { base: '16px', md: '24px' },
    borderRadius: { base: '20px', md: '24px' },
    background: 'rgba(8, 8, 8, 0.55)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    boxShadow: '0 20px 45px rgba(0,0,0,0.45)',
    overflow: 'hidden',
    minHeight: 0,
  }),

  panelHeader: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
  }),

  panelBody: css({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: { base: '12px', md: '16px' },
    overflowY: 'auto',
    paddingRight: '4px',
    minHeight: 0,
  }),

  panelFooter: css({
    display: 'flex',
    justifyContent: 'flex-end',
  }),

  developerTag: css({
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'rgba(255,255,255,0.6)',
  }),

  panelTitle: css({
    fontSize: { base: '1.25rem', md: '1.5rem' },
    fontWeight: 600,
    color: '#FFFFFF',
  }),

  panelSubtitle: css({
    fontSize: '0.9rem',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 1.4,
  }),

  panelEyebrow: css({
    fontSize: '0.75rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.5)',
  }),

  panelLead: css({
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 1.5,
    marginTop: '4px',
  }),

  panelHint: css({
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.65)',
    marginTop: '4px',
  }),

  panelBackButton: css({
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#FFFFFF',
    borderRadius: '999px',
    padding: '6px 14px',
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'background 0.2s ease, color 0.2s ease',
    _hover: {
      background: 'rgba(255,255,255,0.08)',
    },
  }),

  // Showcase Panel redesign
  showcasePanel: css({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    overflow: 'hidden',
  }),

  showcaseHeader: css({
    display: 'flex',
    flexDirection: 'column',
    gap: { base: '12px', md: '16px' },
    padding: { base: '16px', md: '20px' },
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(0,0,0,0.2)',
  }),

  showcaseBackBtn: css({
    alignSelf: 'flex-start',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.6)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 0',
    '&:hover': {
      color: '#FFFFFF',
    },
  }),

  developerInfo: css({
    display: 'flex',
    alignItems: 'center',
    gap: { base: '12px', md: '16px' },
  }),

  developerLogoLarge: css({
    width: { base: '48px', md: '56px' },
    height: { base: '48px', md: '56px' },
    borderRadius: '12px',
    objectFit: 'cover',
    background: 'rgba(255,255,255,0.1)',
  }),

  developerLogoPlaceholder: css({
    width: { base: '48px', md: '56px' },
    height: { base: '48px', md: '56px' },
    borderRadius: '12px',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: { base: '20px', md: '24px' },
    fontWeight: 700,
    color: '#FFFFFF',
  }),

  developerDetails: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  }),

  developerLabel: css({
    fontSize: '10px',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  }),

  developerNameLarge: css({
    fontSize: { base: '18px', md: '22px' },
    fontWeight: 700,
    color: '#FFFFFF',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
  }),

  developerStats: css({
    display: 'flex',
    alignItems: 'center',
    gap: { base: '12px', md: '20px' },
    flexWrap: 'wrap',
  }),

  developerStat: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  }),

  developerStatValue: css({
    fontSize: { base: '18px', md: '22px' },
    fontWeight: 700,
    color: '#FFFFFF',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
  }),

  developerStatLabel: css({
    fontSize: '9px',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }),

  developerStatDivider: css({
    width: '1px',
    height: '28px',
    background: 'rgba(255,255,255,0.1)',
  }),

  showcaseBody: css({
    flex: 1,
    overflowY: 'auto',
    padding: { base: '16px', md: '20px' },
    display: 'flex',
    flexDirection: 'column',
    gap: { base: '20px', md: '24px' },
  }),

  showcaseSection: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  }),

  showcaseSectionTitle: css({
    fontSize: { base: '14px', md: '16px' },
    fontWeight: 600,
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }),

  showcaseSectionDesc: css({
    fontSize: '12px',
    color: 'rgba(255,255,255,0.6)',
  }),

  showcaseGrid: css({
    display: 'grid',
    gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)' },
    gap: '10px',
  }),

  showcaseCard: css({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    position: 'relative',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: 'rgba(255,255,255,0.08)',
      borderColor: 'rgba(255,255,255,0.15)',
    },
  }),

  showcaseCardIcon: css({
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    flexShrink: 0,
  }),

  showcaseCardContent: css({
    flex: 1,
    minWidth: 0,
  }),

  showcaseCardTitle: css({
    fontSize: '13px',
    fontWeight: 600,
    color: '#FFFFFF',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),

  showcaseCardDesc: css({
    fontSize: '11px',
    color: 'rgba(255,255,255,0.5)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),

  showcaseBadge: css({
    fontSize: '9px',
    padding: '4px 8px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.1)',
    color: '#FFFFFF',
  }),

  showcaseDescription: css({
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 1.4,
  }),

  showcaseEmptyState: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '24px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px dashed rgba(255,255,255,0.1)',
    '& span': {
      fontSize: '24px',
    },
    '& p': {
      fontSize: '12px',
      color: 'rgba(255,255,255,0.4)',
      textAlign: 'center',
    },
  }),

  documentGrid: css({
    display: 'grid',
    gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)' },
    gap: '8px',
  }),

  documentCard: css({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: 'rgba(255,255,255,0.1)',
      borderColor: 'rgba(255,255,255,0.2)',
    },
  }),

  documentCardIcon: css({
    fontSize: '16px',
  }),

  documentCardLabel: css({
    flex: 1,
    fontSize: '12px',
    color: '#FFFFFF',
    fontWeight: 500,
  }),

  documentCardAction: css({
    fontSize: '12px',
    color: 'rgba(255,255,255,0.4)',
  }),

  showcaseFooter: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: { base: '16px', md: '20px' },
    borderTop: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(0,0,0,0.2)',
  }),

  showcaseFooterHint: css({
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
  }),

  documentSection: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '8px',
  }),

  documentLead: css({
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.65)',
  }),

  documentHeader: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
  }),

  documentLogo: css({
    width: '48px',
    height: '48px',
    objectFit: 'contain',
    filter: 'grayscale(0.2)',
  }),

  documentList: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  }),

  documentLink: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.05)',
    color: '#FFFFFF',
    textDecoration: 'none',
    transition: 'background 0.2s ease, border 0.2s ease',
    _hover: {
      background: 'rgba(255,255,255,0.08)',
      borderColor: 'rgba(255,255,255,0.15)',
    },
  }),

  documentLinkLabel: css({
    fontSize: '0.85rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '70%',
  }),

  documentLinkAction: css({
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.7)',
  }),

  emptyState: css({
    fontSize: '0.85rem',
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'left',
  }),

  ctaPrimary: css({
    background: 'linear-gradient(120deg, #ffffff 0%, #a3a3a3 100%)',
    color: '#050505',
    border: 'none',
    borderRadius: '999px',
    padding: '10px 22px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    _hover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 20px rgba(255,255,255,0.15)',
    },
    _disabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
      transform: 'none',
      boxShadow: 'none',
    },
  }),

  paymentCard: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '12px',
    borderRadius: '14px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.05)',
  }),

  paymentLabel: css({
    fontSize: '0.85rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'rgba(255,255,255,0.65)',
  }),

  shareControl: css({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }),

  shareButton: css({
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#FFFFFF',
    fontSize: '1.2rem',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
    _disabled: {
      opacity: 0.4,
      cursor: 'not-allowed',
    },
  }),

  shareInput: css({
    flex: 1,
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(0,0,0,0.3)',
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: '1rem',
    padding: '8px 12px',
  }),

  paymentHint: css({
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.6)',
  }),

  paymentSummary: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.04)',
  }),

  paymentAmount: css({
    fontSize: '1.3rem',
    fontWeight: 600,
  }),

  paymentSecure: css({
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.6)',
  }),

  floatingCta: css({
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: { base: '24px', md: '32px' },
    marginInline: 'auto',
    width: 'fit-content',
    minWidth: "75%",
    zIndex: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: { base: '14px 32px', md: '16px 40px' },
    borderRadius: '999px',
    border: 'none',
    background: 'linear-gradient(120deg, #ffffff 0%, #a3a3a3 100%)',
    boxShadow: '0 8px 24px rgba(255,255,255,0.15)',
    color: '#050505',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: { base: '14px', md: '15px' },
    whiteSpace: 'nowrap',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 32px rgba(255,255,255,0.2)',
    },
  }),

  floatingCtaIcon: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    color: '#050505',
  }),

  paymentStep: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '100%',
    maxWidth: '100%',
    // Ne pas forcer une hauteur minimale pour permettre le scroll du parent
    minHeight: 'auto',
    height: 'fit-content',
    padding: { base: '16px', sm: '20px', md: '24px' },
    paddingBottom: { base: '24px', sm: '32px', md: '40px' },
    boxSizing: 'border-box',
    flexShrink: 0,
  }),

  paymentStepHeader: css({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: { base: '12px', sm: '16px', md: '20px' },
  }),

  paymentStepBadge: css({
    fontSize: { base: '0.6rem', sm: '0.7rem' },
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'rgba(255,255,255,0.5)',
    padding: { base: '4px 8px', sm: '6px 12px' },
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.1)',
  }),

  paymentStepTitle: css({
    width: '100%',
    fontSize: { base: '1.3rem', sm: '1.6rem', md: '2rem' },
    fontWeight: 600,
    color: '#FFFFFF',
    textAlign: 'left',
    marginBottom: { base: '4px', sm: '8px' },
    letterSpacing: '-0.02em',
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
  }),

  paymentStepSubtitle: css({
    width: '100%',
    fontSize: { base: '0.8rem', sm: '0.9rem', md: '1rem' },
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'left',
    lineHeight: 1.4,
    marginBottom: { base: '12px', sm: '20px', md: '32px' },
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
  }),

  checkoutContainer: css({
    width: '100%',
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    boxSizing: 'border-box',
    // Padding minimal pour éviter le débordement latéral
    paddingInline: { base: '0', sm: '4px' },
    // Pas de paddingBottom ici - le parent gère l'espace
  }),

  // Success Step Styles
  successStep: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: { base: '24px 16px', sm: '32px 24px', md: '40px 32px' },
    gap: { base: '12px', sm: '16px' },
  }),

  successIcon: css({
    marginBottom: { base: '8px', sm: '12px' },
    animation: 'pulse 2s ease-in-out infinite',
  }),

  successTitle: css({
    fontSize: { base: '1.5rem', sm: '1.8rem', md: '2rem' },
    fontWeight: 700,
    color: '#FFFFFF',
    letterSpacing: '-0.02em',
  }),

  successSubtitle: css({
    fontSize: { base: '0.85rem', sm: '0.95rem' },
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 1.5,
    maxWidth: '320px',
  }),

  successCard: css({
    width: '100%',
    maxWidth: '360px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '16px',
    padding: { base: '16px', sm: '20px' },
    border: '1px solid rgba(255,255,255,0.1)',
    marginTop: { base: '8px', sm: '12px' },
  }),

  successPropertyName: css({
    fontSize: { base: '1.1rem', sm: '1.2rem' },
    fontWeight: 600,
    color: '#FFFFFF',
    marginBottom: '4px',
  }),

  successLocation: css({
    fontSize: { base: '0.8rem', sm: '0.85rem' },
    color: 'rgba(255,255,255,0.5)',
    marginBottom: { base: '12px', sm: '16px' },
  }),

  successDivider: css({
    width: '100%',
    height: '1px',
    background: 'rgba(255,255,255,0.1)',
    marginBottom: { base: '12px', sm: '16px' },
  }),

  successDetails: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
  }),

  successDetailItem: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  }),

  successDetailLabel: css({
    fontSize: { base: '0.7rem', sm: '0.75rem' },
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }),

  successDetailValue: css({
    fontSize: { base: '1.2rem', sm: '1.4rem' },
    fontWeight: 700,
    color: '#FFFFFF',
  }),

  successDetailValueHighlight: css({
    fontSize: { base: '1.2rem', sm: '1.4rem' },
    fontWeight: 700,
    color: '#34c759',
  }),

  successNotice: css({
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    width: '100%',
    maxWidth: '360px',
    padding: { base: '12px 14px', sm: '14px 16px' },
    background: 'rgba(52,199,89,0.1)',
    borderRadius: '12px',
    borderLeft: '3px solid #34c759',
    marginTop: { base: '8px', sm: '12px' },
    textAlign: 'left',
  }),

  successNoticeIcon: css({
    fontSize: '1.2rem',
    flexShrink: 0,
  }),

  successNoticeText: css({
    fontSize: { base: '0.8rem', sm: '0.85rem' },
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 1.5,
  }),

  successTransactionId: css({
    fontSize: { base: '0.7rem', sm: '0.75rem' },
    color: 'rgba(255,255,255,0.4)',
    marginTop: { base: '8px', sm: '12px' },
  }),

  successCloseButton: css({
    marginTop: { base: '16px', sm: '24px' },
    padding: { base: '14px 32px', sm: '16px 40px' },
    borderRadius: '999px',
    border: 'none',
    background: '#FFFFFF',
    color: '#0a0a0a',
    fontSize: { base: '0.9rem', sm: '1rem' },
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    _hover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 24px rgba(255,255,255,0.15)',
    },
  }),
};

