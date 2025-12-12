'use client';

import React from 'react';
import { liquidRingStyles } from './liquidRing.styles';

export const LiquidRing = () => {
  return (
    <>
      {/* Keyframes for spin animation */}
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <div className={liquidRingStyles.container}>
        <div className={liquidRingStyles.logoContainer}>
          <img
            src="/images/Noor.png"
            alt="Noor AI Logo"
            className={liquidRingStyles.spinningImage}
            style={{ animation: 'spin 8s linear infinite' }}
          />
        </div>
      </div>
    </>
  );
};
