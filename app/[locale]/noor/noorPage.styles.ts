import { css } from '@/styled-system/css';

export const noorPageStyles = {
  // === 1. CONTAINER FULL PAGE ===
  container: css({
    width: '100%',
    height: '100vh',          // HAUTEUR FIXE 100% de l'écran
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    position: 'relative',     // Permet de positionner le gradient en arrière-plan
    bg: '#000000',
    color: '#ffffff',
    // Padding pour la navbar + espacement bas
    padding: { base: '16px', md: '24px' },
    // px: { base: '12px', md: '24px', xl: '32px' },
    boxSizing: 'border-box',
    overflow: 'hidden',       // Empêcher le scroll de la page, seul messagesContainer scrolle
  }),

  layout: css({
    width: '100%',
    height: '100%',           // Prend toute la hauteur restante
    flex: '1 1 0',            // S'étire pour remplir le container
    minHeight: 0,             // CRUCIAL pour que le flex scroll fonctionne
    display: 'flex',
    alignItems: 'stretch',
    gap: { base: '12px', lg: '24px' },
    flexDirection: { base: 'column', lg: 'row' },
    position: 'relative',
    zIndex: 2,                // Au-dessus du gradient animé
  }),

  // === 2. WRAPPER PRINCIPAL ===
  chatWrapper: css({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 0',        // Prend tout l'espace disponible avec basis 0
    minHeight: 0,         // CRUCIAL : permet au flex interne de se compresser
    maxHeight: '100%',    // Ne pas dépasser la hauteur du parent
    borderRadius: '24px',
    overflow: 'hidden',   // Cache le contenu qui dépasse
  }),

  // === 3. CONTENU DU CHAT (flex column) ===
  chatContent: css({
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 0',            // Prend tout l'espace avec basis 0
    minHeight: 0,             // CRUCIAL : permet à messagesContainer de se compresser
    maxHeight: '100%',         // Ne pas dépasser la hauteur du parent
    width: '100%',
    height: '100%',            // Prend toute la hauteur disponible
    borderRadius: '24px',
    bg: '#000000',
    overflow: 'hidden',        // Cache le contenu, mais messagesContainer peut scroller
  }),

  // Overlay haut
  gradientOverlay: css({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '56px',
    background: 'linear-gradient(to bottom, #000000, transparent)',
    zIndex: 10,
    pointerEvents: 'none',
  }),

  // === 4. ZONE DES MESSAGES SCROLLABLE ===
  messagesContainer: css({
    flex: '1 1 0',            // Prend tout l'espace disponible
    minHeight: 0,              // CRUCIAL : sans ça, le scroll ne fonctionne pas dans flex
    maxHeight: '100%',         // Ne pas dépasser la hauteur du parent
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    paddingTop: '56px',        // Laisse la place visuelle pour le gradient top
    paddingInline: '16px',
    paddingBottom: '16px',
    overflowY: 'auto',         // SCROLL VERTICAL : c'est ici que ça scrolle
    overflowX: 'hidden',       // Pas de scroll horizontal
    scrollbarWidth: 'none',    // Masquer la scrollbar Firefox
    scrollBehavior: 'smooth',  // Scroll fluide
    overscrollBehavior: 'contain', // Empêcher le scroll de remonter au parent
    WebkitOverflowScrolling: 'touch', // Scroll fluide sur iOS
    '&::-webkit-scrollbar': {
      display: 'none',         // Masquer la scrollbar Chrome/Safari
    },
  } as any), // 'as any' pour WebkitOverflowScrolling non reconnu par PandaCSS

  // === 5. MESSAGES ===
  messageText: css({
    width: 'fit-content',
    maxWidth: { base: '85%', md: '75%', lg: '70%' },
    wordBreak: 'break-words',
    padding: { base: '10px 14px', md: '12px 16px' },
    fontSize: { base: '0.8125rem', md: '0.875rem' },
    lineHeight: 1.6,
    color: '#ffffff',
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }),

  messageTextSent: css({
    alignSelf: 'flex-end',
    borderRadius: '16px 16px 6px 16px',
    border: '0.5px solid rgba(255, 255, 255, 0.15)',
    bg: 'rgba(255, 255, 255, 0.08)',
  }),

  messageTextReceived: css({
    alignSelf: 'flex-start',
    borderRadius: '16px 16px 16px 6px',
    maxWidth: { base: '95%', md: '85%', lg: '80%' },
  }),

  thinkingMessage: css({
    bg: 'rgba(255, 255, 255, 0.04)',
    border: '0.5px solid rgba(255, 255, 255, 0.08)',
  }),

  // Mention
  messageMention: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: 'fit-content',
    borderRadius: '10px',
    border: '0.5px solid rgba(255, 255, 255, 0.1)',
    bg: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(4px)',
    padding: { base: '5px 12px 5px 5px', md: '6px 14px 6px 6px' },
    fontSize: { base: '0.8125rem', md: '0.875rem' },
    color: '#ffffff',
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }),

  mentionIconBox: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bg: 'rgba(255, 255, 255, 0.08)',
    border: '0.5px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '8px',
  }),

  // === 6. INPUT EN BAS ===
  inputContainer: css({
    position: 'relative',
    marginTop: 'auto',  // colle en bas de la colonne
    marginLeft: 'auto', // centre horizontalement
    marginRight: 'auto', // centre horizontalement
    marginBottom: { base: '8px', md: '16px' },
    flexShrink: 0,
    width: { base: '95%', sm: '90%', md: '80%', lg: '70%' }, // Largeur responsive
    maxWidth: '700px', // Largeur maximale
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    bg: 'rgba(255, 255, 255, 0.08)',
    border: '0.5px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    padding: { base: '10px', md: '12px' },
    paddingRight: { base: '56px', md: '64px' }, // Espace pour le bouton send
    overflow: 'hidden',
    minHeight: { base: '52px', md: '56px' },
    maxHeight: { base: '200px', md: '250px' },
  }),

  inputContainerExpanded: css({
    borderRadius: '20px',
  }),

  inputRow: css({
    width: '100%',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  }),

  input: css({
    flex: 1,
    minHeight: { base: '32px', md: '36px' },
    maxHeight: { base: '150px', md: '180px' },
    border: 'none',
    outline: 'none',
    bg: 'transparent',
    paddingLeft: { base: '8px', md: '12px' },
    paddingRight: { base: '8px', md: '12px' },
    paddingTop: '6px',
    paddingBottom: '6px',
    fontSize: { base: '0.875rem', md: '0.9375rem' },
    lineHeight: 1.5,
    color: '#ffffff',
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    resize: 'none',
    overflowY: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(255, 255, 255, 0.15) transparent',
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.4)',
    },
    '&::-webkit-scrollbar': {
      width: '4px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(255, 255, 255, 0.15)',
      borderRadius: '2px',
    },
  }),

  sendButton: css({
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    right: { base: '10px', md: '12px' },
    width: { base: '36px', md: '40px' },
    height: { base: '36px', md: '40px' },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bg: 'rgba(0, 0, 0, 0.75)',
    border: '0.5px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    flexShrink: 0,
    _hover: {
      bg: 'rgba(255, 255, 255, 0.1)',
    },
  }),

  voiceButtonContainer: css({
    position: 'absolute',
    top: '50%',
    right: { base: '52px', md: '60px' },
    transform: 'translateY(-50%)',
    zIndex: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),

  activeMentionsArea: css({
    position: 'relative',
    marginLeft: '8px',
    marginTop: '8px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    height: '52px',
  }),

  activeMentionChip: css({
    position: 'absolute',
    left: 0,
    top: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: 'fit-content',
    borderRadius: '10px',
    border: '0.5px solid rgba(255, 255, 255, 0.1)',
    bg: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(4px)',
    padding: { base: '5px 12px 5px 5px', md: '6px 14px 6px 6px' },
    fontSize: { base: '0.8125rem', md: '0.875rem' },
    color: 'rgba(255, 255, 255, 0.3)',
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }),

  activeMentionIconBox: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bg: 'rgba(255, 255, 255, 0.08)',
    border: '0.5px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    padding: '8px',
  }),

  gradientAnimation: css({
    position: 'absolute',
    left: 0,
    top: 0,
    display: 'flex',
    height: '100px',
    width: '120%',
    zIndex: 2,
    pointerEvents: 'none',
  }),

  gradientBar: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    height: '100%',
    width: '100%',
  }),

  gradientSegment: css({
    flex: 1,
    width: '100%',
    filter: 'blur(12px)',
  }),

  scrollSpacer: css({}),

  icon: css({
    width: '28px',
    height: '24px',
  }),

  arrowIcon: css({
    width: '20px',
    height: '20px',
    color: '#ffffff',
  }),

  cancelButton: css({
    bg: 'rgba(93, 93, 93, 0.8)',
    border: '0.5px solid rgba(93, 93, 93, 0.6)',
    _hover: {
      bg: 'rgba(93, 93, 93, 1)',
    },
  }),

  stopIcon: css({
    width: '14px',
    height: '14px',
    color: '#ffffff',
    fill: '#ffffff',
  }),

  borderGradientContainer: css({
    position: 'absolute',
    inset: 0,
    zIndex: 0,                // Derrière le contenu
    pointerEvents: 'none',    // Ne jamais bloquer les clics sur la sidebar ou le chat
  }),

  borderGradientBlurXs: css({ filter: 'blur(2px)' }),
  borderGradientBlurSm: css({ filter: 'blur(4px)' }),
  borderGradientBlurMd: css({ filter: 'blur(8px)' }),
  borderGradientBlurLg: css({ filter: 'blur(12px)' }),
  borderGradientBlurXl: css({ filter: 'blur(16px)' }),
  borderGradientBlur2xl: css({ filter: 'blur(24px)', opacity: 0.95 }),
  borderGradientBlur3xl: css({ filter: 'blur(32px)' }),

  borderGradientInner: css({
    position: 'absolute',
    inset: '1vh',
    borderRadius: 'calc(24px - 3px)',
    bg: '#000000',
  }),

  gradientBarTranslated: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    height: '100%',
    width: '100%',
    transform: 'translateY(-8px)',
  }),

  gradientSegmentPink: css({
    flex: 1,
    width: '100%',
    filter: 'blur(12px)',
    bg: '#FC2BA3',
  }),
  gradientSegmentOrange: css({
    flex: 1,
    width: '100%',
    filter: 'blur(12px)',
    bg: '#FC6D35',
    marginTop: '-12px',
  }),
  gradientSegmentYellow: css({
    flex: 1,
    width: '100%',
    filter: 'blur(12px)',
    bg: '#F9C83D',
    marginTop: '-12px',
  }),
  gradientSegmentBlue: css({
    flex: 1,
    width: '100%',
    filter: 'blur(12px)',
    bg: '#C2D6E1',
    marginTop: '-12px',
  }),

  textShimmerBase: css({
    position: 'relative',
    display: 'inline-block',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
  } as any),

  // === INTRO NOOR (nouveau chat) ===
  introContainer: css({
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
    padding: '48px 24px',
    pointerEvents: 'none',
  }),

  introContent: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    maxWidth: '400px',
    textAlign: 'center',
  }),

  introAvatar: css({
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    overflow: 'hidden',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
  }),

  introAvatarImage: css({
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  }),

  introTitle: css({
    fontSize: '2.5rem',
    fontWeight: '400',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    color: 'rgba(255, 255, 255, 0.95)',
  }),

  introSubtitle: css({
    fontSize: '1rem',
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.5)',
    lineHeight: '1.6',
    letterSpacing: '-0.01em',
  }),

  introHint: css({
    marginTop: '16px',
    fontSize: '0.8125rem',
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.25)',
    letterSpacing: '0.02em',
  }),
};
