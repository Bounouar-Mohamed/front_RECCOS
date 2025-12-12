'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { useRef } from 'react';

import styles from './cardsParallax.module.css';

type Project = {
  title: string;
  description: string;
  src: string;
  url: string;
  color: string;
};

type CardProps = {
  project: Project;
  index: number;
  total: number;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
};

export function Card({
  project,
  index,
  total,
  progress,
  range,
  targetScale,
}: CardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'start start'],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], [2, 1]);
  const cardScale = useTransform(progress, range, [1, targetScale]);

  return (
    <div
      className={styles.cardWrapper}
      style={{
        zIndex: total - index,
      }}
    >
      <motion.div
        ref={cardRef}
        className={styles.card}
        style={{
          scale: cardScale,
          top: `calc(-5vh + ${index * 25}px)`,
          backgroundColor: project.color,
        }}
      >
        <div className={styles.cardInner}>
          <span className={styles.cardHeader}>Featured project</span>
          <h3 className={styles.title}>{project.title}</h3>
          <p className={styles.description}>{project.description}</p>
          <Link className={styles.link} href={project.url}>
            Voir plus
          </Link>
        </div>

        <motion.div className={styles.imageFrame} style={{ scale: imageScale }}>
          <Image
            src={`/images/${project.src}`}
            alt={project.title}
            fill
            className={styles.image}
            sizes="(min-width: 1024px) 60vw, 100vw"
            priority={index === 0}
          />
          <span className={styles.imageOverlay} />
        </motion.div>
      </motion.div>
    </div>
  );
}


