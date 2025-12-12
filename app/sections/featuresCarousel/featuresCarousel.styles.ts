import { css, cva } from '@/styled-system/css';

export const featuresCarouselStyles = {
  root: css({
    display: 'flex',
    h: '100%',
    w: '100vw',
    alignItems: 'center',
    justifyContent: 'center',
    bg: 'black',
    color: 'white',
    // Padding vertical supprimé - géré par le parent
    px: '10px !important',
  }),

  container: css({
    position: 'relative',
    display: 'flex',
    h: '745px',
    w: '100%',
    maxW: '1400px',
    flexDirection: 'column',
    justifyContent: { base: 'flex-end', md: 'center' },
    overflow: 'hidden',
    bg: 'black',
    rounded: '4xl',
    shadow: 'lg',
  }),

  contentWrapper: css({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    zIndex: 2,
  }),

  // Navigation buttons (desktop vertical)
  navButtonsContainer: css({
    position: 'relative',
    display: { base: 'none', lg: 'flex' },
    flexDirection: 'column',
    gap: 2,
    zIndex: 3,
    paddingRight: "10px !important",
    alignSelf: 'center',
  }),

  navButton: css({
    zIndex: 3,
    bg: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    display: 'flex',
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
    rounded: 'full',
    cursor: 'pointer',
    transition: 'all',
    _active: {
      transform: 'scale(0.95)',
    },
  }),

  navButtonDisabled: css({
    cursor: 'not-allowed',
    opacity: 0.5,
  }),

  // Desktop list
  desktopList: css({
    zIndex: 2,
    position: 'relative',
    display: { base: 'none', md: 'flex' },
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 3,
  }),

  // Mobile carousel container
  mobileCarouselContainer: css({
    display: { base: 'flex', lg: 'none' },
    flexDirection: 'column',
    w: '100%',
  }),

  // Mobile carousel wrapper
  mobileCarouselWrapper: css({
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    w: '100%',
  }),

  // Feature item (shared between desktop and mobile)
  featureItem: cva({
    base: {
      borderRadius: '25px',
      bg: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      h: 'fit-content',
      w: { base: 'fit-content', md: 'fit-content' },
      alignItems: 'center',
      justifyContent: 'center',
      _hover: {
        bg: 'rgba(255, 255, 255, 0.14)',
      },
    },
    variants: {
      isActive: {
        true: {
          padding: "10px !important",
        },
        false: {
          paddingX: "10px !important",
          paddingY: "0px !important",
        },
      },
    },
    defaultVariants: {
      isActive: false,
    },
  }),

  // Feature button (collapsed state)
  featureButton: css({
    display: 'flex',
    h: '56px',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '14px',
    rounded: 'full',
    pl: '14px',
    pr: 8,
  }),

  // Feature name text
  featureName: css({
    whiteSpace: 'nowrap',
    fontSize: 'lg',
    fontWeight: 'semibold',
    textTransform: 'capitalize',
    color: 'white',
  }),

  // Feature expanded content
  featureExpanded: css({
    p: { base: 8, md: 10, lg: 12 },
    fontSize: 'lg',
    maxW: { base: '100%', md: '32.5rem' },
    color: 'white',
    padding: "10px !important",
    display: 'flex',
    flexDirection: 'column',
    gap: { base: 2, md: 3 },

  }),

  featureTitle: css({
    lineHeight: '1.2',
    marginBottom: 0,
  }),

  featureDescription: css({
    lineHeight: '1.5',
    marginTop: 0,
  }),

  // Color picker container
  colorPickerContainer: css({
    mt: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  }),

  // Color button
  colorButton: css({
    cursor: 'pointer',
    rounded: 'full',
    borderBottom: '1px solid white',
  }),

  // Color dot (for first feature)
  colorDot: css({
    rounded: 'full',
    borderBottom: '1px solid white',
  }),

  // Mobile carousel navigation buttons
  mobileNavButton: css({
    position: 'absolute',
    top: '50%',
    display: 'flex',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    _active: {
      transform: 'translateY(-50%) scale(0.95)',
    },
  }),

  mobileNavButtonPrev: css({
    left: 0,
    transform: 'translateX(-100%) translateY(-50%)',
    justifyContent: 'flex-end',
  }),

  mobileNavButtonNext: css({
    right: 0,
    transform: 'translateX(100%) translateY(-50%)',
  }),

  mobileNavButtonHidden: css({
    opacity: 0,
  }),

  // Mobile dots navigation
  mobileDotsContainer: css({
    display: { base: 'flex', lg: 'none' },
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
    marginTop: '10px !important',
    marginBottom: '10px !important',
    zIndex: 10,
  }),

  mobileDot: css({
    w: 2,
    h: 2,
    rounded: 'full',
    bg: 'rgba(255, 255, 255, 0.3)',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    _hover: {
      bg: 'rgba(255, 255, 255, 0.5)',
    },
  }),

  mobileDotActive: css({
    w: 3,
    h: 3,
    bg: 'white',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    fontWeight: 'bold',
    transform: 'scale(1.3)',
    opacity: 1,
  }),

  // Mobile carousel item button (collapsed)
  mobileCarouselItemButton: css({
    display: 'flex',
    h: '56px',
    w: '100%',
    cursor: 'pointer',
    alignItems: 'center',
    rounded: 'full',
    gap: '14px',
  }),

  mobileCarouselItemButtonStart: css({
    justifyContent: { base: 'flex-start', lg: 'center' },
    pl: 3,
  }),

  mobileCarouselItemButtonEnd: css({
    justifyContent: { base: 'flex-end', lg: 'center' },
    pr: 3,
  }),

  // Mobile list (when isActive is null)
  mobileList: css({
    position: 'relative',
    zIndex: 1,
    display: { base: 'flex', lg: 'none' },
    gap: 3,
    overflowX: 'scroll',
    px: 5,
    flexDirection: { lg: 'column' },
    alignItems: { lg: 'flex-start' },
    // Hide scrollbar
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  }),

  // Image container
  imageContainer: css({
    position: 'absolute',
    left: '50%',
    top: '50%',
    h: '100%',
    w: '100%',
    transform: 'translate(-50%, -50%)',
    zIndex: 0,
  }),

  // Image
  image: css({
    h: '100%',
    w: '100%',
    objectFit: 'contain',
  }),

  imageTranslated: css({
    h: '100%',
    w: '100%',
    objectFit: 'contain',
    transform: { base: 'translateX(0)', lg: 'translateX(0)' },
    margin: '0 auto',
    display: 'block',
  }),

  // Close button
  closeButton: css({
    zIndex: 3,
    bg: 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    position: 'absolute',
    right: 5,
    top: 5,
    display: 'flex',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
    rounded: 'full',
    _active: {
      transform: 'scale(0.95)',
    },
  }),

  // Plus icon SVG
  plusIcon: css({
    width: '24px',
    height: '24px',
  }),

  // Utility classes
  srOnly: css({
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  }),

  iconSize5: css({
    width: '1.25rem',
    height: '1.25rem',
  }),

  iconSize6: css({
    width: '1.5rem',
    height: '1.5rem',
  }),

  capitalize: css({
    textTransform: 'capitalize',
  }),

  fullWidth: css({
    w: '100%',
  }),

  carouselItem: css({
    w: '100%',
    flexShrink: 0,
    paddingRight: { base: '12px', lg: 0 },
  }),

  carouselContent: css({
    ml: '-1',
    display: 'flex',
    alignItems: 'flex-end',
    gap: { base: 3, lg: 0 },
  }),

  // Mobile description container
  mobileDescriptionContainer: css({
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  }),

  mobileDescription: css({
    lineHeight: '1.5',
    marginTop: 0,
    display: 'inline',
    wordWrap: 'break-word',
  }),

  mobileReadMoreButton: css({
    display: 'inline',
    color: 'white',
    bg: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: 'inherit',
    fontWeight: 'semibold',
    textDecoration: 'underline',
    padding: 0,
    margin: 0,
    _hover: {
      opacity: 0.8,
    },
  }),

  // Mobile feature item - flexible height
  mobileFeatureItem: css({
    display: 'flex',
    flexDirection: 'column',
  }),

  // Mobile feature expanded - flexible height
  mobileFeatureExpanded: css({
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  }),

  rotate45: css({
    transform: 'rotate(45deg)',
  }),
};

