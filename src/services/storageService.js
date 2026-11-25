// Supabase Storage Service for EcoCity Hub
// Enforces user-isolated folder paths (<user_id>/<filename>), MIME type checks,
// size limits, and signed URL retrieval for private buckets (civic-media, plant-media).

import { supabase, isSupabaseConfigured } from './supabase';

const BUCKET_LIMITS = {
  avatars: {
    maxBytes: 5 * 1024 * 1024, // 5MB
    allowedMimes: ['image/jpeg', 'image/png', 'image/webp'],
    isPublic: true
  },
  'civic-media': {
    maxBytes: 25 * 1024 * 1024, // 25MB
    allowedMimes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/quicktime'
    ],
    isPublic: false
  },
  'plant-media': {
    maxBytes: 25 * 1024 * 1024, // 25MB
    allowedMimes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/quicktime'
    ],
    isPublic: false
  }
};

/**
 * Uploads a file to a user-scoped folder: <user_id>/<filename>
 */
export async function uploadUserMedia({ bucket, userId, file, customName = null }) {
  if (!userId) {
    throw new Error('User authentication is required for media upload.');
  }

  const bucketConfig = BUCKET_LIMITS[bucket] || BUCKET_LIMITS['civic-media'];

  // Check file size limit
  if (file.size && file.size > bucketConfig.maxBytes) {
    const maxMb = Math.round(bucketConfig.maxBytes / (1024 * 1024));
    throw new Error(`File size exceeds maximum allowed limit (${maxMb}MB).`);
  }

  // Check MIME type
  if (file.type && !bucketConfig.allowedMimes.includes(file.type)) {
    throw new Error(`Unsupported file type (${file.type}). Please select a standard image or video.`);
  }

  // Format safe filename
  const extension = file.name ? file.name.split('.').pop().toLowerCase() : (file.type?.includes('video') ? 'mp4' : 'jpg');
  const baseName = customName ? customName.replace(/[^a-zA-Z0-9_-]/g, '_') : Date.now().toString();
  const filePath = `${userId}/${baseName}.${extension}`;

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    // Retrieve URL based on bucket visibility
    if (bucketConfig.isPublic) {
      const { data: pubData } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return {
        path: filePath,
        url: pubData?.publicUrl || filePath,
        isPublic: true
      };
    }

    // For private buckets, generate a secure signed URL (1 hour expiry)
    const { data: signedData, error: signErr } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 3600);

    if (signErr) throw signErr;

    return {
      path: filePath,
      url: signedData?.signedUrl || filePath,
      isPublic: false
    };
  } catch (err) {
    console.error(`Storage upload error [${bucket}]:`, err);
    throw err;
  }
}

/**
 * Resolves an authenticated signed URL for a private storage asset,
 * or returns public / data URLs directly.
 */
export async function getSignedMediaUrl(bucket, pathOrUrl, expiresIn = 3600) {
  if (!pathOrUrl) return null;

  // Immediate passthrough for data URLs, local blobs, or built-in SVG avatars
  if (
    pathOrUrl.startsWith('data:') ||
    pathOrUrl.startsWith('blob:') ||
    pathOrUrl.startsWith('http://localhost')
  ) {
    return pathOrUrl;
  }

  // If it's already an external HTTP URL with a signed token
  if (pathOrUrl.startsWith('http') && pathOrUrl.includes('token=')) {
    return pathOrUrl;
  }

  // If it's the public avatars bucket, get public URL
  if (bucket === 'avatars') {
    if (pathOrUrl.startsWith('http')) return pathOrUrl;
    const { data } = supabase.storage.from('avatars').getPublicUrl(pathOrUrl);
    return data?.publicUrl || pathOrUrl;
  }

  // For private buckets (civic-media, plant-media), extract clean storage path
  let storagePath = pathOrUrl;
  if (pathOrUrl.includes(`/storage/v1/object/`)) {
    // Extract path after bucket name
    const parts = pathOrUrl.split(`/${bucket}/`);
    if (parts[1]) {
      storagePath = parts[1].split('?')[0];
    }
  }

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(storagePath, expiresIn);

    if (!error && data?.signedUrl) {
      return data.signedUrl;
    }
  } catch (err) {
    console.warn(`Could not create signed URL for ${storagePath}:`, err);
  }

  return pathOrUrl;
}
