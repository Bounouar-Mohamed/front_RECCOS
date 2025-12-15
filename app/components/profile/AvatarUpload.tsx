'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { avatarUploadStyles } from './avatarUpload.styles';

interface AvatarUploadProps {
  value?: string | null;
  fallbackName?: string | null;
  isUploading?: boolean;
  onFileSelected: (file: File) => void;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function AvatarUpload({ value, fallbackName, isUploading = false, onFileSelected }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initials = useMemo(() => {
    if (!fallbackName) return '👤';
    const [first = '', second = ''] = fallbackName.split(' ');
    return `${first.charAt(0) || ''}${second.charAt(0) || ''}`.toUpperCase() || '👤';
  }, [fallbackName]);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        setError('Formats acceptés: JPG, PNG, WEBP');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('La taille maximale est de 5 Mo');
        return;
      }

      setError(null);
      const objectUrl = URL.createObjectURL(file);
      setLocalPreview(objectUrl);
      onFileSelected(file);
    },
    [onFileSelected],
  );

  const openFilePicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const displayedImage = localPreview || value || null;

  return (
    <div className={avatarUploadStyles.container}>
      <div className={avatarUploadStyles.previewWrapper}>
        {displayedImage ? (
          <Image
            src={displayedImage}
            alt="Avatar"
            width={160}
            height={160}
            className={avatarUploadStyles.previewImage}
          />
        ) : (
          <span className={avatarUploadStyles.placeholderInitials}>{initials}</span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className={avatarUploadStyles.fileInput}
        onChange={handleFileChange}
      />

      <button
        type="button"
        onClick={openFilePicker}
        className={avatarUploadStyles.uploadButton}
        disabled={isUploading}
      >
        {isUploading ? 'Téléchargement...' : 'Mettre à jour'}
      </button>

      <p className={avatarUploadStyles.helperText}>
        {error ?? 'PNG, JPG ou WEBP — 5 Mo max.'}
      </p>
    </div>
  );
}
