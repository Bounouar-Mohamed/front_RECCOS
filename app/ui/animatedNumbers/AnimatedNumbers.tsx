import NumberFlow from '@number-flow/react';
import { css } from '@/styled-system/css';
import React, { useEffect, useMemo, useState } from 'react';

const COUNTDOWN_TARGET = new Date('2025-12-01T18:00:00Z');

const animatedNumbersStyles = {
  wrapper: css({
    width: '100%',
    maxW: { base: '260px', md: '300px' },
    marginX: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    color: '#f4f2ef',
    background: 'transparent',
  }),
  label: css({
    textTransform: 'uppercase',
    letterSpacing: '0.25em',
    fontSize: '0.65rem',
    color: 'rgba(244, 242, 239, 0.6)',
  }),
  timerGrid: css({
    display: 'grid',
    gridAutoFlow: 'column',
    gridTemplateRows: 'auto auto',
    columnGap: { base: 1, md: 2 },
    rowGap: { base: 0.25, md: 0.5 },
    alignItems: 'center',
    justifyContent: 'center',
  }),
  valueCell: css({
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    fontSize: { base: '2.6rem', md: '3rem' },
    letterSpacing: '0.12em',
    minWidth: { base: '48px', md: '60px' },
    textAlign: 'center',
  }),
  labelCell: css({
    textTransform: 'uppercase',
    letterSpacing: '0.28em',
    fontSize: '0.55rem',
    color: 'rgba(244, 242, 239, 0.7)',
    textAlign: 'center',
  }),
  separatorCell: css({
    alignSelf: 'center',
    fontSize: { base: '2.3rem', md: '2.6rem' },
    color: 'rgba(244, 242, 239, 0.4)',
    fontFamily: 'var(--font-bebas-neue), sans-serif',
    lineHeight: 1,
  }),
  separatorPlaceholder: css({
    minWidth: { base: '10px', md: '14px' },
  }),
};

type CountdownLabels = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

const defaultLabels: CountdownLabels = {
  days: 'Days',
  hours: 'Hours',
  minutes: 'Minutes',
  seconds: 'Seconds',
};

const getTimeParts = (target: Date) => {
  const now = new Date();
  const totalMs = Math.max(target.getTime() - now.getTime(), 0);

  const totalSeconds = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
};

interface AnimatedNumbersProps {
  targetDate?: Date;
  labels?: Partial<CountdownLabels>;
  legend?: string;
}

export const AnimatedNumbersShowcase = ({
  targetDate = COUNTDOWN_TARGET,
  labels,
  legend = 'next launch',
}: AnimatedNumbersProps) => {
  const mergedLabels = useMemo(() => ({ ...defaultLabels, ...labels }), [labels]);
  const [timeParts, setTimeParts] = useState(() => getTimeParts(targetDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeParts(getTimeParts(targetDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const units: Array<{ key: keyof typeof timeParts; label: string }> = [
    { key: 'days', label: mergedLabels.days },
    { key: 'hours', label: mergedLabels.hours },
    { key: 'minutes', label: mergedLabels.minutes },
    { key: 'seconds', label: mergedLabels.seconds },
  ];

  const layout = units.flatMap((unit, index) => {
    const cells: Array<{ type: 'value' | 'separator'; unit?: typeof unit; key: string }> = [
      { type: 'value', unit, key: `${unit.key}` },
    ];
    if (index < units.length - 1) {
      cells.push({ type: 'separator', key: `sep-${index}` });
    }
    return cells;
  });

  return (
    <div className={animatedNumbersStyles.wrapper}>
      <span className={animatedNumbersStyles.label}>{legend}</span>
      <div className={animatedNumbersStyles.timerGrid}>
        {layout.map((cell) =>
          cell.type === 'value' && cell.unit ? (
            <React.Fragment key={cell.key}>
              <span className={animatedNumbersStyles.valueCell}>
                <NumberFlow value={timeParts[cell.unit.key]} />
              </span>
              <span className={animatedNumbersStyles.labelCell}>{cell.unit.label}</span>
            </React.Fragment>
          ) : (
            <React.Fragment key={cell.key}>
              <span className={animatedNumbersStyles.separatorCell}>:</span>
              <span className={animatedNumbersStyles.separatorPlaceholder} />
            </React.Fragment>
          ),
        )}
      </div>
    </div>
  );
};


