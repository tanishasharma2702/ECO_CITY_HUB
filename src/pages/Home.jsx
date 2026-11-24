import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Leaf,
  Footprints,
  AlertTriangle,
  Sprout,
  ShieldCheck,
  Award,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  Users,
  Building2,
  Cpu,
  Sparkles,
  MapPin,
  Flame,
  Globe2,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="space-y-24 sm:space-y-32 pb-16 overflow-hidden">
      
      {/* =====================================================================
          1. HERO SECTION
          ===================================================================== */}
      <section className="relative pt-10 sm:pt-16 lg:pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-eco-200/40 dark:bg-eco-950/20 blur-3xl rounded-full -z-10 pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Text */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-eco-200/70 dark:bg-dark-card border border-eco-300 dark:border-dark-border text-eco-950 dark:text-eco-200 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-eco-700 dark:text-eco-400" />
              <span>{t('hero.badge', 'AI-Powered Smart City & Environmental Platform')}</span>
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-eco-950 dark:text-dark-text tracking-tight leading-[1.12]">
              Together, Let's Build a <span className="text-transparent bg-clip-text bg-gradient-to-r from-eco-800 via-eco-900 to-eco-950 dark:from-eco-300 dark:to-eco-100">Greener City.</span>
            </h1>

            <p className="font-display font-semibold text-lg sm:text-xl text-eco-800 dark:text-eco-300">
              "One Platform. Three Problems. One Greener City."
            </p>

            <p className="text-base sm:text-lg text-stone-600 dark:text-dark-muted max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Track your environmental impact, report local civic problems, and take better care of plants with AI-powered tools. Every small action contributes to a cleaner and more sustainable community.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              <Link
                to={user ? "/dashboard" : "/signup"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-base font-bold text-white bg-eco-900 hover:bg-eco-950 shadow-md hover:shadow-lg transition-all group"
              >
                <span>{user ? t('nav.dashboard', 'Go to Dashboard') : t('hero.btnGetStarted', 'Get Started')}</span>
                <ArrowRight className="w-4 h-4 text-eco-200 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-2xl text-base font-semibold text-eco-900 dark:text-dark-text bg-eco-100/80 dark:bg-dark-card border border-eco-200 dark:border-dark-border hover:bg-eco-200/80 transition-colors"
              >
                {t('hero.btnExplore', 'Explore Features')}
              </a>
            </div>

            {/* Quick Metrics */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-eco-200/80 dark:border-dark-border text-center lg:text-left">
              <div>
                <p className="font-display font-bold text-2xl sm:text-3xl text-eco-900 dark:text-eco-200">12,450+</p>
                <p className="text-xs text-stone-500 dark:text-dark-muted font-medium">Active Citizens</p>
              </div>
              <div>
                <p className="font-display font-bold text-2xl sm:text-3xl text-eco-900 dark:text-eco-200">38.4k</p>
                <p className="text-xs text-stone-500 dark:text-dark-muted font-medium">kg CO2 Tracked</p>
              </div>
              <div>
                <p className="font-display font-bold text-2xl sm:text-3xl text-eco-900 dark:text-eco-200">2,890+</p>
                <p className="text-xs text-stone-500 dark:text-dark-muted font-medium">Civic Issues Solved</p>
              </div>
              <div>
                <p className="font-display font-bold text-2xl sm:text-3xl text-eco-900 dark:text-eco-200">96.8%</p>
                <p className="text-xs text-stone-500 dark:text-dark-muted font-medium">Plant Recovery</p>
              </div>
            </div>
          </div>

          {/* Hero Illustration / Smart City Graphic */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Decorative Frame */}
              <div className="absolute inset-0 bg-gradient-to-tr from-eco-400 to-eco-200 rounded-3xl transform rotate-2 scale-102 opacity-60 filter blur-sm"></div>
              
              <div className="relative rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-6 shadow-2xl space-y-5">
                
                {/* Header card preview */}
                <div className="flex items-center justify-between border-b border-eco-100 dark:border-dark-border pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-eco-900 text-white flex items-center justify-center font-bold">
                      <Leaf className="w-5 h-5 text-eco-200" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-eco-950 dark:text-dark-text">EcoCity Intelligence</h4>
                      <p className="text-xs text-eco-700 dark:text-dark-muted">Real-Time Urban Diagnostics</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-300">
                    Live
                  </span>
                </div>

                {/* Micro preview items */}
                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-eco-50 dark:bg-dark-bg/60 border border-eco-100 dark:border-dark-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-eco-200 dark:bg-stone-800 flex items-center justify-center text-eco-900 dark:text-eco-200">
                        <Footprints className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-800 dark:text-dark-text">Emissions Audit</p>
                        <p className="text-[11px] text-stone-500">242 kg CO2e / month</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">-18% vs prev</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-eco-50 dark:bg-dark-bg/60 border border-eco-100 dark:border-dark-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-eco-300 dark:bg-stone-800 flex items-center justify-center text-eco-900 dark:text-eco-200">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-800 dark:text-dark-text">Civic Hazard Verified</p>
                        <p className="text-[11px] text-stone-500">Pothole on Main Rd • Priority High</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                      Under Review
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-eco-50 dark:bg-dark-bg/60 border border-eco-100 dark:border-dark-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-eco-400 dark:bg-stone-800 flex items-center justify-center text-eco-950 dark:text-eco-100">
                        <Sprout className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-800 dark:text-dark-text">Plant Leaf Diagnosis</p>
                        <p className="text-[11px] text-stone-500">Golden Pothos • Neem organic wash</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-eco-800 dark:text-eco-300">92% Match</span>
                  </div>
                </div>

                {/* Gamification mini badge */}
                <div className="pt-2 flex items-center justify-between text-xs text-stone-600 dark:text-dark-muted font-medium border-t border-eco-100 dark:border-dark-border">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>Level: <strong>Green Guardian</strong></span>
                  </div>
                  <span className="font-bold text-eco-900 dark:text-eco-200">760 pts</span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =====================================================================
          2. ABOUT SECTION
          ===================================================================== */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-8 sm:p-12 shadow-sm space-y-8">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold text-eco-800 dark:text-eco-400 tracking-wider uppercase">
              About EcoCity Hub
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-eco-950 dark:text-dark-text">
              Bridging Civic Vigilance, Eco-Consciousness, and Plant Care with AI
            </h2>
            <p className="text-stone-600 dark:text-dark-muted leading-relaxed">
              Traditional urban management often separates environmental consciousness from local community action. EcoCity Hub bridges this critical divide by uniting three essential pillars into a unified, intelligent web application.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="p-6 rounded-2xl bg-eco-50/70 dark:bg-dark-bg/60 border border-eco-200/80 dark:border-dark-border space-y-3">
              <div className="w-12 h-12 rounded-xl bg-eco-200 text-eco-900 flex items-center justify-center font-bold">
                <Footprints className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-eco-950 dark:text-dark-text">1. Carbon Intelligence</h3>
              <p className="text-sm text-stone-600 dark:text-dark-muted leading-relaxed">
                Empowering individuals to measure exact emissions from transport, electricity, and diet using verifiable factors—accompanied by Gemini AI decarbonization plans.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-eco-50/70 dark:bg-dark-bg/60 border border-eco-200/80 dark:border-dark-border space-y-3">
              <div className="w-12 h-12 rounded-xl bg-eco-300 text-eco-900 flex items-center justify-center font-bold">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-eco-950 dark:text-dark-text">2. Civic Infrastructure</h3>
              <p className="text-sm text-stone-600 dark:text-dark-muted leading-relaxed">
                Transforming smartphones into municipal observation eyes. Snap street hazards, let vision AI categorize problems, estimate danger, and draft ready-to-file complaints.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-eco-50/70 dark:bg-dark-bg/60 border border-eco-200/80 dark:border-dark-border space-y-3">
              <div className="w-12 h-12 rounded-xl bg-eco-400 text-eco-950 flex items-center justify-center font-bold">
                <Sprout className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-eco-950 dark:text-dark-text">3. Urban Flora Health</h3>
              <p className="text-sm text-stone-600 dark:text-dark-muted leading-relaxed">
                Nurturing greenery that purifies city air. Vision-capable Gemini detects plant diseases, identifies root causes, and recommends safe, organic home remedies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. EXPLORE OUR FEATURES (3 Key Modules)
          ===================================================================== */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold text-eco-800 dark:text-eco-400 tracking-wider uppercase">
            Platform Capabilities
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-eco-950 dark:text-dark-text">
            Explore Our Three Core Features
          </h2>
          <p className="text-stone-600 dark:text-dark-muted text-base">
            Three intelligent modules meticulously engineered to solve real-world urban and environmental challenges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Feature 1 */}
          <div className="rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-eco-100 dark:bg-stone-800 text-eco-900 dark:text-eco-200 flex items-center justify-center">
                <Footprints className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-eco-950 dark:text-dark-text">
                  Carbon Footprint Calculator
                </h3>
                <p className="text-xs font-medium text-eco-800 dark:text-eco-400 mt-1">
                  Understand how your daily lifestyle affects the environment.
                </p>
              </div>
              <ul className="space-y-2.5 text-xs text-stone-600 dark:text-dark-muted">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-eco-700 shrink-0 mt-0.5" />
                  <span>Transportation tracking across personal cars, motorcycles, buses, metro, and walking.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-eco-700 shrink-0 mt-0.5" />
                  <span>Monthly electricity consumption analytics in kWh.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-eco-700 shrink-0 mt-0.5" />
                  <span>Food choice impact (Vegan, Vegetarian, Mixed).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-eco-700 shrink-0 mt-0.5" />
                  <span>Deterministic emission calculations with documented IPCC factors.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-eco-700 shrink-0 mt-0.5" />
                  <span>Personalized Gemini AI decarbonization recommendations.</span>
                </li>
              </ul>
            </div>

            <Link
              to="/calculator"
              className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-eco-900 dark:text-dark-text bg-eco-100/60 dark:bg-stone-800/80 hover:bg-eco-200 transition-colors"
            >
              <span>Launch Calculator</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Feature 2 */}
          <div className="rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-eco-200 dark:bg-stone-800 text-eco-950 dark:text-eco-200 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-eco-950 dark:text-dark-text">
                  Civic Issue Reporter
                </h3>
                <p className="text-xs font-medium text-eco-800 dark:text-eco-400 mt-1">
                  Help make your neighbourhood cleaner and safer.
                </p>
              </div>
              <ul className="space-y-2.5 text-xs text-stone-600 dark:text-dark-muted">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-eco-700 shrink-0 mt-0.5" />
                  <span>Upload photographs of potholes, garbage, broken streetlights, and leaks.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-eco-700 shrink-0 mt-0.5" />
                  <span>Gemini Vision AI image recognition and automatic categorization.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-eco-700 shrink-0 mt-0.5" />
                  <span>Priority estimation (Low, Medium, High, Critical).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-eco-700 shrink-0 mt-0.5" />
                  <span>Drafts official, ready-to-send municipal complaint letters.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-eco-700 shrink-0 mt-0.5" />
                  <span>Interactive Leaflet map pinpointing and lifecycle tracking (Draft to Resolved).</span>
                </li>
              </ul>
            </div>

            <Link
              to="/civic-reporter"
              className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-eco-900 dark:text-dark-text bg-eco-100/60 dark:bg-stone-800/80 hover:bg-eco-200 transition-colors"
            >
              <span>Report an Issue</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Feature 3 */}
          <div className="rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-eco-300 dark:bg-stone-800 text-eco-950 dark:text-eco-200 flex items-center justify-center">
                <Sprout className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-eco-950 dark:text-dark-text">
                  Plant Health Checker
                </h3>
                <p className="text-xs font-medium text-eco-800 dark:text-eco-400 mt-1">
                  Give your plants better care using AI.
                </p>
              </div>
              <ul className="space-y-2.5 text-xs text-stone-600 dark:text-dark-muted">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-eco-700 shrink-0 mt-0.5" />
                  <span>Upload leaf and plant photographs for immediate AI vision analysis.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-eco-700 shrink-0 mt-0.5" />
                  <span>Botanical plant identification with common and Latin scientific names.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-eco-700 shrink-0 mt-0.5" />
                  <span>Detection of chlorosis, necrosis, leaf spots, and pest infestations.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-eco-700 shrink-0 mt-0.5" />
                  <span>Safe, chemical-free organic treatments and home remedies.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-eco-700 shrink-0 mt-0.5" />
                  <span>Long-term prevention tips and complete plant care history.</span>
                </li>
              </ul>
            </div>

            <Link
              to="/plant-checker"
              className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-eco-900 dark:text-dark-text bg-eco-100/60 dark:bg-stone-800/80 hover:bg-eco-200 transition-colors"
            >
              <span>Check Plant Health</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* =====================================================================
          4. GREEN SCORE SYSTEM INTRODUCTION & SAMPLE DASHBOARD PREVIEW
          ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-eco-100 via-eco-50 to-white dark:from-dark-card dark:via-dark-bg dark:to-dark-card border border-eco-200 dark:border-dark-border p-8 sm:p-12 space-y-10">
          
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-bold text-eco-800 dark:text-eco-400 tracking-wider uppercase">
              Gamified Environmental Stewardship
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-eco-950 dark:text-dark-text">
              The Transparent Green Score System
            </h2>
            <p className="text-stone-600 dark:text-dark-muted text-sm sm:text-base leading-relaxed">
              Every action counts. Your Green Score is computed directly from recorded activities across three transparent pillars: 40% Carbon Footprint Reduction, 30% Civic Participation, and 30% Plant Care Stewardship.
            </p>
          </div>

          {/* Sample Dashboard Preview Card */}
          <div className="rounded-2xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-6 shadow-lg space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-eco-100 dark:border-dark-border pb-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                  Sample Dashboard Preview (Example Demonstration)
                </span>
                <h3 className="font-display font-bold text-lg text-stone-900 dark:text-dark-text mt-1">
                  Citizen Profile: Aarav Patel (Jaipur, India)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500 dark:text-dark-muted">Current Tier:</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-eco-900 text-white">
                  🌿 Eco Explorer (485 pts)
                </span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-eco-50 dark:bg-dark-bg border border-eco-200/80 dark:border-dark-border">
                <p className="text-xs text-stone-500 font-medium">Carbon Footprint Progress</p>
                <p className="font-display font-bold text-2xl text-eco-950 dark:text-dark-text mt-1">-22%</p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">180 pts earned (40% weight)</p>
              </div>

              <div className="p-4 rounded-xl bg-eco-50 dark:bg-dark-bg border border-eco-200/80 dark:border-dark-border">
                <p className="text-xs text-stone-500 font-medium">Civic Reports Filed</p>
                <p className="font-display font-bold text-2xl text-eco-950 dark:text-dark-text mt-1">3 Reports</p>
                <p className="text-[11px] text-eco-800 dark:text-eco-400 font-semibold mt-0.5">150 pts earned (30% weight)</p>
              </div>

              <div className="p-4 rounded-xl bg-eco-50 dark:bg-dark-bg border border-eco-200/80 dark:border-dark-border">
                <p className="text-xs text-stone-500 font-medium">Plant Health Activities</p>
                <p className="font-display font-bold text-2xl text-eco-950 dark:text-dark-text mt-1">4 Plants</p>
                <p className="text-[11px] text-eco-800 dark:text-eco-400 font-semibold mt-0.5">155 pts earned (30% weight)</p>
              </div>

              <div className="p-4 rounded-xl bg-eco-50 dark:bg-dark-bg border border-eco-200/80 dark:border-dark-border">
                <p className="text-xs text-stone-500 font-medium">Weekly Challenges</p>
                <p className="font-display font-bold text-2xl text-eco-950 dark:text-dark-text mt-1">2 Completed</p>
                <p className="text-[11px] text-purple-700 dark:text-purple-400 font-semibold mt-0.5">+100 bonus pts</p>
              </div>
            </div>

            {/* Badges preview row */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-eco-100 dark:border-dark-border">
              <span className="text-xs font-semibold text-stone-700 dark:text-dark-muted">Sample Badges:</span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-eco-100 text-eco-900 border border-eco-200">
                🌱 First Green Step
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-eco-100 text-eco-900 border border-eco-200">
                🛡️ Civic Sentinel
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-eco-100 text-eco-900 border border-eco-200">
                🌿 Botanical Healer
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* =====================================================================
          5. HOW IT WORKS (4 Steps)
          ===================================================================== */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-eco-800 dark:text-eco-400 tracking-wider uppercase">
            Simple Process
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-eco-950 dark:text-dark-text">
            How EcoCity Hub Works
          </h2>
          <p className="text-stone-600 dark:text-dark-muted text-sm sm:text-base">
            Turn daily urban observations into quantifiable environmental change in four simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="relative p-6 rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border space-y-3">
            <div className="w-10 h-10 rounded-xl bg-eco-900 text-white flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="font-bold text-base text-eco-950 dark:text-dark-text">Create Your Account</h3>
            <p className="text-xs text-stone-600 dark:text-dark-muted leading-relaxed">
              Sign up in seconds, configure your city and preferred language, and access your private dashboard.
            </p>
          </div>

          <div className="relative p-6 rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border space-y-3">
            <div className="w-10 h-10 rounded-xl bg-eco-800 text-white flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="font-bold text-base text-eco-950 dark:text-dark-text">Explore the AI Tools</h3>
            <p className="text-xs text-stone-600 dark:text-dark-muted leading-relaxed">
              Calculate your travel and energy emissions, photograph street hazards, or diagnose an ailing houseplant.
            </p>
          </div>

          <div className="relative p-6 rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border space-y-3">
            <div className="w-10 h-10 rounded-xl bg-eco-700 text-white flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="font-bold text-base text-eco-950 dark:text-dark-text">Take Environmental Action</h3>
            <p className="text-xs text-stone-600 dark:text-dark-muted leading-relaxed">
              Follow Gemini's decarbonization plan, dispatch civic complaints, and apply organic neem remedies.
            </p>
          </div>

          <div className="relative p-6 rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border space-y-3">
            <div className="w-10 h-10 rounded-xl bg-eco-600 text-white flex items-center justify-center font-bold text-sm">
              04
            </div>
            <h3 className="font-bold text-base text-eco-950 dark:text-dark-text">Earn Green Points</h3>
            <p className="text-xs text-stone-600 dark:text-dark-muted leading-relaxed">
              Climb tiers from Green Beginner to Planet Protector, unlock prestigious badges, and inspire your community.
            </p>
          </div>

        </div>
      </section>

      {/* =====================================================================
          6. WHY CHOOSE ECOCITY HUB?
          ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-eco-100/60 dark:bg-dark-card border border-eco-200 dark:border-dark-border p-8 sm:p-12 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-eco-800 dark:text-eco-400 tracking-wider uppercase">
              The EcoCity Advantage
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-eco-950 dark:text-dark-text">
              Why Choose EcoCity Hub?
            </h2>
            <p className="text-stone-600 dark:text-dark-muted text-sm sm:text-base">
              A purposeful blend of artificial intelligence, municipal engagement, and verifiable impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-dark-bg border border-eco-200 dark:border-dark-border space-y-2">
              <div className="w-10 h-10 rounded-xl bg-eco-100 dark:bg-stone-800 flex items-center justify-center text-eco-900 dark:text-eco-200">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-eco-950 dark:text-dark-text">AI-Powered Assistance</h4>
              <p className="text-xs text-stone-600 dark:text-dark-muted leading-relaxed">
                Vision-capable Gemini models provide instant analysis for photos and personalized lifestyle coaching.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-dark-bg border border-eco-200 dark:border-dark-border space-y-2">
              <div className="w-10 h-10 rounded-xl bg-eco-100 dark:bg-stone-800 flex items-center justify-center text-eco-900 dark:text-eco-200">
                <Globe2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-eco-950 dark:text-dark-text">Environmental Awareness</h4>
              <p className="text-xs text-stone-600 dark:text-dark-muted leading-relaxed">
                Documented emission factors demystify how daily transportation and household power affect the climate.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-dark-bg border border-eco-200 dark:border-dark-border space-y-2">
              <div className="w-10 h-10 rounded-xl bg-eco-100 dark:bg-stone-800 flex items-center justify-center text-eco-900 dark:text-eco-200">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-eco-950 dark:text-dark-text">Civic Responsibility</h4>
              <p className="text-xs text-stone-600 dark:text-dark-muted leading-relaxed">
                Empowers residents to report potholes, water leaks, and illegal dumping directly to municipal departments.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-dark-bg border border-eco-200 dark:border-dark-border space-y-2">
              <div className="w-10 h-10 rounded-xl bg-eco-100 dark:bg-stone-800 flex items-center justify-center text-eco-900 dark:text-eco-200">
                <Sprout className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-eco-950 dark:text-dark-text">Plant Health Guidance</h4>
              <p className="text-xs text-stone-600 dark:text-dark-muted leading-relaxed">
                Maintains urban and home flora with timely symptom recognition and chemical-free remedies.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-dark-bg border border-eco-200 dark:border-dark-border space-y-2">
              <div className="w-10 h-10 rounded-xl bg-eco-100 dark:bg-stone-800 flex items-center justify-center text-eco-900 dark:text-eco-200">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-eco-950 dark:text-dark-text">Community Participation</h4>
              <p className="text-xs text-stone-600 dark:text-dark-muted leading-relaxed">
                Fosters neighborhood solidarity through public hazard reporting and collaborative city cleanup.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-dark-bg border border-eco-200 dark:border-dark-border space-y-2">
              <div className="w-10 h-10 rounded-xl bg-eco-100 dark:bg-stone-800 flex items-center justify-center text-eco-900 dark:text-eco-200">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-eco-950 dark:text-dark-text">Gamified Sustainability</h4>
              <p className="text-xs text-stone-600 dark:text-dark-muted leading-relaxed">
                Transparent points computed directly from verified actions, not arbitrary frontend placeholders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          7. FINAL CALL TO ACTION
          ===================================================================== */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-eco-950 via-eco-900 to-eco-800 text-white p-10 sm:p-16 text-center space-y-6 shadow-xl overflow-hidden">
          {/* Background art circles */}
          <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-eco-700/30 blur-2xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-eco-600/30 blur-2xl pointer-events-none" />

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-eco-800/80 text-eco-200 border border-eco-700">
            <Leaf className="w-3.5 h-3.5" />
            <span>Join the Movement</span>
          </span>

          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white max-w-2xl mx-auto tracking-tight">
            Small Actions. Meaningful Change.
          </h2>

          <p className="text-eco-100 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Your city becomes better when everyone contributes. Start your journey towards a greener tomorrow with EcoCity Hub.
          </p>

          <div className="pt-2">
            <Link
              to={user ? "/dashboard" : "/signup"}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-eco-950 bg-eco-100 hover:bg-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              <span>{user ? "Open Your Dashboard" : "Get Started with EcoCity Hub"}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
