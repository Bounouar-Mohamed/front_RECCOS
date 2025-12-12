import { css } from '@/styled-system/css';

export const propertyKPIWidgetsStyles = {
  container: css({
    width: '100%',
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(255, 255, 255, 0.2) transparent',
    touchAction: 'pan-y',
    overscrollBehavior: 'contain',
    padding: { base: '12px', md: '16px' },
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '3px',
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.3)',
      },
    },
  } as any),

  // Bento Grid Layout
  bentoGrid: css({
    display: 'grid',
    gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)' },
    gridAutoRows: { base: 'auto', md: '170px' },
    gap: { base: '12px', md: '14px' },
    width: '100%',
  }),

  bentoItem: css({
    borderRadius: { base: '20px', md: '24px' },
    overflow: 'hidden',
    transformStyle: 'preserve-3d',
    perspective: '1000px',
  }),

  bentoNormal: css({
    gridColumn: 'span 1',
    gridRow: 'span 1',
  }),

  bentoLarge: css({
    gridColumn: { base: 'span 1', md: 'span 2' },
    gridRow: 'span 1',
  }),

  bentoTall: css({
    gridColumn: 'span 1',
    gridRow: { base: 'span 1', md: 'span 2' },
  }),

  // Layout pour widget Large (2 colonnes)
  bentoLargeWrapper: css({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  }),

  periodSelectorTopRight: css({
    position: 'absolute',
    top: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '6px',
    padding: '2px',
    zIndex: 2,
  }),

  bentoLargeLayout: css({
    display: 'flex',
    flexDirection: { base: 'column', md: 'row' },
    gap: { base: '8px', md: '16px' },
    flex: 1,
    width: '100%',
    paddingTop: { base: '28px', md: '0' },
  }),

  bentoLargeLeft: css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    gap: { base: '4px', md: '6px' },
    flex: { base: 'none', md: '0 0 32%' },
  }),

  bentoLargeValue: css({
    fontSize: { base: '28px', md: '36px' },
    fontWeight: 700,
    color: '#FFFFFF',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    letterSpacing: '0.02em',
    lineHeight: 1,
  }),

  bentoLargeStats: css({
    display: 'flex',
    alignItems: 'center',
    gap: { base: '12px', md: '16px' },
  }),

  bentoStat: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  }),

  bentoStatValue: css({
    fontSize: { base: '16px', md: '18px' },
    fontWeight: 700,
    color: '#FFFFFF',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
  }),

  bentoStatLabel: css({
    fontSize: { base: '9px', md: '10px' },
    color: '#878787',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }),

  bentoStatDivider: css({
    width: '1px',
    height: '24px',
    background: 'rgba(255, 255, 255, 0.1)',
  }),

  bentoLargeRight: css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  }),

  bentoChartContainer: css({
    width: '100%',
    height: { base: '70px', md: '85px' },
  }),

  // Layout pour widget Tall (2 lignes)
  bentoTallLayout: css({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    gap: { base: '10px', md: '12px' },
  }),

  bentoTallHeader: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }),

  bentoTallScore: css({
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: '4px',
  }),

  bentoTallScoreValue: css({
    fontSize: { base: '48px', md: '56px' },
    fontWeight: 700,
    color: '#FFFFFF',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    lineHeight: 1,
  }),

  bentoTallScoreMax: css({
    fontSize: { base: '18px', md: '22px' },
    color: '#878787',
    fontWeight: 500,
  }),

  bentoTallDivider: css({
    width: '100%',
    height: '1px',
    background: 'rgba(255, 255, 255, 0.1)',
    margin: { base: '4px 0', md: '8px 0' },
  }),

  bentoTallFooter: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingTop: { base: '8px', md: '10px' },
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  }),

  bentoTallFooterLabel: css({
    fontSize: { base: '10px', md: '11px' },
    color: '#878787',
  }),

  bentoTallFooterValue: css({
    fontSize: { base: '16px', md: '18px' },
    fontWeight: 700,
    color: '#FFFFFF',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
  }),

  // Layout compact pour widgets normaux (1x1)
  bentoCompactLayout: css({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    gap: { base: '8px', md: '10px' },
    justifyContent: 'space-between',
  }),

  bentoCompactValue: css({
    fontSize: { base: '32px', md: '38px' },
    fontWeight: 700,
    color: '#FFFFFF',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    lineHeight: 1,
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
  }),

  bentoCompactUnit: css({
    fontSize: { base: '14px', md: '16px' },
    color: '#878787',
    fontWeight: 500,
  }),

  bentoCompactFooter: css({
    display: 'flex',
    alignItems: 'center',
    gap: { base: '16px', md: '20px' },
    marginTop: 'auto',
  }),

  bentoCompactStat: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  }),

  bentoCompactStatValue: css({
    fontSize: { base: '14px', md: '16px' },
    fontWeight: 700,
    color: '#FFFFFF',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
  }),

  bentoCompactStatLabel: css({
    fontSize: { base: '9px', md: '10px' },
    color: '#878787',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }),

  bentoBarWrapper: css({
    display: 'flex',
    alignItems: 'center',
    gap: { base: '8px', md: '10px' },
    marginTop: 'auto',
  }),

  bentoBar: css({
    flex: 1,
    height: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
  }),

  bentoBarFill: css({
    height: '100%',
    background: '#FFFFFF',
    borderRadius: '3px',
  }),

  bentoBarLabel: css({
    fontSize: { base: '10px', md: '11px' },
    color: '#878787',
    whiteSpace: 'nowrap',
  }),

  bentoCircleRow: css({
    display: 'flex',
    alignItems: 'center',
    gap: { base: '12px', md: '16px' },
    flex: 1,
  }),

  bentoMiniCircle: css({
    position: 'relative',
    width: { base: '70px', md: '80px' },
    height: { base: '70px', md: '80px' },
    flexShrink: 0,
    '& svg': {
      width: '100%',
      height: '100%',
    },
  }),

  bentoMiniCircleValue: css({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: { base: '16px', md: '18px' },
    fontWeight: 700,
    color: '#FFFFFF',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
  }),

  bentoCircleInfo: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  }),

  bentoCircleLabel: css({
    fontSize: { base: '14px', md: '16px' },
    color: '#FFFFFF',
    fontWeight: 600,
  }),

  bentoCircleSub: css({
    fontSize: { base: '10px', md: '11px' },
    color: '#878787',
  }),

  // Widget PRIX AU M² amélioré
  priceWidgetLayout: css({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    gap: { base: '6px', md: '8px' },
  }),

  priceWidgetHeader: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }),

  priceWidgetBadge: css({
    fontSize: '9px',
    fontWeight: 600,
    padding: '3px 6px',
    borderRadius: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  }),

  priceWidgetValue: css({
    fontSize: { base: '28px', md: '32px' },
    fontWeight: 700,
    color: '#FFFFFF',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    lineHeight: 1,
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
  }),

  priceWidgetCurrency: css({
    fontSize: { base: '12px', md: '14px' },
    color: '#878787',
    fontWeight: 500,
  }),

  priceGaugeWrapper: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
    justifyContent: 'center',
  }),

  priceGaugeBg: css({
    position: 'relative',
    height: '8px',
    borderRadius: '4px',
    background: 'rgba(255, 255, 255, 0.1)',
    overflow: 'visible',
  }),

  priceGaugeGradientBar: css({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '4px',
    background: 'linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #22c55e 100%)',
    opacity: 0.6,
  }),

  priceGaugeIndicator: css({
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    background: '#FFFFFF',
    boxShadow: '0 0 8px rgba(255, 255, 255, 0.5)',
    border: '2px solid rgba(0, 0, 0, 0.3)',
    zIndex: 2,
  }),

  priceGaugeAvgMark: css({
    position: 'absolute',
    top: '-3px',
    width: '2px',
    height: '14px',
    background: 'rgba(255, 255, 255, 0.5)',
    transform: 'translateX(-50%)',
    zIndex: 1,
  }),

  priceGaugeScale: css({
    display: 'flex',
    justifyContent: 'space-between',
    position: 'relative',
    fontSize: '9px',
    color: '#878787',
  }),

  priceWidgetStats: css({
    display: 'flex',
    alignItems: 'center',
    gap: { base: '10px', md: '12px' },
    marginTop: 'auto',
  }),

  priceWidgetStat: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  }),

  priceWidgetStatVal: css({
    fontSize: { base: '13px', md: '14px' },
    fontWeight: 700,
    color: '#22c55e',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
  }),

  priceWidgetStatLbl: css({
    fontSize: '9px',
    color: '#878787',
  }),

  priceWidgetStatDivider: css({
    width: '1px',
    height: '20px',
    background: 'rgba(255, 255, 255, 0.1)',
  }),

  // Widget APPRÉCIATION amélioré
  appreciationLayout: css({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    gap: { base: '6px', md: '8px' },
  }),

  appreciationHeader: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }),

  appreciationBadge: css({
    fontSize: '9px',
    fontWeight: 600,
    padding: '3px 6px',
    borderRadius: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  }),

  appreciationMain: css({
    display: 'flex',
    alignItems: 'baseline',
    gap: '2px',
  }),

  appreciationValue: css({
    fontSize: { base: '42px', md: '48px' },
    fontWeight: 700,
    color: '#FFFFFF',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    lineHeight: 1,
  }),

  appreciationPercent: css({
    fontSize: { base: '20px', md: '24px' },
    color: '#878787',
    fontWeight: 600,
  }),

  appreciationTrend: css({
    fontSize: { base: '18px', md: '20px' },
    color: '#22c55e',
    marginLeft: '8px',
  }),

  appreciationBarWrapper: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginTop: 'auto',
  }),

  appreciationBarBg: css({
    height: '6px',
    borderRadius: '3px',
    background: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  }),

  appreciationBarFill: css({
    height: '100%',
    borderRadius: '3px',
  }),

  appreciationBarScale: css({
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '9px',
    color: '#878787',
  }),

  appreciationSubtext: css({
    fontSize: '10px',
    color: '#878787',
    textAlign: 'center',
  }),

  // Widget VOLATILITÉ amélioré
  volatilityLayout: css({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    gap: { base: '4px', md: '6px' },
  }),

  volatilityHeader: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }),

  volatilityBadge: css({
    fontSize: '9px',
    fontWeight: 600,
    padding: '3px 6px',
    borderRadius: '4px',
    letterSpacing: '0.02em',
  }),

  volatilityGauge: css({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    minHeight: 0,
  }),

  volatilityGaugeSvg: css({
    width: '100%',
    maxWidth: '140px',
    height: 'auto',
  }),

  volatilityValue: css({
    display: 'flex',
    alignItems: 'baseline',
    gap: '2px',
    marginTop: '-10px',
  }),

  volatilityValueNum: css({
    fontSize: { base: '24px', md: '28px' },
    fontWeight: 700,
    color: '#FFFFFF',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    lineHeight: 1,
  }),

  volatilityValueMax: css({
    fontSize: { base: '12px', md: '14px' },
    color: '#878787',
    fontWeight: 500,
  }),

  volatilityZones: css({
    display: 'flex',
    justifyContent: 'center',
    gap: { base: '12px', md: '16px' },
    marginTop: 'auto',
  }),

  volatilityZone: css({
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'opacity 0.3s ease',
  }),

  volatilityZoneDot: css({
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  }),

  volatilityZoneLabel: css({
    fontSize: '9px',
    color: '#878787',
  }),

  // Widget DEMANDE (ex-CHALEUR) amélioré
  demandLayout: css({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    gap: { base: '6px', md: '8px' },
  }),

  demandHeader: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }),

  demandBadge: css({
    fontSize: '9px',
    fontWeight: 600,
    padding: '3px 6px',
    borderRadius: '4px',
    letterSpacing: '0.02em',
  }),

  demandMain: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  }),

  demandScore: css({
    display: 'flex',
    alignItems: 'baseline',
    gap: '2px',
  }),

  demandScoreNum: css({
    fontSize: { base: '32px', md: '38px' },
    fontWeight: 700,
    color: '#FFFFFF',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    lineHeight: 1,
  }),

  demandScoreMax: css({
    fontSize: { base: '14px', md: '16px' },
    color: '#878787',
    fontWeight: 500,
  }),

  demandDesc: css({
    fontSize: '11px',
    color: '#878787',
  }),

  demandIndicators: css({
    display: 'flex',
    gap: '4px',
    height: '24px',
    alignItems: 'flex-end',
    marginTop: 'auto',
  }),

  demandIndicator: css({
    flex: 1,
    borderRadius: '3px',
    transformOrigin: 'bottom',
    '&:nth-child(1)': { height: '40%' },
    '&:nth-child(2)': { height: '60%' },
    '&:nth-child(3)': { height: '80%' },
    '&:nth-child(4)': { height: '100%' },
  }),

  demandMeta: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '6px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  }),

  demandMetaLabel: css({
    fontSize: '9px',
    color: '#878787',
  }),

  demandMetaValue: css({
    fontSize: '12px',
    fontWeight: 600,
    color: '#FFFFFF',
  }),

  parallaxWrapper: css({
    width: '100%',
    height: '100%',
  }),

  parallaxContainer: css({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  }),

  rowWrapper: css({
    width: '100%',
    paddingLeft: 0,
    paddingRight: 0,
    transformOrigin: 'top center',
  }),

  bottomSpacer: css({
    width: '100%',
    height: { base: '60px', md: '80px' },
    flexShrink: 0,
    pointerEvents: 'none',
  }),

  widget: css({
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(40px)',
    borderRadius: { base: '20px', md: '24px' },
    border: '1px solid rgba(255, 255, 255, 0.12)',
    padding: { base: '14px', md: '18px' },
    display: 'flex',
    flexDirection: 'column',
    gap: { base: '10px', md: '12px' },
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    minHeight: { base: '160px', md: 'auto' },
    pointerEvents: 'auto',
    transition: 'border-color 0.2s ease',
    '&:hover': {
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '1px',
      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
    },
  } as any),

  widgetHeader: css({
    display: 'flex',
    flexDirection: 'column',
    gap: { base: '4px', md: '6px' },
  }),

  headerTop: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    flexWrap: 'wrap',
  }),

  periodSelector: css({
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    padding: '3px',
  }),

  periodButton: css({
    padding: { base: '4px 8px', md: '5px 10px' },
    borderRadius: '6px',
    border: 'none',
    background: 'transparent',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: { base: '10px', md: '11px' },
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      color: 'rgba(255, 255, 255, 0.9)',
      background: 'rgba(255, 255, 255, 0.08)',
    },
  }),

  periodButtonActive: css({
    background: 'rgba(255, 255, 255, 0.15)!important',
    color: '#FFFFFF!important',
  }),

  widgetTitle: css({
    fontSize: { base: '12px', md: '13px', lg: '14px' },
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.9)',
    margin: 0,
    lineHeight: 1.2,
  }),

  widgetSubtitle: css({
    fontSize: { base: '10px', md: '11px', lg: '12px' },
    fontWeight: 500,
    letterSpacing: '0.03em',
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
  }),

  widgetContent: css({
    display: 'flex',
    flexDirection: 'column',
    gap: { base: '12px', md: '16px' },
    flex: 1,
    position: 'relative',
    overflow: 'visible',
  }),

  mainValue: css({
    fontSize: { base: '28px', md: '32px', lg: '36px' },
    color: '#FFFFFF',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    letterSpacing: '0.02em',
    lineHeight: 1,
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
  }),

  mainValueUnit: css({
    fontSize: { base: '14px', md: '16px' },
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.6)',
  }),

  // Prix au m² styles
  priceValueContainer: css({
    display: 'flex',
    alignItems: 'baseline',
    gap: { base: '4px', md: '6px' },
  }),

  priceValue: css({
    fontSize: { base: '26px', md: '30px', lg: '34px' },
    fontWeight: 700,
    color: '#FFFFFF',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    letterSpacing: '0.02em',
    lineHeight: 1,
  }),

  priceUnit: css({
    fontSize: { base: '12px', md: '14px' },
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.6)',
  }),

  // Prix au m² - Jauge de marché
  marketBadge: css({
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  }),

  priceMainRow: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: { base: '6px', md: '8px' },
    flexWrap: 'nowrap',
  }),

  priceValueLarge: css({
    fontSize: { base: '28px', md: '34px' },
    fontWeight: 700,
    color: '#FFFFFF',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    letterSpacing: '0.02em',
    lineHeight: 1,
    display: 'flex',
    alignItems: 'baseline',
    gap: { base: '3px', md: '6px' },
    flexShrink: 0,
  }),

  priceCurrency: css({
    fontSize: { base: '10px', md: '12px' },
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.5)',
  }),

  priceCompare: css({
    fontSize: { base: '10px', md: '12px' },
    fontWeight: 600,
    whiteSpace: 'nowrap',
    textAlign: 'right',
  }),

  priceGaugeContainer: css({
    display: 'flex',
    flexDirection: 'column',
    gap: { base: '4px', md: '6px' },
    width: '100%',
  }),

  priceGaugeTrack: css({
    position: 'relative',
    width: '100%',
    height: { base: '10px', md: '12px' },
    borderRadius: '6px',
    overflow: 'visible',
  }),

  priceGaugeGradient: css({
    position: 'absolute',
    inset: 0,
    borderRadius: '6px',
    background: 'rgba(255, 255, 255, 0.15)',
  }),

  priceGaugeMarker: css({
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 10,
  }),

  priceGaugePin: css({
    width: { base: '12px', md: '14px' },
    height: { base: '12px', md: '14px' },
    borderRadius: '50%',
    background: '#FFFFFF',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(255, 255, 255, 0.2)',
  }),

  priceGaugePulse: css({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { base: '18px', md: '22px' },
    height: { base: '18px', md: '22px' },
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.3)',
    animation: 'pulse 2s ease-in-out infinite',
  }),

  priceGaugeAvgLine: css({
    position: 'absolute',
    top: { base: '-3px', md: '-4px' },
    width: '2px',
    height: { base: '16px', md: '20px' },
    background: 'rgba(255, 255, 255, 0.6)',
    transform: 'translateX(-50%)',
    borderRadius: '1px',
  }),

  priceGaugeLabels: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: { base: '8px', md: '10px' },
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: 500,
  }),

  priceGaugeAvgLabel: css({
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 600,
    fontSize: { base: '8px', md: '10px' },
  }),

  priceMetrics: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: { base: '20px', md: '32px' },
    marginTop: 'auto',
    paddingTop: { base: '8px', md: '10px' },
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  }),

  priceMetric: css({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: { base: '6px', md: '8px' },
  }),

  priceMetricValue: css({
    fontSize: { base: '18px', md: '22px' },
    fontWeight: 700,
    color: '#FFFFFF',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    lineHeight: 1,
  }),

  priceMetricLabel: css({
    fontSize: { base: '10px', md: '11px' },
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: 500,
  }),

  priceMetricDivider: css({
    width: '1px',
    height: { base: '24px', md: '28px' },
    background: 'rgba(255, 255, 255, 0.15)',
  }),

  valueRow: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: { base: '8px', md: '12px' },
    flexWrap: 'wrap',
  }),

  variationBadge: css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: { base: '4px 10px', md: '6px 12px' },
    borderRadius: '999px',
    fontSize: { base: '12px', md: '14px' },
    fontWeight: 600,
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
  }),

  rechartsContainer: css({
    width: '100%',
    height: { base: '80px', md: '90px' },
    marginTop: 'auto',
    position: 'relative',
    pointerEvents: 'auto',
    '& .recharts-wrapper': {
      pointerEvents: 'auto!important',
    },
    '& .recharts-surface': {
      pointerEvents: 'auto!important',
    },
    '& .recharts-cartesian-axis-tick-value': {
      fill: 'rgba(255, 255, 255, 0.5)',
      fontSize: '10px',
    },
    '& .recharts-tooltip-cursor': {
      stroke: 'rgba(255, 255, 255, 0.2)',
    },
  }),

  chartTooltip: css({
    background: 'rgba(0, 0, 0, 0.95)',
    backdropFilter: 'blur(12px)',
    borderRadius: '10px',
    padding: '10px 14px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
  }),

  chartTooltipDate: css({
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: '4px',
    fontWeight: 500,
  }),

  chartTooltipValue: css({
    fontSize: { base: '13px', md: '15px' },
    color: '#FFFFFF',
    fontWeight: 700,
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
  }),

  valueChartContainer: css({
    width: '100%',
    height: { base: '70px', md: '75px' },
    position: 'relative',
    alignSelf: 'flex-end',
    marginTop: 'auto',
    overflow: 'visible',
  }),

  valueChart: css({
    width: '100%',
    height: { base: '50px', md: '55px' },
    display: 'block',
    cursor: 'crosshair',
    overflow: 'visible',
  }),

  valueChartDates: css({
    position: 'relative',
    width: '100%',
    height: '18px',
    marginTop: { base: '4px', md: '6px' },
    fontSize: { base: '10px', md: '11px' },
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: 500,
  }),

  valueChartDate: css({
    position: 'absolute',
    transform: 'translateX(-50%)',
    whiteSpace: 'nowrap',
  }),

  valueChartPointGroup: css({
    cursor: 'pointer',
    outline: 'none',
  }),

  valueChartPointHalo: css({
    fill: 'rgba(255, 255, 255, 0.25)',
    stroke: 'rgba(255, 255, 255, 0.5)',
    strokeWidth: '1px',
    opacity: 0,
    transition: 'opacity 0.15s ease',
    pointerEvents: 'none',
  }),

  valueChartPoint: css({
    fill: '#FFFFFF',
    stroke: 'rgba(0, 0, 0, 0.4)',
    strokeWidth: '1px',
    transition: 'opacity 0.15s ease',
    pointerEvents: 'auto',
  }),

  valueChartPointActive: css({
    fill: '#FFFFFF',
    stroke: 'rgba(255, 255, 255, 0.9)',
    strokeWidth: '1.5px',
    pointerEvents: 'none',
  }),

  valueTooltip: css({
    position: 'absolute',
    background: 'rgba(0, 0, 0, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: { base: '8px', md: '10px' },
    padding: { base: '8px 12px', md: '10px 14px' },
    border: '1px solid rgba(255, 255, 255, 0.3)',
    pointerEvents: 'none',
    zIndex: 10000,
    transform: 'translateX(-50%)',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
    minWidth: '120px',
  }),

  valueTooltipDate: css({
    fontSize: { base: '10px', md: '11px' },
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: { base: '2px', md: '4px' },
    fontWeight: 500,
  }),

  valueTooltipValue: css({
    fontSize: { base: '12px', md: '14px' },
    color: '#FFFFFF',
    fontWeight: 600,
    fontFamily: 'var(--font-bebas-neue), sans-serif',
  }),

  metricsRow: css({
    display: 'flex',
    flexDirection: 'column',
    gap: { base: '8px', md: '10px' },
  }),

  metric: css({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: { base: '8px', md: '10px' },
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  }),

  metricLabel: css({
    fontSize: { base: '11px', md: '12px' },
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.7)',
  }),

  metricValue: css({
    fontSize: { base: '13px', md: '14px' },
    fontWeight: 600,
    color: '#4ADE80',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
  }),

  probabilityContainer: css({
    display: 'flex',
    flexDirection: 'column',
    gap: { base: '12px', md: '16px' },
    alignItems: 'center',
  }),

  probabilityValue: css({
    fontSize: { base: '48px', md: '56px', lg: '64px' },
    fontWeight: 700,
    color: '#FFFFFF',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    letterSpacing: '0.02em',
    lineHeight: 1,
    background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(255, 255, 255, 0.8) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  } as any),

  probabilityBar: css({
    width: '100%',
    height: { base: '8px', md: '10px' },
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: { base: '4px', md: '5px' },
    overflow: 'hidden',
    position: 'relative',
  }),

  probabilityBarFill: css({
    height: '100%',
    background: 'linear-gradient(90deg, #4ADE80 0%, #22C55E 100%)',
    borderRadius: 'inherit',
    boxShadow: '0 0 12px rgba(74, 222, 128, 0.4)',
  }),

  reputationContainer: css({
    display: 'flex',
    flexDirection: 'column',
    gap: { base: '12px', md: '16px' },
    alignItems: 'center',
  }),

  reputationValue: css({
    fontSize: { base: '28px', md: '32px' },
    fontWeight: 700,
    color: '#FFFFFF',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    letterSpacing: '0.02em',
    lineHeight: 1,
  }),

  reputationStars: css({
    display: 'flex',
    gap: { base: '2px', md: '4px' },
    alignItems: 'center',
  }),

  star: css({
    width: { base: '16px', md: '20px' },
    height: { base: '16px', md: '20px' },
    color: '#FFFFFF',
  }),

  reputationTier: css({
    fontSize: { base: '11px', md: '12px' },
    fontWeight: 400,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 1.4,
    paddingTop: { base: '4px', md: '6px' },
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    width: '100%',
  }),

  volatilityContainer: css({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: { base: '4px', md: '6px' },
    height: { base: '80px', md: '100px' },
  }),

  volatilityDisplayValue: css({
    fontSize: { base: '32px', md: '40px', lg: '48px' },
    fontWeight: 700,
    color: '#FFFFFF',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    letterSpacing: '0.02em',
    lineHeight: 1,
    marginRight: { base: '8px', md: '12px' },
  }),

  volatilityScale: css({
    display: 'flex',
    gap: { base: '3px', md: '4px' },
    alignItems: 'flex-end',
    height: '100%',
  }),

  volatilityBar: css({
    width: { base: '6px', md: '8px' },
    background: 'linear-gradient(180deg, #FBBF24 0%, #F59E0B 100%)',
    borderRadius: { base: '3px', md: '4px' },
    transition: 'opacity 0.3s ease',
  }),

  heatScoreContainer: css({
    display: 'flex',
    flexDirection: 'column',
    gap: { base: '12px', md: '16px' },
    alignItems: 'center',
  }),

  heatScoreValue: css({
    fontSize: { base: '40px', md: '48px', lg: '56px' },
    fontWeight: 700,
    color: '#FFFFFF',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    letterSpacing: '0.02em',
    lineHeight: 1,
    background: 'linear-gradient(135deg, #F97316 0%, #EF4444 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  } as any),

  heatScoreInfo: css({
    display: 'flex',
    flexDirection: 'column',
    gap: { base: '6px', md: '8px' },
    alignItems: 'center',
    width: '100%',
    paddingTop: { base: '8px', md: '10px' },
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  }),

  heatScoreLabel: css({
    fontSize: { base: '11px', md: '12px' },
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  }),

  heatScoreDispersion: css({
    fontSize: { base: '18px', md: '20px' },
    fontWeight: 600,
    color: '#F97316',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
  }),

  // BarChart container
  barChartContainer: css({
    width: '100%',
    marginTop: 'auto',
    pointerEvents: 'auto',
    '& .recharts-wrapper': {
      pointerEvents: 'auto!important',
    },
  }),

  // Tier badge pour réputation
  tierBadge: css({
    padding: { base: '3px 8px', md: '4px 10px' },
    borderRadius: '8px',
    fontSize: { base: '10px', md: '11px' },
    fontWeight: 600,
    color: '#FFFFFF',
    background: 'rgba(255, 255, 255, 0.1)',
  }),

  // Probabilité d'appréciation - Cercle de progression
  appreciationContainer: css({
    display: 'flex',
    alignItems: 'center',
    gap: { base: '16px', md: '20px' },
    width: '100%',
    height: '100%',
  }),

  circleProgressWrapper: css({
    position: 'relative',
    width: { base: '100px', md: '120px' },
    height: { base: '100px', md: '120px' },
    flexShrink: 0,
  }),

  circleProgressSvg: css({
    width: '100%',
    height: '100%',
  }),

  circleProgressValue: css({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    alignItems: 'baseline',
    gap: '2px',
  }),

  appreciationPercentText: css({
    fontSize: { base: '32px', md: '40px' },
    fontWeight: 700,
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    lineHeight: 1,
    color: '#FFFFFF',
  }),

  appreciationPercentSign: css({
    fontSize: { base: '16px', md: '20px' },
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.6)',
  }),

  appreciationInfo: css({
    display: 'flex',
    flexDirection: 'column',
    gap: { base: '12px', md: '16px' },
    flex: 1,
  }),

  confidenceBadge: css({
    display: 'inline-flex',
    alignSelf: 'flex-start',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: { base: '12px', md: '13px' },
    fontWeight: 600,
    letterSpacing: '0.02em',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
  }),

  appreciationScale: css({
    display: 'flex',
    gap: '4px',
    width: '100%',
  }),

  scaleSegment: css({
    flex: 1,
    height: { base: '6px', md: '8px' },
    borderRadius: '4px',
    transition: 'background 0.3s ease',
  }),

  // Ancien styles conservés pour compatibilité
  radialGaugeContainer: css({
    position: 'relative',
    width: '100%',
    height: '120px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'auto',
  }),

  radialGaugeValue: css({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -30%)',
    fontSize: { base: '32px', md: '40px' },
    fontWeight: 700,
    color: '#22c55e',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
  }),

  probabilityLabels: css({
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.5)',
    paddingInline: '10px',
  }),

  // Réputation améliorée
  reputationHeader: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: { base: '8px', md: '10px' },
  }),

  reputationScore: css({
    display: 'flex',
    alignItems: 'baseline',
    gap: '2px',
  }),

  reputationMax: css({
    fontSize: { base: '14px', md: '16px' },
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: 500,
  }),

  reputationBars: css({
    display: 'flex',
    flexDirection: 'column',
    gap: { base: '6px', md: '8px' },
    width: '100%',
  }),

  criteriaRow: css({
    display: 'flex',
    alignItems: 'center',
    gap: { base: '6px', md: '8px' },
  }),

  criteriaLabel: css({
    fontSize: { base: '10px', md: '11px' },
    color: 'rgba(255, 255, 255, 0.7)',
    width: { base: '42px', md: '50px' },
    flexShrink: 0,
  }),

  criteriaBarBg: css({
    flex: 1,
    height: { base: '5px', md: '6px' },
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
    overflow: 'hidden',
  }),

  criteriaBarFill: css({
    height: '100%',
    background: '#FFFFFF',
    borderRadius: '3px',
  }),

  criteriaValue: css({
    fontSize: { base: '10px', md: '11px' },
    color: '#FFFFFF',
    fontWeight: 600,
    width: { base: '28px', md: '32px' },
    textAlign: 'right',
  }),

  // Gauge pour volatilité
  gaugeContainer: css({
    position: 'relative',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  }),

  gaugeSvg: css({
    width: '100%',
    maxWidth: '200px',
    height: 'auto',
    overflow: 'visible',
  }),

  gaugeValue: css({
    position: 'absolute',
    bottom: '10px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: { base: '28px', md: '32px' },
    fontWeight: 700,
    fontFamily: 'var(--font-bebas-neue), sans-serif',
  }),

  gaugeLabels: css({
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '180px',
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: '-10px',
  }),

  volatilityBadgeSimple: css({
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: 600,
  }),

  // Nouveau design Volatilité
  volatilityMain: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: { base: '8px', md: '12px' },
  }),

  volatilityScoreContainer: css({
    display: 'flex',
    alignItems: 'baseline',
    gap: '2px',
  }),

  volatilityScoreValue: css({
    fontSize: { base: '36px', md: '44px' },
    fontWeight: 700,
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    lineHeight: 1,
    color: '#FFFFFF',
  }),

  volatilityScoreMax: css({
    fontSize: { base: '16px', md: '18px' },
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: 500,
  }),

  volatilityLevelBadge: css({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: { base: '6px 10px', md: '8px 14px' },
    borderRadius: '10px',
    fontSize: { base: '12px', md: '13px' },
    fontWeight: 600,
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
  }),

  volatilityBarFill: css({
    height: '100%',
    background: '#FFFFFF',
    borderRadius: '6px',
  }),

  volatilityBarContainer: css({
    position: 'relative',
    width: '100%',
    height: { base: '10px', md: '12px' },
  }),

  volatilityBarTrack: css({
    width: '100%',
    height: '100%',
    borderRadius: '6px',
    overflow: 'hidden',
    background: 'rgba(255, 255, 255, 0.1)',
  }),

  volatilityBarIndicator: css({
    position: 'absolute',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: { base: '12px', md: '14px' },
    height: { base: '12px', md: '14px' },
    borderRadius: '50%',
    background: '#FFFFFF',
    boxShadow: '0 0 0 3px rgba(255, 255, 255, 0.2)',
  }),

  volatilityLevels: css({
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 'auto',
  }),

  volatilityLevelItem: css({
    display: 'flex',
    alignItems: 'center',
    gap: { base: '4px', md: '6px' },
    transition: 'opacity 0.3s ease',
  }),

  volatilityLevelDot: css({
    width: { base: '6px', md: '8px' },
    height: { base: '6px', md: '8px' },
    borderRadius: '50%',
  }),

  volatilityLevelLabel: css({
    fontSize: { base: '10px', md: '11px' },
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: 500,
  }),

  // Heat score / thermomètre
  heatGaugeContainer: css({
    display: 'flex',
    alignItems: 'center',
    gap: { base: '16px', md: '24px' },
    width: '100%',
  }),

  thermometer: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0',
  }),

  thermometerTrack: css({
    width: '20px',
    height: '80px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '10px 10px 0 0',
    overflow: 'hidden',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  }),

  thermometerFill: css({
    width: '100%',
    borderRadius: '8px 8px 0 0',
  }),

  thermometerBulb: css({
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    marginTop: '-6px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),

  thermometerPulse: css({
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
  }),

  heatDetails: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
  }),

  heatScoreMax: css({
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: 500,
    marginTop: '-8px',
  }),

  dispersionInfo: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    width: '100%',
  }),

  dispersionLabel: css({
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.6)',
  }),

  dispersionValue: css({
    fontSize: '18px',
    fontWeight: 600,
    color: '#F97316',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
  }),

  heatScale: css({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    marginTop: 'auto',
    paddingTop: '12px',
  }),

  heatScaleBar: css({
    flex: 1,
    height: '4px',
    borderRadius: '2px',
    background: 'linear-gradient(90deg, #3b82f6, #22c55e, #eab308, #ef4444)',
  }),

  heatBadge: css({
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: 600,
  }),

  // Nouveau design Heat Score - Radar concentrique
  heatRadarContainer: css({
    display: 'flex',
    alignItems: 'center',
    gap: { base: '12px', md: '16px' },
    width: '100%',
    overflow: 'hidden',
  }),

  heatRadar: css({
    position: 'relative',
    width: { base: '80px', md: '90px' },
    height: { base: '80px', md: '90px' },
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),

  heatRing: css({
    position: 'absolute',
    borderRadius: '50%',
    border: { base: '2px solid', md: '3px solid' },
    transition: 'all 0.3s ease',
  }),

  heatCenter: css({
    position: 'relative',
    width: { base: '24px', md: '28px' },
    height: { base: '24px', md: '28px' },
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    background: 'rgba(255, 255, 255, 0.15)',
  }),

  heatCenterIcon: css({
    fontSize: { base: '14px', md: '16px' },
  }),

  heatPulse: css({
    position: 'absolute',
    width: { base: '28px', md: '32px' },
    height: { base: '28px', md: '32px' },
    borderRadius: '50%',
    zIndex: 4,
  }),

  heatInfo: css({
    display: 'flex',
    flexDirection: 'column',
    gap: { base: '4px', md: '6px' },
    flex: 1,
    minWidth: 0,
  }),

  heatScoreDisplay: css({
    display: 'flex',
    alignItems: 'baseline',
    gap: '2px',
  }),

  heatScoreNum: css({
    fontSize: { base: '28px', md: '34px' },
    fontWeight: 700,
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    lineHeight: 1,
    color: '#FFFFFF',
  }),

  heatScoreOf: css({
    fontSize: { base: '12px', md: '14px' },
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: 500,
  }),

  heatLabelBadge: css({
    display: 'inline-flex',
    alignSelf: 'flex-start',
    padding: { base: '3px 8px', md: '4px 10px' },
    borderRadius: '6px',
    fontSize: { base: '10px', md: '11px' },
    fontWeight: 600,
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
  }),

  heatDemandText: css({
    fontSize: { base: '9px', md: '10px' },
    color: 'rgba(255, 255, 255, 0.6)',
  }),

  heatMetricsRow: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: { base: '16px', md: '24px' },
    marginTop: 'auto',
    paddingTop: { base: '6px', md: '8px' },
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  }),

  heatMetric: css({
    display: 'flex',
    alignItems: 'center',
    gap: { base: '4px', md: '6px' },
  }),

  heatMetricLabel: css({
    fontSize: { base: '9px', md: '10px' },
    color: 'rgba(255, 255, 255, 0.5)',
  }),

  heatMetricValue: css({
    fontSize: { base: '14px', md: '16px' },
    fontWeight: 700,
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    color: '#FFFFFF',
  }),

  heatMetricDivider: css({
    width: '1px',
    height: { base: '18px', md: '22px' },
    background: 'rgba(255, 255, 255, 0.15)',
  }),
} as const;

