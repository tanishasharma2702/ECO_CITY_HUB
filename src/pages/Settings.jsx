import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useFontSize } from '../contexts/FontSizeContext';
import LocationSelector from '../components/LocationSelector';
import LanguageSelector from '../components/LanguageSelector';
import ProfilePictureSelector from '../components/ProfilePictureSelector';
import { isSupabaseConfigured } from '../services/supabase';
import { isGeminiConfigured } from '../services/geminiService';
import {
  Settings as SettingsIcon,
  User,
  Sun,
  Moon,
  Laptop,
  Type,
  Globe,
  Bell,
  Shield,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Database,
  Cpu,
  Key,
  ExternalLink
} from 'lucide-react';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const { user, updateProfile, deleteAccount, signOut } = useAuth();
  const { theme, updateTheme } = useTheme();
  const { fontSize, updateFontSize } = useFontSize();
  const navigate = useNavigate();

  // Profile Form State
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || '');
  const [location, setLocation] = useState({
    country: 'India',
    state: user?.user_metadata?.state || 'Rajasthan',
    city: user?.user_metadata?.city || 'Jaipur'
  });

  // Notifications State
  const [notifications, setNotifications] = useState({
    reports: true,
    challenges: true,
    digest: true
  });

  // State Feedback
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Connection Checks
  const isSupabaseLive = isSupabaseConfigured();
  const isGeminiLive = isGeminiConfigured();

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(false);

    await updateProfile({
      full_name: fullName,
      avatar_url: avatarUrl,
      country: 'India',
      state: location.state,
      city: location.city
    });

    setSavingProfile(false);
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    await deleteAccount();
    setShowDeleteModal(false);
    navigate('/');
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-eco-200 text-eco-950 border border-eco-300 mb-2">
          <SettingsIcon className="w-3.5 h-3.5" />
          <span>System & Preferences</span>
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-eco-950 dark:text-dark-text tracking-tight">
          {t('settings.title', 'Settings & Preferences')}
        </h1>
        <p className="text-sm text-stone-600 dark:text-dark-muted mt-1">
          Customize your profile, display theme, font scale, language, and connected API credentials.
        </p>
      </div>

      {/* 1. Profile Management */}
      <div className="rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-eco-100 dark:border-dark-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-eco-100 dark:bg-stone-800 text-eco-900 dark:text-eco-200 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-eco-950 dark:text-dark-text">
                {t('settings.profile', 'Profile Information')}
              </h3>
              <p className="text-xs text-stone-500">
                Manage your citizen identity and residential civic jurisdiction.
              </p>
            </div>
          </div>

          {profileSuccess && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved!</span>
            </span>
          )}
        </div>

        <form onSubmit={handleProfileSave} className="space-y-6">
          {/* Change Profile Picture */}
          <div className="pb-4 border-b border-eco-100 dark:border-dark-border">
            <ProfilePictureSelector
              value={avatarUrl}
              onChange={setAvatarUrl}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-dark-muted mb-1 uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-eco-200 dark:border-dark-border bg-eco-50/50 dark:bg-dark-bg text-sm text-stone-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-eco-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-dark-muted mb-1 uppercase tracking-wider">
                Registered Email (Auth Locked)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2.5 rounded-xl border border-eco-200 dark:border-dark-border bg-stone-100 dark:bg-stone-800 text-sm text-stone-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Location Selector (India State/UT & City) */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-stone-700 dark:text-dark-muted mb-2 uppercase tracking-wider">
              {t('location.sectionTitle', 'India Location (State & City)')}
            </label>
            <LocationSelector
              state={location.state}
              city={location.city}
              onChange={(loc) => setLocation(loc)}
            />
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-eco-900 hover:bg-eco-950 transition-colors shadow-sm disabled:opacity-50"
          >
            {savingProfile ? 'Saving Changes...' : t('common.save', 'Save Changes')}
          </button>
        </form>
      </div>

      {/* 2. Theme Preferences (Inside Settings, not in navbar!) */}
      <div className="rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-eco-100 dark:border-dark-border pb-4">
          <div className="w-10 h-10 rounded-xl bg-eco-200 dark:bg-stone-800 text-eco-900 dark:text-eco-200 flex items-center justify-center">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-eco-950 dark:text-dark-text">
              {t('settings.theme', 'Theme Preferences')}
            </h3>
            <p className="text-xs text-stone-500">
              Select between Light, Dark, or System Default. Saved automatically across sessions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: 'light', label: t('settings.themeLight', 'Light Mode (Default)'), icon: Sun, desc: 'Warm peach & beige earthy surfaces' },
            { id: 'dark', label: t('settings.themeDark', 'Dark Mode'), icon: Moon, desc: 'Dark espresso brown & stone contrast' },
            { id: 'system', label: t('settings.themeSystem', 'System Default'), icon: Laptop, desc: 'Adapts to your operating system' }
          ].map((mode) => {
            const IconComp = mode.icon;
            const isSelected = theme === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => updateTheme(mode.id)}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'border-eco-800 bg-eco-100/50 dark:bg-dark-bg ring-2 ring-eco-700'
                    : 'border-eco-200 dark:border-dark-border hover:bg-eco-50 dark:hover:bg-dark-bg/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <IconComp className="w-5 h-5 text-eco-900 dark:text-eco-200" />
                  {isSelected && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-eco-950 dark:text-dark-text">{mode.label}</h4>
                  <p className="text-[11px] text-stone-500 dark:text-dark-muted mt-0.5">{mode.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Display Font Size */}
      <div className="rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-eco-100 dark:border-dark-border pb-4">
          <div className="w-10 h-10 rounded-xl bg-eco-300 dark:bg-stone-800 text-eco-900 dark:text-eco-200 flex items-center justify-center">
            <Type className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-eco-950 dark:text-dark-text">
              {t('settings.fontSize', 'Display Font Size')}
            </h3>
            <p className="text-xs text-stone-500">
              Adjust typography scale for optimal accessibility and readability.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'sm', label: t('settings.fontSm', 'Small (14px)') },
            { id: 'md', label: t('settings.fontMd', 'Medium (16px)') },
            { id: 'lg', label: t('settings.fontLg', 'Large (18px)') },
            { id: 'xl', label: t('settings.fontXl', 'Extra Large (20px)') }
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => updateFontSize(f.id)}
              className={`p-3 rounded-xl border text-center font-semibold text-xs transition-all ${
                fontSize === f.id
                  ? 'bg-eco-900 text-white border-eco-900 shadow-sm'
                  : 'border-eco-200 dark:border-dark-border hover:bg-eco-100 text-stone-700 dark:text-dark-text'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Language Preferences */}
      <div className="rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-eco-100 dark:border-dark-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-eco-400 dark:bg-stone-800 text-eco-950 dark:text-eco-200 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-eco-950 dark:text-dark-text">
                {t('settings.language', 'Language Preferences')}
              </h3>
              <p className="text-xs text-stone-500">
                Choose your preferred interface and AI reporting language.
              </p>
            </div>
          </div>

          <LanguageSelector variant="settings" />
        </div>
      </div>

      {/* 5. Security & Live Service Integrations */}
      <div className="rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-eco-100 dark:border-dark-border pb-4">
          <div className="w-10 h-10 rounded-xl bg-eco-200 dark:bg-stone-800 text-eco-900 dark:text-eco-200 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-eco-950 dark:text-dark-text">
              {t('settings.security', 'Security & Connected Services')}
            </h3>
            <p className="text-xs text-stone-500">
              Live status of backend database, Edge Functions, and AI vision services.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Supabase Status */}
          <div className="p-4 rounded-2xl bg-eco-50 dark:bg-dark-bg border border-eco-200 dark:border-dark-border space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-eco-800 dark:text-eco-300" />
                <span className="font-bold text-xs text-eco-950 dark:text-dark-text">Supabase Backend</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isSupabaseLive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {isSupabaseLive ? 'Configured' : 'Local Demo Mode'}
              </span>
            </div>
            <p className="text-xs text-stone-600 dark:text-dark-muted">
              {isSupabaseLive
                ? 'Connected to your remote Supabase PostgreSQL database.'
                : 'Using browser local state mock fallback. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to connect.'}
            </p>
          </div>

          {/* Gemini AI Status */}
          <div className="p-4 rounded-2xl bg-eco-50 dark:bg-dark-bg border border-eco-200 dark:border-dark-border space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-eco-800 dark:text-eco-300" />
                <span className="font-bold text-xs text-eco-950 dark:text-dark-text">Gemini Vision AI</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isGeminiLive ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {isGeminiLive ? 'Direct API Key Active' : 'Edge Function & Smart Engine Active'}
              </span>
            </div>
            <p className="text-xs text-stone-600 dark:text-dark-muted">
              {isGeminiLive
                ? 'Direct Gemini 1.5/2.0 API connection enabled.'
                : 'Runs via Supabase Edge Function with intelligent deterministic fallback.'}
            </p>
          </div>
        </div>
      </div>

      {/* 6. Notifications Preferences */}
      <div className="rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-eco-100 dark:border-dark-border pb-4">
          <div className="w-10 h-10 rounded-xl bg-eco-100 dark:bg-stone-800 text-eco-900 dark:text-eco-200 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-eco-950 dark:text-dark-text">
              {t('settings.notifications', 'Notification Preferences')}
            </h3>
            <p className="text-xs text-stone-500">
              Manage alerts for municipal reports and challenge updates.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { id: 'reports', label: t('settings.notifReports', 'Civic Report status updates'), desc: 'Get notified when municipal squads review or resolve your reports' },
            { id: 'challenges', label: t('settings.notifChallenges', 'Weekly Green Challenge reminders'), desc: 'Receive a reminder before weekly challenges reset on Sunday' },
            { id: 'digest', label: t('settings.notifDigest', 'Monthly Environmental impact digest'), desc: 'Summary of your CO2 reductions and plant care achievements' }
          ].map((item) => (
            <label
              key={item.id}
              className="flex items-start justify-between p-3.5 rounded-2xl border border-eco-100 dark:border-dark-border hover:bg-eco-50/50 cursor-pointer"
            >
              <div>
                <p className="font-bold text-xs text-stone-900 dark:text-dark-text">{item.label}</p>
                <p className="text-[11px] text-stone-500 mt-0.5">{item.desc}</p>
              </div>
              <input
                type="checkbox"
                checked={notifications[item.id]}
                onChange={() => setNotifications(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                className="mt-1 w-4 h-4 accent-eco-800"
              />
            </label>
          ))}
        </div>
      </div>

      {/* 7. Danger Zone: Delete Account */}
      <div className="rounded-3xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60 p-6 sm:p-8 space-y-4">
        <div>
          <h3 className="font-bold text-base text-red-900 dark:text-red-200 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-600" />
            <span>{t('settings.dangerZone', 'Danger Zone')}</span>
          </h3>
          <p className="text-xs text-red-700/80 dark:text-red-300/80 mt-1">
            Permanently delete your citizen account, reports, carbon audit history, and Green Score records.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
        >
          {t('settings.deleteAccount', 'Delete Account')}
        </button>
      </div>

      {/* Confirmation Modal for Account Deletion */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-dark-card rounded-3xl border border-red-200 dark:border-red-800 max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-bold text-lg text-stone-900 dark:text-dark-text">
                Confirm Permanent Account Deletion
              </h3>
              <p className="text-xs text-stone-600 dark:text-dark-muted leading-relaxed">
                {t('settings.deleteConfirm', 'Are you sure you want to delete your account? This action is permanent and deletes all your records.')}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-stone-200 text-stone-700 hover:bg-stone-100"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-sm"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
