'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { heroSearchFormStyles } from './heroSearchForm.styles';
import { Select } from '@/app/ui/select';

const emirates = [
  { value: 'dubai', label: 'Dubai' },
  { value: 'abu-dhabi', label: 'Abu Dhabi' },
  { value: 'sharjah', label: 'Sharjah' },
  { value: 'ajman', label: 'Ajman' },
  { value: 'ras-al-khaimah', label: 'Ras Al Khaimah' },
  { value: 'fujairah', label: 'Fujairah' },
  { value: 'umm-al-quwain', label: 'Umm Al Quwain' },
];

const propertyTypes = [
  { value: 'apartment', label: 'Appartement' },
  { value: 'villa', label: 'Villa' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'land', label: 'Terrain' },
];

export const HeroSearchForm = () => {
  const t = useTranslations('home.searchForm');
  const [propertyType, setPropertyType] = useState('');
  const [selectedEmirate, setSelectedEmirate] = useState('');
  const [budget, setBudget] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implémenter la logique de recherche
    // Redirection vers la page de résultats de recherche
    // const searchParams = new URLSearchParams({
    //   type: propertyType,
    //   emirate: selectedEmirate,
    //   budget: budget,
    // });
    // router.push(`/${locale}/properties?${searchParams.toString()}`);
  };

  return (
    <div className={heroSearchFormStyles.wrapper}>
      <div className={heroSearchFormStyles.titleSection}>
        <h2 className={heroSearchFormStyles.title}>{t('title')}</h2>
        <p className={heroSearchFormStyles.price}>{t('price')}</p>
      </div>
      <form onSubmit={handleSubmit} className={heroSearchFormStyles.container}>
        <div className={heroSearchFormStyles.formContent}>
          {/* Type de propriété */}
          <div className={heroSearchFormStyles.fieldWrapper}>
            <label className={heroSearchFormStyles.label}>{t('propertyTypeLabel')}</label>
            <Select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              options={propertyTypes}
              placeholder={t('propertyTypePlaceholder')}
              required
              icon={
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 15V6M15 15V6M3 6L9 2L15 6M3 6H15M6 15V10H12V15"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            />
          </div>

          <div className={heroSearchFormStyles.separator} />

          {/* Émirat */}
          <div className={heroSearchFormStyles.fieldWrapper}>
            <label className={heroSearchFormStyles.label}>{t('emirateLabel')}</label>
            <Select
              value={selectedEmirate}
              onChange={(e) => setSelectedEmirate(e.target.value)}
              options={emirates}
              placeholder={t('emiratePlaceholder')}
              required
              icon={
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 9.75C10.2426 9.75 11.25 8.74264 11.25 7.5C11.25 6.25736 10.2426 5.25 9 5.25C7.75736 5.25 6.75 6.25736 6.75 7.5C6.75 8.74264 7.75736 9.75 9 9.75Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 1.5C6.51472 1.5 4.5 3.51472 4.5 6C4.5 9.75 9 16.5 9 16.5C9 16.5 13.5 9.75 13.5 6C13.5 3.51472 11.4853 1.5 9 1.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            />
          </div>

          <div className={heroSearchFormStyles.separator} />

          {/* Budget */}
          <div className={heroSearchFormStyles.fieldWrapper}>
            <label className={heroSearchFormStyles.label}>{t('budgetLabel')}</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder={t('budgetPlaceholder')}
              className={heroSearchFormStyles.input}
              min="2000"
              step="1000"
              required
            />
          </div>

          {/* Bouton CTA */}
          <div className={heroSearchFormStyles.ctaWrapper}>
            <button type="submit" className={heroSearchFormStyles.cta}>
              <span className={heroSearchFormStyles.ctaText}>{t('searchButton')}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

