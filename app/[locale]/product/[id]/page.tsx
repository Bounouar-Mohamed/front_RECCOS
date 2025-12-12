'use client';

import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/lib/store/auth-store';
import { useParams } from 'next/navigation';
import { productPageStyles } from './productPage.styles';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import PropertyRecommendationModal from '@/app/components/PropertyRecommendationModal';
import { propertiesApi, type PropertyRecord } from '@/lib/api/properties';

// Type pour les données du produit
interface LifestyleFeatureDetail {
    title: string;
    description?: string;
}

interface PromoterDocument {
    id: string;
    label: string;
    url: string;
}

interface PromoterShowcaseItem {
    id: string;
    title: string;
    description?: string;
    badge?: string;
    proofUrl?: string;
    documentUrl?: string;
}

interface ProductData {
    id: number | string;
    title: string;
    location?: string;
    description?: string;
    pricePerShare?: number;
    sharesAvailable?: number;
    totalShares?: number;
    investorCount?: number;
    developer?: string;
    developerLogo?: string;
    images?: string[];
    propertyType?: string;
    squareFeet?: number;
    bedrooms?: number;
    bathrooms?: number;
    features?: string[];
    lifestyle?: string[];
    latitude?: number;
    longitude?: number;
    lifestyleFeatureDetails?: LifestyleFeatureDetail[];
    availableAt?: string | null;
    documents?: PromoterDocument[];
    showcaseItems?: PromoterShowcaseItem[];
}

const DESCRIPTION_PREVIEW_CHAR_LIMIT = 180;

const getPreviewDescription = (value: string) => {
    if (value.length <= DESCRIPTION_PREVIEW_CHAR_LIMIT) return value;
    return `${value.slice(0, DESCRIPTION_PREVIEW_CHAR_LIMIT).trimEnd()}…`;
};

const extractDocumentLabel = (url: string, index: number) => {
    try {
        const parsed = new URL(url);
        const fileName = parsed.pathname.split('/').filter(Boolean).pop();
        if (fileName) {
            return fileName.replace(/[-_]/g, ' ');
        }
    } catch {
        // ignore parsing errors
    }
    return `Brochure ${index + 1}`;
};

const normalizePromoterShowcase = (metadata: Record<string, any>): any[] => {
    if (Array.isArray(metadata.promoterHighlights)) {
        return metadata.promoterHighlights;
    }
    if (Array.isArray(metadata.deliveredProjects)) {
        return metadata.deliveredProjects;
    }
    if (Array.isArray(metadata.successStories)) {
        return metadata.successStories;
    }
    return [];
};

const mapPropertyToProductData = (property: PropertyRecord): ProductData => {
    const metadata = (property.metadata ?? {}) as Record<string, any>;
    const developerName =
        (property.developerBrand?.name ?? metadata.developerName ?? '').toString().trim() || '';
    const developerLogo =
        property.developerBrand?.logoUrl ||
        (metadata.developerLogoFile as string | undefined) ||
        (metadata.developerLogoUrl as string | undefined) ||
        '';
    const lifestyleFeatureDetails: LifestyleFeatureDetail[] = Array.isArray(metadata.lifestyleFeatures)
        ? metadata.lifestyleFeatures
              .filter((item: any) => item && (item.title || item.description))
              .map((item: any) => ({
                  title: item.title || item.description || '',
                  description: item.description,
              }))
              .filter((item) => item.title)
        : [];
    const images: string[] = [];
    if (property.mainImage) {
        images.push(property.mainImage);
    }
    if (Array.isArray(property.images)) {
        property.images.forEach((img) => {
            if (img && !images.includes(img)) {
                images.push(img);
            }
        });
    }

    const documents: PromoterDocument[] = Array.isArray(property.documents)
        ? property.documents
              .filter((doc): doc is string => typeof doc === 'string' && doc.trim().length > 0)
              .map((doc, index) => ({
                  id: `document-${index}`,
                  label:
                      (Array.isArray(metadata.documentLabels) && metadata.documentLabels[index]?.title) ||
                      extractDocumentLabel(doc, index),
                  url: doc,
              }))
        : [];

    const promoterShowcase: PromoterShowcaseItem[] = normalizePromoterShowcase(metadata)
        .map((item: any, index: number) => ({
            id: item?.id || `showcase-${index}`,
            title: item?.title || item?.name || '',
            description: item?.description || item?.details || item?.summary,
            badge: item?.badge || item?.year || item?.status,
            proofUrl: item?.coverImage || item?.image || item?.proofUrl,
            documentUrl: item?.documentUrl || item?.brochureUrl || item?.link,
        }))
        .filter((item) => item.title);

    return {
        id: property.id,
        title: property.title,
        location: property.address || [property.zone, property.emirate].filter(Boolean).join(', '),
        description: property.description,
        pricePerShare: property.pricePerShare ? Number(property.pricePerShare) : undefined,
        sharesAvailable:
            property.totalShares !== undefined && property.soldShares !== undefined
                ? Math.max(property.totalShares - property.soldShares, 0)
                : undefined,
        totalShares: property.totalShares,
        investorCount: metadata.investorCount ?? property.soldShares ?? 0,
        developer: developerName,
        developerLogo: developerLogo || undefined,
        images: images.length ? images : ['/images/TowerJBR.png'],
        propertyType: property.propertyType,
        squareFeet: property.totalArea ? Number(property.totalArea) : undefined,
        bedrooms: property.bedrooms ?? undefined,
        bathrooms: property.bathrooms ?? undefined,
        features: Array.isArray(property.features) ? property.features : undefined,
        lifestyle: lifestyleFeatureDetails.length ? lifestyleFeatureDetails.map((item) => item.title) : undefined,
        latitude: property.latitude ? Number(property.latitude) : undefined,
        longitude: property.longitude ? Number(property.longitude) : undefined,
        lifestyleFeatureDetails: lifestyleFeatureDetails.length ? lifestyleFeatureDetails : undefined,
        availableAt: property.availableAt ?? null,
        documents: documents.length ? documents : undefined,
        showcaseItems: promoterShowcase.length ? promoterShowcase : undefined,
    };
};

// IMPORTANT :
// - La protection d'accès à /product est gérée par le middleware (cookie httpOnly)
// - Si l'utilisateur n'est pas encore hydraté côté client, on affiche juste un état de chargement

export default function ProductPage() {
    const t = useTranslations('auth');
    const tCommon = useTranslations('common');
    const tProduct = useTranslations('product');
    const params = useParams();
    const productId = params?.id as string;
    const { user, isAuthenticated } = useAuthStore();
    const [productData, setProductData] = useState<ProductData | null>(null);
    const [isProductLoading, setIsProductLoading] = useState(true);
    const [productError, setProductError] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [previewStartIndex, setPreviewStartIndex] = useState(0);
    const [slidePosition, setSlidePosition] = useState(0);
    const [isSliding, setIsSliding] = useState(false);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [slideProgress, setSlideProgress] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const slideContainerRef = useRef<HTMLDivElement>(null);
    const slideButtonRef = useRef<HTMLDivElement>(null);
    const startXRef = useRef(0);
    const animationFrameRef = useRef<number | null>(null);

    // Fonctions pour gérer le glissement
    const handleSlideStart = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        setIsSliding(true);
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        if (slideContainerRef.current) {
            const containerRect = slideContainerRef.current.getBoundingClientRect();
            startXRef.current = clientX - containerRect.left - slidePosition;
        }
    };

    const handleSlideMove = (e: MouseEvent | TouchEvent) => {
        if (!isSliding || !slideContainerRef.current) return;

        // Utiliser requestAnimationFrame pour des mises à jour fluides
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = requestAnimationFrame(() => {
            if (!slideContainerRef.current) return;

            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const containerRect = slideContainerRef.current.getBoundingClientRect();
            const buttonSize = slideButtonRef.current?.offsetWidth || 48;
            const padding = 8;
            const maxPosition = containerRect.width - buttonSize - padding;

            const newPosition = Math.max(0, Math.min(maxPosition, clientX - containerRect.left - startXRef.current));
            setSlidePosition(newPosition);
            
            // Calculer le pourcentage de progression pour l'effet silver
            const progress = maxPosition > 0 ? (newPosition / maxPosition) * 100 : 0;
            setSlideProgress(progress);

            // Si on atteint la fin, déclencher l'action
            if (newPosition >= maxPosition - 5) {
                // Action à effectuer quand on glisse jusqu'au bout
                console.log('Slide completed!');
                setIsSliding(false);
                // Ouvrir la modal
                setIsModalOpen(true);
                // Réinitialiser après un court délai
                setTimeout(() => {
                    setSlidePosition(0);
                    setSlideProgress(0);
                }, 500);
            }
        });
    };

    const handleSlideEnd = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        setIsSliding(false);
        // Si on n'a pas atteint la fin, revenir au début
        if (slideContainerRef.current) {
            const containerRect = slideContainerRef.current.getBoundingClientRect();
            const buttonSize = slideButtonRef.current?.offsetWidth || 48;
            const padding = 8;
            const maxPosition = containerRect.width - buttonSize - padding;

            if (slidePosition < maxPosition - 10) {
                setSlidePosition(0);
                setSlideProgress(0);
            }
        }
    };

    useEffect(() => {
        let isMounted = true;

        const loadProduct = async () => {
            if (!productId) {
                setProductData(null);
                setIsProductLoading(false);
                return;
            }
            setIsProductLoading(true);
            try {
                const property = await propertiesApi.get(productId);
                if (!isMounted) {
                    return;
                }
                const mapped = mapPropertyToProductData(property);
                setProductData(mapped);
                setProductError(null);
            } catch (err) {
                if (!isMounted) {
                    return;
                }
                const message =
                    err instanceof Error
                        ? err.message
                        : tCommon('error', { defaultValue: 'Unable to load property.' });
                setProductError(message);
                setProductData(null);
            } finally {
                if (isMounted) {
                    setIsProductLoading(false);
                }
            }
        };

        loadProduct();

        return () => {
            isMounted = false;
        };
    }, [productId, tCommon]);

    useEffect(() => {
        if (!productData) {
            return;
        }
        setCurrentImageIndex(0);
        setPreviewStartIndex(0);
        setIsDescriptionExpanded(false);
        setSlidePosition(0);
        setSlideProgress(0);
    }, [productData?.id]);

    // Ajuster previewStartIndex quand currentImageIndex change
    useEffect(() => {
        if (productData?.images && productData.images.length > 4) {
            const maxVisible = 4;
            if (currentImageIndex >= previewStartIndex + maxVisible) {
                setPreviewStartIndex(currentImageIndex - maxVisible + 1);
            } else if (currentImageIndex < previewStartIndex) {
                setPreviewStartIndex(currentImageIndex);
            }
        }
    }, [currentImageIndex, productData?.images, previewStartIndex]);

    // Gestion des événements de glissement
    useEffect(() => {
        if (!isSliding) return;

        const handleMove = (e: MouseEvent | TouchEvent) => handleSlideMove(e);
        const handleEnd = () => handleSlideEnd();

        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);
        document.addEventListener('touchmove', handleMove);
        document.addEventListener('touchend', handleEnd);

        return () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleEnd);
            document.removeEventListener('touchmove', handleMove);
            document.removeEventListener('touchend', handleEnd);
        };
    }, [isSliding, slidePosition]);

    const handlePreviewClick = (clickedIndex: number) => {
        setCurrentImageIndex(clickedIndex);

        // Effet de roue infinie : l'image cliquée devient le nouveau point de départ
        // Peu importe sa position actuelle, elle passe en premier plan (position 0)
        if (productData?.images) {
            // L'image cliquée devient le nouveau previewStartIndex
            // Cela permet un défilement infini - on peut toujours cliquer sur n'importe quelle image
            setPreviewStartIndex(clickedIndex);
        }
    };

    const handlePreviewPrev = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🔵 handlePreviewPrev clicked', {
            previewStartIndex,
            imagesLength: productData?.images?.length,
        });
        if (productData?.images && productData.images.length > 0) {
            // Défilement infini : on peut toujours aller à l'image précédente
            // Si on dépasse, on boucle à la fin (effet de roue)
            const newIndex = previewStartIndex === 0
                ? productData.images.length - 1
                : previewStartIndex - 1;
            console.log('✅ Setting previewStartIndex to', newIndex);
            setPreviewStartIndex(newIndex);
            setCurrentImageIndex(newIndex);
        } else {
            console.log('❌ Cannot go prev: no images');
        }
    };

    const handlePreviewNext = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🟢 handlePreviewNext clicked', {
            previewStartIndex,
            imagesLength: productData?.images?.length,
        });
        if (productData?.images && productData.images.length > 0) {
            // Défilement infini : on peut toujours aller à l'image suivante
            // Si on dépasse, on boucle au début (effet de roue)
            const newIndex = (previewStartIndex + 1) % productData.images.length;
            console.log('✅ Setting previewStartIndex to', newIndex);
            setPreviewStartIndex(newIndex);
            setCurrentImageIndex(newIndex);
        } else {
            console.log('❌ Cannot go next: no images');
        }
    };

    // Navigation au clavier pour le carousel
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!productData?.images || productData.images.length <= 1) return;

            if (e.key === 'ArrowLeft') {
                setCurrentImageIndex((prev) =>
                    prev === 0 ? productData.images!.length - 1 : prev - 1
                );
            } else if (e.key === 'ArrowRight') {
                setCurrentImageIndex((prev) =>
                    prev === productData.images!.length - 1 ? 0 : prev + 1
                );
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [productData]);

    if (!isAuthenticated || !user) {
        return (
            <main className={productPageStyles.container}>
                <motion.p
                    className={productPageStyles.loading}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    {tCommon('loading')}
                </motion.p>
            </main>
        );
    }

    if (isProductLoading) {
        return (
            <main className={productPageStyles.container}>
                <motion.p
                    className={productPageStyles.loading}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    {tCommon('loading')}
                </motion.p>
            </main>
        );
    }

    if (!productData) {
        return (
            <main className={productPageStyles.container}>
                <motion.p
                    className={productPageStyles.loading}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    {productError || tCommon('error', { defaultValue: 'Unable to load property.' })}
                </motion.p>
            </main>
        );
    }

    const descriptionText = productData.description?.trim() ?? '';
    const shouldShowDescriptionToggle = descriptionText.length > DESCRIPTION_PREVIEW_CHAR_LIMIT;
    const previewDescription = shouldShowDescriptionToggle
        ? getPreviewDescription(descriptionText)
        : descriptionText;
    const developerDisplayName =
        productData.developer ||
        tProduct('unknownDeveloper', { defaultValue: 'Developer to be announced' });
    const developerLogoSrc = productData.developerLogo;
    const developerInitials = developerDisplayName
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    const featureItems = Array.isArray(productData.features)
        ? productData.features
              .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        : [];
    const lifestyleEntriesFromMetadata = productData.lifestyleFeatureDetails ?? [];
    const lifestyleFallbackEntries =
        lifestyleEntriesFromMetadata.length === 0 && Array.isArray(productData.lifestyle)
            ? productData.lifestyle
                  .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
                  .map((title) => ({ title, description: undefined }))
            : [];
    const lifestyleEntries =
        lifestyleEntriesFromMetadata.length > 0 ? lifestyleEntriesFromMetadata : lifestyleFallbackEntries;
    const shouldShowLifestyleSection = featureItems.length > 0 || lifestyleEntries.length > 0;

    return (
        <main className={productPageStyles.container}>
            <motion.div
                className={productPageStyles.content}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            >
                <div className={productPageStyles.bentoGrid}>
                    {/* Première colonne (gauche) */}
                    <motion.div
                        className={productPageStyles.leftColumn}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        {/* Breadcrumb en haut */}
                        <div className={productPageStyles.breadcrumb}>
                            <span>{tProduct('currentlyOpen')}</span>
                            <span className={productPageStyles.breadcrumbSeparator}>›</span>
                            <span>{productData.title}</span>
                        </div>

                        {/* Nom du bien */}
                        <motion.h1
                            className={productPageStyles.productTitle}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            {productData.title}
                        </motion.h1>

                        {/* Section description en bas */}
                        <motion.div
                            className={productPageStyles.descriptionSection}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <div className={productPageStyles.descriptionLabel}>
                                {tProduct('description')}
                            </div>
                            <div className={productPageStyles.builtByContainer}>
                                <div className={productPageStyles.builtByLabel}>
                                    {tProduct('buildedBy')}
                                </div>
                                <div className={productPageStyles.developerLogoWrapper}>
                                    {developerLogoSrc ? (
                                        <Image
                                            src={developerLogoSrc}
                                            alt={`${developerDisplayName} logo`}
                                            width={322}
                                            height={65}
                                            className={productPageStyles.developerLogo}
                                            unoptimized
                                        />
                                    ) : (
                                        <div className={productPageStyles.developerLogoFallback}>
                                            {developerInitials || '—'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Colonne du milieu - Carousel d'images */}
                    <motion.div
                        className={productPageStyles.middleColumn}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        {productData.images && productData.images.length > 0 ? (
                            <div className={productPageStyles.imageCarousel}>
                                <Image
                                    src={productData.images[currentImageIndex]}
                                    alt={`${productData.title} - Image ${currentImageIndex + 1}`}
                                    fill
                                    className={productPageStyles.carouselImage}
                                    unoptimized
                                    priority={currentImageIndex === 0}
                                />
                                {/* Bouton "View on map" avec effet liquid glass */}
                                {/* <button
                                    className={productPageStyles.viewMapButton}
                                    aria-label={tProduct('viewOnMap')}
                                >
                                    <svg
                                        className={productPageStyles.viewMapIcon}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <circle
                                            cx="12"
                                            cy="10"
                                            r="3"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <span>{tProduct('viewOnMap')}</span>
                                </button> */}
                                {productData.images.length > 1 && (
                                    <div className={productPageStyles.carouselDots}>
                                        {productData.images.map((_, index) => (
                                            <button
                                                key={index}
                                                className={`${productPageStyles.carouselDot} ${index === currentImageIndex ? productPageStyles.carouselDotActive : ''
                                                    }`}
                                                onClick={() => setCurrentImageIndex(index)}
                                                aria-label={`Go to image ${index + 1}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className={productPageStyles.imageCarousel}>
                                <Image
                                    src="/images/TowerJBR.png"
                                    alt={productData.title}
                                    fill
                                    className={productPageStyles.carouselImage}
                                    unoptimized
                                />
                                {/* Bouton "View on map" avec effet liquid glass */}
                                <button
                                    className={productPageStyles.viewMapButton}
                                    aria-label={tProduct('viewOnMap')}
                                >
                                    <svg
                                        className={productPageStyles.viewMapIcon}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <circle
                                            cx="12"
                                            cy="10"
                                            r="3"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <span>{tProduct('viewOnMap')}</span>
                                </button>
                            </div>
                        )}

                        {/* Wrapper pour les infos (localisation + description) */}
                        <div className={productPageStyles.infoWrapper}>
                            {/* Localisation avec pin (uniquement en mode compact) */}
                            {productData.location && !isDescriptionExpanded && (
                                <motion.div
                                    className={productPageStyles.locationInfo}
                                    layout
                                    transition={{
                                        type: 'spring',
                                        stiffness: 400,
                                        damping: 35,
                                        mass: 0.6,
                                    }}
                                >
                                    <svg
                                        className={productPageStyles.locationIcon}
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    <motion.span
                                        className={productPageStyles.locationText}
                                        layout
                                        transition={{
                                            type: 'spring',
                                            stiffness: 400,
                                            damping: 35,
                                        }}
                                    >
                                        {productData.location}
                                    </motion.span>
                                </motion.div>
                            )}

                            {/* Version COMPACTE de la description */}
                            {descriptionText && !isDescriptionExpanded && (
                                <motion.div
                                    className={productPageStyles.descriptionCard}
                                    layout
                                    initial={{ 
                                        opacity: 0,
                                        borderColor: 'rgba(255, 255, 255, 0)',
                                    }}
                                    animate={{ 
                                        opacity: 1,
                                        borderColor: 'rgba(255, 255, 255, 0.12)',
                                    }}
                                    transition={{
                                        opacity: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
                                        borderColor: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
                                        layout: {
                                            type: 'spring',
                                            stiffness: 400,
                                            damping: 35,
                                            mass: 0.6,
                                        },
                                    }}
                                >
                                    <p
                                        className={`${productPageStyles.productDescription} ${productPageStyles.productDescriptionCollapsed}`}
                                    >
                                        {previewDescription}
                                        {shouldShowDescriptionToggle && (
                                            <button
                                                type="button"
                                                className={productPageStyles.descriptionToggle}
                                                onClick={() => setIsDescriptionExpanded(true)}
                                            >
                                                {tProduct('readMore')}
                                            </button>
                                        )}
                                    </p>
                                </motion.div>
                            )}
                        </div>

                        {/* OVERLAY EXPAND PAR-DESSUS L'IMAGE */}
                        <AnimatePresence>
                            {descriptionText && isDescriptionExpanded && (
                                <motion.div
                                    className={productPageStyles.descriptionOverlay}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                                >
                                    <div className={productPageStyles.descriptionOverlayInner}>
                                        {/* Localisation au-dessus du texte dans la même card */}
                                        {productData.location && (
                                            <div className={productPageStyles.locationInfoOverlay}>
                                                <svg
                                                    className={productPageStyles.locationIcon}
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                                                        fill="currentColor"
                                                    />
                                                </svg>
                                                <span className={productPageStyles.locationText}>
                                                    {productData.location}
                                                </span>
                                            </div>
                                        )}

                                        {/* Texte complet */}
                                        <p className={productPageStyles.productDescription}>
                                            {descriptionText}
                                        </p>
                                        <button
                                            type="button"
                                            className={productPageStyles.descriptionToggleBlock}
                                            onClick={() => setIsDescriptionExpanded(false)}
                                        >
                                            {tProduct('readLess')}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Colonne de droite */}
                    <motion.div
                        className={productPageStyles.rightColumn}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        {/* Prix par share en haut */}
                        <div className={productPageStyles.priceSection}>
                            {productData.pricePerShare !== undefined && (
                                <div className={productPageStyles.priceRow}>
                                    <div className={productPageStyles.priceText}>
                                        <svg
                                            className={productPageStyles.aedIcon}
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 25 30"
                                            fill="none"
                                        >
                                            <path
                                                fill="#fff"
                                                d="m24.683 13.736.195.248v-.753c0-1.656-.86-3.005-1.916-3.005h-1.689C20.091 3.576 16.066 0 10.077 0H2.162s1.084 1.23 1.084 5.106v5.124H1.249c-.388 0-.753-.203-1.054-.586L0 9.397v.752c0 1.658.86 3.005 1.916 3.005h1.33v2.923H1.25c-.389 0-.753-.202-1.054-.586L0 15.243v.752c0 1.656.86 3.003 1.916 3.003h1.33v5.349c0 3.766-1.084 4.878-1.084 4.878h7.915c6.177 0 10.075-3.602 11.21-10.23h2.342c.388 0 .753.202 1.054.585l.195.247v-.75c0-1.658-.86-3.005-1.916-3.005h-1.364a30 30 0 0 0-.001-2.923h2.032c.387 0 .753.202 1.054.586zM6.49 1.463h3.308c4.452 0 7.03 2.663 7.8 8.764l-11.108.002zm3.336 26.302H6.49v-8.768l11.101-.002c-.72 5.522-3.035 8.613-7.764 8.77m8.018-13.152q0 .75-.025 1.46l-11.33.003v-2.923l11.331-.002q.024.707.024 1.462"
                                            />
                                        </svg>
                                        {new Intl.NumberFormat('en-US', {
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 0,
                                        }).format(productData.pricePerShare)}
                                        <span> {tProduct('perShare')}</span>
                                        {productData.totalShares !== undefined && (
                                            <>
                                                <span className={productPageStyles.priceSeparator}> • </span>
                                                <span>{productData.totalShares} {tProduct('shares')}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Mots-clés juste en dessous du prix */}
                        <div className={productPageStyles.keywordsSection}>
                            <div className={productPageStyles.keywordsRow}>
                                {[
                                    productData.propertyType && {
                                        icon: (
                                            <svg
                                                className={productPageStyles.keywordIcon}
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v0M9 15v0M15 13v0"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        ),
                                        label: productData.propertyType,
                                    },
                                    productData.squareFeet && {
                                        icon: (
                                            <svg
                                                className={productPageStyles.keywordIcon}
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M3 3h18v18H3V3zM7 7h10M7 12h10M7 17h10"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                        ),
                                        label: `${productData.squareFeet} sqft`,
                                    },
                                    productData.bedrooms !== undefined && {
                                        icon: (
                                            <svg
                                                className={productPageStyles.keywordIcon}
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M3 7h18M5 7V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2m-1 0v12m-12 0V7M3 19h18"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                        ),
                                        label: `${productData.bedrooms} ${productData.bedrooms && productData.bedrooms > 1 ? tProduct('bedrooms') : tProduct('bedroom')}`,
                                    },
                                    productData.bathrooms !== undefined && {
                                        icon: (
                                            <svg
                                                className={productPageStyles.keywordIcon}
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M7 10V5a3 3 0 0 1 6 0v5m5 0H4v3a6 6 0 0 0 12 0v-3Zm-9 7v2m6-2v2"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        ),
                                        label: `${productData.bathrooms} ${productData.bathrooms && productData.bathrooms > 1 ? tProduct('bathrooms') : tProduct('bathroom')}`,
                                    },
                                ]
                                    .filter(
                                        (item): item is { icon: JSX.Element; label: string } => Boolean(item)
                                    )
                                    .map((item, index) => (
                                        <div key={`keyword-${index}`} className={productPageStyles.keywordItem}>
                                            {item.icon}
                                            <span>{item.label}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>

                        {/* Container Liquid Glass pour FEATURES & LIFESTYLE */}
                        {shouldShowLifestyleSection ? (
                            <motion.div
                                className={productPageStyles.liquidGlassContainer}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                            >
                                {/* Titre du container */}
                                <div className={productPageStyles.liquidGlassTitle}>
                                    <span className={productPageStyles.liquidGlassTitleText}>{tProduct('featuresAndLifestyle')}</span>
                                </div>

                                {/* Liste des features avec scroll contrôlé */}
                                <div className={productPageStyles.liquidGlassContent}>
                                    <div
                                        className={productPageStyles.liquidGlassScrollArea}
                                        data-lenis-prevent
                                        data-lenis-prevent-wheel
                                        data-lenis-prevent-touch
                                    >
                                        {/* FEATURES */}
                                        {featureItems.length > 0 && (
                                            <>
                                                {featureItems.map((feature, index) => (
                                                    <motion.div
                                                        key={`feature-${index}`}
                                                        className={productPageStyles.liquidGlassItem}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.4, delay: index * 0.05 }}
                                                    >
                                                        <div className={productPageStyles.liquidGlassItemContent}>
                                                            <span className={productPageStyles.liquidGlassItemTitle}>{feature}</span>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </>
                                        )}

                                        {/* LIFESTYLE */}
                                        {lifestyleEntries.length > 0 && (
                                            <>
                                                {lifestyleEntries.map((item, index) => {
                                                    const title = item.title?.trim();
                                                    const description = item.description?.trim();
                                                    if (!title) {
                                                        return null;
                                                    }
                                                    return (
                                                        <motion.div
                                                            key={`lifestyle-${index}`}
                                                            className={productPageStyles.liquidGlassItem}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{
                                                                duration: 0.4,
                                                                delay: (featureItems.length || 0) * 0.05 + index * 0.05,
                                                            }}
                                                        >
                                                            <div className={productPageStyles.liquidGlassItemContent}>
                                                                <span className={productPageStyles.liquidGlassItemTitle}>{title}</span>
                                                                {description && (
                                                                    <p className={productPageStyles.liquidGlassItemDescription}>
                                                                        {description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </>
                                        )}
                                    </div>
                                    <div className={productPageStyles.liquidGlassFade} aria-hidden="true" />
                                </div>
                            </motion.div>
                        ) : null}

                        {/* Preview des images avec parallaxe 3D */}
                        {productData.images && productData.images.length > 0 && (
                            <div className={productPageStyles.imagePreviewSection}>
                                <div className={productPageStyles.imagePreviewContainer}>
                                    {/* Wrapper des previews avec superposition */}
                                    <div className={productPageStyles.imagePreviewWrapper}>
                                        {productData.images.map((image, actualIndex) => {
                                            // Calculer la position relative par rapport à previewStartIndex
                                            // Pour créer un effet de roue infinie
                                            let relativeIndex = actualIndex - previewStartIndex;

                                            // Gérer le cas où l'index est négatif (image avant le point de départ)
                                            // Pour créer un effet de roue circulaire, on peut afficher les images "avant" aussi
                                            if (relativeIndex < 0 && productData.images) {
                                                relativeIndex = relativeIndex + productData.images.length;
                                            }

                                            const isActive = actualIndex === currentImageIndex;

                                            // Afficher les 4 images suivantes à partir de previewStartIndex
                                            // Mais aussi permettre de voir les images "avant" pour l'effet de roue
                                            const maxVisible = 4;
                                            const isVisible = relativeIndex >= 0 && relativeIndex < maxVisible;

                                            // Calcul de la position avec superposition : chaque image se décale de 60px vers la droite
                                            // et monte en z-index pour créer l'effet de superposition
                                            const translateX = relativeIndex * 60; // Superposition horizontale
                                            const translateZ = relativeIndex * -15; // Effet de profondeur 3D
                                            const scale = 1 - (relativeIndex * 0.05); // Légère réduction de taille pour les images derrière
                                            const zIndex = isActive ? 20 : (10 - relativeIndex); // Les premières images sont au-dessus

                                            // Opacité pour les images hors de la vue visible
                                            // On peut les rendre semi-transparentes pour créer l'effet de roue
                                            const opacity = isVisible ? 1 : (relativeIndex < 0 || relativeIndex >= maxVisible ? 0 : 0.3);
                                            const pointerEvents = isVisible ? 'auto' : 'none';

                                            return (
                                                <div
                                                    key={`preview-${actualIndex}`}
                                                    className={`${productPageStyles.imagePreviewItem} ${isActive ? productPageStyles.imagePreviewItemActive : ''
                                                        }`}
                                                    onClick={() => handlePreviewClick(actualIndex)}
                                                    style={{
                                                        transform: `translateX(${translateX}px) translateZ(${translateZ}px) scale(${scale})`,
                                                        zIndex: zIndex,
                                                        left: 0,
                                                        opacity: opacity,
                                                        pointerEvents: pointerEvents as any,
                                                    }}
                                                >
                                                    <Image
                                                        src={image}
                                                        alt={`${productData.title} - Preview ${actualIndex + 1}`}
                                                        fill
                                                        className={productPageStyles.imagePreviewImage}
                                                        unoptimized
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Flèches de navigation à droite avec parallaxe horizontale */}
                                    <div className={productPageStyles.previewNavButtons}>
                                        <button
                                            type="button"
                                            className={`${productPageStyles.previewNavButton} ${previewStartIndex > 0 ? productPageStyles.previewNavButtonActive : ''
                                                }`}
                                            onClick={(e) => {
                                                console.log('🟣 Button prev clicked directly');
                                                handlePreviewPrev(e);
                                            }}
                                            disabled={!productData?.images}
                                            aria-label="Previous images"
                                            style={{
                                                left: 0,
                                                top: 0,
                                                transform: 'translateX(0px) translateZ(0px)',
                                                zIndex: 201,
                                                pointerEvents: 'auto',
                                            }}
                                        >
                                            <svg
                                                className={productPageStyles.previewNavIcon}
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="22"
                                                height="11"
                                                viewBox="0 0 22 11"
                                                fill="none"
                                                style={{
                                                    transform: 'rotate(180deg)',
                                                }}
                                            >
                                                <path
                                                    fill={previewStartIndex > 0 ? '#fff' : 'rgba(255, 255, 255, 0.9)'}
                                                    d="M.691 4.397a.69.69 0 1 0 0 1.382zm20.89 1.18a.69.69 0 0 0 0-.978L17.184.202a.69.69 0 1 0-.977.977l3.909 3.909-3.909 3.908a.691.691 0 0 0 .977.977zm-20.89-.49v.692h20.402V4.397H.69z"
                                                />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            className={`${productPageStyles.previewNavButton} ${productData.images ? productPageStyles.previewNavButtonActive : ''
                                                }`}
                                            onClick={(e) => {
                                                console.log('🟠 Button next clicked directly');
                                                handlePreviewNext(e);
                                            }}
                                            disabled={!productData.images}
                                            aria-label="Next images"
                                            style={{
                                                right: 0,
                                                top: 0,
                                                left: 'auto',
                                                transform: 'translateX(8px) translateZ(-10px)',
                                                zIndex: 200,
                                                pointerEvents: 'auto',
                                            }}
                                        >
                                            <svg
                                                className={productPageStyles.previewNavIcon}
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="22"
                                                height="11"
                                                viewBox="0 0 22 11"
                                                fill="none"
                                            >
                                                <path
                                                    fill={
                                                        productData.images && previewStartIndex < productData.images.length - 4
                                                            ? '#fff'
                                                            : 'rgba(255, 255, 255, 0.9)'
                                                    }
                                                    d="M.691 4.397a.69.69 0 1 0 0 1.382zm20.89 1.18a.69.69 0 0 0 0-.978L17.184.202a.69.69 0 1 0-.977.977l3.909 3.909-3.909 3.908a.691.691 0 0 0 .977.977zm-20.89-.49v.692h20.402V4.397H.69z"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Bouton slide-to-unlock en bas */}
                        <div className={productPageStyles.slideToUnlockContainer}>
                            <div
                                ref={slideContainerRef}
                                className={productPageStyles.slideContainer}
                            >
                                {/* Effet silver animé derrière le bouton */}
                                <div
                                    className={productPageStyles.slideSilverEffect}
                                    style={{
                                        width: `${slideProgress}%`,
                                        transition: isSliding ? 'none' : 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}
                                />
                                <div
                                    ref={slideButtonRef}
                                    className={productPageStyles.slideButton}
                                    style={{
                                        transform: `translate(${slidePosition}px, -50%)`,
                                        transition: isSliding ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}
                                    onMouseDown={handleSlideStart}
                                    onTouchStart={handleSlideStart}
                                >
                                    <svg
                                        width="20"
                                        height="20"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M7.5 5L12.5 10L7.5 15"
                                            stroke="#000"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                                <span className={productPageStyles.slideText}>{tProduct('discover')}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
            
            {/* Modal de recommandation */}
            <PropertyRecommendationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                latitude={productData.latitude}
                longitude={productData.longitude}
                propertyTitle={productData.title}
                propertyLocation={productData.location}
                propertyPrice={productData.pricePerShare}
                investorCount={productData.investorCount}
                propertyType={productData.propertyType}
                squareFeet={productData.squareFeet}
                bedrooms={productData.bedrooms}
                bathrooms={productData.bathrooms}
                propertyImage={productData.images?.[0]}
                propertyId={productData.id}
                developerName={productData.developer}
                developerLogo={productData.developerLogo}
                documents={productData.documents}
                showcaseItems={productData.showcaseItems}
                availableShares={productData.sharesAvailable}
                currency="AED"
            />
        </main>
    );
}

