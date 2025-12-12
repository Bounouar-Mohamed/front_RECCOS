import { cn } from '@/lib/utils';
import { investorBadgeStyles } from './investorBadge.styles';

export interface InvestorBadgeProps {
  count?: number;
  singularLabel?: string;
  pluralLabel?: string;
  maxAvatars?: number;
  className?: string;
  showAvatars?: boolean;
  avatarsOnly?: boolean;
  hideLabels?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const InvestorBadge = ({
  count,
  singularLabel = 'Investor',
  pluralLabel = 'Investors',
  maxAvatars = 4,
  className,
  showAvatars = true,
  avatarsOnly = false,
  hideLabels = false,
  size = 'medium',
}: InvestorBadgeProps) => {
  const safeCount = count ?? 0;
  const avatarCount = typeof count === 'number' && count > 0 ? count : maxAvatars;
  const avatarsToRender = showAvatars ? Math.min(maxAvatars, Math.max(avatarCount, 1)) : 0;
  const label = safeCount === 1 ? singularLabel : pluralLabel;

  if (!avatarsOnly && safeCount <= 0) {
    return null;
  }
  const avatarElements = showAvatars ? (
    <div className={investorBadgeStyles.avatarGroup[size]}>
      {Array.from({ length: avatarsToRender }).map((_, index) => {
        // Calcul de l'overlap adaptatif selon la taille
        // Pour small: 18-20px -> overlap ~40% = -7 à -8px
        // Pour medium: 28-32px -> overlap ~40% = -11 à -13px
        // Pour large: 36-40px -> overlap ~40% = -14 à -16px
        const getOverlap = () => {
          if (size === 'small') return '-8px';
          if (size === 'large') return '-16px';
          return '-12.5px'; // medium
        };
        
        return (
          <div
            key={index}
            className={investorBadgeStyles.avatar[size]}
            style={{
              zIndex: avatarsToRender - index,
              marginLeft: index > 0 ? getOverlap() : '0',
            }}
          />
        );
      })}
    </div>
  ) : null;

  if (avatarsOnly) {
    return avatarElements ? (
      <div className={cn(className)}>
        {avatarElements}
      </div>
    ) : null;
  }

  return (
    <div className={cn(investorBadgeStyles.container[size], className)}>
      {avatarElements}

      {!hideLabels && safeCount > 0 && (
        <div className={investorBadgeStyles.info[size]}>
          <span className={investorBadgeStyles.count[size]}>{safeCount}</span>
          {/* <span className={investorBadgeStyles.label[size]}>{label}</span> */}
        </div>
      )}
    </div>
  );
};

