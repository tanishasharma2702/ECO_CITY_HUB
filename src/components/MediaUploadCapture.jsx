import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Camera,
  Video,
  X,
  RotateCcw,
  AlertCircle,
  Play,
  Square,
  CheckCircle2,
  Sparkles,
  Film,
  Image as ImageIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function MediaUploadCapture({
  onMediaSelected = () => {},
  onMediaCleared = () => {},
  initialPreview = null,
  initialType = 'image', // 'image' | 'video'
  className = ''
}) {
  const { t } = useTranslation();

  const [activeMode, setActiveMode] = useState('picker'); // 'picker' | 'camera_photo' | 'camera_video'
  const [mediaPreview, setMediaPreview] = useState(initialPreview);
  const [mediaType, setMediaType] = useState(initialType);
  const [extractedFrame, setExtractedFrame] = useState(null);
  const [isExtractingFrame, setIsExtractingFrame] = useState(false);

  // Camera & Recording State
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const videoPreviewRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      stopCamera();
      clearInterval(recordingTimerRef.current);
    };
  }, []);

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const startCamera = async (needAudio = false) => {
    stopCamera();
    setCameraError('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(t('media.notSupported', 'Camera access is not supported on this browser.'));
        return null;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: needAudio
      });
      setCameraStream(stream);
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }
      return stream;
    } catch (err) {
      console.warn('Camera error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError(t('media.permissionDenied', 'Camera/microphone permission was denied. Please allow permission in browser settings.'));
      } else {
        setCameraError(t('media.errorOpening', 'Could not open camera on this device.'));
      }
      return null;
    }
  };

  // Helper to extract a high-clarity video frame for Gemini Vision
  const extractFrameFromVideo = (videoUrl) => {
    return new Promise((resolve) => {
      setIsExtractingFrame(true);
      const v = document.createElement('video');
      v.src = videoUrl;
      v.muted = true;
      v.crossOrigin = 'anonymous';

      v.onloadeddata = () => {
        // Seek to 1 second or 25% duration
        const targetTime = Math.min(1.0, (v.duration || 1) / 2);
        v.currentTime = targetTime;
      };

      v.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = v.videoWidth || 640;
          canvas.height = v.videoHeight || 480;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
          const frameDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          const base64 = frameDataUrl.split(',')[1];
          setIsExtractingFrame(false);
          resolve({ frameDataUrl, base64 });
        } catch (err) {
          console.warn('Frame extraction error:', err);
          setIsExtractingFrame(false);
          resolve({ frameDataUrl: null, base64: null });
        }
      };

      v.onerror = () => {
        setIsExtractingFrame(false);
        resolve({ frameDataUrl: null, base64: null });
      };
    });
  };

  // Option A: File Selected from Device
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      alert(t('media.invalidFormat', 'Please upload a valid photo (JPEG, PNG, WebP) or video (MP4, WebM, MOV).'));
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert(t('media.tooLarge', 'File size exceeds maximum limit (50MB).'));
      return;
    }

    if (isImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        const base64 = dataUrl.split(',')[1];
        setMediaType('image');
        setMediaPreview(dataUrl);
        setExtractedFrame(null);
        setActiveMode('picker');
        onMediaSelected({
          file,
          previewUrl: dataUrl,
          mediaType: 'image',
          frameBase64: base64,
          frameMimeType: file.type || 'image/jpeg'
        });
      };
      reader.readAsDataURL(file);
    } else {
      // Video
      const videoBlobUrl = URL.createObjectURL(file);
      setMediaType('video');
      setMediaPreview(videoBlobUrl);
      setActiveMode('picker');

      const { frameDataUrl, base64 } = await extractFrameFromVideo(videoBlobUrl);
      setExtractedFrame(frameDataUrl);

      onMediaSelected({
        file,
        previewUrl: videoBlobUrl,
        mediaType: 'video',
        frameBase64: base64,
        frameMimeType: 'image/jpeg'
      });
    }
  };

  // Option B1: Snap Photo from Live Camera
  const handleSnapPhoto = () => {
    if (!videoPreviewRef.current) return;
    const v = videoPreviewRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth || 640;
    canvas.height = v.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const base64 = dataUrl.split(',')[1];

    stopCamera();
    setMediaType('image');
    setMediaPreview(dataUrl);
    setExtractedFrame(null);
    setActiveMode('picker');

    // Convert dataUrl to a blob/file
    fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `camera_photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        onMediaSelected({
          file,
          previewUrl: dataUrl,
          mediaType: 'image',
          frameBase64: base64,
          frameMimeType: 'image/jpeg'
        });
      });
  };

  // Option B2: Record Video from Live Camera
  const startRecordingVideo = async () => {
    if (!cameraStream) {
      const stream = await startCamera(true);
      if (!stream) return;
    }

    recordedChunksRef.current = [];
    const mimeTypes = ['video/webm;codecs=vp9,opus', 'video/webm', 'video/mp4'];
    let supportedMime = mimeTypes.find(m => MediaRecorder.isTypeSupported(m)) || '';

    try {
      const recorder = new MediaRecorder(cameraStream, supportedMime ? { mimeType: supportedMime } : {});
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: supportedMime || 'video/webm' });
        const videoBlobUrl = URL.createObjectURL(blob);
        const file = new File([blob], `recorded_video_${Date.now()}.webm`, { type: supportedMime || 'video/webm' });

        stopCamera();
        setMediaType('video');
        setMediaPreview(videoBlobUrl);
        setActiveMode('picker');

        const { frameDataUrl, base64 } = await extractFrameFromVideo(videoBlobUrl);
        setExtractedFrame(frameDataUrl);

        onMediaSelected({
          file,
          previewUrl: videoBlobUrl,
          mediaType: 'video',
          frameBase64: base64,
          frameMimeType: 'image/jpeg'
        });
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting video recording:', err);
      setCameraError(t('media.recordError', 'Could not start video recording.'));
    }
  };

  const stopRecordingVideo = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  const handleClearMedia = () => {
    stopCamera();
    clearInterval(recordingTimerRef.current);
    setMediaPreview(null);
    setMediaType('image');
    setExtractedFrame(null);
    setIsRecording(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onMediaCleared();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      
      {/* 1. If Media is Already Selected/Captured -> Show Preview */}
      {mediaPreview ? (
        <div className="space-y-3">
          <div className="relative rounded-3xl border border-eco-200 dark:border-dark-border overflow-hidden bg-black max-w-lg mx-auto shadow-md">
            {mediaType === 'image' ? (
              <img
                src={mediaPreview}
                alt="Selected media preview"
                className="w-full max-h-80 object-contain mx-auto"
              />
            ) : (
              <video
                src={mediaPreview}
                controls
                playsInline
                className="w-full max-h-80 object-contain mx-auto bg-black"
              />
            )}

            {/* Remove / Replace Top Controls */}
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearMedia}
                className="p-2 rounded-xl bg-black/75 hover:bg-black text-white shadow-md transition-colors"
                title={t('media.removeMedia', 'Remove media')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="absolute bottom-3 left-3 px-3 py-1 rounded-xl bg-black/70 backdrop-blur-sm text-white text-xs font-semibold flex items-center gap-1.5">
              {mediaType === 'image' ? <ImageIcon className="w-3.5 h-3.5 text-eco-300" /> : <Film className="w-3.5 h-3.5 text-eco-300" />}
              <span className="capitalize">{mediaType === 'image' ? t('media.photoLabel', 'Photograph') : t('media.videoLabel', 'Video Recording')}</span>
            </div>
          </div>

          {/* If Video: Show Frame Extraction Banner for Gemini Vision */}
          {mediaType === 'video' && (
            <div className="p-3.5 rounded-2xl bg-eco-100/70 dark:bg-dark-bg border border-eco-200 dark:border-dark-border flex items-start gap-3 text-xs">
              <Sparkles className="w-4 h-4 text-eco-800 dark:text-eco-300 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-eco-950 dark:text-dark-text">
                  {t('media.videoFrameNotice', 'Video Ready for AI Analysis')}
                </p>
                <p className="text-stone-600 dark:text-dark-muted">
                  {t('media.videoFrameDesc', 'A representative high-clarity frame was extracted so Gemini Vision can inspect visible symptoms or infrastructure hazards accurately.')}
                </p>
                {extractedFrame && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] text-stone-500 font-semibold">{t('media.extractedFrame', 'Extracted Frame:')}</span>
                    <img src={extractedFrame} alt="Extracted frame preview" className="w-14 h-9 object-cover rounded-md border border-eco-300" />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleClearMedia}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 py-1 px-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('media.changeMedia', 'Change Photo or Video')}</span>
            </button>
          </div>
        </div>
      ) : activeMode === 'picker' ? (
        
        /* 2. Choose Upload or Open Camera */
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Option A: Upload Photo or Video from Device */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-eco-300 dark:border-dark-border rounded-3xl p-6 sm:p-8 text-center cursor-pointer hover:bg-eco-50/60 dark:hover:bg-dark-bg/40 transition-colors space-y-2 flex flex-col items-center justify-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-eco-100 dark:bg-stone-800 text-eco-900 dark:text-eco-200 flex items-center justify-center shadow-sm">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-eco-950 dark:text-dark-text">
                  {t('media.uploadOptionTitle', 'Upload Photo or Video')}
                </p>
                <p className="text-xs text-stone-500 dark:text-dark-muted mt-1">
                  {t('media.uploadOptionDesc', 'Select JPG, PNG, WebP or MP4, WebM (up to 50MB)')}
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Option B: Open Camera (Capture Photo or Video) */}
            <div
              onClick={async () => {
                setActiveMode('camera_photo');
                await startCamera(false);
              }}
              className="border-2 border-dashed border-eco-300 dark:border-dark-border rounded-3xl p-6 sm:p-8 text-center cursor-pointer hover:bg-eco-50/60 dark:hover:bg-dark-bg/40 transition-colors space-y-2 flex flex-col items-center justify-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-eco-200 dark:bg-stone-800 text-eco-950 dark:text-eco-200 flex items-center justify-center shadow-sm">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-eco-950 dark:text-dark-text">
                  {t('media.cameraOptionTitle', 'Open Camera')}
                </p>
                <p className="text-xs text-stone-500 dark:text-dark-muted mt-1">
                  {t('media.cameraOptionDesc', 'Snap a live photo or record a real-time video')}
                </p>
              </div>
            </div>

          </div>
        </div>

      ) : (

        /* 3. Live Camera Viewfinder (Snap Photo OR Record Video) */
        <div className="rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-5 space-y-4 shadow-md max-w-lg mx-auto">
          
          <div className="flex items-center justify-between border-b border-eco-100 dark:border-dark-border pb-3">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-eco-800 dark:text-eco-300" />
              <span className="font-bold text-sm text-eco-950 dark:text-dark-text">
                {t('media.liveCamera', 'Live Camera')}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={async () => {
                  stopRecordingVideo();
                  setActiveMode('camera_photo');
                  await startCamera(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeMode === 'camera_photo'
                    ? 'bg-eco-900 text-white'
                    : 'text-stone-600 hover:bg-eco-100'
                }`}
              >
                {t('media.photoMode', 'Photo')}
              </button>
              <button
                type="button"
                onClick={async () => {
                  setActiveMode('camera_video');
                  await startCamera(true);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeMode === 'camera_video'
                    ? 'bg-eco-900 text-white'
                    : 'text-stone-600 hover:bg-eco-100'
                }`}
              >
                {t('media.videoMode', 'Video')}
              </button>
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setActiveMode('picker');
                }}
                className="p-1.5 rounded-xl text-stone-500 hover:bg-eco-100 ml-1"
                title="Cancel Camera"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {cameraError ? (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{cameraError}</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => startCamera(activeMode === 'camera_video')}
                  className="px-3 py-1 rounded-lg bg-white dark:bg-dark-card border border-red-300 text-xs font-semibold"
                >
                  {t('media.retry', 'Retry')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('picker')}
                  className="px-3 py-1 rounded-lg text-xs font-semibold text-stone-600"
                >
                  {t('media.backToUpload', 'Back to Upload')}
                </button>
              </div>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center shadow-inner">
              <video
                ref={videoPreviewRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Recording indicator */}
              {isRecording && (
                <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white text-xs font-bold animate-pulse shadow">
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                  <span>REC {recordingSeconds}s</span>
                </div>
              )}

              {/* Bottom Camera Action Bar */}
              <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4">
                {activeMode === 'camera_photo' ? (
                  <button
                    type="button"
                    onClick={handleSnapPhoto}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-white text-eco-950 shadow-xl hover:scale-105 transition-all"
                  >
                    <Camera className="w-4 h-4 text-eco-900" />
                    <span>{t('media.snapPhoto', 'Snap Photo')}</span>
                  </button>
                ) : (
                  !isRecording ? (
                    <button
                      type="button"
                      onClick={startRecordingVideo}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-red-600 text-white shadow-xl hover:scale-105 transition-all"
                    >
                      <Video className="w-4 h-4" />
                      <span>{t('media.startRecording', 'Start Recording')}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecordingVideo}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold bg-stone-900 text-white shadow-xl hover:scale-105 transition-all border border-white/20"
                    >
                      <Square className="w-4 h-4 text-red-500 fill-current" />
                      <span>{t('media.stopRecording', 'Stop & Use Video')}</span>
                    </button>
                  )
                )}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
