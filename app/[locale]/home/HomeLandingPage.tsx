'use client';

import { css } from '@/styled-system/css';
import { Hero } from './sections/Hero';
import { ScrollAnimation } from './sections/ScrollAnimation';
import { FeaturesCarousel } from './sections/FeaturesCarousel';
import { ProjectsGallery } from './sections/ProjectsGallery';
import { Footer } from './sections/Footer';
import { LiquidRing } from '@/components/ui/liquidRing';
import { FeaturedLaunch } from './sections/FeaturedLaunch';

const mainStyles = css({
  bg: 'black',
  margin: 0,
  padding: 0,
  minH: '100vh',
  display: 'flex',
  flexDirection: 'column',
});

// Style pour wrapper chaque section avec espacement uniforme
const sectionWrapper = css({
  py: "5% !important", // Espacement vertical uniforme entre toutes les sections
  w: '100%',
});

interface HomeLandingPageProps {
  isPreloaderComplete: boolean;
}

export default function HomeLandingPage({ isPreloaderComplete }: HomeLandingPageProps) {
  return (
    <main className={mainStyles}>
      <Hero isPreloaderComplete={isPreloaderComplete} />
      <div className={sectionWrapper}>
        <FeaturedLaunch />
      </div>
      <div className={sectionWrapper}>
        <ScrollAnimation />
      </div>
      <div className={sectionWrapper}>
        <FeaturesCarousel />
      </div>
      <div className={sectionWrapper}>
        <ProjectsGallery />
      </div>
      <LiquidRing />
      <Footer />
      {/* Ajoutez d'autres sections ici (Features, Testimonials, FAQ, Contact, etc.) */}
    </main>
  );
}


