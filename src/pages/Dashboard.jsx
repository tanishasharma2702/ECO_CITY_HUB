import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import StatCard from '../components/StatCard';
import {
  calculateGreenScore,
  getChallengesWithUserState,
  toggleChallenge
} from '../services/greenScoreService';
import { getCarbonHistory } from '../services/carbonService';
import { getUserCivicReports } from '../services/civicService';
import { getUserPlantHistory } from '../services/plantService';
import {
  Award,
  Footprints,
  AlertTriangle,
  Sprout,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  PlusCircle,
  ShieldCheck,
  Target
} from 'lucide-react';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [scoreData, setScoreData] = useState(null);
  const [carbonHistory, setCarbonHistory] = useState([]);
  const [civicReports, setCivicReports] = useState([]);
  const [plantHistory, setPlantHistory] = useState([]);
  const [challenges, setChallenges] = useState([]);

  // Load user data across all tables
  const loadDashboardData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [scoreRes, carbonRes, civicRes, plantRes, challengeRes] = await Promise.all([
        calculateGreenScore(user.id),
        getCarbonHistory(user.id),
        getUserCivicReports(user.id),
        getUserPlantHistory(user.id),
        getChallengesWithUserState(user.id)
      ]);

      setScoreData(scoreRes);
      setCarbonHistory(carbonRes.data || []);
      setCivicReports(civicRes.data || []);
      setPlantHistory(plantRes.data || []);
      setChallenges(challengeRes || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user?.id]);

  const handleToggleChallenge = async (chId, points) => {
    await toggleChallenge(user?.id, chId, points);
    await loadDashboardData();
  };

  const latestCarbon = carbonHistory[0] || null;
  const previousCarbon = carbonHistory[1] || null;

  let carbonDiffPercent = null;
  if (latestCarbon && previousCarbon && previousCarbon.total_emissions > 0) {
    const diff = ((latestCarbon.total_emissions - previousCarbon.total_emissions) / previousCarbon.total_emissions) * 100;
    carbonDiffPercent = diff.toFixed(1);
  }

  const resolvedReportsCount = civicReports.filter(r => r.status === 'Resolved').length;
  const activeReportsCount = civicReports.filter(r => r.status === 'Submitted' || r.status === 'Under Review').length;

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. Header & Welcome Message */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-eco-950 dark:text-dark-text tracking-tight">
            {t('dashboard.welcome', 'Welcome back')}, {user?.user_metadata?.full_name || 'Citizen'}!
          </h1>
          <p className="text-sm text-stone-600 dark:text-dark-muted mt-1">
            {t('dashboard.subtitle', 'Here is an overview of your environmental impact and civic contributions.')}
          </p>
        </div>

        {/* Current City Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border text-xs font-semibold text-eco-900 dark:text-eco-200 shadow-sm self-start sm:self-auto">
          <span>📍 {user?.user_metadata?.city || 'Jaipur'}, {user?.user_metadata?.country || 'India'}</span>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Green Score Card */}
        <StatCard
          title={t('dashboard.totalGreenScore', 'Total Green Score')}
          value={scoreData?.totalScore || 50}
          subtitle={`Tier: ${scoreData?.level?.name || 'Green Beginner'}`}
          icon={Award}
          badgeText={scoreData?.level?.badge || '🌱'}
          badgeType="success"
        />

        {/* Carbon Footprint Card */}
        <StatCard
          title={t('dashboard.carbonProgress', 'Carbon Footprint')}
          value={latestCarbon ? `${latestCarbon.total_emissions} kg` : 'Not tested'}
          subtitle={
            carbonDiffPercent !== null
              ? `${Number(carbonDiffPercent) <= 0 ? 'Decreased' : 'Increased'} by ${Math.abs(carbonDiffPercent)}%`
              : latestCarbon ? 'Monthly estimated CO2e' : 'Run first calculation'
          }
          icon={Footprints}
          badgeText={carbonDiffPercent !== null ? `${carbonDiffPercent}%` : latestCarbon ? 'Audited' : 'Pending'}
          badgeType={Number(carbonDiffPercent) <= 0 ? 'success' : 'warning'}
        />

        {/* Civic Reports Card */}
        <StatCard
          title={t('dashboard.civicReports', 'Civic Reports Filed')}
          value={civicReports.length}
          subtitle={`${resolvedReportsCount} resolved, ${activeReportsCount} in review`}
          icon={AlertTriangle}
          badgeText={civicReports.length > 0 ? `${resolvedReportsCount} Closed` : 'None yet'}
          badgeType={resolvedReportsCount > 0 ? 'success' : 'default'}
        />

        {/* Plants Diagnosed Card */}
        <StatCard
          title={t('dashboard.plantsCared', 'Plants Diagnosed')}
          value={plantHistory.length}
          subtitle={plantHistory.length > 0 ? 'Diagnosed with organic remedies' : 'No plant checks yet'}
          icon={Sprout}
          badgeText={plantHistory.length > 0 ? 'Healed' : 'Get started'}
          badgeType="info"
        />

      </div>

      {/* 3. Quick Access to the Three AI Tools */}
      <div className="space-y-4">
        <h2 className="font-display font-bold text-lg text-eco-950 dark:text-dark-text flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-eco-700 dark:text-eco-400" />
          <span>{t('dashboard.quickTools', 'AI Quick Tools')}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <Link
            to="/calculator"
            className="group rounded-2xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-5 hover:border-eco-400 transition-all shadow-sm hover:shadow-md flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-eco-100 dark:bg-stone-800 text-eco-900 dark:text-eco-200 flex items-center justify-center">
                <Footprints className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-eco-950 dark:text-dark-text group-hover:text-eco-800">
                Carbon Calculator
              </h3>
              <p className="text-xs text-stone-600 dark:text-dark-muted leading-relaxed">
                Compute emissions across commute, electricity, and diet. Receive personalized Gemini decarbonization plans.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-eco-900 dark:text-eco-300">
              <span>Calculate Footprint</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/civic-reporter"
            className="group rounded-2xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-5 hover:border-eco-400 transition-all shadow-sm hover:shadow-md flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-eco-200 dark:bg-stone-800 text-eco-950 dark:text-eco-200 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-eco-950 dark:text-dark-text group-hover:text-eco-800">
                Civic Issue Reporter
              </h3>
              <p className="text-xs text-stone-600 dark:text-dark-muted leading-relaxed">
                Upload street hazard photos. Gemini Vision assesses urgency, suggests departments, and drafts complaints.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-eco-900 dark:text-eco-300">
              <span>File a Report</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/plant-checker"
            className="group rounded-2xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-5 hover:border-eco-400 transition-all shadow-sm hover:shadow-md flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-eco-300 dark:bg-stone-800 text-eco-950 dark:text-eco-200 flex items-center justify-center">
                <Sprout className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-eco-950 dark:text-dark-text group-hover:text-eco-800">
                Plant Health Checker
              </h3>
              <p className="text-xs text-stone-600 dark:text-dark-muted leading-relaxed">
                Photograph a leaf or garden plant. Gemini detects diseases, uncovers causes, and prescribes organic remedies.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-eco-900 dark:text-eco-300">
              <span>Diagnose Plant</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

        </div>
      </div>

      {/* 4. Two-Column Layout: Challenges & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Weekly Challenges (Left 7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-eco-950 dark:text-dark-text flex items-center gap-2">
              <Target className="w-5 h-5 text-eco-700 dark:text-eco-400" />
              <span>{t('dashboard.activeChallenges', 'Weekly Green Challenges')}</span>
            </h2>
            <Link
              to="/green-challenges"
              className="text-xs font-bold text-eco-800 dark:text-eco-400 hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="rounded-2xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border divide-y divide-eco-100 dark:divide-dark-border overflow-hidden shadow-sm">
            {challenges.slice(0, 4).map((ch) => (
              <div
                key={ch.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-eco-50/50 dark:hover:bg-dark-bg/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleChallenge(ch.id, ch.points)}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                      ch.isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-stone-300 dark:border-stone-600 hover:border-eco-600'
                    }`}
                  >
                    {ch.isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                  <div>
                    <h4 className={`text-sm font-bold ${ch.isCompleted ? 'line-through text-stone-400 dark:text-stone-500' : 'text-stone-900 dark:text-dark-text'}`}>
                      {ch.title}
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-dark-muted line-clamp-1 mt-0.5">
                      {ch.description}
                    </p>
                  </div>
                </div>

                <span className="shrink-0 text-xs font-bold px-2 py-1 rounded-lg bg-eco-100 dark:bg-stone-800 text-eco-900 dark:text-eco-200">
                  +{ch.points} pts
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities Ledger (Right 5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="font-display font-bold text-lg text-eco-950 dark:text-dark-text flex items-center gap-2">
            <Clock className="w-5 h-5 text-eco-700 dark:text-eco-400" />
            <span>{t('dashboard.recentActivity', 'Recent Activity')}</span>
          </h2>

          <div className="rounded-2xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-4 shadow-sm">
            {scoreData?.recentActivities && scoreData.recentActivities.length > 0 ? (
              <div className="space-y-3">
                {scoreData.recentActivities.slice(0, 5).map((act) => (
                  <div key={act.id} className="flex items-start justify-between gap-3 text-xs border-b border-eco-50 dark:border-dark-border pb-2.5 last:border-none last:pb-0">
                    <div>
                      <p className="font-semibold text-stone-900 dark:text-dark-text">
                        {act.description}
                      </p>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        {new Date(act.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="shrink-0 font-bold text-emerald-600 dark:text-emerald-400">
                      +{act.points_earned} pts
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 space-y-2">
                <Footprints className="w-8 h-8 text-stone-300 dark:text-stone-600 mx-auto" />
                <p className="text-xs text-stone-500 dark:text-dark-muted font-medium max-w-xs mx-auto">
                  {t('dashboard.noActivity', 'No activities recorded yet. Use the AI tools above to start earning points!')}
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
