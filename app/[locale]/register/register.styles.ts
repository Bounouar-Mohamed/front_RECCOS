import { css } from '@/styled-system/css';

export const registerStyles = {
  container: css({
    minH: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bg: 'gray.50',
    p: 4,
  }),

  card: css({
    w: '100%',
    maxW: 'md',
    bg: 'white',
    rounded: 'lg',
    shadow: 'lg',
    p: 8,
  }),

  successCard: css({
    w: '100%',
    maxW: 'md',
    bg: 'white',
    rounded: 'lg',
    shadow: 'lg',
    p: 8,
    textAlign: 'center',
  }),

  title: css({
    textAlign: 'center',
    fontSize: '2xl',
    fontWeight: 'bold',
    mb: 6,
  }),

  successTitle: css({
    fontSize: '2xl',
    fontWeight: 'bold',
    mb: 4,
    color: 'green.600',
  }),

  successText: css({
    color: 'gray.600',
  }),

  errorMessage: css({
    mb: 4,
    p: 3,
    bg: 'red.50',
    border: '1px solid',
    borderColor: 'red.200',
    rounded: 'md',
    color: 'red.800',
  }),

  form: css({
    spaceY: 4,
  }),

  formGroup: css({
    display: 'flex',
    flexDirection: 'column',
  }),

  formRow: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 4,
  }),

  label: css({
    display: 'block',
    mb: 1,
    fontWeight: 'medium',
  }),

  input: css({
    w: '100%',
    px: 3,
    py: 2,
    border: '1px solid',
    borderColor: 'gray.300',
    rounded: 'md',
    _focus: {
      outline: 'none',
      borderColor: 'primary.500',
    },
  }),

  errorText: css({
    mt: 1,
    color: 'red.600',
    fontSize: 'sm',
  }),

  helpText: css({
    mt: 1,
    color: 'gray.600',
    fontSize: 'xs',
  }),

  submitButton: css({
    w: '100%',
    py: 2,
    px: 4,
    bg: 'primary.600',
    color: 'white',
    rounded: 'md',
    fontWeight: 'medium',
    _hover: {
      bg: 'primary.700',
    },
    _disabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  }),

  linksContainer: css({
    mt: 4,
    textAlign: 'center',
  }),

  link: css({
    color: 'primary.600',
    textDecoration: 'underline',
  }),
};
















