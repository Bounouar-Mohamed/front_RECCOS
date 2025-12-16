import { css } from '@/styled-system/css';

export const walletHistoryTableStyles = {
  container: css({
    // Espace plus compact sous le titre "History"
    marginTop: { base: '0.4rem', sm: '0.5rem' },
    borderRadius: '25px',
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    flexDirection: 'column',
    // hauteur fixe pour que la card reste stable
    height: { base: '190px', sm: '210px', md: '220px' },
    overflow: 'hidden',
  }),
  headerRow: css({
    display: 'grid',
    gridTemplateColumns: '2fr 1.25fr 1.1fr 1.4fr',
    padding: { base: '0.6rem 0.9rem', sm: '0.7rem 1rem' },
    borderBottom: '1px solid rgba(255,255,255,0.16)',
    fontSize: { base: '0.7rem', sm: '0.75rem' },
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    color: 'rgba(255,255,255,0.6)',
  }),
  headerCell: css({
    display: 'flex',
    alignItems: 'center',
    // justifyContent: 'space-between',
    columnGap: '0.4rem',
    whiteSpace: 'nowrap',
  }),
  sortButton: css({
    display: 'flex',
    alignItems: 'center',
    columnGap: '0.35rem',
    width: '100%',
    padding: 0,
    margin: 0,
    border: 'none',
    background: 'transparent',
    color: 'inherit',
    font: 'inherit',
    cursor: 'pointer',
  }),
  row: css({
    display: 'grid',
    gridTemplateColumns: '2fr 1.25fr 1.1fr 1.4fr',
    padding: { base: '0.65rem 0.9rem', sm: '0.75rem 1rem' },
    fontSize: { base: '0.8rem', sm: '0.85rem' },
    color: 'rgba(255,255,255,0.9)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    _last: {
      borderBottom: 'none',
    },
  }),
  body: css({
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
  }),
  cell: css({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  statusCell: css({
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  }),
  statusDotCompleted: css({
    width: '8px',
    height: '8px',
    borderRadius: '999px',
    backgroundColor: '#22c55e', // vert
  }),
  statusDotPending: css({
    width: '8px',
    height: '8px',
    borderRadius: '999px',
    backgroundColor: '#f97316', // orange
  }),
  empty: css({
    padding: { base: '0.9rem 1rem' },
    fontSize: { base: '0.8rem', sm: '0.85rem' },
    color: 'rgba(255,255,255,0.65)',
  }),
};


