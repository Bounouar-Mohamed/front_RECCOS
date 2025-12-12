import { css } from '@/styled-system/css';

export const containerClass = css({
    position: 'fixed',
    top: { base: '20px', md: '32px' },
    right: { base: '16px', md: '32px' },
    zIndex: 100000,
    display: 'flex',
    flexDirection: 'column',
    pointerEvents: 'none',
});

export const toastCard = css({
    pointerEvents: 'auto',
    minWidth: { base: '280px', sm: '320px' },
    maxWidth: { base: 'calc(100vw - 32px)', sm: '360px' },
    borderRadius: '22px',
    padding: '9px 15px',
    background:
        'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(12px)',
    // border: '1px solid rgba(255,255,255,0.25)',
    position: 'relative',
    overflow: 'visible',
    _before: {
        content: "''",
        position: 'absolute',
        inset: 0,
        borderRadius: '22px',
        padding: '1px',
        background:
          'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255,255,255,0.25) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.25) 75%, rgba(255, 255, 255, 0.7) 100%)',
        WebkitMask:
          'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        pointerEvents: 'none',
        zIndex: -1,
      },
});

export const separatorContainer = css({
    borderBottom: '1px solid rgba(255,255,255,0.15)',
});

export const decorativeBar = css({
    width: '48px',
    height: '6px',
    borderRadius: '999px',
    background: 'linear-gradient(90deg, rgba(255,255,255,0.9), rgba(255,255,255,0.45))',
    marginBottom: '12px',
});

export const contentContainer = css({
    position: 'relative',
    zIndex: 2,
});

export const titleClass = css({
    fontSize: '0.95rem',
    fontWeight: 600,
    marginBottom: '4px',
    color: '#FFFFFF',
});

export const descriptionClass = css({
    fontSize: '0.85rem',
    color: 'rgba(168, 168, 168, 0.8)',
    lineHeight: 1.4,
});


export const closeButton = css({
    position: 'absolute',
    top: '-8px',
    left: '-8px',
    background: 'rgb(84, 82, 82)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '45px',
    width: '25px',
    height: '25px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255, 255, 255, 0.5)',
    cursor: 'pointer',
    opacity: 0,
    zIndex: 10,
    transition: 'opacity 0.2s ease, background 0.2s ease, transform 0.2s ease, backdrop-filter 0.2s ease',
});

export const designModeToggle = css({
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    zIndex: 100001,
    padding: '10px 16px',
    background: 'rgba(110, 168, 255, 0.9)',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '12px',
    color: '#05060a',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s ease, transform 0.2s ease',
    _hover: {
        background: 'rgba(110, 168, 255, 1)',
        transform: 'translateY(-2px)',
    },
});

