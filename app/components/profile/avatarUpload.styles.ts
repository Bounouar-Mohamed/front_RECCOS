import { css } from '@/styled-system/css';

export const avatarUploadStyles = {
  container: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
  }),
  previewWrapper: css({
    position: 'relative',
    width: { base: '120px', md: '140px' },
    height: { base: '120px', md: '140px' },
    borderRadius: 'full',
    border: '1px solid rgba(255,255,255,0.15)',
    overflow: 'hidden',
    background: 'rgba(255,255,255,0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  previewImage: css({
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  }),
  uploadButton: css({
    appearance: 'none',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: '999px',
    padding: '0.35rem 1.25rem',
    fontSize: '0.875rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    background: 'transparent',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    _hover: {
      borderColor: 'white',
      background: 'rgba(255,255,255,0.05)',
    },
    _disabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  }),
  helperText: css({
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  }),
  fileInput: css({
    display: 'none',
  }),
  placeholderInitials: css({
    fontSize: '2.25rem',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.85)',
  }),
};
