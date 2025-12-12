'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { useState, useEffect } from 'react';
import { propertyRecommendationModalStyles } from './propertyRecommendationModal.styles';
import PropertyMap from './PropertyMap';
import PropertyKPIWidgets from './PropertyKPIWidgets';
import { ShareCheckoutSelector } from './shareCheckoutSelector';
import { purchasesApi } from '@/lib/api/purchases';
import { useAuthStore } from '@/lib/store/auth-store';

type ShowcaseDocument = { id?: string; label: string; url: string };
type ShowcaseItem = {
  id?: string;
  title: string;
  description?: string;
  badge?: string;
  documentUrl?: string;
  proofUrl?: string;
};

interface PropertyRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  latitude?: number;
  longitude?: number;
  propertyTitle?: string;
  propertyLocation?: string;
  propertyPrice?: number;
  investorCount?: number;
  propertyType?: string;
  squareFeet?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyImage?: string;
  propertyId?: string | number;
  developerName?: string;
  developerLogo?: string;
  documents?: ShowcaseDocument[];
  showcaseItems?: ShowcaseItem[];
  availableShares?: number;
  currency?: string;
}

export default function PropertyRecommendationModal({
  isOpen,
  onClose,
  latitude,
  longitude,
  propertyTitle,
  propertyLocation,
  propertyPrice,
  investorCount,
  propertyType,
  squareFeet,
  bedrooms,
  bathrooms,
  propertyImage,
  propertyId,
  developerName,
  developerLogo,
  documents,
  showcaseItems,
  availableShares,
  currency = 'AED',
}: PropertyRecommendationModalProps) {
  const tProduct = useTranslations('product');
  const locale = useLocale();
  const { user } = useAuthStore();
  const [showKPIs, setShowKPIs] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [panelStep, setPanelStep] = useState<'kpis' | 'showcase' | 'payment' | 'success'>('kpis');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [purchaseData, setPurchaseData] = useState<{ shares: number; total: number; transactionId: string } | null>(null);
  const text = tProduct('whyReccosChose');
  const documentList = documents ?? [];
  const showcaseList = showcaseItems ?? [];
  const hasShowcaseData = documentList.length > 0 || showcaseList.length > 0;
  const allowShowcaseFlow = hasShowcaseData || Boolean(developerName || developerLogo);
  const hasCoordinates =
    typeof latitude === 'number' &&
    Number.isFinite(latitude) &&
    typeof longitude === 'number' &&
    Number.isFinite(longitude);

  useEffect(() => {
    if (isOpen) {
      setShowKPIs(false);
      setMapLoaded(false);
      setPanelStep('kpis');
      const timer = setTimeout(() => setShowKPIs(true), 2500);
      return () => clearTimeout(timer);
    }

    setShowKPIs(false);
    setMapLoaded(false);
    return undefined;
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (typeof window !== 'undefined' && (window as any).lenis) {
        (window as any).lenis.stop();
      }
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      if (typeof window !== 'undefined' && (window as any).lenis) {
        (window as any).lenis.start();
      }
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      if (typeof window !== 'undefined' && (window as any).lenis) {
        (window as any).lenis.start();
      }
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  const handleMapLoad = () => setMapLoaded(true);

  const handlePaymentSubmit = async (payload: { propertyId: string | number; shares: number; total: number }) => {
    if (!user?.email) return;
    
    setIsProcessingPayment(true);
    try {
      const result = await purchasesApi.create({
        email: user.email,
        propertyId: String(payload.propertyId),
        shares: payload.shares,
        totalAmount: payload.total,
        currency,
        propertyTitle,
        propertyLocation,
        propertyImage,
        locale,
      });
      
      console.log('[PropertyRecommendationModal] Purchase result:', result);
      
      if (result && result.success) {
        setPurchaseData({
          shares: payload.shares,
          total: payload.total,
          transactionId: result.transactionId,
        });
        // Small delay for smoother transition
        setTimeout(() => {
          setPanelStep('success');
          setIsProcessingPayment(false);
        }, 300);
      } else {
        console.error('Payment response invalid:', result);
        setIsProcessingPayment(false);
      }
    } catch (error) {
      console.error('Payment failed:', error);
      setIsProcessingPayment(false);
    }
  };

  const renderDocuments = () => {
    if (!documentList.length) {
      return (
        <p className={propertyRecommendationModalStyles.emptyState}>
          {tProduct('recommendation.documentsEmpty')}
        </p>
      );
    }

    return (
      <div className={propertyRecommendationModalStyles.documentList}>
        {documentList.map((doc) => (
          <a
            key={doc.id ?? doc.url}
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className={propertyRecommendationModalStyles.documentLink}
          >
            <span className={propertyRecommendationModalStyles.documentLinkLabel}>{doc.label}</span>
            <span className={propertyRecommendationModalStyles.documentLinkAction}>
              {tProduct('recommendation.download')}
            </span>
          </a>
        ))}
      </div>
    );
  };

  const renderKpiContent = () => (
    <div className={propertyRecommendationModalStyles.panelCard}>
      <div className={propertyRecommendationModalStyles.panelHeader}>
        <div>
          <span className={propertyRecommendationModalStyles.panelEyebrow}>
            {tProduct('recommendation.kpisEyebrow')}
          </span>
          <h3 className={propertyRecommendationModalStyles.panelTitle}>
            {tProduct('recommendation.kpisTitle')}
          </h3>
          <p className={propertyRecommendationModalStyles.panelSubtitle}>
            {tProduct('recommendation.kpisSubtitle')}
          </p>
        </div>
      </div>
      <div className={propertyRecommendationModalStyles.panelBody}>
        <PropertyKPIWidgets />
      </div>
    </div>
  );

  const renderShowcaseContent = () => (
    <div className={propertyRecommendationModalStyles.showcasePanel}>
      {/* Header avec infos promoteur */}
      <div className={propertyRecommendationModalStyles.showcaseHeader}>
        <button
          type="button"
          className={propertyRecommendationModalStyles.showcaseBackBtn}
          onClick={() => setPanelStep('kpis')}
        >
           {tProduct('recommendation.backToKpis')}
        </button>
        
        <div className={propertyRecommendationModalStyles.developerInfo}>
          {developerLogo ? (
            <img
              src={developerLogo}
              alt={developerName ?? 'Developer'}
              className={propertyRecommendationModalStyles.developerLogoLarge}
            />
          ) : (
            <div className={propertyRecommendationModalStyles.developerLogoPlaceholder}>
              {developerName?.charAt(0) ?? 'R'}
            </div>
          )}
          <div className={propertyRecommendationModalStyles.developerDetails}>
            <span className={propertyRecommendationModalStyles.developerLabel}>
              {tProduct('recommendation.developerLabel')}
            </span>
            <h3 className={propertyRecommendationModalStyles.developerNameLarge}>
              {developerName ?? 'RECCOS Partners'}
            </h3>
          </div>
        </div>

        <div className={propertyRecommendationModalStyles.developerStats}>
          <div className={propertyRecommendationModalStyles.developerStat}>
            <span className={propertyRecommendationModalStyles.developerStatValue}>15+</span>
            <span className={propertyRecommendationModalStyles.developerStatLabel}>{tProduct('recommendation.projectsDelivered')}</span>
          </div>
          <div className={propertyRecommendationModalStyles.developerStatDivider} />
          <div className={propertyRecommendationModalStyles.developerStat}>
            <span className={propertyRecommendationModalStyles.developerStatValue}>98%</span>
            <span className={propertyRecommendationModalStyles.developerStatLabel}>{tProduct('recommendation.satisfactionRate')}</span>
          </div>
          <div className={propertyRecommendationModalStyles.developerStatDivider} />
          <div className={propertyRecommendationModalStyles.developerStat}>
            <span className={propertyRecommendationModalStyles.developerStatValue}>2015</span>
            <span className={propertyRecommendationModalStyles.developerStatLabel}>{tProduct('recommendation.since')}</span>
          </div>
        </div>
      </div>

      {/* Corps avec projets et documents */}
      <div className={propertyRecommendationModalStyles.showcaseBody}>
        {/* Section Projets */}
        <div className={propertyRecommendationModalStyles.showcaseSection}>
          <h4 className={propertyRecommendationModalStyles.showcaseSectionTitle}>
            📍 {tProduct('recommendation.showcaseTitle')}
          </h4>
          {showcaseList.length ? (
            <div className={propertyRecommendationModalStyles.showcaseGrid}>
              {showcaseList.map((item, index) => (
                <motion.article
                  key={item.id ?? item.title}
                  className={propertyRecommendationModalStyles.showcaseCard}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={propertyRecommendationModalStyles.showcaseCardIcon}>
                    🏢
                  </div>
                  <div className={propertyRecommendationModalStyles.showcaseCardContent}>
                    <h5 className={propertyRecommendationModalStyles.showcaseCardTitle}>{item.title}</h5>
                    {item.description && (
                      <p className={propertyRecommendationModalStyles.showcaseCardDesc}>{item.description}</p>
                    )}
                  </div>
                  {item.badge && (
                    <span className={propertyRecommendationModalStyles.showcaseBadge}>{item.badge}</span>
                  )}
                </motion.article>
              ))}
            </div>
          ) : (
            <div className={propertyRecommendationModalStyles.showcaseEmptyState}>
              <span>🏗️</span>
              <p>{tProduct('recommendation.showcaseEmpty')}</p>
            </div>
          )}
        </div>

        {/* Section Documents */}
        <div className={propertyRecommendationModalStyles.showcaseSection}>
          <h4 className={propertyRecommendationModalStyles.showcaseSectionTitle}>
            📄 {tProduct('recommendation.documentsTitle')}
          </h4>
          <p className={propertyRecommendationModalStyles.showcaseSectionDesc}>
            {tProduct('recommendation.documentsLead')}
          </p>
          {documentList.length ? (
            <div className={propertyRecommendationModalStyles.documentGrid}>
              {documentList.map((doc, index) => (
                <motion.a
                  key={doc.url}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={propertyRecommendationModalStyles.documentCard}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className={propertyRecommendationModalStyles.documentCardIcon}>
                    📑
                  </div>
                  <span className={propertyRecommendationModalStyles.documentCardLabel}>{doc.label}</span>
                  <span className={propertyRecommendationModalStyles.documentCardAction}>↗</span>
                </motion.a>
              ))}
            </div>
          ) : (
            <div className={propertyRecommendationModalStyles.showcaseEmptyState}>
              <span>📂</span>
              <p>{tProduct('recommendation.documentsEmpty')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className={propertyRecommendationModalStyles.showcaseFooter}>
        <p className={propertyRecommendationModalStyles.showcaseFooterHint}>
          {tProduct('recommendation.readyToInvest')}
        </p>
        <button
          type="button"
          className={propertyRecommendationModalStyles.ctaPrimary}
          onClick={() => setPanelStep('payment')}
        >
          {tProduct('recommendation.ctaInvest')} 
        </button>
      </div>
    </div>
  );

  const kpisContainerClassName = [
    propertyRecommendationModalStyles.kpisContainer,
    panelStep === 'kpis' && allowShowcaseFlow ? propertyRecommendationModalStyles.kpisContainerCtaSpacer : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={propertyRecommendationModalStyles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            onClick={onClose}
          
          />

          <motion.div
            className={propertyRecommendationModalStyles.modal}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {hasCoordinates && (
              <div
                className={propertyRecommendationModalStyles.hiddenMapContainer}
                style={{ display: showKPIs ? 'none' : 'block' }}
              >
                <PropertyMap
                  latitude={latitude}
                  longitude={longitude}
                  title={propertyTitle}
                  location={propertyLocation}
                  price={propertyPrice}
                  investorCount={investorCount}
                  propertyType={propertyType}
                  squareFeet={squareFeet}
                  bedrooms={bedrooms}
                  bathrooms={bathrooms}
                  image={propertyImage}
                  hideCloseButton
                  onLoad={handleMapLoad}
                  hidden={!showKPIs}
                />
              </div>
            )}

            <AnimatePresence mode="wait">
              {!showKPIs ? (
                <motion.div
                  key="preloader"
                  className={propertyRecommendationModalStyles.content}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <motion.div
                    className={propertyRecommendationModalStyles.textWrapper as string}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
                  >
                    <motion.p
                      className={propertyRecommendationModalStyles.preloaderText}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
                    >
                      {text}
                    </motion.p>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  className={propertyRecommendationModalStyles.modalLayout}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {hasCoordinates && mapLoaded && (
                    <motion.div
                      className={propertyRecommendationModalStyles.mapSection}
                      initial={{ opacity: 0, y: -30, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
                    >
                      <PropertyMap
                        latitude={latitude}
                        longitude={longitude}
                        title={propertyTitle}
                        location={propertyLocation}
                        price={propertyPrice}
                        investorCount={investorCount}
                        propertyType={propertyType}
                        squareFeet={squareFeet}
                        bedrooms={bedrooms}
                        bathrooms={bathrooms}
                        image={propertyImage}
                        hideCloseButton
                      />
                    </motion.div>
                  )}

                  <motion.div
                    className={kpisContainerClassName}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1], delay: 0.3 }}
                  >
                    <AnimatePresence mode="wait">
                      {panelStep === 'kpis' && (
                        <motion.div
                          key="panel-kpis"
                          className={propertyRecommendationModalStyles.panelCardWrapper}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          {renderKpiContent()}
                        </motion.div>
                      )}
                      {panelStep === 'showcase' && (
                        <motion.div
                          key="panel-showcase"
                          className={propertyRecommendationModalStyles.panelCardWrapper}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          {renderShowcaseContent()}
                        </motion.div>
                      )}
                      {panelStep === 'payment' && (
                        <motion.div
                          key="panel-payment"
                          className={propertyRecommendationModalStyles.panelCardWrapper}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className={propertyRecommendationModalStyles.paymentStep}>
                            <div className={propertyRecommendationModalStyles.paymentStepHeader}>
                              <button
                                type="button"
                                className={propertyRecommendationModalStyles.panelBackButton}
                                onClick={() => setPanelStep('showcase')}
                              >
                                 {tProduct('recommendation.backToShowcase')}
                              </button>
                              <span className={propertyRecommendationModalStyles.paymentStepBadge}>
                                {tProduct('recommendation.stepFinal')}
                              </span>
                            </div>
                            <h3 className={propertyRecommendationModalStyles.paymentStepTitle}>
                              {tProduct('recommendation.checkoutTitle')}
                            </h3>
                            <p className={propertyRecommendationModalStyles.paymentStepSubtitle}>
                              {tProduct('recommendation.checkoutSubtitle')}
                            </p>
                            <div className={propertyRecommendationModalStyles.checkoutContainer}>
                              <ShareCheckoutSelector
                                propertyId={propertyId ?? propertyTitle ?? 'property'}
                                pricePerShare={propertyPrice ?? 0}
                                maxShares={availableShares ?? null}
                                currency={currency}
                                developerLabel={developerName ?? undefined}
                                propertyName={propertyTitle}
                                onPaymentSubmit={handlePaymentSubmit}
                                isProcessing={isProcessingPayment}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                      {panelStep === 'success' && purchaseData && (
                        <motion.div
                          key="panel-success"
                          className={propertyRecommendationModalStyles.panelCardWrapper}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className={propertyRecommendationModalStyles.successStep}>
                            {/* Success Icon with animation */}
                            <motion.div 
                              className={propertyRecommendationModalStyles.successIcon}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ 
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                                delay: 0.1 
                              }}
                              style={{
                                animation: 'successGlow 2s ease-in-out infinite',
                                borderRadius: '50%',
                              }}
                            >
                              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                                <motion.circle 
                                  cx="12" cy="12" r="10" 
                                  fill="#34c759"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ duration: 0.3, delay: 0.1 }}
                                />
                                <motion.path 
                                  d="M8 12l2.5 2.5L16 9" 
                                  stroke="white" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round"
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ duration: 0.4, delay: 0.4 }}
                                />
                              </svg>
                            </motion.div>
                            
                            {/* Success Title */}
                            <motion.h3 
                              className={propertyRecommendationModalStyles.successTitle}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                            >
                              {tProduct('recommendation.successTitle')}
                            </motion.h3>
                            <motion.p 
                              className={propertyRecommendationModalStyles.successSubtitle}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4 }}
                            >
                              {tProduct('recommendation.successSubtitle')}
                            </motion.p>

                            {/* Purchase Summary */}
                            <motion.div 
                              className={propertyRecommendationModalStyles.successCard}
                              initial={{ opacity: 0, y: 20, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ delay: 0.5, duration: 0.4 }}
                            >
                              <div className={propertyRecommendationModalStyles.successPropertyName}>
                                {propertyTitle}
                              </div>
                              <div className={propertyRecommendationModalStyles.successLocation}>
                                📍 {propertyLocation}
                              </div>
                              <div className={propertyRecommendationModalStyles.successDivider} />
                              <div className={propertyRecommendationModalStyles.successDetails}>
                                <div className={propertyRecommendationModalStyles.successDetailItem}>
                                  <span className={propertyRecommendationModalStyles.successDetailLabel}>
                                    {tProduct('recommendation.sharesPurchased')}
                                  </span>
                                  <span className={propertyRecommendationModalStyles.successDetailValue}>
                                    {purchaseData.shares}
                                  </span>
                                </div>
                                <div className={propertyRecommendationModalStyles.successDetailItem}>
                                  <span className={propertyRecommendationModalStyles.successDetailLabel}>
                                    {tProduct('recommendation.totalInvested')}
                                  </span>
                                  <span className={propertyRecommendationModalStyles.successDetailValueHighlight}>
                                    {purchaseData.total.toLocaleString()} {currency}
                                  </span>
                                </div>
                              </div>
                            </motion.div>

                            {/* Title Deed Notice */}
                            <motion.div 
                              className={propertyRecommendationModalStyles.successNotice}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.7 }}
                            >
                              <span className={propertyRecommendationModalStyles.successNoticeIcon}>📄</span>
                              <p className={propertyRecommendationModalStyles.successNoticeText}>
                                {tProduct('recommendation.titleDeedNotice')}
                              </p>
                            </motion.div>

                            {/* Transaction ID */}
                            <motion.p 
                              className={propertyRecommendationModalStyles.successTransactionId}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.8 }}
                            >
                              {tProduct('recommendation.transactionId')}: {purchaseData.transactionId}
                            </motion.p>

                            {/* Close Button */}
                            <motion.button
                              type="button"
                              className={propertyRecommendationModalStyles.successCloseButton}
                              onClick={onClose}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.9 }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {tProduct('recommendation.done')}
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {panelStep === 'kpis' && allowShowcaseFlow ? (
                      <motion.button
                        type="button"
                        className={propertyRecommendationModalStyles.floatingCta}
                        onClick={() => setPanelStep('showcase')}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                      >
                        <span>{tProduct('recommendation.next')}</span>
                      </motion.button>
                    ) : null}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
