import { css } from '@/styled-system/css';

export const navbarStyles = {
  root: css({
    position: 'relative',
    zIndex: 10001,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 'fit-content',
    maxWidth: '100%',
    backdropFilter: 'blur(10px) saturate(160%)',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: '999px',
    boxShadow: '0 28px 90px rgba(15, 23, 42, 0.22)',
    px: { base: '1.75rem', md: '2.5rem' },
    py: { base: '0.85rem', md: '1rem' },
    marginLeft: 'auto',
    overflow: 'visible',

    // ⭐ Le vrai reflet est ici
    _before: {
      content: "''",
      position: 'absolute',
      inset: 0,
      borderRadius: '999px',
      padding: '1px', // épaisseur de la pseudo-bordure
      background:
        'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.25) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.25) 75%, rgba(255,255,255,0.9) 100%)',
      WebkitMask:
        'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
      WebkitMaskComposite: 'xor',
      pointerEvents: 'none',
      zIndex: -1,
    },
  }),

  nav: css({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '15px !important',
    paddingX: '25px !important',
    paddingY: '20px !important',
  }),

  link: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    px: { base: 3, md: 4 },
    py: { base: 2, md: 2.5 },
    color: 'rgba(255, 255, 255, 0.92)',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 400,
    letterSpacing: '-0.01em',
    borderRadius: '999px',
    transition: 'background 0.2s ease, transform 0.2s ease, text-decoration 0.2s ease',
    textDecoration: 'none',
    cursor: 'pointer',
    _hover: {
      color: 'rgba(255, 255, 255, 0.28)',
    },
  }),

  linkActive: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    px: { base: 3, md: 4 },
    py: { base: 2, md: 2.5 },
    color: 'white',
    textDecoration: 'underline',
    textDecorationColor: 'rgba(255, 255, 255, 0.9)',
    textUnderlineOffset: '4px',
    borderRadius: '999px',
    transition: 'background 0.2s ease, transform 0.2s ease',
    cursor: 'pointer',
  }),

  cta: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingX: '20px !important',
    paddingY: '5px !important',
    bg: 'rgba(255, 255, 255, 0.95)',
    color: 'black',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 400,
    borderRadius: '999px',
    transition: 'background 0.2s ease, transform 0.2s ease',
    cursor: 'pointer',
    textDecoration: 'none',
    border: 'none',
    _hover: {
      bg: 'rgba(255, 255, 255, 0.28)',
    },
  }),

  logoutButton: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingX: '20px !important',
    paddingY: '5px !important',
    bg: 'rgba(255, 255, 255, 0.95)',
    color: 'black',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 400,
    borderRadius: '999px',
    transition: 'background 0.2s ease, transform 0.2s ease',
    cursor: 'pointer',
    border: 'none',
    _hover: {
      bg: 'rgba(255, 255, 255, 0.28)',
    },
  }),
};
