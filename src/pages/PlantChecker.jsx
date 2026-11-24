import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { analyzePlantImage } from '../services/geminiService';
import { savePlantAnalysis, getUserPlantHistory } from '../services/plantService';
import {
  Sprout,
  Upload,
  Image as ImageIcon,
  X,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Save,
  Clock,
  Leaf,
  HeartHandshake,
  AlertTriangle,
  Loader2,
  Droplets,
  Sun
} from 'lucide-react';

export default function PlantChecker() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  // Photo state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [userRemarks, setUserRemarks] = useState('');
  const [error, setError] = useState('');

  // AI & Diagnosis State
  const [analyzing, setAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [history, setHistory] = useState([]);

  const fileInputRef = useRef(null);

  // Load history
  const loadHistory = async () => {
    if (!user?.id) return;
    const res = await getUserPlantHistory(user.id);
    if (res.success) {
      setHistory(res.data || []);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user?.id]);

  // Image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image format (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB.');
      return;
    }

    setError('');
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      setImagePreview(dataUrl);
      const base64Data = dataUrl.split(',')[1];
      setImageBase64(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Run Botanical AI Vision Diagnosis
  const handleDiagnose = async () => {
    if (!imageBase64) {
      setError('Please upload a leaf or plant photo to diagnose.');
      return;
    }

    setError('');
    setAnalyzing(true);
    setSaveSuccess(false);

    try {
      const res = await analyzePlantImage({
        imageBase64,
        mimeType: imageFile?.type || 'image/jpeg',
        notes: userRemarks,
        language: i18n.language || 'en'
      });

      if (res.success && res.data) {
        setDiagnosis(res.data);
      } else {
        setError('Could not analyze the photo. Please try a clearer leaf photo.');
      }
    } catch (err) {
      console.error('Plant analysis error:', err);
      setError('Diagnosis failed. Please check network connection.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Save Plant Diagnosis to Supabase
  const handleSaveDiagnosis = async () => {
    if (!user?.id || !diagnosis) return;
    setSaving(true);
    const saveRes = await savePlantAnalysis(user.id, {
      ...diagnosis,
      imageUrl: imagePreview
    });
    setSaving(false);
    if (saveRes.success) {
      setSaveSuccess(true);
      await loadHistory();
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-eco-300 text-eco-950 border border-eco-400 mb-2">
          <Sprout className="w-3.5 h-3.5" />
          <span>Module 3: Botanical Intelligence & Flora Health</span>
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-eco-950 dark:text-dark-text tracking-tight">
          {t('plant.title', 'Plant Health Checker')}
        </h1>
        <p className="text-sm text-stone-600 dark:text-dark-muted mt-1">
          {t('plant.subtitle', 'Upload a photo of a leaf or ailing plant. Gemini AI detects symptoms, diagnoses health issues, and gives organic remedies.')}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Card */}
      <div className="rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-6 sm:p-8 shadow-sm space-y-6">
        
        <h3 className="font-bold text-base text-eco-950 dark:text-dark-text flex items-center gap-2">
          <Leaf className="w-5 h-5 text-eco-800 dark:text-eco-300" />
          <span>1. Upload Plant or Leaf Photograph</span>
        </h3>

        {!imagePreview ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-eco-300 dark:border-dark-border rounded-3xl p-8 sm:p-12 text-center cursor-pointer hover:bg-eco-50/50 dark:hover:bg-dark-bg/40 transition-colors space-y-3"
          >
            <div className="w-14 h-14 rounded-2xl bg-eco-100 dark:bg-stone-800 text-eco-900 dark:text-eco-200 flex items-center justify-center mx-auto shadow-sm">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-eco-950 dark:text-dark-text">
                {t('plant.uploadPrompt', 'Upload a clear photo of the leaf, stem, or plant')}
              </p>
              <p className="text-xs text-stone-500 dark:text-dark-muted mt-1">
                Natural morning lighting yields highest botanical diagnostic accuracy
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>
        ) : (
          <div className="relative rounded-2xl border border-eco-200 dark:border-dark-border overflow-hidden bg-black max-w-md mx-auto">
            <img
              src={imagePreview}
              alt="Plant leaf preview"
              className="w-full max-h-80 object-contain mx-auto"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-3 right-3 p-2 rounded-xl bg-black/70 hover:bg-black text-white transition-colors"
              title="Remove photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-stone-700 dark:text-dark-muted mb-1 uppercase tracking-wider">
            Optional Symptoms or Observations
          </label>
          <input
            type="text"
            value={userRemarks}
            onChange={(e) => setUserRemarks(e.target.value)}
            placeholder="e.g. Yellowing starting from bottom leaves, small white specks on underside..."
            className="w-full px-4 py-2.5 rounded-xl border border-eco-200 dark:border-dark-border bg-eco-50/50 dark:bg-dark-bg text-sm text-stone-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-eco-500"
          />
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleDiagnose}
            disabled={analyzing || !imageBase64}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-eco-900 hover:bg-eco-950 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-eco-200" />
                <span>{t('plant.analyzing', 'Analyzing symptoms and consulting botanical database...')}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-eco-200" />
                <span>{t('plant.analyzeBtn', 'Diagnose Plant with Gemini Vision')}</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* =====================================================================
          DIAGNOSTIC REPORT (Rendered when diagnosis exists)
          ===================================================================== */}
      {diagnosis && (
        <div className="rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-6 sm:p-8 shadow-sm space-y-8 animate-in fade-in duration-300">
          
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-eco-100 dark:border-dark-border pb-4">
            <div>
              <span className="text-xs font-bold text-eco-800 dark:text-eco-400 uppercase tracking-wider">
                {t('plant.diagnosisResults', 'Diagnostic Report')}
              </span>
              <h2 className="font-display font-bold text-2xl text-eco-950 dark:text-dark-text mt-0.5">
                {diagnosis.plantName}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-eco-100 text-eco-900">
                Confidence: {diagnosis.confidenceScore}%
              </span>

              {saveSuccess ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saved (+40 Pts)</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveDiagnosis}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-eco-900 hover:bg-eco-950 transition-colors shadow-sm disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : t('plant.saveAnalysis', 'Save to Plant Care History')}</span>
                </button>
              )}
            </div>
          </div>

          {/* Condition Overview Banner */}
          <div className="p-4 rounded-2xl bg-eco-100/60 dark:bg-dark-bg border border-eco-200 dark:border-dark-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs text-stone-500 font-medium">Likely Condition:</span>
              <h3 className="font-bold text-lg text-eco-950 dark:text-dark-text">
                {diagnosis.likelyCondition}
              </h3>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              diagnosis.healthStatus === 'Healthy'
                ? 'bg-emerald-100 text-emerald-800'
                : diagnosis.healthStatus === 'Mild Issue'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-orange-100 text-orange-800'
            }`}>
              {diagnosis.healthStatus}
            </span>
          </div>

          {/* Symptoms & Possible Causes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Symptoms */}
            <div className="p-5 rounded-2xl bg-eco-50/70 dark:bg-dark-bg border border-eco-200/80 dark:border-dark-border space-y-2">
              <h4 className="font-bold text-sm text-eco-950 dark:text-dark-text flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-eco-800" />
                <span>{t('plant.symptoms', 'Visible Symptoms')}</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-stone-600 dark:text-dark-muted">
                {diagnosis.visibleSymptoms?.map((sym, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-eco-700 font-bold">•</span>
                    <span>{sym}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Causes */}
            <div className="p-5 rounded-2xl bg-eco-50/70 dark:bg-dark-bg border border-eco-200/80 dark:border-dark-border space-y-2">
              <h4 className="font-bold text-sm text-eco-950 dark:text-dark-text flex items-center gap-2">
                <Droplets className="w-4 h-4 text-eco-800" />
                <span>{t('plant.causes', 'Underlying Causes')}</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-stone-600 dark:text-dark-muted">
                {diagnosis.possibleCauses?.map((cause, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-eco-700 font-bold">•</span>
                    <span>{cause}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Recommended Organic Treatment */}
          <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 space-y-2">
            <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>{t('plant.treatment', 'Recommended Treatment')}</span>
            </h4>
            <p className="text-xs text-stone-700 dark:text-dark-text leading-relaxed">
              {diagnosis.recommendedTreatment}
            </p>
          </div>

          {/* Home Care & Prevention Suggestions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="p-5 rounded-2xl bg-eco-50/70 dark:bg-dark-bg border border-eco-200/80 dark:border-dark-border space-y-2">
              <h4 className="font-bold text-sm text-eco-950 dark:text-dark-text flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-eco-800" />
                <span>{t('plant.homeRemedies', 'Eco-Friendly Home Care & Remedies')}</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-stone-600 dark:text-dark-muted">
                {diagnosis.homeCareSuggestions?.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-eco-50/70 dark:bg-dark-bg border border-eco-200/80 dark:border-dark-border space-y-2">
              <h4 className="font-bold text-sm text-eco-950 dark:text-dark-text flex items-center gap-2">
                <Sun className="w-4 h-4 text-eco-800" />
                <span>{t('plant.prevention', 'Long-Term Prevention Tips')}</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-stone-600 dark:text-dark-muted">
                {diagnosis.preventionTips?.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-eco-700 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Botanical Safety Disclaimer */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs">
            <strong>Important Safety Notice:</strong> {t('plant.disclaimer', 'AI assessments are assistive guidelines. For rare species or severe farm blights, consult an agricultural extension specialist. We never recommend unsafe chemicals.')}
          </div>

        </div>
      )}

      {/* =====================================================================
          SAVED PLANT CARE HISTORY
          ===================================================================== */}
      {history.length > 0 && (
        <div className="rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-eco-800 dark:text-eco-300" />
            <h3 className="font-bold text-base text-eco-950 dark:text-dark-text">
              Plant Care Activity History
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {history.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-eco-50/60 dark:bg-dark-bg border border-eco-200 dark:border-dark-border space-y-2.5"
              >
                {item.image_url && (
                  <div className="h-32 rounded-xl overflow-hidden bg-black/5 border border-eco-100 dark:border-dark-border">
                    <img
                      src={item.image_url}
                      alt={item.plant_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <span className="text-[10px] text-stone-400">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                  <h4 className="font-bold text-sm text-eco-950 dark:text-dark-text truncate">
                    {item.plant_name}
                  </h4>
                  <p className="text-xs text-eco-800 dark:text-eco-400 font-medium">
                    {item.health_status}
                  </p>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-dark-muted line-clamp-2">
                  {item.recommended_treatment}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
