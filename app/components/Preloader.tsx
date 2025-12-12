"use client";

import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { preloaderStyles } from "./preloader.styles";

const words = [
  "Hello",
  "bonjour",
  "Ciao",
  "Olà",
  "やあ",
  "Hallå",
  "Guten tag",
  "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਜੀ",
];

const Preloader_002 = () => {
  const [index, setIndex] = useState(0);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });

  // Mettre à jour les dimensions de la fenêtre
  useEffect(() => {
    const updateDimensions = () => {
      setDimension({ width: window.innerWidth, height: window.innerHeight });
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Avancer l’index des mots
  useEffect(() => {
    if (index >= words.length - 1) return; // on arrête au dernier mot
    const timer = setTimeout(
      () => setIndex((prev) => prev + 1),
      index === 0 ? 1000 : 150,
    );
    return () => clearTimeout(timer);
  }, [index]);

  const { width, height } = dimension;
  const initialPath =
    width && height
      ? `M0 0 L${width} 0 L${width} ${height} Q${width / 2} ${height + 300} 0 ${height} L0 0`
      : "";
  const targetPath =
    width && height
      ? `M0 0 L${width} 0 L${width} ${height} Q${width / 2} ${height} 0 ${height} L0 0`
      : "";

  return (
    <motion.div
      variants={{
        initial: { top: 0 },
        exit: {
          top: "-100vh",
          transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 },
        },
      }}
      initial="initial"
      exit="exit"
      className={preloaderStyles.container}
    >
      {width > 0 && (
        <>
          <motion.p
            variants={{
              initial: { opacity: 0 },
              enter: { opacity: 0.75, transition: { duration: 1, delay: 0.2 } },
            }}
            initial="initial"
            animate="enter"
            className={preloaderStyles.text}
          >
            {words[index]}
          </motion.p>
          <svg className={preloaderStyles.svg} preserveAspectRatio="none">
            <motion.path
              variants={{
                initial: { d: initialPath },
                exit: {
                  d: targetPath,
                  transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: 0.3 },
                },
              }}
              initial="initial"
              exit="exit"
              className={preloaderStyles.path}
            />
          </svg>
        </>
      )}
    </motion.div>
  );
};

export { Preloader_002 };
