import React from 'react';
import { Leaf, Heart, Shield, Globe, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-eco-100/70 dark:bg-dark-card border-t border-eco-200 dark:border-dark-border py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-eco-900 text-eco-100 flex items-center justify-center font-bold text-lg shadow-sm">
                <Leaf className="w-5 h-5 text-eco-200" />
              </div>
              <div>
                <span className="font-display font-bold text-xl text-eco-950 dark:text-dark-text tracking-tight">EcoCity Hub</span>
                <p className="text-xs text-eco-800 dark:text-dark-muted font-medium">Smart City & Environmental Platform</p>
              </div>
            </Link>
            <p className="text-sm text-stone-600 dark:text-dark-muted leading-relaxed">
              One Platform. Three Problems. One Greener City. Empowering citizens to monitor their carbon impact, clean urban streets, and heal plants with AI.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm text-eco-950 dark:text-dark-text uppercase tracking-wider mb-3">AI Platforms</h4>
            <ul className="space-y-2 text-sm text-stone-600 dark:text-dark-muted">
              <li><Link to="/calculator" className="hover:text-eco-900 dark:hover:text-eco-300 transition-colors">Carbon Calculator</Link></li>
              <li><Link to="/civic-reporter" className="hover:text-eco-900 dark:hover:text-eco-300 transition-colors">Civic Issue Reporter</Link></li>
              <li><Link to="/plant-checker" className="hover:text-eco-900 dark:hover:text-eco-300 transition-colors">Plant Health Checker</Link></li>
              <li><Link to="/green-score" className="hover:text-eco-900 dark:hover:text-eco-300 transition-colors">Green Score & Badges</Link></li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold text-sm text-eco-950 dark:text-dark-text uppercase tracking-wider mb-3">Community</h4>
            <ul className="space-y-2 text-sm text-stone-600 dark:text-dark-muted">
              <li><Link to="/green-challenges" className="hover:text-eco-900 dark:hover:text-eco-300 transition-colors">Weekly Challenges</Link></li>
              <li><Link to="/my-reports" className="hover:text-eco-900 dark:hover:text-eco-300 transition-colors">Public Issue Tracker</Link></li>
              <li><a href="#about" className="hover:text-eco-900 dark:hover:text-eco-300 transition-colors">About Us</a></li>
              <li><a href="#how-it-works" className="hover:text-eco-900 dark:hover:text-eco-300 transition-colors">How It Works</a></li>
            </ul>
          </div>

          {/* Environmental Mission */}
          <div>
            <h4 className="font-semibold text-sm text-eco-950 dark:text-dark-text uppercase tracking-wider mb-3">Sustainable Vision</h4>
            <div className="p-3.5 rounded-xl bg-eco-200/50 dark:bg-stone-800/60 border border-eco-300 dark:border-dark-border text-xs text-stone-700 dark:text-dark-muted space-y-2">
              <div className="flex items-center gap-2 font-medium text-eco-900 dark:text-eco-300">
                <Shield className="w-4 h-4" />
                <span>Civic Vigilance & Ecology</span>
              </div>
              <p>Direct citizen reporting bridges the gap between urban municipal councils and daily environmental stewardship.</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-eco-200 dark:border-dark-border pt-8 text-center space-y-2">
          {/* Exact required text in black, centre-aligned */}
          <div className="text-black dark:text-white font-bold text-base sm:text-lg tracking-wide">
            Tanisha Sharma | JECRC University
          </div>
          <div className="text-black dark:text-stone-300 text-sm font-medium italic">
            "Empowering community vigilance for cleaner, safer streets."
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 pt-2">
            EcoCity Hub © {new Date().getFullYear()} – All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
