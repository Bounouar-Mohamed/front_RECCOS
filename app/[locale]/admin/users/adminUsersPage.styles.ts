import { css } from '@/styled-system/css';

export const adminUsersPageStyles = {
  container: css({
    minH: '100vh',
    paddingTop: { base: 'calc(5vh + 100px) !important', md: 'calc(5vh + 110px) !important' },

    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    px: { base: 4, md: 6 },
    py: { base: 10, md: 14 },
    bg: '#000000',
    color: '#ffffff',
  }),

  content: css({
    width: '100%',
    maxW: '960px',
    display: 'flex',
    flexDirection: 'column',
    gap: { base: 4, md: 6 },
  }),

  title: css({
    fontSize: { base: '2.25rem', md: '3rem' },
    fontWeight: 300,
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
  }),

  subtitle: css({
    fontSize: { base: '0.9rem', md: '1rem' },
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  }),

  headerRow: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: { base: 3, md: 4 },
  }),

  tableWrapper: css({
    width: '100%',
    borderRadius: '24px',
    padding: { base: 12, md: 16 },
    backdropFilter: 'blur(12px) saturate(180%)',
    background: 'rgba(255, 255, 255, 0.05)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.32)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    overflow: 'hidden',
  }),

  tableScrollArea: css({
    overflowX: 'auto',
    overflowY: 'auto',
    scrollBehavior: 'smooth',
    // cacher la scrollbar tout en gardant le scroll
    scrollbarWidth: 'none', // Firefox
    '&::-webkit-scrollbar': {
      width: '0',
      height: '0',
      display: 'none',
    },
  }),

  table: css({
    width: '100%',
    borderCollapse: 'collapse',
    minW: '720px',
    fontSize: { base: '0.85rem', md: '0.9rem' },
  }),

  theadCell: css({
    textAlign: 'left',
    paddingBottom: 6,
    paddingRight: 8,
    fontSize: { base: '0.7rem', md: '0.75rem' },
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    color: 'rgba(255,255,255,0.5)',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  }),

  row: css({
    '&:not(:last-of-type) td': {
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    },
  }),

  cell: css({
    paddingTop: 6,
    paddingBottom: 6,
    paddingRight: 8,
    paddingLeft: 0,
    whiteSpace: 'nowrap',
    color: 'rgba(255,255,255,0.85)',
  }),

  emailCell: css({
    maxW: '220px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),

  roleBadge: css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingInline: 8,
    paddingBlock: 3,
    borderRadius: '999px',
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    bg: 'rgba(255,255,255,0.08)',
  }),

  roleBadgeAdmin: css({
    bg: 'rgba(0, 255, 148, 0.14)',
    color: '#00ff94',
  }),

  roleBadgeSuperadmin: css({
    bg: 'rgba(255, 255, 255, 0.18)',
    color: '#ffffff',
  }),

  statusWrapper: css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  }),

  statusDot: css({
    width: 3,
    height: 3,
    borderRadius: '999px',
    flexShrink: 0,
  }),

  statusText: css({
    fontSize: '0.8rem',
  }),

  actionSelect: css({
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#ffffff',
    fontSize: '0.8rem',
    paddingInline: 8,
    paddingBlock: 4,
    outline: 'none',
    cursor: 'pointer',
  }),

  actionsStack: css({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  }),

  statusToggleBtn: css({
    borderRadius: '999px',
    border: '1px solid rgba(255,255,255,0.12)',
    paddingInline: 10,
    paddingBlock: 4,
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    background: 'rgba(255,255,255,0.05)',
    color: '#ffffff',
    cursor: 'pointer',
    transition: 'background 0.2s, border-color 0.2s, opacity 0.2s',
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  }),

  statusToggleBtnDeactivate: css({
    background: 'rgba(255, 99, 71, 0.12)',
    borderColor: 'rgba(255, 99, 71, 0.4)',
    '&:hover': {
      background: 'rgba(255, 99, 71, 0.18)',
      borderColor: 'rgba(255, 99, 71, 0.6)',
    },
  }),

  statusToggleBtnActivate: css({
    background: 'rgba(0, 255, 148, 0.14)',
    borderColor: 'rgba(0, 255, 148, 0.4)',
    color: '#00ff94',
    '&:hover': {
      background: 'rgba(0, 255, 148, 0.22)',
      borderColor: 'rgba(0, 255, 148, 0.6)',
    },
  }),

  loading: css({
    fontSize: { base: '1rem', md: '1.125rem' },
    fontWeight: 400,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  }),

  error: css({
    fontSize: { base: '0.9rem', md: '1rem' },
    color: '#ff6b6b',
  }),

  filtersRow: css({
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 3,
    flexWrap: 'wrap',
  }),

  filterInput: css({
    width: '160px',
    height: 30,
    borderRadius: '999px',
    border: '1px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.04)',
    paddingInline: 6,
    fontSize: '0.8rem',
    color: '#ffffff',
    outline: 'none',
    '&::placeholder': {
      color: 'rgba(255,255,255,0.35)',
    },
    '&:focus': {
      borderColor: 'rgba(255,255,255,0.3)',
    },
  }),

  filterSelectWrapper: css({
    minW: '140px',
    flexShrink: 0,
  }),

  filterSelect: css({
    minW: '120px',
    fontSize: '0.75rem',
    height: '32px !important',
  }),

  paginationRow: css({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '8px',
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.7)',
  }),

  paginationInfo: css({
    opacity: 0.8,
  }),

  paginationButtons: css({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  }),

  paginationButton: css({
    borderRadius: '999px',
    border: '1px solid rgba(255,255,255,0.18)',
    background: 'rgba(255,255,255,0.04)',
    paddingInline: '10px',
    paddingBlock: '4px',
    fontSize: '0.75rem',
    color: '#ffffff',
    cursor: 'pointer',
    '&:disabled': {
      opacity: 0.4,
      cursor: 'not-allowed',
    },
  }),

  /* ─────────────────────────────────────────────────────────────────────────
     Modal d’actions utilisateur
  ───────────────────────────────────────────────────────────────────────── */
  modalOverlay: css({
    position: 'fixed',
    inset: 0,
    zIndex: '50',
    background: 'rgba(0,0,0,0.65)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: { base: '8px', md: '12px' },
  }),

  modalContent: css({
    width: '100%',
    maxW: '420px',
    borderRadius: '20px',
    background: 'rgba(12,12,12,0.98)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 18px 48px rgba(0,0,0,0.7)',
    padding: { base: '14px', md: '18px' },
    display: 'flex',
    flexDirection: 'column',
  }),

  modalHeader: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    marginBottom: '12px',
  }),

  modalTitle: css({
    fontSize: { base: '1rem', md: '1.05rem' },
    fontWeight: 500,
  }),

  modalSubtitle: css({
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.6)',
  }),

  modalCloseBtn: css({
    border: 'none',
    background: 'transparent',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '1.2rem',
    lineHeight: '1',
    cursor: 'pointer',
    paddingInline: '4px',
    paddingBlock: '0',
  }),

  modalBody: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '4px',
    marginBottom: '12px',
  }),

  modalFieldGroup: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  }),

  modalFieldLabel: css({
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.16em',
    color: 'rgba(255,255,255,0.55)',
  }),

  modalSelect: css({
    borderRadius: '999px',
    border: '1px solid rgba(255,255,255,0.14)',
    background: 'rgba(255,255,255,0.06)',
    fontSize: '0.85rem',
    color: '#ffffff',
    outline: 'none',
    cursor: 'pointer',
  }),

  modalStatusToggle: css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '999px',
    border: '1px solid rgba(255,255,255,0.16)',
    paddingInline: '8px',
    paddingBlock: '4px',
    fontSize: '0.8rem',
    cursor: 'pointer',
    background: 'rgba(255,255,255,0.03)',
  }),

  modalStatusSwitchTrack: css({
    position: 'relative',
    width: '32px',
    height: '18px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.18)',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
  }),

  modalStatusSwitchThumb: css({
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    background: '#ffffff',
    transform: 'translateX(0)',
    transition: 'transform 0.18s ease-out, background 0.18s ease-out',
    '&[data-active="true"]': {
      transform: 'translateX(14px)',
      background: '#00ff94',
    },
  }),

  modalStatusSwitchLabel: css({
    fontSize: '0.8rem',
  }),

  modalStatusActive: css({
    borderColor: 'rgba(0,255,148,0.4)',
    background: 'rgba(0,255,148,0.12)',
  }),

  modalStatusInactive: css({
    borderColor: 'rgba(255,255,255,0.18)',
  }),

  modalError: css({
    fontSize: '0.8rem',
    color: '#ff6b6b',
  }),

  modalWarning: css({
    marginTop: '6px',
    fontSize: '0.75rem',
    color: 'rgba(255,180,120,0.95)',
  }),

  modalFooter: css({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '8px',
  }),

  modalSecondaryBtn: css({
    borderRadius: '999px',
    border: '1px solid rgba(255,255,255,0.18)',
    background: 'transparent',
    paddingInline: '10px',
    paddingBlock: '4px',
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.8)',
    cursor: 'pointer',
  }),

  modalPrimaryBtn: css({
    borderRadius: '999px',
    border: 'none',
    background: '#ffffff',
    paddingInline: '12px',
    paddingBlock: '4px',
    fontSize: '0.8rem',
    fontWeight: 500,
    color: '#000000',
    cursor: 'pointer',
  }),

  actionsTriggerBtn: css({
    borderRadius: 999,
    border: '1px solid rgba(255,255,255,0.16)',
    background: 'rgba(255,255,255,0.04)',
    paddingInline: 10,
    paddingBlock: 4,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    cursor: 'pointer',
  }),
};


