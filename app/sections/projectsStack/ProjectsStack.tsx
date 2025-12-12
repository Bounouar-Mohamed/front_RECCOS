'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import React, { useRef } from 'react';
import { projectsStackStyles } from './projectsStack.styles';

const projects = [
  {
    title: 'Project 1',
    src: '/images/TowerJBR.png',
  },
  {
    title: 'Project 2',
    src: '/images/TowerJBR.png',
  },
  {
    title: 'Project 3',
    src: '/images/TowerJBR.png',
  },
  {
    title: 'Project 4',
    src: '/images/TowerJBR.png',
  },
  {
    title: 'Project 5',
    src: '/images/TowerJBR.png',
  },
];

interface StickyCardProps {
  i: number;
  title: string;
  src: string;
  progress: any;
  range: [number, number];
  targetScale: number;
}

const StickyCard = ({
  i,
  title,
  src,
  progress,
  range,
  targetScale,
}: StickyCardProps) => {
  const container = useRef<HTMLDivElement>(null);
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div ref={container} className={projectsStackStyles.stickyCard}>
      <motion.div
        style={{
          scale,
          top: `calc(-5vh + ${i * 10}px)`,
        }}
        className={projectsStackStyles.card}
      >
        <img src={src} alt={title} className={projectsStackStyles.cardImage} />
      </motion.div>
    </div>
  );
};

export const ProjectsStack = () => {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  });

  return (
    <main ref={container} className={projectsStackStyles.container}>
      <div className={projectsStackStyles.header}>
        <span className={projectsStackStyles.headerText}>
          scroll down to see card stack
        </span>
      </div>
      {projects.map((project, i) => {
        const targetScale = Math.max(
          0.5,
          1 - (projects.length - i - 1) * 0.1
        );
        return (
          <StickyCard
            key={`p_${i}`}
            i={i}
            {...project}
            progress={scrollYProgress}
            range={[i * 0.25, 1]}
            targetScale={targetScale}
          />
        );
      })}
    </main>
  );
};

