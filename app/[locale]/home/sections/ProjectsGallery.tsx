'use client';

import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { projectsGalleryStyles } from './projectsGallery.styles';

interface Project {
  id: number;
  label: string;
  year: string;
  image: string;
  description: string;
}

const projects: Project[] = [
  {
    id: 1,
    label: 'Velvet ® Dreams Studio',
    year: '2024',
    image: '/images/Burj.jpg',
    description: 'Un studio créatif spécialisé dans le design de luxe et les expériences visuelles immersives.',
  },
  {
    id: 2,
    label: 'Neon Pulse ® Agency',
    year: '2024',
    image: '/images/TowerJBR.png',
    description: 'Agence digitale innovante axée sur les technologies émergentes et les campagnes marketing modernes.',
  },
  {
    id: 3,
    label: 'Midnight Canvas',
    year: '2024',
    image: '/images/TowerJBR.png',
    description: 'Atelier d\'art numérique explorant les frontières entre design traditionnel et nouvelles technologies.',
  },
  {
    id: 4,
    label: 'Echo Digital Lab',
    year: '2024',
    image: '/images/Grue.jpg',
    description: 'Laboratoire de recherche et développement en design interactif et expériences utilisateur.',
  },
  {
    id: 5,
    label: 'Skiper Creative ® Co ',
    year: '2023',
    image: '/images/TowerJBR.png',
    description: 'Collectif créatif multidisciplinaire produisant des solutions visuelles et stratégiques innovantes.',
  },
  {
    id: 6,
    label: 'Cosmic Brew Studios',
    year: '2023—2024',
    image: '/images/TowerJBR.png',
    description: 'Studio de production créative fusionnant art, technologie et narration visuelle immersive.',
  },
  {
    id: 7,
    label: 'Horizon Typography',
    year: '2024',
    image: '/images/TowerJBR.png',
    description: 'Spécialiste en typographie contemporaine et design de caractères pour marques premium.',
  },
  {
    id: 8,
    label: 'Waves & ® Motion',
    year: '2022—2024',
    image: '/images/TowerJBR.png',
    description: 'Studio d\'animation et motion design créant des identités visuelles dynamiques et mémorables.',
  },
  {
    id: 9,
    label: 'Stellar Workshop',
    year: '2023',
    image: '/images/TowerJBR.png',
    description: 'Atelier collaboratif dédié à la création de projets visuels ambitieux et impactants.',
  },
  {
    id: 10,
    label: 'Prism ® Media House',
    year: '2023',
    image: '/images/TowerJBR.png',
    description: 'Maison de production média spécialisée dans le contenu visuel premium et les campagnes cross-platform.',
  },
  {
    id: 11,
    label: 'Aurora Design Co ™ ',
    year: '2023',
    image: '/images/TowerJBR.png',
    description: 'Agence de design intégré proposant des solutions créatives complètes pour marques et entreprises.',
  },
  {
    id: 12,
    label: 'Flux Interactive',
    year: '2023',
    image: '/images/TowerJBR.png',
    description: 'Expert en design interactif et expériences digitales engageantes pour plateformes modernes.',
  },
  {
    id: 13,
    label: 'Ember Creative Lab ™',
    year: '2022',
    image: '/images/TowerJBR.png',
    description: 'Laboratoire créatif explorant les intersections entre design, technologie et innovation.',
  },
  {
    id: 14,
    label: 'Zenith Brand Studio',
    year: '2024',
    image: '/images/TowerJBR.png',
    description: 'Studio de branding premium créant des identités de marque distinctives et mémorables.',
  },
  {
    id: 15,
    label: 'Quantum Visual Arts',
    year: '2022—2023',
    image: '/images/TowerJBR.png',
    description: 'Collectif d\'artistes visuels repoussant les limites de la création digitale et du design expérimental.',
  },
  {
    id: 16,
    label: 'Quantum Visual Arts',
    year: '2022—2023',
    image: '/images/TowerJBR.png',
    description: 'Collectif d\'artistes visuels repoussant les limites de la création digitale et du design expérimental.',
  },
  {
    id: 17,
    label: 'Quantum Visual Arts',
    year: '2022—2023',
    image: '/images/TowerJBR.png',
    description: 'Collectif d\'artistes visuels repoussant les limites de la création digitale et du design expérimental.',
  },
];

const ProjectsGallery = () => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [firstImageKey, setFirstImageKey] = useState<number>(1);
  const isMobile = useMediaQuery('(max-width: 767px)');

  const handleMouseEnter = (index: number) => {
    if (!isMobile) {
      setSelectedIndex(index);
      // Réinitialiser l'animation de la première image à chaque survol
      if (index === 0) {
        setFirstImageKey((prev) => prev + 1);
      }
    }
  };

  return (
    <section className={projectsGalleryStyles.section}>
      <div className={projectsGalleryStyles.container}>
        <motion.div className={projectsGalleryStyles.projectsWrapper}>
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              className={projectsGalleryStyles.projectItem}
              onClick={isMobile ? () => setSelectedIndex(index) : undefined}
              onMouseEnter={!isMobile ? () => handleMouseEnter(index) : undefined}
              initial={
                isMobile
                  ? { height: '4rem', width: '100%' }
                  : { width: '4rem', height: '100%' }
              }
              animate={
                isMobile
                  ? {
                      height: selectedIndex === index ? '500px' : '4rem',
                      width: '100%',
                    }
                  : { width: selectedIndex === index ? '28rem' : '4rem' }
              }
              transition={{ stiffness: 200, damping: 25, type: 'spring' }}
            >
              {/* Label vertical - seulement visible quand la colonne n'est PAS sélectionnée */}
              {selectedIndex !== index && (
                <motion.div
                  className={projectsGalleryStyles.projectLabel}
                  animate={{
                    color: 'rgba(241, 241, 241, 0.3)',
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <p className={projectsGalleryStyles.projectLabelText}>
                    {project.label}
                  </p>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 1 }}
                animate={{
                  opacity: selectedIndex === index ? 1 : 0,
                }}
                className={projectsGalleryStyles.imageContainer}
              >
                <motion.img
                  key={index === 0 ? `first-image-${firstImageKey}` : project.id}
                  src={project.image}
                  alt={project.label}
                  className={projectsGalleryStyles.image}
                  style={{ height: '100%', objectFit: 'cover' }}
                  initial={
                    index === 0 && selectedIndex === 0
                      ? { y: 900, scale: 0.2, opacity: 0 }
                      : { opacity: selectedIndex === index ? 1 : 0 }
                  }
                  animate={
                    index === 0 && selectedIndex === 0
                      ? { y: 0, scale: 1, opacity: 1 }
                      : { opacity: selectedIndex === index ? 1 : 0 }
                  }
                  transition={
                    index === 0 && selectedIndex === 0
                      ? { duration: 0.6, ease: 'easeOut' }
                      : { duration: 0.4, ease: 'easeOut' }
                  }
                />

                {/* Box blur avec titre et description au hover */}
                <AnimatePresence>
                  {selectedIndex === index && !isMobile && (
                    <motion.div
                      className={projectsGalleryStyles.hoverInfoBox}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      <h3 className={projectsGalleryStyles.hoverTitle}>
                        {project.label}
                      </h3>
                      <p className={projectsGalleryStyles.hoverYear}>
                        {project.year}
                      </p>
                      <p className={projectsGalleryStyles.hoverDescription}>
                        {project.description}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export { ProjectsGallery };