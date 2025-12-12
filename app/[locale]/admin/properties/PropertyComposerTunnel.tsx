'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type HTMLInputTypeAttribute,
  type InputHTMLAttributes,
} from 'react';
import type { KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Select } from '@/app/ui/select';
import { propertiesApi, type PropertyPayload, type PropertyRecord, type PropertyStatus } from '@/lib/api/properties';
import { developerBrandsApi, type DeveloperBrand } from '@/lib/api/developer-brands';
import { propertyTunnelStyles } from './propertyTunnel.styles';

type UploadedImage = { name: string; dataUrl: string };
type LifestyleFeature = { id: string; title: string; description: string };

// Liste des features prédéfinies
const PREDEFINED_FEATURES = [
  'Private Pool',
  'Private Cinema',
  'Gym',
  'Spa',
  'Sauna',
  'Rooftop Terrace',
  'Smart Home',
  'Concierge Service',
  'Valet Parking',
  'Private Beach Access',
  'Golf Course View',
  'Marina View',
  'City Skyline View',
  'Kids Play Area',
  'BBQ Area',
  'Wine Cellar',
  'Home Office',
  'Maid\'s Room',
  'Driver\'s Room',
  'Pet Friendly',
] as const;

const PROPERTY_TYPES = ['apartment', 'villa', 'townhouse', 'penthouse', 'studio', 'land', 'commercial'] as const;
type PropertyType = typeof PROPERTY_TYPES[number];
const EMIRATES = ['dubai', 'abu_dhabi', 'sharjah', 'ajman', 'umm_al_quwain', 'ras_al_khaimah', 'fujairah'] as const;
type Emirate = typeof EMIRATES[number];
const STATUS_ORDER: PropertyStatus[] = [
  'draft',
  'pending',
  'upcoming',
  'published',
  'sold',
  'rejected',
  'archived',
];

const toDatetimeLocalValue = (iso?: string | null) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

const toIsoStringFromLocal = (value: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
};

type PropertyRecordWithBrand = PropertyRecord & {
  brandDeveloper?: {
    id: string;
    name: string;
    logoUrl?: string | null;
  } | null;
};

interface PropertyComposerTunnelProps {
  mode: 'create' | 'edit';
  initialProperty?: PropertyRecordWithBrand | null;
  onCancel: () => void;
  onSuccess: () => void;
  isSuperAdmin: boolean;
}

export function PropertyComposerTunnel({
  mode,
  initialProperty,
  onCancel,
  onSuccess,
  isSuperAdmin,
}: PropertyComposerTunnelProps) {
  const t = useTranslations('adminPropertyTunnel');

  const [formState, setFormState] = useState<{
    title: string;
    description: string;
    propertyType: PropertyType;
    emirate: Emirate;
    zone: string;
    address: string;
    latitude: string;
    longitude: string;
    pricePerShare: string;
    totalShares: string;
    totalArea: string;
    bedrooms: string;
    bathrooms: string;
    mainImage: string;
    listingType: string;
    status: PropertyStatus;
    availableAt: string;
  }>({
    title: '',
    description: '',
    propertyType: 'apartment',
    emirate: 'dubai',
    zone: '',
    address: '',
    latitude: '',
    longitude: '',
    pricePerShare: '',
    totalShares: '',
    totalArea: '',
    bedrooms: '',
    bathrooms: '',
    mainImage: '',
    listingType: '',
    status: 'draft',
    availableAt: '',
  });
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [galleryUrlInput, setGalleryUrlInput] = useState('');
  const [galleryUploads, setGalleryUploads] = useState<UploadedImage[]>([]);
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);
  const [developerBrands, setDeveloperBrands] = useState<DeveloperBrand[]>([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [brandErrorMessage, setBrandErrorMessage] = useState<string | null>(null);
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandLogoUrl, setNewBrandLogoUrl] = useState('');
  const [newBrandLogoFile, setNewBrandLogoFile] = useState<string | null>(null);
  const [isSavingBrand, setIsSavingBrand] = useState(false);
  const [legacyDeveloperName, setLegacyDeveloperName] = useState('');
  const [legacyDeveloperLogo, setLegacyDeveloperLogo] = useState('');
  const [lifestyleFeatures, setLifestyleFeatures] = useState<LifestyleFeature[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const brandLogoPreview = newBrandLogoFile || newBrandLogoUrl || '';
  const sortBrands = useCallback(
    (list: DeveloperBrand[]) =>
      [...list].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })),
    [],
  );

  useEffect(() => {
    let isMounted = true;
    const loadBrands = async () => {
      try {
        setIsLoadingBrands(true);
        const list = await developerBrandsApi.list();
        if (!isMounted) return;
        setDeveloperBrands(sortBrands(list));
        setBrandErrorMessage(null);
      } catch (err: any) {
        if (!isMounted) return;
        setBrandErrorMessage(err.message || t('messages.brandLoadError'));
      } finally {
        if (isMounted) {
          setIsLoadingBrands(false);
        }
      }
    };
    loadBrands();
    return () => {
      isMounted = false;
    };
  }, [t]);

  useEffect(() => {
    if (!initialProperty?.brandDeveloper) {
      return;
    }
    setDeveloperBrands((prev) => {
      if (prev.find((brand) => brand.id === initialProperty.brandDeveloper!.id)) {
        return prev;
      }
      return sortBrands([...prev, initialProperty.brandDeveloper!]);
    });
  }, [initialProperty?.brandDeveloper, sortBrands]);

  useEffect(() => {
    if (!initialProperty) {
      setFormState((prev) => ({ ...prev, status: 'draft', availableAt: '' }));
      setGalleryUrls([]);
      setGalleryUrlInput('');
      setGalleryUploads([]);
      setMainImageUrl(null);
      setSelectedBrandId('');
      setLegacyDeveloperName('');
      setLegacyDeveloperLogo('');
      setNewBrandName('');
      setNewBrandLogoUrl('');
      setNewBrandLogoFile(null);
      setIsAddingBrand(false);
      setLifestyleFeatures([]);
      return;
    }
    const metadata = initialProperty.metadata ?? {};
    setFormState({
      title: initialProperty.title ?? '',
      description: initialProperty.description ?? '',
      propertyType: (initialProperty.propertyType as PropertyType) || 'apartment',
      emirate: (initialProperty.emirate as Emirate) || 'dubai',
      zone: initialProperty.zone ?? '',
      address: initialProperty.address ?? '',
      latitude: initialProperty.latitude !== undefined && initialProperty.latitude !== null
        ? Number(initialProperty.latitude).toString()
        : '',
      longitude: initialProperty.longitude !== undefined && initialProperty.longitude !== null
        ? Number(initialProperty.longitude).toString()
        : '',
      pricePerShare: initialProperty.pricePerShare?.toString() ?? '',
      totalShares: initialProperty.totalShares?.toString() ?? '',
      totalArea: initialProperty.totalArea?.toString() ?? '',
      bedrooms: initialProperty.bedrooms?.toString() ?? '',
      bathrooms: initialProperty.bathrooms?.toString() ?? '',
      mainImage: initialProperty.mainImage ?? '',
      listingType: initialProperty.listingType ?? '',
      status: (initialProperty.status as PropertyStatus) ?? 'draft',
      availableAt: toDatetimeLocalValue(initialProperty.availableAt),
    });

    const existingImages = initialProperty.images ?? [];
    const urlImages = existingImages.filter((img) => img.startsWith('http'));
    const fileImages = existingImages
      .filter((img) => img.startsWith('data:'))
      .map((dataUrl, idx) => ({ name: `image-${idx + 1}`, dataUrl }));
    setGalleryUrls(urlImages);
    setGalleryUrlInput('');
    setGalleryUploads(fileImages);
    // Définir l'image principale : celle de la propriété, ou la première image disponible
    const firstImage = urlImages[0] || fileImages[0]?.dataUrl || null;
    setMainImageUrl(initialProperty.mainImage || firstImage);

    setSelectedBrandId(initialProperty.brandDeveloper?.id ?? '');
    const legacyName = (metadata.developerName as string) || '';
    const legacyLogoValue = (metadata.developerLogoFile || metadata.developerLogoUrl) as string | undefined;
    const legacyLogo = typeof legacyLogoValue === 'string' ? legacyLogoValue : '';
    setLegacyDeveloperName(legacyName);
    setLegacyDeveloperLogo(legacyLogo);
    if (!initialProperty.brandDeveloper?.id) {
      setNewBrandName(legacyName || '');
      if (legacyLogo) {
        if (typeof legacyLogo === 'string' && legacyLogo.startsWith('data:')) {
          setNewBrandLogoFile(legacyLogo);
          setNewBrandLogoUrl('');
        } else if (typeof legacyLogo === 'string') {
          setNewBrandLogoUrl(legacyLogo);
          setNewBrandLogoFile(null);
        } else {
          setNewBrandLogoFile(null);
          setNewBrandLogoUrl('');
        }
      } else {
        setNewBrandLogoFile(null);
        setNewBrandLogoUrl('');
      }
    } else {
      setNewBrandName('');
      setNewBrandLogoUrl('');
      setNewBrandLogoFile(null);
    }
    
    // Charger les lifestyle features depuis metadata
    const features = metadata.lifestyleFeatures || [];
    if (Array.isArray(features) && features.length > 0) {
      setLifestyleFeatures(
        features.map((f: any) => ({
          id: f.id || crypto.randomUUID(),
          title: f.title || '',
          description: f.description || '',
        }))
      );
    } else {
      setLifestyleFeatures([]);
    }
  }, [initialProperty]);

  const handleChange = (field: keyof typeof formState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleGalleryFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const uploads = await Promise.all(
      Array.from(files).map(
        (file) =>
          new Promise<UploadedImage>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ name: file.name, dataUrl: reader.result as string });
            reader.onerror = reject;
            reader.readAsDataURL(file);
          }),
      ),
    );
    setGalleryUploads((prev) => [...prev, ...uploads]);
  };

  const removeGalleryUpload = (name: string) => {
    setGalleryUploads((prev) => prev.filter((item) => item.name !== name));
  };

  const handleBrandLogoFile = async (files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setNewBrandLogoFile(reader.result as string);
      setNewBrandLogoUrl('');
    };
    reader.readAsDataURL(file);
  };

  const combinedImages = useMemo(() => [...galleryUrls, ...galleryUploads.map((img) => img.dataUrl)], [galleryUrls, galleryUploads]);

  useEffect(() => {
    setMainImageUrl((current) => {
      if (!combinedImages.length) {
        return null;
      }
      if (current && combinedImages.includes(current)) {
        return current;
      }
      return combinedImages[0];
    });
  }, [combinedImages]);

  const handleAddGalleryUrl = () => {
    const trimmed = galleryUrlInput.trim();
    if (!trimmed) return;
    try {
      const url = new URL(trimmed);
      setGalleryUrls((prev) => (prev.includes(url.href) ? prev : [...prev, url.href]));
      setGalleryUrlInput('');
      setError(null);
      setSuccess(null);
    } catch {
      setError(t('messages.invalidUrl'));
    }
  };

  const handleGalleryUrlKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddGalleryUrl();
    }
  };

  const handleRemoveGalleryUrl = (url: string) => {
    setGalleryUrls((prev) => prev.filter((entry) => entry !== url));
  };

  // Vérifie si une feature prédéfinie est sélectionnée
  const isFeatureSelected = (title: string) => {
    return lifestyleFeatures.some((f) => f.title === title);
  };

  // Ajouter une feature prédéfinie (avec titre pré-rempli)
  const handleAddPredefinedFeature = (title: string) => {
    if (!isFeatureSelected(title)) {
      setLifestyleFeatures((prev) => [
        ...prev,
        { id: crypto.randomUUID(), title, description: '' },
      ]);
    }
  };

  // Ajouter une feature personnalisée vide
  const handleAddCustomFeature = () => {
    setLifestyleFeatures((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: '', description: '' },
    ]);
  };

  // Mettre à jour une feature
  const handleUpdateFeature = (id: string, field: 'title' | 'description', value: string) => {
    setLifestyleFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  // Supprimer une feature
  const handleRemoveFeature = (id: string) => {
    setLifestyleFeatures((prev) => prev.filter((f) => f.id !== id));
  };

  const handleCreateBrand = async () => {
    if (!newBrandName.trim()) {
      setBrandErrorMessage(t('messages.brandNameRequired'));
      return;
    }
    const payload = {
      name: newBrandName.trim(),
      logoUrl: newBrandLogoFile || newBrandLogoUrl || undefined,
    };
    try {
      setIsSavingBrand(true);
      const brand = await developerBrandsApi.create(payload);
      setDeveloperBrands((prev) => sortBrands([...prev, brand]));
      setSelectedBrandId(brand.id);
      setIsAddingBrand(false);
      setNewBrandName('');
      setNewBrandLogoUrl('');
      setNewBrandLogoFile(null);
      setBrandErrorMessage(null);
    } catch (err: any) {
      setBrandErrorMessage(err.message || t('messages.brandCreateError'));
    } finally {
      setIsSavingBrand(false);
    }
  };

  const handleSubmit = async () => {
    if (!formState.title.trim() || !formState.description.trim()) {
      setError(t('messages.required'));
      return;
    }

    const price = Number(formState.pricePerShare);
    const shares = Number(formState.totalShares);
    const area = Number(formState.totalArea);
    if (Number.isNaN(price) || Number.isNaN(shares) || Number.isNaN(area)) {
      setError(t('messages.numberError'));
      return;
    }

    const availableAtIso = toIsoStringFromLocal(formState.availableAt);
    if (formState.availableAt && !availableAtIso) {
      setError(t('messages.dateError'));
      return;
    }

    if (!selectedBrandId) {
      setError(t('messages.brandRequired'));
      return;
    }

    const latitudeValue = formState.latitude.trim();
    const longitudeValue = formState.longitude.trim();

    if (!latitudeValue || !longitudeValue) {
      setError(t('messages.coordinatesRequired'));
      return;
    }

    const latitude = Number(latitudeValue);
    const longitude = Number(longitudeValue);

    if (
      Number.isNaN(latitude) ||
      Number.isNaN(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      setError(t('messages.coordinatesInvalid'));
      return;
    }

    const payload: PropertyPayload = {
      title: formState.title.trim(),
      description: formState.description.trim(),
      propertyType: formState.propertyType,
      emirate: formState.emirate,
      zone: formState.zone.trim(),
      address: formState.address.trim() || undefined,
      latitude,
      longitude,
      pricePerShare: price,
      totalShares: shares,
      totalArea: area,
      bedrooms: formState.bedrooms ? Number(formState.bedrooms) : undefined,
      bathrooms: formState.bathrooms ? Number(formState.bathrooms) : undefined,
      mainImage: mainImageUrl || undefined,
      listingType: formState.listingType || undefined,
      brandDeveloperId: selectedBrandId,
    };

    if (combinedImages.length) {
      payload.images = combinedImages;
    }


    if (availableAtIso) {
      payload.availableAt = availableAtIso;
    } else if (mode === 'edit' && initialProperty?.availableAt) {
      payload.availableAt = null;
    }

    const metadata: Record<string, any> = initialProperty?.metadata ? { ...initialProperty.metadata } : {};
    delete metadata.developerName;
    delete metadata.developerLogoUrl;
    delete metadata.developerLogoFile;

    // Ajouter les lifestyle features dans metadata
    const validFeatures = lifestyleFeatures.filter((f) => f.title.trim() && f.description.trim());
    if (validFeatures.length > 0) {
      metadata.lifestyleFeatures = validFeatures.map((f) => ({
        id: f.id,
        title: f.title.trim(),
        description: f.description.trim(),
      }));
    } else {
      delete metadata.lifestyleFeatures;
    }

    if (metadata.developerName === undefined) delete metadata.developerName;
    if (metadata.developerLogoUrl === undefined) delete metadata.developerLogoUrl;
    if (metadata.developerLogoFile === undefined) delete metadata.developerLogoFile;

    if (Object.keys(metadata).length) {
      payload.metadata = metadata;
    } else if (initialProperty?.metadata) {
      payload.metadata = {};
    }

    if (mode === 'edit' && formState.status) {
      payload.status = formState.status;
    }

    try {
      setError(null);
      setSuccess(null);
      setIsSaving(true);
      if (mode === 'create') {
        await propertiesApi.create(payload);
      } else if (initialProperty) {
        await propertiesApi.update(initialProperty.id, payload);
      }
      setSuccess(t('messages.success'));
      onSuccess();
    } catch (err: any) {
      setError(err.message || t('messages.error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className={propertyTunnelStyles.container}>
      <div className={propertyTunnelStyles.inner}>
        <div className={propertyTunnelStyles.topBar}>
          <button type="button" className={propertyTunnelStyles.backButton} onClick={onCancel}>
           {t('actions.back')}
          </button>
        </div>

        <section className={propertyTunnelStyles.hero}>
          <div>
            <h1 className={propertyTunnelStyles.heroTitle}>
              {mode === 'create' ? t('title') : t('titleEdit')}
            </h1>
            <p className={propertyTunnelStyles.heroSubtitle}>
              {mode === 'create' ? t('subtitle') : t('subtitleEdit')}
            </p>
          </div>
          <div className={propertyTunnelStyles.stepsRow}>
            {['steps.identity', 'steps.financials', 'steps.media', 'steps.developer', 'steps.status'].map((key, index) => (
              <span
                key={key}
                className={[
                  propertyTunnelStyles.step,
                  index <= 2 ? propertyTunnelStyles.stepActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className={propertyTunnelStyles.stepDot} />
                {t(key as any)}
              </span>
            ))}
          </div>
        </section>

        <div className={propertyTunnelStyles.bentoGrid}>
          <section className={propertyTunnelStyles.formSection}>
            <div className={propertyTunnelStyles.sectionHeader}>
              <span className={propertyTunnelStyles.sectionTitle}>{t('sections.media')}</span>
              <p className={propertyTunnelStyles.sectionSubtitle}>{t('uploads.galleryHint')}</p>
            </div>

            <div className={propertyTunnelStyles.formGrid}>
              <div className={`${propertyTunnelStyles.fieldWrapper} ${propertyTunnelStyles.mediaField}`}>
                <span className={propertyTunnelStyles.fieldLabel}>{t('fields.galleryUrls')}</span>
                <div className={propertyTunnelStyles.mediaFieldBody}>
                  <div className={propertyTunnelStyles.urlInputRow}>
                    <input
                      className={propertyTunnelStyles.input}
                      placeholder="https://example…"
                      value={galleryUrlInput}
                      onChange={(e) => setGalleryUrlInput(e.target.value)}
                      onKeyDown={handleGalleryUrlKeyDown}
                    />
                    <button
                      type="button"
                      className={propertyTunnelStyles.addUrlButton}
                      onClick={handleAddGalleryUrl}
                      disabled={!galleryUrlInput.trim()}
                    >
                      {t('uploads.add')}
                    </button>
                  </div>
                </div>
                <span className={propertyTunnelStyles.fieldHint}>{t('uploads.urlHint')}</span>
              </div>
              <div className={`${propertyTunnelStyles.fieldWrapper} ${propertyTunnelStyles.mediaField}`}>
                <span className={propertyTunnelStyles.fieldLabel}>{t('fields.galleryFiles')}</span>
                <div className={propertyTunnelStyles.mediaFieldBody}>
                  <label className={propertyTunnelStyles.fileUploadBox}>
                    <span style={{ fontSize: '1.8rem', opacity: 0.6 }}>📁</span>
                    <span>{t('uploads.galleryDrop')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className={propertyTunnelStyles.fileInput}
                      onChange={(e) => {
                        handleGalleryFiles(e.target.files);
                        if (e.target) {
                          const inputEl = e.target as HTMLInputElement;
                          inputEl.value = '';
                        }
                      }}
                    />
                  </label>
                </div>
                <span className={propertyTunnelStyles.fieldHint}>{t('uploads.multipleHint')}</span>
              </div>
            </div>

            {combinedImages.length > 0 && (
              <div className={propertyTunnelStyles.galleryPreviewWrapper}>
                <motion.div className={propertyTunnelStyles.galleryPreview} layout>
                  <AnimatePresence mode="popLayout">
                    {galleryUrls.map((url) => (
                      <GalleryUrlCard
                        key={url}
                        url={url}
                        isMain={mainImageUrl === url}
                        onSetMain={() => setMainImageUrl(url)}
                        onRemove={() => {
                          if (mainImageUrl === url) {
                            setMainImageUrl(null);
                          }
                          handleRemoveGalleryUrl(url);
                        }}
                      />
                    ))}
                    {galleryUploads.map((img) => (
                      <motion.div
                        key={img.name}
                        className={propertyTunnelStyles.galleryCard}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                      >
                        <img src={img.dataUrl} alt={img.name} className={propertyTunnelStyles.galleryImage} />
                        <span className={propertyTunnelStyles.galleryMeta}>{img.name}</span>
                        {mainImageUrl === img.dataUrl ? (
                          <div className={propertyTunnelStyles.mainImageBadge}>
                            <span className={propertyTunnelStyles.mainImageBadgeDot} />
                            <span className={propertyTunnelStyles.mainImageBadgeText}>{t('uploads.mainImage')}</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className={propertyTunnelStyles.mainImageBadgeCompact}
                            onClick={() => setMainImageUrl(img.dataUrl)}
                            title={t('uploads.setAsMain')}
                          >
                            <span className={propertyTunnelStyles.mainImageBadgeDot} />
                          </button>
                        )}
                        <button type="button" className={propertyTunnelStyles.removeButton} onClick={() => {
                          if (mainImageUrl === img.dataUrl) {
                            setMainImageUrl(null);
                          }
                          removeGalleryUpload(img.name);
                        }}>
                          ×
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}
          </section>

          <section className={propertyTunnelStyles.formSection}>
            <div className={propertyTunnelStyles.sectionHeader}>
              <span className={propertyTunnelStyles.sectionTitle}>{t('sections.identity')}</span>
              <p className={propertyTunnelStyles.sectionSubtitle}>{t('sections.identitySubtitle')}</p>
            </div>
            <div className={propertyTunnelStyles.formGrid}>
              <FieldInput label={t('fields.title')} value={formState.title} onChange={(value) => handleChange('title', value)} />
              <FieldInput label={t('fields.zone')} value={formState.zone} onChange={(value) => handleChange('zone', value)} />
              <FieldTextarea
                label={t('fields.description')}
                value={formState.description}
                onChange={(value) => handleChange('description', value)}
                colSpan
              />
              <FieldSelect
                label={t('fields.propertyType')}
                value={formState.propertyType}
                onChange={(value) => handleChange('propertyType', value)}
                options={PROPERTY_TYPES.map((type) => ({ value: type, label: t(`propertyTypes.${type}`) }))}
              />
              <FieldSelect
                label={t('fields.emirate')}
                value={formState.emirate}
                onChange={(value) => handleChange('emirate', value)}
                options={EMIRATES.map((emirate) => ({ value: emirate, label: t(`emirates.${emirate}`) }))}
              />
              <FieldInput label={t('fields.address')} value={formState.address} onChange={(value) => handleChange('address', value)} colSpan />
              <FieldInput
                label={t('fields.latitude')}
                value={formState.latitude}
                onChange={(value) => handleChange('latitude', value)}
                placeholder="25.2048"
                type="number"
                inputMode="decimal"
                step="0.0000001"
                hint={t('fields.latitudeHint')}
              />
              <FieldInput
                label={t('fields.longitude')}
                value={formState.longitude}
                onChange={(value) => handleChange('longitude', value)}
                placeholder="55.2708"
                type="number"
                inputMode="decimal"
                step="0.0000001"
                hint={t('fields.longitudeHint')}
              />
            </div>
          </section>
        </div>

        <section className={propertyTunnelStyles.formSection}>
          <div className={propertyTunnelStyles.sectionHeader}>
            <span className={propertyTunnelStyles.sectionTitle}>{t('sections.financials')}</span>
          </div>
          <div className={propertyTunnelStyles.formGrid}>
            <FieldInput label={t('fields.pricePerShare')} value={formState.pricePerShare} onChange={(value) => handleChange('pricePerShare', value)} />
            <FieldInput label={t('fields.totalShares')} value={formState.totalShares} onChange={(value) => handleChange('totalShares', value)} />
            <FieldInput label={t('fields.totalArea')} value={formState.totalArea} onChange={(value) => handleChange('totalArea', value)} />
            <FieldInput label={t('fields.bedrooms')} value={formState.bedrooms} onChange={(value) => handleChange('bedrooms', value)} />
            <FieldInput label={t('fields.bathrooms')} value={formState.bathrooms} onChange={(value) => handleChange('bathrooms', value)} />
            <FieldInput label={t('fields.listingType')} value={formState.listingType} onChange={(value) => handleChange('listingType', value)} />
          </div>
        </section>

        <section className={propertyTunnelStyles.formSection}>
          <div className={propertyTunnelStyles.sectionHeader}>
            <span className={propertyTunnelStyles.sectionTitle}>{t('sections.lifestyleFeatures')}</span>
            <p className={propertyTunnelStyles.sectionSubtitle}>{t('sections.lifestyleFeaturesSubtitle')}</p>
          </div>
          
          {/* Grille de features prédéfinies - cliquer pour ajouter */}
          <div className={propertyTunnelStyles.predefinedFeaturesGrid}>
            {PREDEFINED_FEATURES.map((featureTitle) => {
              const isSelected = isFeatureSelected(featureTitle);
              return (
                <button
                  key={featureTitle}
                  type="button"
                  onClick={() => handleAddPredefinedFeature(featureTitle)}
                  disabled={isSelected}
                  className={
                    isSelected
                      ? propertyTunnelStyles.featureBoxDisabled
                      : propertyTunnelStyles.featureBox
                  }
                >
                  <span className={propertyTunnelStyles.featureBoxIcon}>
                    {isSelected ? '✓' : '+'}
                  </span>
                  <span className={propertyTunnelStyles.featureBoxTitle}>{featureTitle}</span>
                </button>
              );
            })}
          </div>

          {/* Liste des features ajoutées (avec titre et description) */}
          {lifestyleFeatures.length > 0 && (
            <div className={propertyTunnelStyles.customFeaturesContainer}>
              <p className={propertyTunnelStyles.customFeaturesLabel}>
                Added features ({lifestyleFeatures.length})
              </p>
              {lifestyleFeatures.map((feature) => (
                <div key={feature.id} className={propertyTunnelStyles.customFeatureCard}>
                  <div className={propertyTunnelStyles.customFeatureHeader}>
                    <input
                      type="text"
                      className={propertyTunnelStyles.customFeatureInput}
                      placeholder={t('fields.featureTitle')}
                      value={feature.title}
                      onChange={(e) => handleUpdateFeature(feature.id, 'title', e.target.value)}
                    />
                    <button
                      type="button"
                      className={propertyTunnelStyles.removeFeatureButton}
                      onClick={() => handleRemoveFeature(feature.id)}
                      title={t('actions.removeFeature')}
                    >
                      ×
                    </button>
                  </div>
                  <textarea
                    className={propertyTunnelStyles.customFeatureTextarea}
                    placeholder={t('fields.featureDescription')}
                    value={feature.description}
                    onChange={(e) => handleUpdateFeature(feature.id, 'description', e.target.value)}
                    rows={2}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Bouton pour ajouter une feature personnalisée */}
          <button
            type="button"
            className={propertyTunnelStyles.addFeatureButton}
            onClick={handleAddCustomFeature}
          >
            + {t('actions.addFeature')}
          </button>
        </section>

        <section className={propertyTunnelStyles.formSection}>
          <div className={propertyTunnelStyles.sectionHeader}>
            <span className={propertyTunnelStyles.sectionTitle}>{t('sections.developer')}</span>
            <p className={propertyTunnelStyles.sectionSubtitle}>{t('sections.developerSubtitle')}</p>
          </div>

          <div className={propertyTunnelStyles.formGrid}>
            <FieldSelect
              label={t('fields.developerBrand')}
              value={selectedBrandId}
              onChange={setSelectedBrandId}
              options={developerBrands.map((brand) => ({
                value: brand.id,
                label: brand.name,
              }))}
              placeholder={
                isLoadingBrands
                  ? t('messages.loading')
                  : t('fields.developerBrandPlaceholder')
              }
              disabled={isLoadingBrands || developerBrands.length === 0}
            />
            <div className={propertyTunnelStyles.developerActions}>
              <button
                type="button"
                className={propertyTunnelStyles.secondaryButton}
                onClick={() => setIsAddingBrand((prev) => !prev)}
              >
                {isAddingBrand ? t('actions.cancelAddDeveloper') : t('actions.addDeveloper')}
              </button>
              {brandErrorMessage && (
                <p className={propertyTunnelStyles.feedbackError}>{brandErrorMessage}</p>
              )}
              {!isLoadingBrands && developerBrands.length === 0 && (
                <p className={propertyTunnelStyles.feedbackInfo}>{t('messages.noDevelopers')}</p>
              )}
            </div>
          </div>

          {isAddingBrand && (
            <div className={propertyTunnelStyles.developerCreateCard}>
              <FieldInput
                label={t('fields.newDeveloperName')}
                value={newBrandName}
                onChange={setNewBrandName}
              />
              <FieldInput
                label={t('fields.developerLogoUrl')}
                value={newBrandLogoUrl}
                onChange={(value) => {
                  setNewBrandLogoUrl(value);
                  if (value) {
                    setNewBrandLogoFile(null);
                  }
                }}
              />
              <div className={propertyTunnelStyles.fieldWrapper}>
                <span className={propertyTunnelStyles.fieldLabel}>{t('fields.developerLogoFile')}</span>
                <label className={propertyTunnelStyles.fileUploadBox}>
                  {t('uploads.logoHint')}
                  <input
                    type="file"
                    accept="image/*"
                    className={propertyTunnelStyles.fileInput}
                    onChange={(e) => handleBrandLogoFile(e.target.files)}
                  />
                </label>
              </div>
              {brandLogoPreview ? (
                <img
                  src={brandLogoPreview}
                  alt="Developer logo preview"
                  className={propertyTunnelStyles.logoPreview}
                />
              ) : null}
              <div className={propertyTunnelStyles.developerCreateActions}>
                <button
                  type="button"
                  className={propertyTunnelStyles.primaryButton}
                  onClick={handleCreateBrand}
                  disabled={isSavingBrand}
                >
                  {isSavingBrand ? t('actions.saving') : t('actions.createDeveloper')}
                </button>
              </div>
            </div>
          )}

          {legacyDeveloperName && !selectedBrandId && (
            <p className={propertyTunnelStyles.legacyDeveloperNotice}>
              {t('messages.legacyDeveloperNotice', { name: legacyDeveloperName })}
            </p>
          )}
          {legacyDeveloperLogo && !selectedBrandId && (
            <img src={legacyDeveloperLogo} alt="Legacy developer logo" className={propertyTunnelStyles.logoPreview} />
          )}
        </section>

        <section className={propertyTunnelStyles.formSection}>
          <div className={propertyTunnelStyles.sectionHeader}>
            <span className={propertyTunnelStyles.sectionTitle}>{t('sections.status')}</span>
          </div>
          {mode === 'edit' ? (
            <FieldSelect
              label={t('fields.status')}
              value={formState.status}
              onChange={(value) => handleChange('status', value as PropertyStatus)}
              options={STATUS_ORDER.map((value) => ({
                value,
                label: t(`statuses.${value}`),
              }))}
            />
          ) : (
            <p className={propertyTunnelStyles.sectionSubtitle}>{t('sections.statusHint')}</p>
          )}
          <div className={propertyTunnelStyles.fieldWrapper} style={{ gridColumn: '1 / -1' }}>
            <span className={propertyTunnelStyles.fieldLabel}>{t('fields.availableAt')}</span>
            <input
              type="datetime-local"
              className={propertyTunnelStyles.input}
              value={formState.availableAt}
              onChange={(event) => handleChange('availableAt', event.target.value)}
            />
            <span className={propertyTunnelStyles.fieldHint}>{t('fields.availableAtHint')}</span>
          </div>
        </section>

        {error && <p className={propertyTunnelStyles.feedbackError}>{error}</p>}
        {success && <p className={propertyTunnelStyles.feedbackSuccess}>{success}</p>}

        <div className={propertyTunnelStyles.actionsRow}>
          <button type="button" className={propertyTunnelStyles.secondaryButton} onClick={onCancel}>
            {t('actions.cancel')}
          </button>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className={propertyTunnelStyles.primaryButton} onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? t('actions.saving') : t('actions.save')}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

interface FieldInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  colSpan?: boolean;
  placeholder?: string;
  type?: HTMLInputTypeAttribute;
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode'];
  step?: string;
  hint?: string;
}

function FieldInput({
  label,
  value,
  onChange,
  colSpan,
  placeholder,
  type = 'text',
  inputMode,
  step,
  hint,
}: FieldInputProps) {
  return (
    <label className={propertyTunnelStyles.fieldWrapper} style={colSpan ? { gridColumn: '1 / -1' } : undefined}>
      <span className={propertyTunnelStyles.fieldLabel}>{label}</span>
      <input
        className={propertyTunnelStyles.input}
        type={type}
        inputMode={inputMode}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {hint ? <span className={propertyTunnelStyles.fieldHint}>{hint}</span> : null}
    </label>
  );
}

function FieldTextarea({ label, value, onChange, colSpan, placeholder }: FieldInputProps) {
  return (
    <label className={propertyTunnelStyles.fieldWrapper} style={colSpan ? { gridColumn: '1 / -1' } : undefined}>
      <span className={propertyTunnelStyles.fieldLabel}>{label}</span>
      <textarea
        className={propertyTunnelStyles.textarea}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

interface FieldSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  colSpan?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

function FieldSelect({ label, value, onChange, options, colSpan, placeholder, disabled }: FieldSelectProps) {
  return (
    <label className={propertyTunnelStyles.fieldWrapper} style={colSpan ? { gridColumn: '1 / -1' } : undefined}>
      <span className={propertyTunnelStyles.fieldLabel}>{label}</span>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        options={options}
        placeholder={placeholder}
        disabled={disabled}
        variant="compact"
      />
    </label>
  );
}

interface GalleryUrlCardProps {
  url: string;
  isMain?: boolean;
  onSetMain: () => void;
  onRemove: () => void;
}

function GalleryUrlCard({ url, isMain, onSetMain, onRemove }: GalleryUrlCardProps) {
  const t = useTranslations('adminPropertyTunnel');
  const [imgLoaded, setImgLoaded] = useState(true);
  const [imgError, setImgError] = useState(false);

  const displayUrl = url.length > 35 ? `${url.slice(0, 32)}...` : url;

  return (
    <motion.div
      className={propertyTunnelStyles.galleryUrlCard}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.2 }}
    >
      {imgLoaded && !imgError ? (
        <img
          src={url}
          alt="Gallery"
          className={propertyTunnelStyles.galleryUrlImage}
          onError={() => {
            setImgError(true);
            setImgLoaded(false);
          }}
        />
      ) : (
        <div className={propertyTunnelStyles.galleryUrlFallback}>
          <span className={propertyTunnelStyles.galleryUrlIcon}>🔗</span>
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', wordBreak: 'break-all' }}>
            {displayUrl}
          </span>
        </div>
      )}
      <span className={propertyTunnelStyles.galleryMeta}>{displayUrl}</span>
      {isMain ? (
        <div className={propertyTunnelStyles.mainImageBadge}>
          <span className={propertyTunnelStyles.mainImageBadgeDot} />
          <span className={propertyTunnelStyles.mainImageBadgeText}>{t('uploads.mainImage')}</span>
        </div>
      ) : (
        <button
          type="button"
          className={propertyTunnelStyles.mainImageBadgeCompact}
          onClick={onSetMain}
          title={t('uploads.setAsMain')}
        >
          <span className={propertyTunnelStyles.mainImageBadgeDot} />
        </button>
      )}
      <button type="button" className={propertyTunnelStyles.removeButton} onClick={onRemove}>
        ×
      </button>
    </motion.div>
  );
}

