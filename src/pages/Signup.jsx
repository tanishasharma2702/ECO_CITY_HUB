import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import LocationSelector from '../components/LocationSelector';
import ProfilePictureSelector from '../components/ProfilePictureSelector';
import { Leaf, User, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export default function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    state: 'Rajasthan',
    city: 'Jaipur'
  });

  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationChange = ({ state, city }) => {
    setFormData(prev => ({ ...prev, state, city }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError(t('auth.passwordLengthError', 'Password must be at least 6 characters.'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordMismatch', 'Passwords do not match. Please re-enter.'));
      return;
    }

    if (!formData.state || !formData.city) {
      setError(t('auth.locationRequired', 'Please select both your State/UT and City.'));
      return;
    }

    setLoading(true);
    const { data, error: authError } = await signUp({
      email: formData.email,
      password: formData.password,
      full_name: formData.fullName,
      state: formData.state,
      city: formData.city,
      avatar_url: avatarUrl
    });
    setLoading(false);

    if (authError) {
      setError(authError.message || t('auth.signupError', 'Registration failed. Please check inputs.'));
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-xl space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-eco-900 text-white flex items-center justify-center shadow-md">
              <Leaf className="w-5 h-5 text-eco-200" />
            </div>
            <span className="font-display font-bold text-2xl text-eco-950 dark:text-dark-text tracking-tight">
              EcoCity Hub
            </span>
          </Link>
          <h2 className="font-display font-bold text-3xl text-eco-950 dark:text-dark-text">
            {t('auth.signupTitle', 'Create Your Account')}
          </h2>
          <p className="text-sm text-stone-600 dark:text-dark-muted">
            {t('auth.signupSubtitle', 'Join thousands of citizens making Indian cities cleaner and greener.')}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-6 sm:p-8 shadow-lg space-y-6">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* 1. Profile Picture Selection (Upload, Camera, or Avatar) */}
            <div className="pb-2 border-b border-eco-100 dark:border-dark-border">
              <ProfilePictureSelector
                value={avatarUrl}
                onChange={setAvatarUrl}
              />
            </div>

            {/* 2. Full Name */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-dark-muted mb-1 uppercase tracking-wider">
                {t('auth.fullName', 'Full Name')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder={t('auth.namePlaceholder', 'Enter your full name')}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-eco-200 dark:border-dark-border bg-eco-50/50 dark:bg-dark-bg text-stone-900 dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-eco-500"
                  required
                />
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* 3. Email */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-dark-muted mb-1 uppercase tracking-wider">
                {t('auth.email', 'Email Address')}
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-eco-200 dark:border-dark-border bg-eco-50/50 dark:bg-dark-bg text-stone-900 dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-eco-500"
                  required
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* 4. Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-dark-muted mb-1 uppercase tracking-wider">
                  {t('auth.password', 'Password')}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 chars"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-eco-200 dark:border-dark-border bg-eco-50/50 dark:bg-dark-bg text-stone-900 dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-eco-500"
                    required
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-dark-muted mb-1 uppercase tracking-wider">
                  {t('auth.confirmPassword', 'Confirm Password')}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-eco-200 dark:border-dark-border bg-eco-50/50 dark:bg-dark-bg text-stone-900 dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-eco-500"
                    required
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* 5. Dependent Location Selector (State/UT -> City, India Only) */}
            <div className="pt-2 border-t border-eco-100 dark:border-dark-border">
              <span className="block text-xs font-bold text-eco-900 dark:text-eco-300 mb-2 uppercase tracking-wider">
                {t('location.sectionTitle', 'India Location (State & City)')}
              </span>
              <LocationSelector
                state={formData.state}
                city={formData.city}
                onChange={handleLocationChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-eco-900 hover:bg-eco-950 transition-colors shadow-md disabled:opacity-50 mt-4"
            >
              {loading ? t('common.loading', 'Creating Account...') : t('auth.signupBtn', 'Create Account')}
            </button>
          </form>

          <div className="text-center text-xs text-stone-600 dark:text-dark-muted pt-2 border-t border-eco-100 dark:border-dark-border">
            {t('auth.haveAccount', 'Already have an account?')}{' '}
            <Link to="/login" className="font-bold text-eco-900 dark:text-eco-300 hover:underline">
              {t('auth.loginBtn', 'Sign In')}
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
