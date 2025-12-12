'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { launchpadPageStyles } from './launchpadPage.styles';
import { FeaturedLaunch } from '../../sections/featuredLaunch';
import { FilterBar } from '../../sections/filterBar';
import { StickyCard002Default } from '../../sections/stickyCard002';
import { Skiper32 } from '../../sections/skiper32';
import { ReccosExperience } from '../../sections/reccosExperience';
import { cn } from '@/lib/utils';

export default function LaunchpadPage() {
  const t = useTranslations('launchpad.filters');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('');

  const statusOptions = [
    { value: 'all', label: t('statusOptions.all') },
    { value: 'open', label: t('statusOptions.open') },
    { value: 'closed', label: t('statusOptions.closed') },
    { value: 'upcoming', label: t('statusOptions.upcoming') },
  ];

  const sortOptions = [
    { value: 'newest', label: t('sortOptions.newest') },
    { value: 'oldest', label: t('sortOptions.oldest') },
    { value: 'price-asc', label: t('sortOptions.priceAsc') },
    { value: 'price-desc', label: t('sortOptions.priceDesc') },
  ];

  const sections = [
    {
      id: 'filter-open',
      content: (
        <FilterBar
          label={t('currentlyOpen')}
          firstSelectOptions={statusOptions}
          firstSelectValue={statusFilter}
          firstSelectPlaceholder={t('filterByStatus')}
          firstSelectOnChange={setStatusFilter}
          secondSelectOptions={sortOptions}
          secondSelectValue={sortBy}
          secondSelectPlaceholder={t('sortBy')}
          secondSelectOnChange={setSortBy}
        />
      ),
    },
    {
      id: 'sticky-card',
      content: <StickyCard002Default />,
    },
    {
      id: 'filter-bought-top',
      content: <FilterBar title={t('alreadyBought')} showSelects={false} />,
    },
    {
      id: 'skiper',
      content: <Skiper32 />,
    },
    {
      id: 'filter-reccos',
      content: (
        <FilterBar
          title={t('discoverExperience')}
          titlePosition="left"
          showSelects={false}
        />
      ),
    },
    {
      id: 'reccos',
      content: <ReccosExperience />,
    },
  ];

  return (
    <main className={cn(launchpadPageStyles.container)}>

      <div className={launchpadPageStyles.firstSectionWrapper}>
        <FeaturedLaunch />
      </div>

      {sections.map((section) => (
        <section
          key={section.id}
          className={launchpadPageStyles.sectionWrapper}
        >
          {section.content}
        </section>
      ))}
    </main>
  );
}
