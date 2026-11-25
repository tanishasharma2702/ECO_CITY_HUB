import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Leaf, Mail, Lock, AlertCircle, Sparkles } from 'lucide-react';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInDemo } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError(t('auth.fillAllFields', 'Please fill in both your email address and password.'));
      return;
    }

    setLoading(true);
    const { data, error: authError } = await signIn(email, password);
    setLoading(false);

    if (authError) {
      setError(authError.message || t('auth.invalidCredentials', 'Invalid credentials. Please try again.'));
    } else {
      navigate(from, { replace: true });
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    const { error: authError } = await signInDemo();
    setLoading(false);

    if (authError) {
      setError(authError.message || t('auth.demoLoginFailed', 'Failed to launch demo account.'));
    } else {
      navigate('/dashboard', { replace: true });
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
                  placeholder={t('auth.emailPlaceholder', 'name@example.com')}
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

          {/* Demo Account Access Button */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-eco-200 dark:border-dark-border" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
              <span className="bg-white dark:bg-dark-card px-3 text-stone-400 font-semibold">
                {t('auth.orInstantAccess', 'Instant Access')}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm text-eco-950 dark:text-dark-text bg-gradient-to-r from-amber-100 to-eco-100 hover:from-amber-200 hover:to-eco-200 dark:from-stone-800 dark:to-stone-700 dark:hover:from-stone-700 dark:hover:to-stone-600 border border-amber-300/80 dark:border-amber-800/40 transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-700 dark:text-amber-400 group-hover:rotate-12 transition-transform" />
            <span>{t('auth.exploreDemoBtn', 'Explore Demo Account')}</span>
          </button>

          <div className="text-center text-xs text-stone-600 dark:text-dark-muted pt-2 border-t border-eco-100 dark:border-dark-border">
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
