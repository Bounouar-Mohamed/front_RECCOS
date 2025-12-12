import { css } from '@/styled-system/css';

export const heroSearchFormStyles = {
  wrapper: css({
    position: 'absolute',
    bottom: { base: 4, sm: 6, md: 8, lg: 12 },
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10,
    width: { base: 'calc(100% - 1rem)', sm: 'calc(100% - 2rem)', md: 'calc(100% - 4rem)', lg: 'calc(100% - 6rem)' },
    maxWidth: '1400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: { base: 2, sm: 3, md: 4 },
  }),

  titleSection: css({
    textAlign: 'center',
    mb: { base: 0, md: 1 },
  }),

  title: css({
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    fontSize: { base: '1.5rem', sm: '1.75rem', md: '2.25rem', lg: '2.75rem', xl: '3rem' },
    fontWeight: 400,
    letterSpacing: '0.02em',
    color: 'rgba(255, 255, 255, 0.98)',
    lineHeight: 1.1,
    mb: { base: 0.5, sm: 1, md: 1.5 },
    textShadow: '0 20px 80px rgba(255, 255, 255, 0.9)',
  }),

  price: css({
    fontFamily: 'var(--font-inter), Inter, sans-serif',
    fontSize: { base: 11, sm: 12, md: 13, lg: 14 },
    fontWeight: 400,
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: '0.05em',
    lineHeight: 1.5,
    mt: { base: 1.5, sm: 2, md: 2.5 },
    textTransform: 'uppercase',
    opacity: 0.9,
  }),

  container: css({
    width: '100%',
    backdropFilter: 'blur(12px) saturate(180%)',
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: { base: 18, sm: 24, md: 30, lg: 36 },
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    position: 'relative',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: { base: '12px !important', sm: '16px !important', md: '20px !important' },

    // ⭐ Le vrai reflet est ici (même style que navbar)
    _before: {
      content: "''",
      position: 'absolute',
      inset: 0,
      borderRadius: { base: 18, sm: 24, md: 30, lg: 36 },
      padding: '1px',
      background:
        'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.25) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.25) 75%, rgba(255,255,255,0.9) 100%)',
      WebkitMask:
        'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
      WebkitMaskComposite: 'xor',
      pointerEvents: 'none',
      zIndex: -1,
    },
  } as any),

  formContent: css({
    display: 'flex',
    flexDirection: { base: 'column', md: 'column', lg: 'row' },
    alignItems: { base: 'stretch', lg: 'stretch' },
    width: '100%',
    position: 'relative',
    zIndex: 1,
    gap: { base: 0, lg: 0 },
  }),

  fieldWrapper: css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    flex: { base: '1 1 100%', lg: '1 1 0%' },
    minWidth: 0,
    position: 'relative',
    gap: { base: '6px', sm: '8px' },
    paddingTop: { base: '8px !important', sm: '9px !important', md: '10px !important' },
    paddingBottom: { base: '8px !important', sm: '9px !important', md: '10px !important' },
    paddingLeft: { base: '10px !important', sm: '12px !important', md: '15px !important' },
    paddingRight: { base: '10px !important', sm: '12px !important', md: '15px !important' },
  }),

  label: css({
    fontFamily: 'var(--font-inter), Inter, sans-serif',
    fontSize: { base: 10, sm: 11, md: 12 },
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.65)',
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
    mb: { base: 1, sm: 1.5, md: 2 },
    lineHeight: 1.2,
  }),

  separator: css({
    display: { base: 'none', lg: 'block' },
    width: '1px',
    bg: 'rgba(255, 255, 255, 0.12)',
    alignSelf: 'stretch',
    my: { base: 0, lg: 3 },
    minHeight: { base: 0, lg: 'auto' },
  }),

  select: css({
    width: '100%',
    bg: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.95)',
    fontFamily: 'var(--font-inter), Inter, sans-serif',
    fontSize: { base: 14, md: 15 },
    fontWeight: 400,
    letterSpacing: '-0.01em',
    outline: 'none',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='rgba(255,255,255,0.6)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right center',
    paddingRight: 7,
    _hover: {
      color: 'rgba(255, 255, 255, 1)',
    },
    _focus: {
      color: 'rgba(255, 255, 255, 1)',
    },
    '& option': {
      bg: '#1a1a1a',
      color: 'rgba(255, 255, 255, 0.95)',
      padding: 2,
    },
  }),

  input: css({
    width: '100%',
    bg: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: { base: 10, md: 12 },
    color: 'rgba(255, 255, 255, 0.95)',
    fontFamily: 'var(--font-inter), Inter, sans-serif',
    fontSize: { base: 12.5, sm: 13.5, md: 15 },
    fontWeight: 400,
    letterSpacing: '-0.01em',
    outline: 'none',
    padding: { base: '9px 12px !important', sm: '10px 14px !important', md: '12px 16px !important' },
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    _placeholder: {
      color: 'rgba(255, 255, 255, 0.5)',
    },
    _hover: {
      color: 'rgba(255, 255, 255, 1)',
      bg: 'rgba(255, 255, 255, 0.08)',
      borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    _focus: {
      color: 'rgba(255, 255, 255, 1)',
      bg: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.1)',
    },
    '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
      appearance: 'none',
      margin: 0,
    },
    '&[type=number]': {
      // @ts-ignore - Propriété Mozilla spécifique
      MozAppearance: 'textfield',
    } as any,
  }),

  ctaWrapper: css({
    display: 'flex',
    flexDirection: 'column',
    flex: { base: '1 1 100%', lg: '0 0 auto' },
    minWidth: { base: '100%', lg: 140 },
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    mt: { base: 2, lg: 0 },
    paddingTop: { base: '8px !important', sm: '9px !important', md: '10px !important' },
    paddingBottom: { base: '8px !important', sm: '9px !important', md: '10px !important' },
    paddingLeft: { base: '10px !important', sm: '12px !important', md: '15px !important' },
    paddingRight: { base: '10px !important', sm: '12px !important', md: '15px !important' },
  }),

  cta: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    padding: { base: '9px 18px !important', sm: '11px 22px !important', md: '12px 26px !important' },
    bg: 'rgba(255, 255, 255, 0)',
    color: '#FFFFFF',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    fontSize: { base: '0.95rem', sm: '1.05rem', md: '1.2rem' },
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    border: 'none',
    borderRadius: "60px",
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    _hover: {
      bg: 'rgba(255, 255, 255, 0.12)',
    },
    _active: {
      opacity: 0.9,
    },
    // ⭐ Le vrai reflet est ici (même style que container)
    _before: {
      content: "''",
      position: 'absolute',
      inset: 0,
      borderRadius: "60px",
      padding: '1px',
      background:
        'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.25) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.25) 75%, rgba(255,255,255,0.9) 100%)',
      WebkitMask:
        'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
      WebkitMaskComposite: 'xor',
      pointerEvents: 'none',
      zIndex: -1,
    },
  } as any),

  ctaText: css({
    display: 'inline-block',
    letterSpacing: '-0.005em',
  }),

  ctaIcon: css({
    display: 'block',
    flexShrink: 0,
    width: { base: 12, md: 14 },
    height: { base: 12, md: 14 },
    opacity: 0.7,
  }),
};

