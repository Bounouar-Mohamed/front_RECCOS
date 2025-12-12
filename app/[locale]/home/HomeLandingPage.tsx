'use client';

import { Hero } from '../../sections/hero';
import { ScrollAnimation } from '../../sections/scrollAnimation';
import { FeaturesCarousel } from '../../sections/featuresCarousel';
import { ProjectsGallery } from '../../sections/projectsGallery';
import { Footer } from '../../sections/footer';
import { LiquidRing } from '@/app/ui/liquidRing';
import { FeaturedLaunch } from '../../sections/featuredLaunch';
import { homeStyles } from '../home.styles';

interface HomeLandingPageProps {
  isPreloaderComplete: boolean;
}

export default function HomeLandingPage({ isPreloaderComplete }: HomeLandingPageProps) {
  return (
    <main className={homeStyles.main}>

      <Hero isPreloaderComplete={isPreloaderComplete} />

      <div className={homeStyles.sectionWrapper}>
        <FeaturedLaunch />
      </div>

      <div className={homeStyles.sectionWrapper}>
        <ScrollAnimation />
      </div>

      <div className={homeStyles.sectionWrapper}>
        <FeaturesCarousel />
      </div>

      <div className={homeStyles.sectionWrapper}>
        <ProjectsGallery />
      </div>

      <LiquidRing />
      {/* <Footer /> */}
    </main>
  );
}


