import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Leaf, Menu, X, ArrowRight, User, LogIn, Sparkles } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: t('nav.home', 'Home'), href: '/' },
    { name: t('nav.about', 'About'), href: '/#about' },
    { name: t('nav.exploreFeatures', 'Explore Features'), href: '/#features' },
    { name: t('nav.howItWorks', 'How It Works'), href: '/#how-it-works' },
    { name: t('nav.contact', 'Contact'), href: '/#contact' },
  ];

  const handleScroll = (href) => {
    setMobileMenuOpen(false);
    if (href.startsWith('/#')) {
      const id = href.replace('/#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-eco-50/90 dark:bg-dark-bg/90 border-b border-eco-200/80 dark:border-dark-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-eco-800 to-eco-950 flex items-center justify-center text-eco-100 shadow-md group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5 text-eco-200" />
            </div>
            <div>
              <span className="font-display font-bold text-xl sm:text-2xl text-eco-950 dark:text-dark-text tracking-tight">
                EcoCity Hub
              </span>
              <p className="hidden sm:block text-[11px] font-medium text-eco-800 dark:text-dark-muted -mt-0.5">
                {t('brand.tagline', 'One Platform. Three Problems. One Greener City.')}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  if (link.href.startsWith('/#') && location.pathname === '/') {
                    e.preventDefault();
                    handleScroll(link.href);
                  }
                }}
                className="px-3 py-2 rounded-lg text-sm font-medium text-stone-700 dark:text-dark-muted hover:text-eco-950 dark:hover:text-white hover:bg-eco-100/50 dark:hover:bg-dark-card transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Action: Language + Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSelector />

            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-eco-900 hover:bg-eco-950 shadow-sm hover:shadow transition-all"
              >
                <User className="w-4 h-4 text-eco-200" />
                <span>{t('nav.dashboard', 'Dashboard')}</span>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-sm font-semibold text-eco-900 dark:text-dark-text hover:bg-eco-100 dark:hover:bg-dark-card transition-colors"
                >
                  {t('nav.login', 'Login')}
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-eco-900 hover:bg-eco-950 shadow-sm hover:shadow transition-all"
                >
                  <span>{t('nav.signup', 'Sign Up')}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-eco-200" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSelector />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-stone-700 dark:text-dark-text hover:bg-eco-100 dark:hover:bg-dark-card focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-eco-200 dark:border-dark-border bg-white dark:bg-dark-card px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-200 shadow-xl">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  if (link.href.startsWith('/#') && location.pathname === '/') {
                    e.preventDefault();
                    handleScroll(link.href);
                  } else {
                    setMobileMenuOpen(false);
                  }
                }}
                className="block px-3 py-2.5 rounded-lg text-base font-medium text-stone-700 dark:text-dark-text hover:bg-eco-50 dark:hover:bg-stone-800"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="pt-3 border-t border-eco-100 dark:border-dark-border space-y-2">
            {user ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-eco-900"
              >
                <User className="w-4 h-4 text-eco-200" />
                <span>{t('nav.dashboard', 'Go to Dashboard')}</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center py-2.5 rounded-xl text-sm font-semibold text-eco-900 dark:text-dark-text border border-eco-200 dark:border-dark-border"
                >
                  {t('nav.login', 'Login')}
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-white bg-eco-900"
                >
                  <span>{t('nav.signup', 'Sign Up')}</span>
                  <ArrowRight className="w-4 h-4 text-eco-200" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
