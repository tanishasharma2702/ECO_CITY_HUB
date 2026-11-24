import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import LocationSelector from '../components/LocationSelector';
import { analyzeCivicImage } from '../services/geminiService';
import { createCivicReport, CIVIC_CATEGORIES } from '../services/civicService';
import {
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  X,
  Sparkles,
  MapPin,
  Building,
  FileText,
  Copy,
  Download,
  Share2,
  Check,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldAlert
} from 'lucide-react';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix default Leaflet icon issue in Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to handle map clicks for coordinate selection
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function CivicReporter() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [category, setCategory] = useState('Potholes');
  const [userNotes, setUserNotes] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState({
    country: user?.user_metadata?.country || 'India',
    state: user?.user_metadata?.state || 'Rajasthan',
    city: user?.user_metadata?.city || 'Jaipur'
  });
  // Coordinates for Leaflet (Default around Jaipur/India, user can click to change)
  const [coordinates, setCoordinates] = useState([26.9124, 75.7873]);
  const [showMap, setShowMap] = useState(true);

  // AI & Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [editableLetter, setEditableLetter] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [department, setDepartment] = useState('Public Works Department (PWD)');

  // Actions
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  // Handle Image Upload
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image file size must be less than 10MB.');
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

  // Run Gemini Vision Analysis
  const handleAnalyze = async () => {
    if (!imageBase64) {
      setError('Please upload a photo of the civic problem before running AI analysis.');
      return;
    }

    setError('');
    setIsAnalyzing(true);
    try {
      const result = await analyzeCivicImage({
        imageBase64,
        mimeType: imageFile?.type || 'image/jpeg',
        userNotes,
        location: { ...location, address },
        language: i18n.language || 'en'
      });

      if (result.success && result.data) {
        setAiAnalysis(result.data);
        if (result.data.suggestedCategory) setCategory(result.data.suggestedCategory);
        if (result.data.priority) setPriority(result.data.priority);
        if (result.data.recommendedDepartment) setDepartment(result.data.recommendedDepartment);
        if (result.data.formalComplaintLetter) setEditableLetter(result.data.formalComplaintLetter);
      }
    } catch (err) {
      console.error('Civic image analysis error:', err);
      setError('Analysis failed. Please check the image and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Copy Complaint to Clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(editableLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download Complaint as Text file
  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([editableLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Civic_Complaint_${category.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Save Report to Supabase
  const handleSaveReport = async () => {
    if (!user?.id) {
      setError('Please log in to save and file this report.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const reportData = {
        title: aiAnalysis?.complaintTitle || `${category} at ${address || location.city}`,
        category,
        description: userNotes || aiAnalysis?.explanation,
        imageUrl: imagePreview,
        country: location.country,
        state: location.state,
        city: location.city,
        address,
        latitude: coordinates[0],
        longitude: coordinates[1],
        priority,
        suggestedDepartment: department,
        status: 'Submitted',
        generatedComplaint: editableLetter
      };

      const res = await createCivicReport(user.id, reportData);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => {
          navigate('/my-reports');
        }, 1200);
      } else {
        setError('Failed to record report. Please retry.');
      }
    } catch (err) {
      console.error('Save civic report error:', err);
      setError('An error occurred while saving the report.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-eco-200 text-eco-950 border border-eco-300 mb-2">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Module 2: Civic Infrastructure Vigilance</span>
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-eco-950 dark:text-dark-text tracking-tight">
          {t('civic.title', 'Civic Issue Reporter')}
        </h1>
        <p className="text-sm text-stone-600 dark:text-dark-muted mt-1">
          {t('civic.subtitle', 'Capture local civic hazards. Gemini Vision analyzes the problem, estimates urgency, and drafts an official complaint.')}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Step 1: Upload & Details Card */}
      <div className="rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-6 sm:p-8 shadow-sm space-y-8">
        
        {/* Step A: Photo Upload */}
        <div className="space-y-3">
          <h3 className="font-bold text-base text-eco-950 dark:text-dark-text flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-eco-800 dark:text-eco-300" />
            <span>1. Upload Photograph of Civic Problem</span>
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
                  Click or drag image to upload
                </p>
                <p className="text-xs text-stone-500 dark:text-dark-muted mt-1">
                  Supports JPG, PNG, WebP up to 10MB
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
            <div className="relative rounded-2xl border border-eco-200 dark:border-dark-border overflow-hidden bg-black max-w-lg">
              <img
                src={imagePreview}
                alt="Civic hazard preview"
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
        </div>

        {/* Step B: Location Selector + Coordinates */}
        <div className="space-y-4 pt-4 border-t border-eco-100 dark:border-dark-border">
          <h3 className="font-bold text-base text-eco-950 dark:text-dark-text flex items-center gap-2">
            <MapPin className="w-5 h-5 text-eco-800 dark:text-eco-300" />
            <span>2. Location & Jurisdiction</span>
          </h3>

          <LocationSelector
            country={location.country}
            state={location.state}
            city={location.city}
            onChange={(loc) => setLocation(loc)}
          />

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-dark-muted mb-1 uppercase tracking-wider">
              Street Address / Landmark
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Near Hawa Mahal Circle, Badi Chaupar, Main Crossroad"
              className="w-full px-4 py-2.5 rounded-xl border border-eco-200 dark:border-dark-border bg-eco-50/50 dark:bg-dark-bg text-sm text-stone-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-eco-500"
            />
          </div>

          {/* Interactive Leaflet Pinpoint Map */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700 dark:text-dark-muted">
                Pinpoint Exact Coordinates on Map (Click on map to position pin)
              </span>
              <span className="text-[11px] font-mono text-stone-500">
                Lat: {coordinates[0].toFixed(4)}, Lng: {coordinates[1].toFixed(4)}
              </span>
            </div>

            <div className="h-64 w-full rounded-2xl overflow-hidden border border-eco-200 dark:border-dark-border shadow-inner">
              <MapContainer
                center={coordinates}
                zoom={13}
                scrollWheelZoom={false}
                className="w-full h-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={coordinates} setPosition={setCoordinates} />
              </MapContainer>
            </div>
          </div>
        </div>

        {/* Step C: Citizen Notes & Manual Category Override */}
        <div className="space-y-4 pt-4 border-t border-eco-100 dark:border-dark-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-dark-muted mb-1 uppercase tracking-wider">
                Problem Category (AI can auto-suggest)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-eco-200 dark:border-dark-border bg-eco-50/50 dark:bg-dark-bg text-sm text-stone-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-eco-500"
              >
                {CIVIC_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-dark-muted mb-1 uppercase tracking-wider">
                Urgency Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-eco-200 dark:border-dark-border bg-eco-50/50 dark:bg-dark-bg text-sm text-stone-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-eco-500 font-semibold"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
                <option value="Critical">Critical Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-dark-muted mb-1 uppercase tracking-wider">
              Additional Citizen Notes / Context
            </label>
            <textarea
              rows={2}
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="e.g. Causing traffic jams during rush hours, open drain exposed to pedestrians..."
              className="w-full px-4 py-2.5 rounded-xl border border-eco-200 dark:border-dark-border bg-eco-50/50 dark:bg-dark-bg text-sm text-stone-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-eco-500"
            />
          </div>
        </div>

        {/* Action Button: Run Gemini Vision */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !imageBase64}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-eco-900 hover:bg-eco-950 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-eco-200" />
                <span>{t('civic.analyzing', 'AI is analyzing the photograph and categorizing...')}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-eco-200" />
                <span>{t('civic.analyzeBtn', 'Analyze with Gemini Vision')}</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* =====================================================================
          AI REVIEW & COMPLAINT GENERATION SECTION
          ===================================================================== */}
      {(aiAnalysis || editableLetter) && (
        <div className="rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-eco-100 dark:border-dark-border pb-4">
            <div>
              <span className="text-xs font-bold text-eco-800 dark:text-eco-400 uppercase tracking-wider">
                Review & Complaint Draft
              </span>
              <h3 className="font-display font-bold text-2xl text-eco-950 dark:text-dark-text">
                {aiAnalysis?.complaintTitle || `${category} Complaint Draft`}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                priority === 'Critical' ? 'bg-red-100 text-red-800' :
                priority === 'High' ? 'bg-orange-100 text-orange-800' :
                priority === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-800'
              }`}>
                {priority} Priority
              </span>
            </div>
          </div>

          {/* Department Recommendation */}
          <div className="p-4 rounded-2xl bg-eco-50 dark:bg-dark-bg border border-eco-200/80 dark:border-dark-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <Building className="w-4 h-4 text-eco-800 dark:text-eco-300" />
              <div>
                <span className="text-stone-500 font-medium">Suggested Municipal Wing:</span>
                <p className="font-bold text-eco-950 dark:text-dark-text text-sm">
                  {department}
                </p>
              </div>
            </div>
            <span className="text-[11px] text-stone-500">
              Assigned based on visual hazard categorization
            </span>
          </div>

          {/* Safety Hazards Identified */}
          {aiAnalysis?.safetyHazards && aiAnalysis.safetyHazards.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-stone-700 dark:text-dark-muted">
                Observed Safety Hazards:
              </span>
              <div className="flex flex-wrap gap-2">
                {aiAnalysis.safetyHazards.map((hz, idx) => (
                  <span key={idx} className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200">
                    ⚠️ {hz}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Editable Complaint Letter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700 dark:text-dark-muted uppercase tracking-wider">
                Official Grievance Letter (Fully Editable)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold border border-eco-200 dark:border-dark-border hover:bg-eco-100 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold border border-eco-200 dark:border-dark-border hover:bg-eco-100 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download (.txt)</span>
                </button>
              </div>
            </div>

            <textarea
              rows={12}
              value={editableLetter}
              onChange={(e) => setEditableLetter(e.target.value)}
              className="w-full font-mono text-xs sm:text-sm p-4 rounded-2xl border border-eco-200 dark:border-dark-border bg-eco-50/30 dark:bg-dark-bg text-stone-800 dark:text-dark-text leading-relaxed focus:outline-none focus:ring-2 focus:ring-eco-500"
            />
            <p className="text-[11px] text-stone-500 italic">
              Notice: You can edit dates, names, or additional street landmarks directly before saving or copying. EcoCity Hub provides this draft to accelerate official municipal dispatch.
            </p>
          </div>

          {/* Final Actions */}
          <div className="pt-4 border-t border-eco-100 dark:border-dark-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-stone-500">
              Saving files this report into your community account and awards <strong>+50 Green Points</strong>.
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSaveReport}
                disabled={saving || saveSuccess}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-eco-900 hover:bg-eco-950 shadow-md transition-all disabled:opacity-50"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Report Filed! (+50 pts)</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4 text-eco-200" />
                    <span>{saving ? 'Filing Report...' : 'Save & File Report'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
