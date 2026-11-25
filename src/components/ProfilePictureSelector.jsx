import React, { useState, useRef, useEffect } from 'react';
import { BUILT_IN_AVATARS, getAvatarDataUrl } from '../data/avatars';
import {
  Camera,
  Upload,
  Smile,
  X,
  Check,
  RotateCcw,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ProfilePictureSelector({
  value = '',
  onChange = () => {},
  className = ''
}) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('avatar'); // 'upload' | 'camera' | 'avatar'
  const [selectedAvatarId, setSelectedAvatarId] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [currentPreview, setCurrentPreview] = useState(value || '');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setCurrentPreview(value || '');
  }, [value]);

  // Clean up camera stream on unmount or tab switch
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(t('profile.cameraNotSupported', 'Camera access is not supported on this browser.'));
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: 'user' },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.warn('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError(t('profile.cameraDenied', 'Camera permission was denied. Please allow camera access in browser settings.'));
      } else {
        setCameraError(t('profile.cameraError', 'Could not open camera. Please check device connection.'));
      }
      setCameraActive(false);
    }
  };

  const handleTabChange = (tab) => {
    if (activeTab === 'camera' && tab !== 'camera') {
      stopCamera();
    }
    setActiveTab(tab);
    if (tab === 'camera') {
      startCamera();
    }
  };

  // Option 1: File Upload
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(t('profile.invalidFormat', 'Please select a valid image file (JPEG, PNG, WebP).'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(t('profile.imageTooLarge', 'Image must be under 5MB.'));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      setCurrentPreview(dataUrl);
      setSelectedAvatarId('');
      onChange(dataUrl, file);
    };
    reader.readAsDataURL(file);
  };

  // Option 2: Snap Camera Photo
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    // Draw centered square crop from video
    const vWidth = videoRef.current.videoWidth || 640;
    const vHeight = videoRef.current.videoHeight || 480;
    const minDim = Math.min(vWidth, vHeight);
    const startX = (vWidth - minDim) / 2;
    const startY = (vHeight - minDim) / 2;

    ctx.drawImage(videoRef.current, startX, startY, minDim, minDim, 0, 0, 400, 400);
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);

    stopCamera();
    setCurrentPreview(photoDataUrl);
    setSelectedAvatarId('');
    onChange(photoDataUrl);
  };

  // Option 3: Select Built-in Avatar
  const handleSelectAvatar = (avatar) => {
    setSelectedAvatarId(avatar.id);
    const dataUrl = getAvatarDataUrl(avatar.id);
    setCurrentPreview(dataUrl);
    onChange(dataUrl);
  };

  // Remove selection
  const handleClear = () => {
    stopCamera();
    setCurrentPreview('');
    setSelectedAvatarId('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    onChange('');
  };

  return (
    <div className={`space-y-4 ${className}`}>
      
      {/* Current Profile Preview Header */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-eco-50/70 dark:bg-dark-bg border border-eco-200 dark:border-dark-border">
        <div className="relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-eco-200 dark:bg-stone-800 border-2 border-eco-300 dark:border-dark-border shadow-sm flex items-center justify-center">
            {currentPreview ? (
              <img
                src={currentPreview}
                alt="Selected profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <Smile className="w-8 h-8 text-eco-800 dark:text-eco-300 opacity-60" />
            )}
          </div>
          {currentPreview && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md hover:bg-red-700 transition-colors"
              title={t('profile.removePhoto', 'Remove photo')}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex-1">
          <h4 className="font-bold text-sm text-eco-950 dark:text-dark-text">
            {t('profile.pictureTitle', 'Profile Picture / Avatar')}
          </h4>
          <p className="text-xs text-stone-500 dark:text-dark-muted mt-0.5">
            {currentPreview
              ? t('profile.pictureSelected', 'Custom profile picture selected.')
              : t('profile.pictureOptional', 'Optional. Pick an avatar, take a photo, or upload an image.')}
          </p>
        </div>
      </div>

      {/* Three Selection Options Tabs */}
      <div className="grid grid-cols-3 gap-2 border-b border-eco-100 dark:border-dark-border pb-2">
        <button
          type="button"
          onClick={() => handleTabChange('avatar')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'avatar'
              ? 'bg-eco-900 text-white shadow-sm'
              : 'bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border text-stone-700 dark:text-dark-muted hover:bg-eco-100'
          }`}
        >
          <Smile className="w-3.5 h-3.5" />
          <span>{t('profile.tabAvatar', 'Choose Avatar')}</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('upload')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'upload'
              ? 'bg-eco-900 text-white shadow-sm'
              : 'bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border text-stone-700 dark:text-dark-muted hover:bg-eco-100'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{t('profile.tabUpload', 'Upload Photo')}</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('camera')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'camera'
              ? 'bg-eco-900 text-white shadow-sm'
              : 'bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border text-stone-700 dark:text-dark-muted hover:bg-eco-100'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>{t('profile.tabCamera', 'Take Photo')}</span>
        </button>
      </div>

      {/* Tab 1 Content: Built-in Avatar Gallery */}
      {activeTab === 'avatar' && (
        <div className="space-y-2">
          <p className="text-xs text-stone-500 font-medium">
            {t('profile.selectAvatarPrompt', 'Select one of our environmental citizen avatars:')}
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {BUILT_IN_AVATARS.map((avatar) => {
              const isSelected = selectedAvatarId === avatar.id || currentPreview.includes(encodeURIComponent(avatar.id));
              return (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => handleSelectAvatar(avatar)}
                  className={`group relative p-2 rounded-2xl border transition-all text-center flex flex-col items-center ${
                    isSelected
                      ? 'border-eco-800 bg-eco-100/60 dark:bg-dark-card ring-2 ring-eco-700 shadow-md'
                      : 'border-eco-200 dark:border-dark-border bg-white dark:bg-dark-card hover:bg-eco-50 dark:hover:bg-dark-bg'
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-xl overflow-hidden shadow-inner flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: avatar.svg }}
                  />
                  <span className="text-[10px] font-bold text-stone-700 dark:text-dark-muted mt-1.5 truncate max-w-full">
                    {avatar.name}
                  </span>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2 Content: Device File Upload */}
      {activeTab === 'upload' && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-eco-300 dark:border-dark-border rounded-2xl p-6 text-center cursor-pointer hover:bg-eco-50/50 dark:hover:bg-dark-bg/40 transition-colors space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-eco-100 dark:bg-stone-800 text-eco-900 dark:text-eco-200 flex items-center justify-center mx-auto shadow-sm">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-eco-950 dark:text-dark-text">
              {t('profile.clickToUpload', 'Click to browse images on your device')}
            </p>
            <p className="text-[11px] text-stone-500 dark:text-dark-muted mt-0.5">
              JPG, PNG, WebP up to 5MB
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Tab 3 Content: Camera Capture */}
      {activeTab === 'camera' && (
        <div className="space-y-3">
          {cameraError ? (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{cameraError}</span>
              </div>
              <button
                type="button"
                onClick={startCamera}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-dark-card border border-red-300 text-red-800 dark:text-red-300"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('profile.retryCamera', 'Retry Camera')}</span>
              </button>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden bg-black max-w-xs mx-auto shadow-inner aspect-square flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {cameraActive && (
                <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleCapturePhoto}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-white text-eco-950 shadow-lg hover:scale-105 transition-all"
                  >
                    <Camera className="w-4 h-4 text-eco-800" />
                    <span>{t('profile.captureBtn', 'Snap Photo')}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
