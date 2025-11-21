'use client';

import { heroStyles } from './hero.styles';
import { HeroSearchForm } from './HeroSearchForm';

interface HeroProps {
  isPreloaderComplete: boolean;
}

export const Hero = ({ isPreloaderComplete }: HeroProps) => {
  return (
    <section className={heroStyles.root}>
      <HeroSearchForm />
    </section>
  );
};