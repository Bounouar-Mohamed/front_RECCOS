'use client';

import { motion } from 'framer-motion';
import { InvestorBadge } from '@/app/ui/investorBadge/InvestorBadge';
import { mapPropertyPopupCardStyles } from './mapPropertyPopupCard.styles';

interface MapPropertyPopupCardProps {
  title?: string;
  location?: string;
  price?: number;
  investorCount?: number;
  propertyType?: string;
  squareFeet?: number;
  bedrooms?: number;
  bathrooms?: number;
  image?: string;
}

const formatSquareFeet = (sqft?: number) => {
  if (!sqft) return '';
  return new Intl.NumberFormat('fr-FR').format(sqft);
};

export function MapPropertyPopupCard({
  title,
  location,
  investorCount,
  propertyType,
  squareFeet,
  bedrooms,
  bathrooms,
  image,
}: MapPropertyPopupCardProps) {
  return (
    <div className={mapPropertyPopupCardStyles.container}>
      {/* Ligne 1 : Image + Détails */}
      <div className={mapPropertyPopupCardStyles.row}>
        {image && (
          <div className={mapPropertyPopupCardStyles.imageBox}>
            <img
              src={image}
              alt={title || 'Property'}
              className={mapPropertyPopupCardStyles.image}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                if (target.parentElement) {
                  target.parentElement.style.background =
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                }
              }}
            />
            <div className={mapPropertyPopupCardStyles.imageOverlay} />
          </div>
        )}

        {/* Boîte Détails */}
        <div className={mapPropertyPopupCardStyles.detailsBox}>
          {/* Badge investisseurs avec InvestorBadge */}
          {investorCount !== undefined && investorCount !== null && investorCount > 0 && (
            <motion.div
              className={mapPropertyPopupCardStyles.investorBadgeWrapper}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <InvestorBadge
                count={investorCount}
                singularLabel="Investisseur"
                pluralLabel="Investisseurs"
                size="small"
              />
            </motion.div>
          )}

          {/* Détails en 2 colonnes */}
          <div className={mapPropertyPopupCardStyles.detailsGrid}>
            {/* Colonne gauche : Type et Surface */}
            <div
              className={mapPropertyPopupCardStyles.detailsColumn}
              style={{
                justifyContent: investorCount !== undefined && investorCount !== null ? 'flex-start' : 'center',
              }}
            >
              {propertyType && (
                <div className={mapPropertyPopupCardStyles.detailItem}>
                  <span className={mapPropertyPopupCardStyles.detailLabel}>Type</span>
                  <span className={mapPropertyPopupCardStyles.detailValue}>{propertyType}</span>
                </div>
              )}
              {squareFeet && (
                <div className={mapPropertyPopupCardStyles.detailItem}>
                  <span className={mapPropertyPopupCardStyles.detailLabel}>Surface</span>
                  <span className={mapPropertyPopupCardStyles.detailValue}>
                    {formatSquareFeet(squareFeet)} m²
                  </span>
                </div>
              )}
            </div>

            {/* Colonne droite : Chambres et Salles de bain */}
            <div
              className={mapPropertyPopupCardStyles.detailsColumn}
              style={{
                justifyContent: investorCount !== undefined && investorCount !== null ? 'flex-start' : 'center',
              }}
            >
              {bedrooms && (
                <div className={mapPropertyPopupCardStyles.detailItem}>
                  <span className={mapPropertyPopupCardStyles.detailLabel}>Chambres</span>
                  <span className={mapPropertyPopupCardStyles.detailValue}>{bedrooms}</span>
                </div>
              )}
              {bathrooms && (
                <div className={mapPropertyPopupCardStyles.detailItem}>
                  <span className={mapPropertyPopupCardStyles.detailLabel}>Salles de bain</span>
                  <span className={mapPropertyPopupCardStyles.detailValue}>{bathrooms}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ligne 2 : Titre + Localisation */}
      <div className={mapPropertyPopupCardStyles.locationBox}>
        {title && <div className={mapPropertyPopupCardStyles.title}>{title}</div>}
        {location && (
          <div className={mapPropertyPopupCardStyles.locationContainer}>
            <svg
              className={mapPropertyPopupCardStyles.locationIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>{location}</span>
          </div>
        )}
      </div>
    </div>
  );
}

