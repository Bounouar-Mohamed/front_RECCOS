import { css } from '@/styled-system/css';

export const loginStyles = {
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

  title: css({
    textAlign: 'center',
    fontSize: '2xl',
    fontWeight: 'bold',
    mb: 6,
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

  input2FA: css({
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
    spaceY: 2,
  }),

  link: css({
    color: 'primary.600',
    textDecoration: 'underline',
  }),

  oauthSection: css({
    mt: 6,
    pt: 6,
    borderTop: '1px solid',
    borderColor: 'gray.200',
  }),

  oauthTitle: css({
    textAlign: 'center',
    mb: 4,
    color: 'gray.600',
  }),

  oauthButtons: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 2,
  }),

  oauthButton: css({
    py: 2,
    px: 4,
    border: '1px solid',
    borderColor: 'gray.300',
    rounded: 'md',
    textAlign: 'center',
    _hover: {
      bg: 'gray.50',
    },
  }),
};
















