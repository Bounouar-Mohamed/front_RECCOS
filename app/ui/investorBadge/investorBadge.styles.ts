import { css } from '@/styled-system/css';

const baseContainer = {
  display: 'flex',
  alignItems: 'center',
  pointerEvents: 'none',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '50px',
} as const;

const baseAvatarGroup = {
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
} as const;

const baseAvatar = {
  borderRadius: '50%',
  border: '2px solid rgba(255, 255, 255, 0.2)',
  backgroundColor: 'rgba(32, 32, 32, 0.8)',
  backdropFilter: 'blur(10px)',
  position: 'relative',
} as const;

const baseInfo = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
} as const;

const baseCount = {
  color: '#ffffff',
  fontWeight: 600,
  fontFamily: 'var(--font-bebas-neue), sans-serif',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  lineHeight: 0.6,
} as const;

const baseLabel = {
  color: 'rgba(255, 255, 255, 0.8)',
  fontWeight: 400,
  fontFamily: 'var(--font-inter), sans-serif',
  lineHeight: 1.2,
  textTransform: 'none',
  whiteSpace: 'nowrap',
} as const;

export const investorBadgeStyles = {
  container: {
    small: css({
      ...baseContainer,
      gap: '5px',
      padding: '2.5px',
      paddingRight: '10px',
    }),
    medium: css({
      ...baseContainer,
      gap: { base: '0.625rem', sm: '0.75rem' },
      padding: { base: '0.5rem 0.625rem', sm: '0.5rem 0.75rem' },
    }),
    large: css({
      ...baseContainer,
      gap: { base: '0.75rem', sm: '1rem' },
      padding: { base: '0.625rem 0.75rem', sm: '0.75rem 1rem' },
    }),
  },
  avatarGroup: {
    small: css({
      ...baseAvatarGroup,
    }),
    medium: css({
      ...baseAvatarGroup,
    }),
    large: css({
      ...baseAvatarGroup,
    }),
  },
  avatar: {
    small: css({
      ...baseAvatar,
      width: { base: '18px', sm: '20px' },
      height: { base: '18px', sm: '20px' },
      borderWidth: { base: '1.5px', sm: '2px' },
    }),
    medium: css({
      ...baseAvatar,
      width: '25px',
      height: '25px',
      borderWidth: '2px',
    }),
    large: css({
      ...baseAvatar,
      width: '30px',
      height: '30px',
      borderWidth: { base: '2px', sm: '3px' },
    }),
  },
  info: {
    small: css({
      ...baseInfo,
      gap: '2.5px',
    }),
    medium: css({
      ...baseInfo,
      gap: { base: '0.375rem', sm: '0.5rem' },
    }),
    large: css({
      ...baseInfo,
      gap: { base: '0.5rem', sm: '0.625rem' },
    }),
  },
  count: {
    small: css({
      ...baseCount,
      fontSize: { base: '0.875rem', sm: '1rem' },
    }),
    medium: css({
      ...baseCount,
      fontSize: { base: '1.125rem', sm: '1.25rem' },
    }),
    large: css({
      ...baseCount,
      fontSize: { base: '1.5rem', sm: '1.75rem' },
    }),
  },
  label: {
    small: css({
      ...baseLabel,
      fontSize: { base: '0.625rem', sm: '0.6875rem' },
    }),
    medium: css({
      ...baseLabel,
      fontSize: { base: '0.6875rem', sm: '0.75rem' },
    }),
    large: css({
      ...baseLabel,
      fontSize: { base: '0.875rem', sm: '1rem' },
    }),
  },
} as const;

