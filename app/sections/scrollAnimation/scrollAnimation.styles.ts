import { css } from '@/styled-system/css';

export const scrollAnimationStyles = {
  // Container global = <div className="font-geist flex w-screen flex-col items-center overflow-x-clip bg-[#f5f4f3] pt-[50vh] text-black">
  container: css({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflowX: 'clip',
    overflowY: 'clip', // Empêche les overlays de sortir verticalement
    width: '100vw',
    bg: '#000000',
    color: '#FFFFFF',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    isolation: 'isolate', // Crée un nouveau contexte d'empilement pour contenir les overlays
    zIndex: 1, // Z-index bas pour ne pas chevaucher les autres sections
  }),

  contentWrapper: css({
    width: '100%',
    maxWidth: '1400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  }),

  // motion.div sticky top-[10%] flex gap-2 pb-10 text-2xl font-bold tracking-tighter md:text-5xl
  stickyHeader: css({
    position: 'sticky',
    top: '10%', // comme top-[10%]
    display: 'flex',
    flexDirection: 'row',
    gap: '0.5rem',
    paddingBottom: '2.5rem',
    fontWeight: 400, // Bebas Neue n'a qu'un seul poids (400)
    letterSpacing: '0.05em',
    fontSize: { base: '1.5rem', md: '3rem' },
    lineHeight: 1.2,
    transformOrigin: 'top center',
    zIndex: 5,
    width: '100%',
    maxWidth: '1400px',
    justifyContent: 'center',
  }),

  // div sticky top-[50%] h-fit
  titleColumn: css({
    position: 'sticky',
    top: '50%',
    height: 'fit-content',
    overflow: 'visible',
  }),

  title: css({
    margin: 0,
    whiteSpace: 'nowrap',
  }),

  // Overlays - contenus dans le container pour ne pas chevaucher les autres sections
  topOverlay: css({
    position: 'absolute',
    left: '100%',
    top: 0,
    zIndex: 0, // Z-index très bas pour rester dans le contexte du container
    height: '50vh',
    width: '100vw',
    pointerEvents: 'none',
    transform: 'translateY(-100%)',
    bg: 'rgba(0, 0, 0, 0.9)',
    // L'overlay sera coupé par overflowY: clip du container
  }),

  bottomOverlay: css({
    position: 'absolute',
    left: '100%',
    bottom: 0,
    zIndex: 0, // Z-index très bas pour rester dans le contexte du container
    height: '50vh',
    width: '100vw',
    pointerEvents: 'none',
    transform: 'translateY(100%)',
    bg: 'rgba(0, 0, 0, 0.9)',
    // L'overlay sera coupé par overflowY: clip du container
  }),

  // Colonne des punchlines = div className="h-fit space-y-2"
  linesColumn: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    height: 'fit-content',
  }),

  lineItem: css({
    margin: 0,
  }),

  // Overlay blur = motion.div absolute inset-0 bg-white/10
  blurOverlay: css({
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    pointerEvents: 'none',
    zIndex: 4,
  }),

  // motion.div cards = "rounded-4xl z-20 mt-[20vh] flex w-full flex-col items-center space-y-20 bg-[#121212] py-[20vh] font-medium tracking-tight text-white"
  cardSection: css({
    position: 'relative',
    zIndex: 20,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: '1400px',
    gap: '5rem',
    backgroundColor: '#121212',
    color: '#ffffff',
    borderRadius: '2rem',
    marginTop: '20vh',
    paddingTop: '20vh',
    paddingBottom: '20vh',
    fontWeight: 500,
    letterSpacing: '-0.02em',
  }),

  cardRow: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '1.25rem',
    width: '100%',
    maxWidth: '24rem',
  }),

  cardLabel: css({
    textAlign: 'right',
    opacity: 0.3,
    margin: 0,
  }),

  cardList: css({
    listStyle: 'none',
    margin: 0,
    padding: 0,
  }),

  cardListItem: css({
    margin: 0,
  }),
};