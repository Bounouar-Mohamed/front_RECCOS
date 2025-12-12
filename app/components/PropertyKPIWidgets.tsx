'use client';

import { motion } from 'framer-motion';
import { useState, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { propertyKPIWidgetsStyles } from './propertyKPIWidgets.styles';

interface KPIWidgetData {
  id: string;
  type: 'totalValue' | 'currentValue' | 'appreciation' | 'reputation' | 'volatility' | 'heatScore';
  totalValue?: number;
  currentValue?: number;
  pricePerSqft?: number;
  last12Months?: number;
  rolling6MonthAverage?: number;
  futureAppreciationProbability?: number;
  developerReputation?: number;
  developerReputationTier?: number;
  volatilityIndex?: number;
  marketHeatScore?: number;
  priceDispersion?: number;
}

interface PropertyKPIWidgetsProps {
  totalValue?: number;
  currentValue?: number;
  pricePerSqft?: number;
  last12Months?: number;
  rolling6MonthAverage?: number;
  futureAppreciationProbability?: number;
  developerReputation?: number;
  developerReputationTier?: number;
  volatilityIndex?: number;
  marketHeatScore?: number;
  priceDispersion?: number;
}

// Types de période disponibles
type PeriodType = '1M' | '3M' | '6M' | '12M';

// Données historiques complètes (12 mois)
const fullHistoricalData = [
  { date: 'Jan', fullDate: 'Janvier', value: 7200000 },
  { date: 'Fév', fullDate: 'Février', value: 7350000 },
  { date: 'Mar', fullDate: 'Mars', value: 7500000 },
  { date: 'Avr', fullDate: 'Avril', value: 7650000 },
  { date: 'Mai', fullDate: 'Mai', value: 7800000 },
  { date: 'Juin', fullDate: 'Juin', value: 7950000 },
  { date: 'Juil', fullDate: 'Juillet', value: 8100000 },
  { date: 'Août', fullDate: 'Août', value: 8250000 },
  { date: 'Sep', fullDate: 'Septembre', value: 8350000 },
  { date: 'Oct', fullDate: 'Octobre', value: 8400000 },
  { date: 'Nov', fullDate: 'Novembre', value: 8450000 },
  { date: 'Déc', fullDate: 'Décembre', value: 8500000 },
];

// Générer des données journalières pour le dernier mois
const generateDailyData = (endValue: number) => {
  const today = new Date();
  const days = 30;
  const startValue = endValue * 0.985; // ~1.5% variation sur le mois
  const dailyGrowth = (endValue - startValue) / days;
  
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (days - 1 - i));
    const dayNum = date.getDate();
    const variation = (Math.random() - 0.5) * 20000; // Légère variation aléatoire
    
    return {
      date: `${dayNum}`,
      fullDate: date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }),
      value: Math.round(startValue + (dailyGrowth * i) + variation),
    };
  });
};

// Clés pour les critères de réputation
const reputationCriteriaKeys = ['quality', 'deadlines', 'service', 'price'] as const;
const reputationCriteriaValues = [92, 88, 95, 85];

// Tooltip personnalisé pour Recharts
function CustomChartTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const formatter = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return (
      <div className={propertyKPIWidgetsStyles.chartTooltip}>
        <p className={propertyKPIWidgetsStyles.chartTooltipDate}>{data.fullDate}</p>
        <p className={propertyKPIWidgetsStyles.chartTooltipValue}>{formatter.format(data.value)}</p>
      </div>
    );
  }
  return null;
}

// Point personnalisé pour le dernier point
function CustomDot(props: any) {
  const { cx, cy, index, dataLength, isPositive } = props;
  const isLast = index === dataLength - 1;
  
  if (!isLast) return null;
  
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={10}
        fill={isPositive ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}
      />
      <circle
        cx={cx}
        cy={cy}
        r={5}
        fill={isPositive ? '#22c55e' : '#ef4444'}
        stroke="#fff"
        strokeWidth={2}
      />
    </g>
  );
}

// Composant pour rendre un widget individuel
function KPIWidget({ widget }: { widget: KPIWidgetData }) {
  const t = useTranslations('kpis');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('12M');

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'AED',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }),
    []
  );

  // Filtrer les données selon la période sélectionnée
  const getFilteredData = useCallback((period: PeriodType, totalValue?: number) => {
    const currentValue = totalValue || 8500000;
    
    if (period === '1M') {
      // Données journalières pour le dernier mois
      const dailyData = generateDailyData(currentValue);
      // S'assurer que la dernière valeur est la valeur actuelle
      dailyData[dailyData.length - 1].value = currentValue;
      return dailyData;
    }
    
    const data = fullHistoricalData.map((item, index) => ({
      ...item,
      value: index === fullHistoricalData.length - 1 ? currentValue : item.value,
    }));
    
    switch (period) {
      case '3M':
        return data.slice(-3);
      case '6M':
        return data.slice(-6);
      case '12M':
      default:
        return data;
    }
  }, []);

  const chartData = useMemo(
    () => getFilteredData(selectedPeriod, widget.totalValue),
    [selectedPeriod, getFilteredData, widget.totalValue]
  );
  
  // Calcul de la variation
  const variation = useMemo(() => {
    if (chartData.length < 2) return { value: 0, isPositive: true };
    const startVal = chartData[0].value;
    const endVal = chartData[chartData.length - 1].value;
    const change = ((endVal - startVal) / startVal) * 100;
    return { value: Math.abs(change), isPositive: change >= 0 };
  }, [chartData]);

  const periods: PeriodType[] = ['1M', '3M', '6M', '12M'];

  return (
    <div className={propertyKPIWidgetsStyles.widget}>
      {widget.type === 'totalValue' && (
        <div className={propertyKPIWidgetsStyles.bentoLargeWrapper}>
          {/* Filtre en haut à droite */}
          <div className={propertyKPIWidgetsStyles.periodSelectorTopRight}>
            {periods.map((period) => (
              <button
                key={period}
                type="button"
                className={`${propertyKPIWidgetsStyles.periodButton} ${
                  selectedPeriod === period ? propertyKPIWidgetsStyles.periodButtonActive : ''
                }`}
                onClick={() => setSelectedPeriod(period)}
              >
                {period}
              </button>
            ))}
          </div>
          
          <div className={propertyKPIWidgetsStyles.bentoLargeLayout}>
            <div className={propertyKPIWidgetsStyles.bentoLargeLeft}>
              <h3 className={propertyKPIWidgetsStyles.widgetTitle}>{t('currentValue')}</h3>
              <div className={propertyKPIWidgetsStyles.bentoLargeValue}>
                {currencyFormatter.format(widget.totalValue || 8500000)}
              </div>
              <div className={propertyKPIWidgetsStyles.bentoLargeStats}>
                <div className={propertyKPIWidgetsStyles.bentoStat}>
                  <span className={propertyKPIWidgetsStyles.bentoStatValue}>
                    {variation.isPositive ? '+' : ''}{variation.value.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            <div className={propertyKPIWidgetsStyles.bentoLargeRight}>
              <div className={propertyKPIWidgetsStyles.bentoChartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="valueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#878787', fontSize: 9 }}
                      interval="preserveStartEnd"
                      tickMargin={6}
                    />
                    <YAxis hide domain={['dataMin - 50000', 'dataMax + 50000']} />
                    <Tooltip content={<CustomChartTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.15)' }} />
                    <Area type="monotone" dataKey="value" stroke="#FFFFFF" strokeWidth={1.5} fill="url(#valueGradient)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {widget.type === 'currentValue' && (() => {
        const currentPrice = widget.pricePerSqft || 1200;
        const marketMin = 850;
        const marketMax = 1800;
        const marketAvg = 1250;
        const positionPercent = Math.min(Math.max(((currentPrice - marketMin) / (marketMax - marketMin)) * 100, 5), 95);
        const avgPercent = ((marketAvg - marketMin) / (marketMax - marketMin)) * 100;
        const isAboveAvg = currentPrice >= marketAvg;

        return (
          <div className={propertyKPIWidgetsStyles.priceWidgetLayout}>
            <div className={propertyKPIWidgetsStyles.priceWidgetHeader}>
              <h3 className={propertyKPIWidgetsStyles.widgetTitle}>{t('pricePerSqm')}</h3>
              <span className={propertyKPIWidgetsStyles.priceWidgetBadge} style={{ 
                background: isAboveAvg ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.1)',
                color: isAboveAvg ? '#22c55e' : '#878787'
              }}>
                {isAboveAvg ? t('premium') : t('market')}
              </span>
            </div>
            
            <div className={propertyKPIWidgetsStyles.priceWidgetValue}>
              {currentPrice.toLocaleString('fr-FR')}
              <span className={propertyKPIWidgetsStyles.priceWidgetCurrency}>{t('currency')}</span>
            </div>

            <div className={propertyKPIWidgetsStyles.priceGaugeWrapper}>
              <div className={propertyKPIWidgetsStyles.priceGaugeBg}>
                <div className={propertyKPIWidgetsStyles.priceGaugeGradientBar} />
                <motion.div 
                  className={propertyKPIWidgetsStyles.priceGaugeIndicator}
                  initial={{ left: '0%' }}
                  animate={{ left: `${positionPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
                <div 
                  className={propertyKPIWidgetsStyles.priceGaugeAvgMark}
                  style={{ left: `${avgPercent}%` }}
                />
              </div>
              <div className={propertyKPIWidgetsStyles.priceGaugeScale}>
                <span>{marketMin}</span>
                <span style={{ position: 'absolute', left: `${avgPercent}%`, transform: 'translateX(-50%)' }}>{t('avg')}</span>
                <span>{marketMax}</span>
              </div>
            </div>

            <div className={propertyKPIWidgetsStyles.priceWidgetStats}>
              <div className={propertyKPIWidgetsStyles.priceWidgetStat}>
                <span className={propertyKPIWidgetsStyles.priceWidgetStatVal}>+{widget.last12Months || 8.5}%</span>
                <span className={propertyKPIWidgetsStyles.priceWidgetStatLbl}>{t('months12')}</span>
              </div>
              <div className={propertyKPIWidgetsStyles.priceWidgetStatDivider} />
              <div className={propertyKPIWidgetsStyles.priceWidgetStat}>
                <span className={propertyKPIWidgetsStyles.priceWidgetStatVal}>+{widget.rolling6MonthAverage || 7.2}%</span>
                <span className={propertyKPIWidgetsStyles.priceWidgetStatLbl}>{t('months6')}</span>
              </div>
            </div>
          </div>
        );
      })()}

      {widget.type === 'appreciation' && (() => {
        const probability = widget.futureAppreciationProbability || 85;
        const getConfidence = (p: number) => {
          if (p >= 80) return { key: 'veryHigh', color: '#22c55e' };
          if (p >= 60) return { key: 'high', color: '#84cc16' };
          if (p >= 40) return { key: 'moderate', color: '#f59e0b' };
          return { key: 'low', color: '#ef4444' };
        };
        const confidence = getConfidence(probability);

        return (
          <div className={propertyKPIWidgetsStyles.appreciationLayout}>
            <div className={propertyKPIWidgetsStyles.appreciationHeader}>
              <h3 className={propertyKPIWidgetsStyles.widgetTitle}>{t('appreciation')}</h3>
              <span 
                className={propertyKPIWidgetsStyles.appreciationBadge}
                style={{ background: `${confidence.color}20`, color: confidence.color }}
              >
                {t(`confidence.${confidence.key}`)}
              </span>
            </div>
            
            <div className={propertyKPIWidgetsStyles.appreciationMain}>
              <motion.span 
                className={propertyKPIWidgetsStyles.appreciationValue}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                {probability}
              </motion.span>
              <span className={propertyKPIWidgetsStyles.appreciationPercent}>%</span>
              <span className={propertyKPIWidgetsStyles.appreciationTrend}>↑</span>
            </div>

            <div className={propertyKPIWidgetsStyles.appreciationBarWrapper}>
              <div className={propertyKPIWidgetsStyles.appreciationBarBg}>
                <motion.div 
                  className={propertyKPIWidgetsStyles.appreciationBarFill}
                  style={{ background: confidence.color }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${probability}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <div className={propertyKPIWidgetsStyles.appreciationBarScale}>
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <span className={propertyKPIWidgetsStyles.appreciationSubtext}>{t('forecast12m')}</span>
          </div>
        );
      })()}

      {widget.type === 'reputation' && (() => {
        const reputation = widget.developerReputation || 4.5;
        const tier = widget.developerReputationTier || 4;
        const avgScore = Math.round(reputationCriteriaValues.reduce((a, b) => a + b, 0) / reputationCriteriaValues.length);
        return (
          <div className={propertyKPIWidgetsStyles.bentoTallLayout}>
            <div className={propertyKPIWidgetsStyles.bentoTallHeader}>
              <h3 className={propertyKPIWidgetsStyles.widgetTitle}>{t('reputation')}</h3>
              <div className={propertyKPIWidgetsStyles.tierBadge}>{t('tier', { tier })}</div>
            </div>
            
            <div className={propertyKPIWidgetsStyles.bentoTallScore}>
              <span className={propertyKPIWidgetsStyles.bentoTallScoreValue}>{reputation.toFixed(1)}</span>
              <span className={propertyKPIWidgetsStyles.bentoTallScoreMax}>/5</span>
            </div>
            
            <div className={propertyKPIWidgetsStyles.reputationStars}>
              {Array.from({ length: 5 }).map((_, index) => (
                <motion.svg
                  key={index}
                  className={propertyKPIWidgetsStyles.star}
                  viewBox="0 0 24 24"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <path 
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    fill={index < Math.floor(reputation) ? '#FFFFFF' : 'rgba(255, 255, 255, 0.15)'}
                  />
                </motion.svg>
              ))}
            </div>
            
            <div className={propertyKPIWidgetsStyles.bentoTallDivider} />
            
            <div className={propertyKPIWidgetsStyles.reputationBars}>
              {reputationCriteriaKeys.map((key, index) => (
                <div key={key} className={propertyKPIWidgetsStyles.criteriaRow}>
                  <span className={propertyKPIWidgetsStyles.criteriaLabel}>{t(`criteria.${key}`)}</span>
                  <div className={propertyKPIWidgetsStyles.criteriaBarBg}>
                    <motion.div 
                      className={propertyKPIWidgetsStyles.criteriaBarFill}
                      initial={{ width: 0 }}
                      animate={{ width: `${reputationCriteriaValues[index]}%` }}
                      transition={{ duration: 0.6, delay: 0.1 + index * 0.08 }}
                    />
                  </div>
                  <span className={propertyKPIWidgetsStyles.criteriaValue}>{reputationCriteriaValues[index]}%</span>
                </div>
              ))}
            </div>
            
            <div className={propertyKPIWidgetsStyles.bentoTallFooter}>
              <span className={propertyKPIWidgetsStyles.bentoTallFooterLabel}>{t('avgScore')}</span>
              <span className={propertyKPIWidgetsStyles.bentoTallFooterValue}>{avgScore}%</span>
            </div>
          </div>
        );
      })()}

      {widget.type === 'volatility' && (() => {
        const volatility = widget.volatilityIndex || 3.2;
        const zones = [
          { max: 3, key: 'low', color: '#22c55e' },
          { max: 6, key: 'moderate', color: '#f59e0b' },
          { max: 10, key: 'high', color: '#ef4444' },
        ];
        const currentZone = zones.find(z => volatility <= z.max) || zones[2];
        const needleRotation = (volatility / 10) * 180 - 90;

        return (
          <div className={propertyKPIWidgetsStyles.volatilityLayout}>
            <div className={propertyKPIWidgetsStyles.volatilityHeader}>
              <h3 className={propertyKPIWidgetsStyles.widgetTitle}>{t('volatility')}</h3>
              <span 
                className={propertyKPIWidgetsStyles.volatilityBadge}
                style={{ background: `${currentZone.color}20`, color: currentZone.color }}
              >
               {t(`volatilityLevels.${currentZone.key}`)}
              </span>
            </div>

            <div className={propertyKPIWidgetsStyles.volatilityGauge}>
              <svg viewBox="0 0 120 70" className={propertyKPIWidgetsStyles.volatilityGaugeSvg}>
                <path d="M 10 60 A 50 50 0 0 1 43 17" fill="none" stroke="#22c55e" strokeWidth="8" strokeLinecap="round" />
                <path d="M 45 16 A 50 50 0 0 1 75 16" fill="none" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" />
                <path d="M 77 17 A 50 50 0 0 1 110 60" fill="none" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" />
                
                <motion.g
                  initial={{ rotate: -90 }}
                  animate={{ rotate: needleRotation }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{ transformOrigin: '60px 60px' }}
                >
                  <line x1="60" y1="60" x2="60" y2="20" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="60" cy="60" r="6" fill="#FFFFFF" />
                </motion.g>
              </svg>
              
              <div className={propertyKPIWidgetsStyles.volatilityValue}>
                <span className={propertyKPIWidgetsStyles.volatilityValueNum}>{volatility.toFixed(1)}</span>
                <span className={propertyKPIWidgetsStyles.volatilityValueMax}>/10</span>
              </div>
            </div>

            <div className={propertyKPIWidgetsStyles.volatilityZones}>
              {zones.map((zone) => (
                <div 
                  key={zone.key} 
                  className={propertyKPIWidgetsStyles.volatilityZone}
                  style={{ opacity: currentZone.key === zone.key ? 1 : 0.4 }}
                >
                  <span className={propertyKPIWidgetsStyles.volatilityZoneDot} style={{ background: zone.color }} />
                  <span className={propertyKPIWidgetsStyles.volatilityZoneLabel}>{t(`volatilityLevels.${zone.key}`)}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {widget.type === 'heatScore' && (() => {
        const score = widget.marketHeatScore || 7.8;
        const dispersion = widget.priceDispersion || 12.5;
        const levels = [
          { max: 3, key: 'low', color: '#878787' },
          { max: 5, key: 'moderate', color: '#f59e0b' },
          { max: 7.5, key: 'high', color: '#22c55e' },
          { max: 10, key: 'veryHigh', color: '#10b981' },
        ];
        const currentLevel = levels.find(l => score <= l.max) || levels[3];

        return (
          <div className={propertyKPIWidgetsStyles.demandLayout}>
            <div className={propertyKPIWidgetsStyles.demandHeader}>
              <h3 className={propertyKPIWidgetsStyles.widgetTitle}>{t('demand')}</h3>
              <span 
                className={propertyKPIWidgetsStyles.demandBadge}
                style={{ background: `${currentLevel.color}20`, color: currentLevel.color }}
              >
                 {t(`demandLevels.${currentLevel.key}`)}
              </span>
            </div>

            <div className={propertyKPIWidgetsStyles.demandMain}>
              <div className={propertyKPIWidgetsStyles.demandScore}>
                <motion.span 
                  className={propertyKPIWidgetsStyles.demandScoreNum}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {score.toFixed(1)}
                </motion.span>
                <span className={propertyKPIWidgetsStyles.demandScoreMax}>/10</span>
              </div>
              <span className={propertyKPIWidgetsStyles.demandDesc}>{t(`demandLevels.${currentLevel.key}Desc`)}</span>
            </div>

            <div className={propertyKPIWidgetsStyles.demandIndicators}>
              {levels.map((level, i) => (
                <motion.div
                  key={level.key}
                  className={propertyKPIWidgetsStyles.demandIndicator}
                  style={{ 
                    background: score > (i === 0 ? 0 : levels[i-1].max) ? level.color : 'rgba(255,255,255,0.1)',
                  }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                />
              ))}
            </div>

            <div className={propertyKPIWidgetsStyles.demandMeta}>
              <span className={propertyKPIWidgetsStyles.demandMetaLabel}>{t('priceDispersion')}</span>
              <span className={propertyKPIWidgetsStyles.demandMetaValue}>{dispersion}%</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default function PropertyKPIWidgets({
  totalValue = 8500000,
  currentValue = 850000,
  pricePerSqft = 1200,
  last12Months = 8.5,
  rolling6MonthAverage = 7.2,
  futureAppreciationProbability = 85,
  developerReputation = 4.5,
  developerReputationTier = 4,
  volatilityIndex = 3.2,
  marketHeatScore = 7.8,
  priceDispersion = 12.5,
}: PropertyKPIWidgetsProps) {
  // Widgets avec leurs données et tailles Bento
  const widgetsData: KPIWidgetData[] = [
    { id: 'totalValue', type: 'totalValue', totalValue },
    { id: 'currentValue', type: 'currentValue', pricePerSqft, last12Months, rolling6MonthAverage },
    { id: 'appreciation', type: 'appreciation', futureAppreciationProbability },
    { id: 'reputation', type: 'reputation', developerReputation, developerReputationTier },
    { id: 'volatility', type: 'volatility', volatilityIndex },
    { id: 'heatScore', type: 'heatScore', marketHeatScore, priceDispersion },
  ];

  // Définir les classes Bento pour chaque widget
  const getBentoClass = (type: string) => {
    switch (type) {
      case 'totalValue': return propertyKPIWidgetsStyles.bentoLarge;
      case 'reputation': return propertyKPIWidgetsStyles.bentoTall;
      default: return propertyKPIWidgetsStyles.bentoNormal;
    }
  };

  return (
    <div 
      className={propertyKPIWidgetsStyles.container}
      data-lenis-prevent
      data-lenis-prevent-wheel
      data-lenis-prevent-touch
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div className={propertyKPIWidgetsStyles.bentoGrid}>
        {widgetsData.map((widget, index) => (
          <motion.div
            key={widget.id}
            className={`${propertyKPIWidgetsStyles.bentoItem} ${getBentoClass(widget.type)}`}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, margin: '-30px' }}
            transition={{ 
              duration: 0.4, 
              delay: index * 0.08,
              ease: [0.25, 0.1, 0.25, 1]
            }}
            whileHover={{ 
              scale: 1.015, 
              transition: { duration: 0.2 } 
            }}
          >
            <KPIWidget widget={widget} />
          </motion.div>
        ))}
      </div>
      <div className={propertyKPIWidgetsStyles.bottomSpacer} aria-hidden="true" />
    </div>
  );
}
