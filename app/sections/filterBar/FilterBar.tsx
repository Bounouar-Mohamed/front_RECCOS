'use client';

import { Select, type SelectOption } from '@/app/ui/select';
import { filterBarStyles } from './filterBar.styles';

export interface FilterBarProps {
  label?: string;
  title?: string; // Titre à afficher
  titlePosition?: 'left' | 'right'; // Position du titre (par défaut 'right')
  showSelects?: boolean; // Afficher ou masquer les selects (par défaut true)
  firstSelectOptions?: SelectOption[];
  firstSelectValue?: string;
  firstSelectPlaceholder?: string;
  firstSelectOnChange?: (value: string) => void;
  secondSelectOptions?: SelectOption[];
  secondSelectValue?: string;
  secondSelectPlaceholder?: string;
  secondSelectOnChange?: (value: string) => void;
}

export const FilterBar = ({
  label,
  title,
  titlePosition = 'right',
  showSelects = true,
  firstSelectOptions = [],
  firstSelectValue,
  firstSelectPlaceholder,
  firstSelectOnChange,
  secondSelectOptions = [],
  secondSelectValue,
  secondSelectPlaceholder,
  secondSelectOnChange,
}: FilterBarProps) => {
  // Si title est à gauche, on utilise une disposition différente
  const isTitleLeft = title && titlePosition === 'left';
  
  // Si title est fourni et showSelects est false avec position right, on n'affiche pas le label
  const shouldShowLabel = label && !(title && !showSelects && titlePosition === 'right');

  // Layout avec titre à gauche - ligne continue jusqu'au bord
  if (isTitleLeft) {
    return (
      <div className={filterBarStyles.container}>
        <div className={filterBarStyles.contentTitleLeft}>
          {/* petit trait gauche */}
          <div className={filterBarStyles.leftLine} />

          {/* titre à gauche */}
          <span className={filterBarStyles.label}>{title}</span>

          {/* ligne continue qui va jusqu'au bord droit */}
          <div className={filterBarStyles.fullLineRight} />
        </div>
      </div>
    );
  }

  // Layout standard
  return (
    <div className={filterBarStyles.container}>
      <div className={filterBarStyles.content}>
        {shouldShowLabel ? (
          <>
            {/* petit trait gauche */}
            <div className={filterBarStyles.leftLine} />

            {/* label, bien à gauche */}
            <span className={filterBarStyles.label}>{label}</span>

            {/* ligne entre label et contenu de droite */}
            <div className={filterBarStyles.centerLine} />
          </>
        ) : (
          /* Ligne continue depuis le bord gauche si pas de label */
          <div className={filterBarStyles.fullLine} />
        )}

        {/* Contenu de droite : selects ou titre */}
        <div className={filterBarStyles.rightSection}>
          {showSelects ? (
            <>
              {firstSelectOptions.length > 0 && (
                <div className={filterBarStyles.selectWrapper}>
                  <Select
                    value={firstSelectValue || ''}
                    onChange={(e) => firstSelectOnChange?.(e.target.value)}
                    options={firstSelectOptions}
                    placeholder={firstSelectPlaceholder}
                    variant="compact"
                    className={filterBarStyles.select}
                  />
                </div>
              )}

              {secondSelectOptions.length > 0 && (
                <div className={filterBarStyles.selectWrapper}>
                  <Select
                    value={secondSelectValue || ''}
                    onChange={(e) => secondSelectOnChange?.(e.target.value)}
                    options={secondSelectOptions}
                    placeholder={secondSelectPlaceholder}
                    variant="compact"
                    className={filterBarStyles.select}
                  />
                </div>
              )}
            </>
          ) : null}

          {title && (
            <span className={filterBarStyles.title}>{title}</span>
          )}

          {/* trait final à droite */}
          <div className={filterBarStyles.rightLine} />
        </div>
      </div>
    </div>
  );
};
