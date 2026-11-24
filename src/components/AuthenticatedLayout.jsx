import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer';
import LanguageSelector from './LanguageSelector';
import { Menu, Database, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../services/supabase';

export default function AuthenticatedLayout() {
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
              <span className="hidden sm:inline-block text-xs text-eco-800 dark:text-dark-muted ml-2 font-medium">
                • {user?.user_metadata?.city || 'Civic Ward'}
              </span>
            </div>
          </div>

          {/* Right Header items: DB status + Language Selector + User avatar */}
          <div className="flex items-center gap-3">
            {/* Database indicator */}
            <div
              className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                isOnlineDb
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
              }`}
              title={isOnlineDb ? "Connected to live Supabase PostgreSQL" : "Running in Zero-Config Demo Mode"}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isOnlineDb ? 'Supabase Connected' : 'Offline / Demo Mode'}</span>
            </div>

            <LanguageSelector />

            <div className="w-9 h-9 rounded-full bg-eco-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
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
