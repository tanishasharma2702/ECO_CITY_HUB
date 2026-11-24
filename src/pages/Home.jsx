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
              {t('hero.titlePrefix', "Together, Let's Build a ")}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-eco-800 via-eco-900 to-eco-950 dark:from-eco-300 dark:to-eco-100">
                {t('hero.titleHighlight', 'Greener City.')}
              </span>
            </h1>

            <p className="font-display font-semibold text-lg sm:text-xl text-eco-800 dark:text-eco-300">
              "{t('brand.tagline', 'One Platform. Three Problems. One Greener City.')}"
            </p>

            <p className="text-base sm:text-lg text-stone-600 dark:text-dark-muted max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {t('hero.desc', 'Track your environmental impact, report local civic problems, and take better care of plants with AI-powered tools. Every small action contributes to a cleaner and more sustainable community.')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              <Link
                to={user ? "/dashboard" : "/signup"}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-base font-bold text-white bg-eco-900 hover:bg-eco-950 shadow-md hover:shadow-lg transition-all group"
              >
                <span>{user ? t('hero.goToDashboard', 'Go to Dashboard') : t('hero.btnGetStarted', 'Get Started')}</span>
                <ArrowRight className="w-4 h-4 text-eco-200 group-hover:translate-x-1 transition-transform" />
              </Link>

              <a
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-2xl text-base font-semibold text-eco-900 dark:text-dark-text bg-eco-100/80 dark:bg-dark-card border border-eco-200 dark:border-dark-border hover:bg-eco-200/80 transition-colors"
              >
                {t('hero.btnExplore', 'Explore Features')}
              </a>
            </div>

            {/* Platform Highlights */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-eco-200/80 dark:border-dark-border text-center lg:text-left">
              <div>
                <p className="font-display font-bold text-2xl sm:text-3xl text-eco-900 dark:text-eco-200">{t('hero.stat1Value', '3 Pillars')}</p>
                <p className="text-xs text-stone-500 dark:text-dark-muted font-medium">{t('hero.stat1Label', 'Carbon, Civic & Flora')}</p>
              </div>
              <div>
                <p className="font-display font-bold text-2xl sm:text-3xl text-eco-900 dark:text-eco-200">{t('hero.stat2Value', '28 + 8')}</p>
                <p className="text-xs text-stone-500 dark:text-dark-muted font-medium">{t('hero.stat2Label', 'States & UTs Covered')}</p>
              </div>
              <div>
                <p className="font-display font-bold text-2xl sm:text-3xl text-eco-900 dark:text-eco-200">{t('hero.stat3Value', '100%')}</p>
                <p className="text-xs text-stone-500 dark:text-dark-muted font-medium">{t('hero.stat3Label', 'Real Citizen Data')}</p>
              </div>
              <div>
                <p className="font-display font-bold text-2xl sm:text-3xl text-eco-900 dark:text-eco-200">{t('hero.stat4Value', 'AI Vision')}</p>
                <p className="text-xs text-stone-500 dark:text-dark-muted font-medium">{t('hero.stat4Label', 'Gemini Multimodal')}</p>
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
                      <h4 className="font-bold text-sm text-eco-950 dark:text-dark-text">{t('hero.cardTitle', 'EcoCity Intelligence')}</h4>
                      <p className="text-xs text-eco-700 dark:text-dark-muted">{t('hero.cardSubtitle', 'Real-Time Urban Diagnostics')}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-300">
                    {t('hero.cardLive', 'Live')}
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
                        <p className="text-xs font-bold text-stone-800 dark:text-dark-text">{t('hero.previewEmissionsTitle', 'Emissions Audit')}</p>
                        <p className="text-[11px] text-stone-500">{t('hero.previewEmissionsDesc', '242 kg CO2e / month')}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{t('hero.previewEmissionsTrend', '-18% vs prev')}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-eco-50 dark:bg-dark-bg/60 border border-eco-100 dark:border-dark-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-eco-300 dark:bg-stone-800 flex items-center justify-center text-eco-900 dark:text-eco-200">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-800 dark:text-dark-text">{t('hero.previewHazardTitle', 'Civic Hazard Verified')}</p>
                        <p className="text-[11px] text-stone-500">{t('hero.previewHazardDesc', 'Pothole on Main Rd • Priority High')}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                      {t('hero.previewHazardStatus', 'Under Review')}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-eco-50 dark:bg-dark-bg/60 border border-eco-100 dark:border-dark-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-eco-400 dark:bg-stone-800 flex items-center justify-center text-eco-950 dark:text-eco-100">
                        <Sprout className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-800 dark:text-dark-text">{t('hero.previewPlantTitle', 'Plant Leaf Diagnosis')}</p>
                        <p className="text-[11px] text-stone-500">{t('hero.previewPlantDesc', 'Golden Pothos • Neem organic wash')}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-eco-800 dark:text-eco-300">{t('hero.previewPlantMatch', '92% Match')}</span>
                  </div>
                </div>

                {/* Gamification mini badge */}
                <div className="pt-2 flex items-center justify-between text-xs text-stone-600 dark:text-dark-muted font-medium border-t border-eco-100 dark:border-dark-border">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>{t('hero.previewLevel', 'Level: Green Guardian')}</span>
                  </div>
                  <span className="font-bold text-eco-900 dark:text-eco-200">{t('hero.previewPoints', '760 pts')}</span>
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
              {t('about.badge', 'About EcoCity Hub')}
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-eco-950 dark:text-dark-text">
              {t('about.title', 'Bridging Civic Vigilance, Eco-Consciousness, and Plant Care with AI')}
            </h2>
            <p className="text-stone-600 dark:text-dark-muted leading-relaxed">
              {t('about.desc', 'Traditional urban management often separates environmental consciousness from local community action. EcoCity Hub bridges this critical divide by uniting three essential pillars into a unified, intelligent web application.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="p-6 rounded-2xl bg-eco-50/70 dark:bg-dark-bg/60 border border-eco-200/80 dark:border-dark-border space-y-3">
              <div className="w-12 h-12 rounded-xl bg-eco-200 text-eco-900 flex items-center justify-center font-bold">
                <Footprints className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-eco-950 dark:text-dark-text">{t('about.pillar1Title', '1. Carbon Intelligence')}</h3>
              <p className="text-sm text-stone-600 dark:text-dark-muted leading-relaxed">
                {t('about.pillar1Desc', 'Empowering individuals to measure exact emissions from transport, electricity, and diet using verifiable factors—accompanied by Gemini AI decarbonization plans.')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-eco-50/70 dark:bg-dark-bg/60 border border-eco-200/80 dark:border-dark-border space-y-3">
              <div className="w-12 h-12 rounded-xl bg-eco-300 text-eco-900 flex items-center justify-center font-bold">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-eco-950 dark:text-dark-text">{t('about.pillar2Title', '2. Civic Infrastructure')}</h3>
              <p className="text-sm text-stone-600 dark:text-dark-muted leading-relaxed">
                {t('about.pillar2Desc', 'Transforming smartphones into municipal observation eyes. Snap street hazards, let vision AI categorize problems, estimate danger, and draft ready-to-file complaints.')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-eco-50/70 dark:bg-dark-bg/60 border border-eco-200/80 dark:border-dark-border space-y-3">
              <div className="w-12 h-12 rounded-xl bg-eco-400 text-eco-950 flex items-center justify-center font-bold">
                <Sprout className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-eco-950 dark:text-dark-text">{t('about.pillar3Title', '3. Urban Flora Health')}</h3>
              <p className="text-sm text-stone-600 dark:text-dark-muted leading-relaxed">
                {t('about.pillar3Desc', 'Nurturing greenery that purifies city air. Vision-capable Gemini detects plant diseases, identifies root causes, and recommends safe, organic home remedies.')}
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
            {t('features.badge', 'Platform Capabilities')}
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-eco-950 dark:text-dark-text">
            {t('features.title', 'Explore Our Three Core Features')}
          </h2>
          <p className="text-stone-600 dark:text-dark-muted text-base">
            {t('features.subtitle', 'Three intelligent modules meticulously engineered to solve real-world urban and environmental challenges.')}
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
                  {t('features.feat1Title', 'Carbon Footprint Calculator')}
                </h3>
                <p className="text-xs font-medium text-eco-800 dark:text-eco-400 mt-1">
                  {t('features.feat1Subtitle', 'Understand how your daily lifestyle affects the environment.')}
                </p>
              </div>
              <ul className="space-y-2.5 text-xs text-stone-600 dark:text-dark-muted">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-eco-700 shrink-0 mt-0.5" />
                  <span>{t('features.feat1P1', 'Transportation tracking across personal cars, motorcycles, buses, metro, and walking.')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-eco-700 shrink-0 mt-0.5" />
                  <span>{t('features.feat1P2', 'Monthly electricity consumption analytics in kWh.')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-eco-700 shrink-0 mt-0.5" />
                  <span>{t('features.feat1P3', 'Food choice impact (Vegan, Vegetarian, Mixed).')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-eco-700 shrink-0 mt-0.5" />
                  <span>{t('features.feat1P4', 'Deterministic emission calculations with documented IPCC factors.')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-eco-700 shrink-0 mt-0.5" />
                  <span>{t('features.feat1P5', 'Personalized Gemini AI decarbonization recommendations.')}</span>
                </li>
              </ul>
            </div>

            <Link
              to="/calculator"
              className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-eco-900 dark:text-dark-text bg-eco-100/60 dark:bg-stone-800/80 hover:bg-eco-200 transition-colors"
            >
              <span>{t('features.feat1Btn', 'Launch Calculator')}</span>
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
                  {t('features.feat2Title', 'Civic Issue Reporter')}
                </h3>
                <p className="text-xs font-medium text-eco-800 dark:text-eco-400 mt-1">
                  {t('features.feat2Subtitle', 'Help make your neighbourhood cleaner and safer.')}
                </p>
              </div>
              <ul className="space-y-2.5 text-xs text-stone-600 dark:text-dark-muted">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-eco-700 shrink-0 mt-0.5" />
                  <span>{t('features.feat2P1', 'Upload photographs or videos of potholes, garbage, broken streetlights, and leaks.')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-eco-700 shrink-0 mt-0.5" />
                  <span>{t('features.feat2P2', 'Gemini Vision AI image recognition and automatic categorization.')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-eco-700 shrink-0 mt-0.5" />
                  <span>{t('features.feat2P3', 'Priority estimation (Low, Medium, High, Critical).')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-eco-700 shrink-0 mt-0.5" />
                  <span>{t('features.feat2P4', 'Drafts official, ready-to-send municipal complaint letters.')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-eco-700 shrink-0 mt-0.5" />
                  <span>{t('features.feat2P5', 'Interactive Leaflet map pinpointing and lifecycle tracking (Draft to Resolved).')}</span>
                </li>
              </ul>
            </div>

            <Link
              to="/civic-reporter"
              className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-eco-900 dark:text-dark-text bg-eco-100/60 dark:bg-stone-800/80 hover:bg-eco-200 transition-colors"
            >
              <span>{t('features.feat2Btn', 'Report an Issue')}</span>
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
                  {t('features.feat3Title', 'Plant Health Checker')}
                </h3>
                <p className="text-xs font-medium text-eco-800 dark:text-eco-400 mt-1">
                  {t('features.feat3Subtitle', 'Give your plants better care using AI.')}
                </p>
              </div>
              <ul className="space-y-2.5 text-xs text-stone-600 dark:text-dark-muted">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-eco-700 shrink-0 mt-0.5" />
                  <span>{t('features.feat3P1', 'Upload leaf and plant photographs or videos for immediate AI vision analysis.')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-eco-700 shrink-0 mt-0.5" />
                  <span>{t('features.feat3P2', 'Botanical plant identification with common and Latin scientific names.')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-eco-700 shrink-0 mt-0.5" />
                  <span>{t('features.feat3P3', 'Detection of chlorosis, necrosis, leaf spots, and pest infestations.')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-eco-700 shrink-0 mt-0.5" />
                  <span>{t('features.feat3P4', 'Safe, chemical-free organic treatments and home remedies.')}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-eco-700 shrink-0 mt-0.5" />
                  <span>{t('features.feat3P5', 'Long-term prevention tips and complete plant care history.')}</span>
                </li>
              </ul>
            </div>

            <Link
              to="/plant-checker"
              className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-eco-900 dark:text-dark-text bg-eco-100/60 dark:bg-stone-800/80 hover:bg-eco-200 transition-colors"
            >
              <span>{t('features.feat3Btn', 'Check Plant Health')}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </section>

      {/* =====================================================================
          4. GREEN SCORE SYSTEM INTRODUCTION
          ===================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-eco-100 via-eco-50 to-white dark:from-dark-card dark:via-dark-bg dark:to-dark-card border border-eco-200 dark:border-dark-border p-8 sm:p-12 space-y-10">
          
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-bold text-eco-800 dark:text-eco-400 tracking-wider uppercase">
              {t('homeScore.badge', 'Gamified Environmental Stewardship')}
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-eco-950 dark:text-dark-text">
              {t('homeScore.title', 'The Transparent Green Score System')}
            </h2>
            <p className="text-stone-600 dark:text-dark-muted text-sm sm:text-base leading-relaxed">
              {t('homeScore.desc', 'Every action counts. Your Green Score is computed directly from recorded activities across three transparent pillars: 40% Carbon Footprint Reduction, 30% Civic Participation, and 30% Plant Care Stewardship.')}
            </p>
          </div>

          {/* Transparent Scoring Architecture & Tier Progression */}
          <div className="rounded-2xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-6 shadow-lg space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-eco-100 dark:border-dark-border pb-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-eco-100 text-eco-900 dark:bg-eco-950 dark:text-eco-200">
                  {t('homeScore.cardBadge', 'Transparent Formula & Real Database Computation')}
                </span>
                <h3 className="font-display font-bold text-lg text-stone-900 dark:text-dark-text mt-1">
                  {t('homeScore.cardTitle', 'How Citizens Earn Genuine Green Score Points')}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500 dark:text-dark-muted">{t('homeScore.baselineLabel', 'Initial Baseline:')}</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-eco-900 text-white">
                  {t('homeScore.baselineValue', '0 Points (Zero Fake Points)')}
                </span>
              </div>
            </div>

            {/* Three Weighted Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-eco-50/70 dark:bg-dark-bg border border-eco-200/80 dark:border-dark-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-eco-950 dark:text-dark-text">{t('homeScore.pillar1Weight', '40% Weight')}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">{t('homeScore.pillar1Max', 'Up to 400 pts')}</span>
                </div>
                <h4 className="font-bold text-sm text-stone-800 dark:text-dark-text">{t('homeScore.pillar1Title', 'Carbon Reduction')}</h4>
                <p className="text-xs text-stone-600 dark:text-dark-muted">
                  {t('homeScore.pillar1Desc', 'Earn points by conducting verifiable carbon audits and documenting reductions in your monthly commute and electricity usage.')}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-eco-50/70 dark:bg-dark-bg border border-eco-200/80 dark:border-dark-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-eco-950 dark:text-dark-text">{t('homeScore.pillar2Weight', '30% Weight')}</span>
                  <span className="text-[10px] font-bold text-eco-800 bg-eco-200 px-2 py-0.5 rounded">{t('homeScore.pillar2Max', 'Up to 300 pts')}</span>
                </div>
                <h4 className="font-bold text-sm text-stone-800 dark:text-dark-text">{t('homeScore.pillar2Title', 'Civic Vigilance')}</h4>
                <p className="text-xs text-stone-600 dark:text-dark-muted">
                  {t('homeScore.pillar2Desc', 'Earn +50 points for every street hazard reported, plus +25 bonus points when the issue is resolved by municipal authorities.')}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-eco-50/70 dark:bg-dark-bg border border-eco-200/80 dark:border-dark-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-eco-950 dark:text-dark-text">{t('homeScore.pillar3Weight', '30% Weight')}</span>
                  <span className="text-[10px] font-bold text-eco-800 bg-eco-200 px-2 py-0.5 rounded">{t('homeScore.pillar3Max', 'Up to 300 pts')}</span>
                </div>
                <h4 className="font-bold text-sm text-stone-800 dark:text-dark-text">{t('homeScore.pillar3Title', 'Botanical Health')}</h4>
                <p className="text-xs text-stone-600 dark:text-dark-muted">
                  {t('homeScore.pillar3Desc', 'Earn +30 points for diagnosing plant diseases with AI vision, adopting organic treatments, and nursing plants back to health.')}
                </p>
              </div>
            </div>

            {/* Citizen Achievement Tiers */}
            <div className="pt-2 border-t border-eco-100 dark:border-dark-border space-y-2">
              <span className="text-xs font-semibold text-stone-700 dark:text-dark-muted">{t('homeScore.tiersHeading', 'Citizen Achievement Tiers:')}</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-2.5 rounded-xl bg-eco-100/60 dark:bg-dark-bg border border-eco-200 text-center">
                  <span className="text-sm">🌱</span>
                  <p className="text-xs font-bold text-eco-950 dark:text-dark-text mt-0.5">{t('homeScore.tier1Name', 'Green Beginner')}</p>
                  <p className="text-[10px] text-stone-500">{t('homeScore.tier1Range', '0 – 249 pts')}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-eco-100/60 dark:bg-dark-bg border border-eco-200 text-center">
                  <span className="text-sm">🌿</span>
                  <p className="text-xs font-bold text-eco-950 dark:text-dark-text mt-0.5">{t('homeScore.tier2Name', 'Eco Explorer')}</p>
                  <p className="text-[10px] text-stone-500">{t('homeScore.tier2Range', '250 – 499 pts')}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-eco-100/60 dark:bg-dark-bg border border-eco-200 text-center">
                  <span className="text-sm">🌳</span>
                  <p className="text-xs font-bold text-eco-950 dark:text-dark-text mt-0.5">{t('homeScore.tier3Name', 'Eco Champion')}</p>
                  <p className="text-[10px] text-stone-500">{t('homeScore.tier3Range', '500 – 999 pts')}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-eco-100/60 dark:bg-dark-bg border border-eco-200 text-center">
                  <span className="text-sm">🌍</span>
                  <p className="text-xs font-bold text-eco-950 dark:text-dark-text mt-0.5">{t('homeScore.tier4Name', 'Planet Protector')}</p>
                  <p className="text-[10px] text-stone-500">{t('homeScore.tier4Range', '1000+ pts')}</p>
                </div>
              </div>
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
            {t('howItWorks.badge', 'Simple Process')}
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-eco-950 dark:text-dark-text">
            {t('howItWorks.title', 'How EcoCity Hub Works')}
          </h2>
          <p className="text-stone-600 dark:text-dark-muted text-sm sm:text-base">
            {t('howItWorks.subtitle', 'Turn daily urban observations into quantifiable environmental change in four simple steps.')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="relative p-6 rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border space-y-3">
            <div className="w-10 h-10 rounded-xl bg-eco-900 text-white flex items-center justify-center font-bold text-sm">
              {t('howItWorks.step1Num', '01')}
            </div>
            <h3 className="font-bold text-base text-eco-950 dark:text-dark-text">{t('howItWorks.step1Title', 'Create Your Account')}</h3>
            <p className="text-xs text-stone-600 dark:text-dark-muted leading-relaxed">
              {t('howItWorks.step1Desc', 'Sign up in seconds, configure your city and preferred language, and access your private dashboard.')}
            </p>
          </div>

          <div className="relative p-6 rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border space-y-3">
            <div className="w-10 h-10 rounded-xl bg-eco-800 text-white flex items-center justify-center font-bold text-sm">
              {t('howItWorks.step2Num', '02')}
            </div>
            <h3 className="font-bold text-base text-eco-950 dark:text-dark-text">{t('howItWorks.step2Title', 'Explore the AI Tools')}</h3>
            <p className="text-xs text-stone-600 dark:text-dark-muted leading-relaxed">
              {t('howItWorks.step2Desc', 'Calculate your travel and energy emissions, photograph or record street hazards, or diagnose an ailing houseplant.')}
            </p>
          </div>

          <div className="relative p-6 rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border space-y-3">
            <div className="w-10 h-10 rounded-xl bg-eco-700 text-white flex items-center justify-center font-bold text-sm">
              {t('howItWorks.step3Num', '03')}
            </div>
            <h3 className="font-bold text-base text-eco-950 dark:text-dark-text">{t('howItWorks.step3Title', 'Take Environmental Action')}</h3>
            <p className="text-xs text-stone-600 dark:text-dark-muted leading-relaxed">
              {t('howItWorks.step3Desc', 'Follow Gemini\'s decarbonization plan, dispatch civic complaints, and apply organic neem remedies.')}
            </p>
          </div>

          <div className="relative p-6 rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border space-y-3">
            <div className="w-10 h-10 rounded-xl bg-eco-600 text-white flex items-center justify-center font-bold text-sm">
              {t('howItWorks.step4Num', '04')}
            </div>
            <h3 className="font-bold text-base text-eco-950 dark:text-dark-text">{t('howItWorks.step4Title', 'Earn Green Points')}</h3>
            <p className="text-xs text-stone-600 dark:text-dark-muted leading-relaxed">
              {t('howItWorks.step4Desc', 'Climb tiers from Green Beginner to Planet Protector, unlock prestigious badges, and inspire your community.')}
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
              {t('whyChoose.badge', 'The EcoCity Advantage')}
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-eco-950 dark:text-dark-text">
              {t('whyChoose.title', 'Why Choose EcoCity Hub?')}
            </h2>
            <p className="text-stone-600 dark:text-dark-muted text-sm sm:text-base">
              {t('whyChoose.subtitle', 'A purposeful blend of artificial intelligence, municipal engagement, and verifiable impact.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-dark-bg border border-eco-200 dark:border-dark-border space-y-2">
              <div className="w-10 h-10 rounded-xl bg-eco-100 dark:bg-stone-800 flex items-center justify-center text-eco-900 dark:text-eco-200">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-eco-950 dark:text-dark-text">{t('whyChoose.point1Title', 'AI-Powered Assistance')}</h4>
              <p className="text-xs text-stone-600 dark:text-dark-muted leading-relaxed">
                {t('whyChoose.point1Desc', 'Vision-capable Gemini models provide instant analysis for photos and personalized lifestyle coaching.')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-dark-bg border border-eco-200 dark:border-dark-border space-y-2">
              <div className="w-10 h-10 rounded-xl bg-eco-100 dark:bg-stone-800 flex items-center justify-center text-eco-900 dark:text-eco-200">
                <Globe2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-eco-950 dark:text-dark-text">{t('whyChoose.point2Title', 'Environmental Awareness')}</h4>
              <p className="text-xs text-stone-600 dark:text-dark-muted leading-relaxed">
                {t('whyChoose.point2Desc', 'Documented emission factors demystify how daily transportation and household power affect the climate.')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-dark-bg border border-eco-200 dark:border-dark-border space-y-2">
              <div className="w-10 h-10 rounded-xl bg-eco-100 dark:bg-stone-800 flex items-center justify-center text-eco-900 dark:text-eco-200">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-eco-950 dark:text-dark-text">{t('whyChoose.point3Title', 'Civic Responsibility')}</h4>
              <p className="text-xs text-stone-600 dark:text-dark-muted leading-relaxed">
                {t('whyChoose.point3Desc', 'Empowers residents to report potholes, water leaks, and illegal dumping directly to municipal departments.')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-dark-bg border border-eco-200 dark:border-dark-border space-y-2">
              <div className="w-10 h-10 rounded-xl bg-eco-100 dark:bg-stone-800 flex items-center justify-center text-eco-900 dark:text-eco-200">
                <Sprout className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-eco-950 dark:text-dark-text">{t('whyChoose.point4Title', 'Plant Health Guidance')}</h4>
              <p className="text-xs text-stone-600 dark:text-dark-muted leading-relaxed">
                {t('whyChoose.point4Desc', 'Maintains urban and home flora with timely symptom recognition and chemical-free remedies.')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-dark-bg border border-eco-200 dark:border-dark-border space-y-2">
              <div className="w-10 h-10 rounded-xl bg-eco-100 dark:bg-stone-800 flex items-center justify-center text-eco-900 dark:text-eco-200">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-eco-950 dark:text-dark-text">{t('whyChoose.point5Title', 'Community Participation')}</h4>
              <p className="text-xs text-stone-600 dark:text-dark-muted leading-relaxed">
                {t('whyChoose.point5Desc', 'Fosters neighborhood solidarity through public hazard reporting and collaborative city cleanup.')}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-dark-bg border border-eco-200 dark:border-dark-border space-y-2">
              <div className="w-10 h-10 rounded-xl bg-eco-100 dark:bg-stone-800 flex items-center justify-center text-eco-900 dark:text-eco-200">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-eco-950 dark:text-dark-text">{t('whyChoose.point6Title', 'Gamified Sustainability')}</h4>
              <p className="text-xs text-stone-600 dark:text-dark-muted leading-relaxed">
                {t('whyChoose.point6Desc', 'Transparent points computed directly from verified actions, not arbitrary frontend placeholders.')}
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
            <span>{t('cta.badge', 'Join the Movement')}</span>
          </span>

          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white max-w-2xl mx-auto tracking-tight">
            {t('cta.title', 'Small Actions. Meaningful Change.')}
          </h2>

          <p className="text-eco-100 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            {t('cta.desc', 'Your city becomes better when everyone contributes. Start your journey towards a greener tomorrow with EcoCity Hub.')}
          </p>

          <div className="pt-2">
            <Link
              to={user ? "/dashboard" : "/signup"}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold text-eco-950 bg-eco-100 hover:bg-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              <span>{user ? t('cta.btnLoggedIn', 'Open Your Dashboard') : t('cta.btnLoggedOut', 'Get Started with EcoCity Hub')}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}