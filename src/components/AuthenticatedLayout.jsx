import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import Footer from './Footer';
import LanguageSelector from './LanguageSelector';
import { Menu, Database, ShieldCheck, User, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../services/supabase';

export default function AuthenticatedLayout() {
  const { t } = useTranslation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user } = useAuth();
  const isOnlineDb = isSupabaseConfigured();

  // Check stored collapsed state to compute left margin on desktop
  const isCollapsed = localStorage.getItem('ecocity_sidebar_collapsed') === 'true';

  return (
    <div className="min-h-screen bg-eco-50 dark:bg-dark-bg text-stone-900 dark:text-dark-text flex flex-col transition-colors">
      
      {/* Collapsible Left Sidebar */}
      <Sidebar mobileOpen={mobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />

      {/* Main Content Area (offset by sidebar on desktop) */}
      <div className="flex-1 flex flex-col lg:pl-64 transition-all duration-300">
        
        {/* Authenticated Top Navigation Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-dark-card/90 backdrop-blur-md border-b border-eco-200 dark:border-dark-border px-4 sm:px-6 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-stone-600 dark:text-dark-muted hover:bg-eco-100 dark:hover:bg-dark-bg focus:outline-none"
              aria-label="Open Navigation Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <span className="font-display font-bold text-base sm:text-lg text-eco-950 dark:text-dark-text">
                EcoCity Hub
              </span>
              {user?.user_metadata?.city && (
                <span className="hidden sm:inline-block text-xs text-eco-800 dark:text-dark-muted ml-2 font-medium">
                  • {user.user_metadata.city}, {user.user_metadata.state}
                </span>
              )}
            </div>
          </div>

          {/* Right Header items: Demo badge + DB status + Language Selector + User avatar */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Demo Account Indicator */}
            {user?.user_metadata?.is_demo && (
              <div
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-sm"
                title={t('auth.demoBadgeTitle', 'Demo Account: Full access to Carbon, Civic, and Plant modules')}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="hidden xs:inline">{t('auth.demoBadge', 'Demo Account')}</span>
                <span className="xs:hidden">Demo</span>
              </div>
            )}

            {/* Database indicator */}
            <div
              className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                isOnlineDb
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-dark-muted border-stone-200 dark:border-dark-border'
              }`}
              title={isOnlineDb ? "Connected to live Supabase PostgreSQL" : "Connected to Private Browser Storage"}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isOnlineDb ? 'Supabase Live' : 'Storage Active'}</span>
            </div>

            <LanguageSelector />

            {user?.user_metadata?.avatar_url ? (
              <div className="w-9 h-9 rounded-full overflow-hidden border border-eco-300 dark:border-dark-border shadow-sm shrink-0">
                <img
                  src={user.user_metadata.avatar_url}
                  alt={user?.user_metadata?.full_name || 'Citizen'}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-eco-900 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
                {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <Footer />
      </div>

    </div>
  );
}
