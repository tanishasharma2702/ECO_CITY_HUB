import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Leaf, Mail, Lock, AlertCircle, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, loginAsDemoUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both your email address and password.');
      return;
    }

    setLoading(true);
    const { data, error: authError } = await signIn(email, password);
    setLoading(false);

    if (authError) {
      setError(authError.message || 'Invalid credentials. Please try again.');
    } else {
      navigate(from, { replace: true });
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setDemoLoading(true);
    const { error: authError } = await loginAsDemoUser();
    setDemoLoading(false);
    if (!authError) {
      navigate('/dashboard', { replace: true });
    } else {
      setError('Demo login error: ' + authError.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        
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
            {t('auth.loginTitle', 'Welcome Back')}
          </h2>
          <p className="text-sm text-stone-600 dark:text-dark-muted">
            {t('auth.loginSubtitle', 'Sign in to manage your green impact and civic reports.')}
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
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-dark-muted mb-1 uppercase tracking-wider">
                {t('auth.email', 'Email Address')}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-eco-200 dark:border-dark-border bg-eco-50/50 dark:bg-dark-bg text-stone-900 dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-eco-500"
                  required
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-dark-muted mb-1 uppercase tracking-wider">
                {t('auth.password', 'Password')}
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-eco-200 dark:border-dark-border bg-eco-50/50 dark:bg-dark-bg text-stone-900 dark:text-dark-text text-sm focus:outline-none focus:ring-2 focus:ring-eco-500"
                  required
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-eco-900 hover:bg-eco-950 transition-colors shadow-md disabled:opacity-50"
            >
              {loading ? t('common.loading', 'Signing in...') : t('auth.loginBtn', 'Sign In')}
            </button>
          </form>

          {/* Quick Demo Access Button */}
          <div className="pt-2 border-t border-eco-100 dark:border-dark-border">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={demoLoading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-eco-900 dark:text-eco-200 bg-eco-100 hover:bg-eco-200/80 border border-eco-300 dark:border-dark-border transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-eco-700" />
              <span>{demoLoading ? 'Logging into demo...' : 'Try Guest Demo (One-Click Instant Access)'}</span>
            </button>
            <p className="text-[11px] text-center text-stone-500 dark:text-dark-muted mt-1.5">
              Instantly preview with pre-seeded demo activities.
            </p>
          </div>

          <div className="text-center text-xs text-stone-600 dark:text-dark-muted pt-1">
            {t('auth.noAccount', "Don't have an account?")}{' '}
            <Link to="/signup" className="font-bold text-eco-900 dark:text-eco-300 hover:underline">
              {t('auth.signupBtn', 'Create Account')}
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
