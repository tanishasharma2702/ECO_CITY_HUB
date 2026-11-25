import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Footprints,
  AlertTriangle,
  Sprout,
  Award,
  ClipboardList,
  Target,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Leaf,
  X
} from 'lucide-react';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { t } = useTranslation();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  // Collapsible state for desktop
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('ecocity_sidebar_collapsed') === 'true';
  });

  const toggleCollapsed = () => {
    const nextState = !collapsed;
    setCollapsed(nextState);
    localStorage.setItem('ecocity_sidebar_collapsed', String(nextState));
  };

  const navItems = [
    {
      to: '/dashboard',
      label: t('nav.dashboard', 'Dashboard'),
      icon: LayoutDashboard
    },
    {
      to: '/calculator',
      label: t('nav.carbonCalculator', 'Carbon Calculator'),
      icon: Footprints
    },
    {
      to: '/civic-reporter',
      label: t('nav.civicReporter', 'Civic Issue Reporter'),
      icon: AlertTriangle
    },
    {
      to: '/plant-checker',
      label: t('nav.plantChecker', 'Plant Health Checker'),
      icon: Sprout
    },
    {
      to: '/green-challenges',
      label: t('nav.greenChallenges', 'Green Challenges'),
      icon: Target
    },
    {
      to: '/my-reports',
      label: t('nav.myReports', 'My Reports'),
      icon: ClipboardList
    },
    {
      to: '/green-score',
      label: t('nav.greenScore', 'Green Score & Badges'),
      icon: Award
    },
    {
      to: '/settings',
      label: t('nav.settings', 'Settings'),
      icon: Settings
    }
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const sidebarWidth = collapsed ? 'w-20' : 'w-64';

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 h-screen z-50 bg-white dark:bg-dark-card border-r border-eco-200 dark:border-dark-border flex flex-col justify-between transition-all duration-300 ease-in-out ${sidebarWidth} ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header / Brand */}
        <div className="p-4 border-b border-eco-100 dark:border-dark-border flex items-center justify-between">
          <NavLink
            to="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 overflow-hidden"
          >
            <div className="w-10 h-10 shrink-0 rounded-xl bg-eco-900 text-eco-100 flex items-center justify-center font-bold shadow-sm">
              <Leaf className="w-5 h-5 text-eco-200" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <span className="font-display font-bold text-lg text-eco-950 dark:text-dark-text tracking-tight block truncate">
                  EcoCity Hub
                </span>
                <span className="text-[10px] font-semibold text-eco-800 dark:text-dark-muted block truncate">
                  {t('brand.smartCityDesc', 'Smart City Platform')}
                </span>
              </div>
            )}
          </NavLink>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-stone-500 hover:bg-eco-100 dark:hover:bg-dark-bg"
            title={t('common.close', 'Close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                    isActive
                      ? 'bg-eco-900 text-white shadow-sm'
                      : 'text-stone-700 dark:text-dark-muted hover:bg-eco-100/70 dark:hover:bg-dark-bg hover:text-eco-950 dark:hover:text-dark-text'
                  }`
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-colors group-hover:scale-105`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </div>

        {/* User Mini Bar & Toggle Button */}
        <div className="p-3 border-t border-eco-100 dark:border-dark-border space-y-2">
          
          {/* User profile snippet */}
          {!collapsed && (
            <div className="p-2.5 rounded-xl bg-eco-50 dark:bg-dark-bg flex items-center gap-3 overflow-hidden">
              {user?.user_metadata?.avatar_url ? (
                <div className="w-8 h-8 rounded-full overflow-hidden border border-eco-300 dark:border-dark-border shrink-0">
                  <img
                    src={user.user_metadata.avatar_url}
                    alt={user?.user_metadata?.full_name || 'Citizen'}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-eco-300 dark:bg-stone-700 text-eco-950 dark:text-eco-200 flex items-center justify-center font-bold text-xs shrink-0">
                  {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
              )}
              <div className="truncate text-xs">
                <p className="font-bold text-eco-950 dark:text-dark-text truncate">
                  {user?.user_metadata?.full_name || t('common.activeCitizen', 'Active Citizen')}
                </p>
                <p className="text-stone-500 dark:text-dark-muted truncate">
                  {user?.user_metadata?.city ? `${user.user_metadata.city}, ${user.user_metadata.state}` : (user?.user_metadata?.state || 'India')}
                </p>
              </div>
            </div>
          )}

          {/* Logout Action */}
          <button
            type="button"
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
            title={collapsed ? t('nav.logout', 'Logout') : undefined}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{t('nav.logout', 'Logout')}</span>}
          </button>

          {/* Collapse / Expand Toggle Button (Desktop only) */}
          <div className="hidden lg:block pt-1 border-t border-eco-100 dark:border-dark-border">
            <button
              type="button"
              onClick={toggleCollapsed}
              className="w-full flex items-center justify-center p-2 rounded-xl text-stone-500 hover:bg-eco-100 dark:hover:bg-dark-bg transition-colors"
              title={collapsed ? t('common.expandSidebar', 'Expand Sidebar') : t('common.collapseSidebar', 'Collapse Sidebar')}
            >
              {collapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-600 dark:text-dark-muted">
                  <ChevronLeft className="w-4 h-4" />
                  <span>{t('common.collapseSidebar', 'Collapse Sidebar')}</span>
                </div>
              )}
            </button>
          </div>

        </div>
      </aside>
    </>
  );
}
