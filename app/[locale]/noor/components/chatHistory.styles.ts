import { css } from '@/styled-system/css';

export const chatHistoryStyles = {
  sidebarShell: css({
    height: '100%',
    maxHeight: '100%',
    minHeight: 0,              // CRUCIAL pour que le scroll fonctionne dans le flex parent
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,             // Ne pas se réduire
    width: '280px',
    bg: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '18px',
    padding: '16px 14px',
    backdropFilter: 'blur(18px)',
    transition: 'width 0.25s ease, padding 0.25s ease',
    overflow: 'hidden',
    pointerEvents: 'auto',
    position: 'relative',
  }),

  sidebarCollapsed: css({
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: '64px !important',
    borderRadius: '50px',
    '& > *': {
      alignSelf: 'flex-start',
    },
  }),

  header: css({
    
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    paddingBottom: '14px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    marginBottom: '16px',
    minHeight: '30px',
    position: 'relative',
    zIndex: 5,
  }),

  headerActions: css({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }),

  headerTitle: css({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#ffffff',
  }),

  headerIcon: css({
    width: '18px',
    height: '18px',
    color: 'rgba(255, 255, 255, 0.75)',
  }),

  collapseButton: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30px',
    height: '30px',
    minWidth: '30px',
    minHeight: '30px',
    flexShrink: 0,
    borderRadius: '999px',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    background: 'rgba(255, 255, 255, 0.03)',

    color: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    pointerEvents: 'auto',
    _hover: {
      background: 'rgba(255, 255, 255, 0.12)',
    },
    _active: {
      transform: 'scale(0.95)',
    },
  }),

  actionsBar: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '16px',
  }),

  actionButton: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '12px 14px',
    borderRadius: '14px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(255, 255, 255, 0.04)',
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    _hover: {
      background: 'rgba(255, 255, 255, 0.08)',
    },
  }),

  searchBox: css({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderRadius: '14px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(255, 255, 255, 0.03)',
    padding: '10px 12px',
    color: 'rgba(255, 255, 255, 0.6)',
    '& input': {
      flex: 1,
      background: 'transparent',
      border: 'none',
      outline: 'none',
      color: '#ffffff',
      fontSize: '0.85rem',
    },
  }),

  searchIcon: css({
    color: 'rgba(255, 255, 255, 0.6)',
  }),

  conversationList: css({
    flex: 1,
    overflowY: 'auto',
    padding: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(255, 255, 255, 0.1) transparent',
    '&::-webkit-scrollbar': {
      width: '4px',
    },
    '&::-webkit-scrollbar-track': {
      bg: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      bg: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '2px',
    },
  }),

  loadingState: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '32px 16px',
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: '0.8125rem',
  }),

  emptyState: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '32px 16px',
    color: 'rgba(255, 255, 255, 0.25)',
    textAlign: 'center',
    '& p': {
      fontSize: '0.875rem',
      fontWeight: '500',
      color: 'rgba(255, 255, 255, 0.4)',
    },
    '& span': {
      fontSize: '0.75rem',
    },
  }),

  conversationItem: css({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.03)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    _hover: {
      background: 'rgba(255, 255, 255, 0.07)',
      '& button': {
        opacity: 1,
      },
    },
  }),

  conversationItemActive: css({
    background: '#363636',
    borderLeft: '3px solid #FFFFFF',
    _hover: {
      background: '#818181',
    },
    '& > span:first-child': {
      color: '#FFFFFF',
    },
  }),

  conversationContent: css({
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  }),

  conversationTitle: css({
    flex: 1,
    fontSize: '0.8125rem',
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),

  conversationDivider: css({
    height: '1px',
    flex: 1,
    background: 'rgba(255, 255, 255, 0.08)',
  }),

  deleteButton: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    background: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.3)',
    cursor: 'pointer',
    opacity: 0,
    transition: 'all 0.15s ease',
    _hover: {
      background: 'rgba(239, 68, 68, 0.15)',
      color: '#ef4444',
    },
    _disabled: {
      cursor: 'not-allowed',
      opacity: 0.5,
    },
  }),

  footer: css({
    paddingTop: '14px',
    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
    textAlign: 'center',
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.4)',
  }),

  conversationIndex: css({
    fontSize: '0.75rem',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.35)',
    fontFamily: 'monospace',
    minWidth: '28px',
  }),

  collapsedIcons: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '16px',
    flex: 1,
    width: '100%',
  }),

  iconCircle: css({
    width: '35px',
    height: '35px',
    borderRadius: '999px',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    background: 'rgba(255, 255, 255, 0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 8px 25px rgba(0,0,0,0.25)',
    _hover: {
      background: 'rgba(255, 255, 255, 0.12)',
      color: '#ffffff',
    },
  }),
};
