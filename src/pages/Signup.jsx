import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import LocationSelector from '../components/LocationSelector';
import { Leaf, User, Mail, Lock, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function Signup() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { signUp, loginAsDemoUser } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: 'India',
    state: 'Rajasthan',
    city: 'Jaipur'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationChange = ({ country, state, city }) => {
    setFormData(prev => ({ ...prev, country, state, city }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    const { data, error: authError } = await signUp({
      email: formData.email,
      password: formData.password,
      full_name: formData.fullName,
      country: formData.country,
      state: formData.state,
      city: formData.city
    });
    setLoading(false);

    if (authError) {
      setError(authError.message || 'Registration failed. Please check inputs.');
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8">
        
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
            {t('auth.signupSubtitle', 'Join thousands of citizens making cities cleaner and greener.')}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-8 shadow-lg space-y-6">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
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
                  placeholder="e.g. Aarav Patel"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-eco-200 dark:border-dark-border bg-eco-50/50 dark:bg-dark-bg text-stone-900 dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-eco-500"
                  required
                />
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Email */}
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

            {/* Password Grid */}
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

            {/* Dependent Location Selector (Country -> State -> City) */}
            <div className="pt-2 border-t border-eco-100 dark:border-dark-border">
              <span className="block text-xs font-bold text-eco-900 dark:text-eco-300 mb-2 uppercase tracking-wider">
                Civic Location
              </span>
              <LocationSelector
                country={formData.country}
                state={formData.state}
                city={formData.city}
                onChange={handleLocationChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-eco-900 hover:bg-eco-950 transition-colors shadow-md disabled:opacity-50 mt-4"
            >
              {loading ? t('common.loading', 'Creating Account...') : t('auth.signupBtn', 'Create Account')}
            </button>
          </form>

          {/* Guest Demo shortcut */}
          <div className="pt-2 border-t border-eco-100 dark:border-dark-border">
            <button
              type="button"
              onClick={async () => {
                await loginAsDemoUser();
                navigate('/dashboard', { replace: true });
              }}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-eco-900 dark:text-eco-200 bg-eco-100 hover:bg-eco-200/80 border border-eco-300 dark:border-dark-border transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-eco-700" />
              <span>Try Guest Demo Mode (Instant Access)</span>
            </button>
          </div>

          <div className="text-center text-xs text-stone-600 dark:text-dark-muted">
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
