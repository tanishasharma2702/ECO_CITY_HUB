import React, { useState, useEffect } from 'react';
import { getSignedMediaUrl } from '../services/storageService';
import { Loader2 } from 'lucide-react';

/**
 * SecureMediaViewer
 * Renders media from private Supabase Storage buckets (civic-media, plant-media)
 * by dynamically resolving signed URLs with expiring cryptographic access tokens.
 * Gracefully renders data URLs, local blobs, and public URLs without delay.
 */
export default function SecureMediaViewer({
  bucket = 'civic-media',
  src = '',
  alt = 'Media evidence',
  className = 'w-full h-full object-cover',
  isVideo = false,
  controls = true
}) {
  const [mediaUrl, setMediaUrl] = useState(src);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function resolveUrl() {
      if (!src) {
        setMediaUrl(null);
        return;
      }

      // Fast-path: local base64, webcam blob, or existing signed token
      if (
        src.startsWith('data:') ||
        src.startsWith('blob:') ||
        (src.startsWith('http') && src.includes('token='))
      ) {
        setMediaUrl(src);
        return;
      }

      setLoading(true);
      const signed = await getSignedMediaUrl(bucket, src, 3600);
      if (active) {
        setMediaUrl(signed);
        setLoading(false);
      }
    }

    resolveUrl();

    return () => {
      active = false;
    };
  }, [bucket, src]);

  if (!src) return null;

  const isVideoCheck = isVideo || 
    (typeof src === 'string' && (src.startsWith('data:video') || /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(src))) ||
    (typeof mediaUrl === 'string' && (mediaUrl.startsWith('data:video') || /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(mediaUrl)));

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-stone-100 dark:bg-stone-800 ${className}`}>
        <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
      </div>
    );
  }

  if (isVideoCheck) {
    return (
      <video
        src={mediaUrl}
        controls={controls}
        className={className}
      />
    );
  }

  return (
    <img
      src={mediaUrl}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
}
