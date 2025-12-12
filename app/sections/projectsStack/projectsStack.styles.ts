import { css } from '@/styled-system/css';

export const projectsStackStyles = {
  container: css({
    position: 'relative',
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: '50vh',
    paddingTop: '50vh',
  }),

  header: css({
    position: 'absolute',
    left: '50%',
    top: '10%',
    transform: 'translateX(-50%)',
    display: 'grid',
    gridTemplateRows: 'auto',
    justifyItems: 'center',
    alignContent: 'flex-start',
    gap: '24px',
    textAlign: 'center',
  }),

  headerText: css({
    position: 'relative',
    maxWidth: '12ch',
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    lineHeight: 1.1,
    letterSpacing: '0.08em',
    opacity: 0.4,
    _after: {
      content: "''",
      position: 'absolute',
      left: '50%',
      top: '100%',
      height: '64px',
      width: '1px',
      background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(255, 255, 255, 0.6))',
      transform: 'translateX(-50%)',
    },
  }),

  stickyCard: css({
    position: 'sticky',
    top: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    minHeight: '100vh',
  }),

  card: css({
    borderRadius: '32px',
    position: 'relative',
    top: '-10%',
    display: 'flex',
    height: '300px',
    width: '500px',
    transformOrigin: 'top',
    flexDirection: 'column',
    overflow: 'hidden',
  }),

  cardImage: css({
    height: '100%',
    width: '100%',
    objectFit: 'cover',
  }),
};

