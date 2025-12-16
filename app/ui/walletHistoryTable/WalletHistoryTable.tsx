import React from 'react';
import { useTranslations } from 'next-intl';
import { walletHistoryTableStyles } from './walletHistoryTable.styles';

export type WalletHistoryRow = {
  id: string;
  name: string;
  type: string;
  status: string;
  date: string;
};

const SortIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="17"
    height="12"
    fill="none"
    viewBox="0 0 17 12"
    {...props}
  >
    <g fill="#838383">
      <rect
        width="4"
        height="1"
        rx=".5"
        transform="rotate(135 2.95 1.93)skewX(-.001)"
      />
      <rect
        width="4"
        height="1"
        rx=".5"
        transform="rotate(45 2.236 7.131)skewX(.001)"
      />
      <path d="M5.658 1.543a.5.5 0 0 1 .5.5v8.81a.5.5 0 1 1-1 0v-8.81a.5.5 0 0 1 .5-.5" />
      <rect
        width="4"
        height="1"
        rx=".5"
        transform="rotate(-45 17.794 -6.689)skewX(-.001)"
      />
      <rect
        width="4"
        height="1"
        rx=".5"
        transform="rotate(-135 7.668 3.46)skewX(.001)"
      />
      <path d="M10.69 10.315a.5.5 0 0 1-.5-.5V1a.5.5 0 1 1 1 0v8.815a.5.5 0 0 1-.5.5" />
    </g>
  </svg>
);

interface WalletHistoryTableProps {
  rows: WalletHistoryRow[];
  emptyLabel?: string;
}

export const WalletHistoryTable: React.FC<WalletHistoryTableProps> = ({
  rows,
  emptyLabel,
}) => {
  const t = useTranslations('wallet');

  const [sort, setSort] = React.useState<{
    by: 'name' | 'status' | 'date';
    direction: 'asc' | 'desc';
  }>({
    by: 'date',
    direction: 'desc',
  });

  const handleSortClick = (column: 'name' | 'status' | 'date') => {
    setSort((current) => {
      if (current.by === column) {
        return {
          by: column,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        };
      }

      return {
        by: column,
        direction: column === 'date' ? 'desc' : 'asc',
      };
    });
  };

  const sortedRows = React.useMemo(() => {
    const copy = [...rows];

    const parseDisplayDate = (value: string): number => {
      // Format attendu : "15 Jan 2025 · 10:24"
      const [datePartRaw, timePartRaw] = value.split('·').map((p) => p.trim());
      if (!datePartRaw) return 0;

      const [dayStr, monthStr, yearStr] = datePartRaw.split(' ');
      const [hourStr, minuteStr] = (timePartRaw ?? '00:00').split(':');

      const monthIndexMap: Record<string, number> = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11,
      };

      const monthIndex =
        monthIndexMap[monthStr as keyof typeof monthIndexMap] ?? 0;

      const year = Number(yearStr);
      const month = monthIndex;
      const day = Number(dayStr);
      const hour = Number(hourStr);
      const minute = Number(minuteStr);

      const timestamp = new Date(year, month, day, hour, minute).getTime();
      return Number.isNaN(timestamp) ? 0 : timestamp;
    };

    copy.sort((a, b) => {
      const factor = sort.direction === 'asc' ? 1 : -1;

      if (sort.by === 'date') {
        const da = parseDisplayDate(a.date);
        const db = parseDisplayDate(b.date);
        return (da - db) * factor;
      }

      const av = sort.by === 'name' ? a.name : a.status;
      const bv = sort.by === 'name' ? b.name : b.status;

      return av.localeCompare(bv) * factor;
    });

    return copy;
  }, [rows, sort.by, sort.direction]);

  return (
    <div className={walletHistoryTableStyles.container}>
      <div className={walletHistoryTableStyles.headerRow}>
        <div className={walletHistoryTableStyles.headerCell}>
          <button
            type="button"
            className={walletHistoryTableStyles.sortButton}
            onClick={() => handleSortClick('name')}
          >
            <span>{t('history.columns.name')}</span>
            <SortIcon />
          </button>
        </div>
        <div className={walletHistoryTableStyles.headerCell}>
          {t('history.columns.type')}
        </div>
        <div className={walletHistoryTableStyles.headerCell}>
          <button
            type="button"
            className={walletHistoryTableStyles.sortButton}
            onClick={() => handleSortClick('status')}
          >
            <span>{t('history.columns.status')}</span>
            <SortIcon />
          </button>
        </div>
        <div className={walletHistoryTableStyles.headerCell}>
          <button
            type="button"
            className={walletHistoryTableStyles.sortButton}
            onClick={() => handleSortClick('date')}
          >
            <span>{t('history.columns.date')}</span>
            <SortIcon />
          </button>
        </div>
      </div>

      <div
        className={walletHistoryTableStyles.body}
        data-lenis-prevent
        data-lenis-prevent-wheel
        data-lenis-prevent-touch
      >
        {rows.length === 0 ? (
          <div className={walletHistoryTableStyles.empty}>
            {emptyLabel ?? t('history.empty')}
          </div>
        ) : (
          sortedRows.map((row) => (
            <div key={row.id} className={walletHistoryTableStyles.row}>
              <div className={walletHistoryTableStyles.cell}>{row.name}</div>
              <div className={walletHistoryTableStyles.cell}>{row.type}</div>
              <div className={walletHistoryTableStyles.statusCell}>
                <span
                  className={
                    row.status === 'Completed'
                      ? walletHistoryTableStyles.statusDotCompleted
                      : walletHistoryTableStyles.statusDotPending
                  }
                />
                <span>{row.status}</span>
              </div>
              <div className={walletHistoryTableStyles.cell}>{row.date}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};


