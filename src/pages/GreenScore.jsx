import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import {
  calculateGreenScore,
  ACHIEVEMENT_LEVELS,
  BADGE_DEFINITIONS
} from '../services/greenScoreService';
import StatCard from '../components/StatCard';
import {
  Award,
  Crown,
  Footprints,
  AlertTriangle,
  Sprout,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  Target
} from 'lucide-react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function GreenScore() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [scoreData, setScoreData] = useState(null);

  const fetchScore = async () => {
    if (!user?.id) return;
    setLoading(true);
    const data = await calculateGreenScore(user.id);
    setScoreData(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchScore();
  }, [user?.id]);

  // Breakdown Chart Data
  const barData = scoreData ? {
    labels: ['Carbon Footprint (40%)', 'Civic Action (30%)', 'Plant Care (30%)', 'Weekly Challenges'],
    datasets: [
      {
        label: 'Earned Points',
        data: [
          scoreData.carbonScore,
          scoreData.civicScore,
          scoreData.plantScore,
          scoreData.challengeBonus || 0
        ],
        backgroundColor: ['#8A5A44', '#B07D62', '#C38E70', '#DEAB90'],
        borderRadius: 8
      }
    ]
  } : null;

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-eco-200 text-eco-950 border border-eco-300 mb-2">
          <Award className="w-3.5 h-3.5" />
          <span>Gamified Sustainability</span>
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-eco-950 dark:text-dark-text tracking-tight">
          {t('score.title', 'Green Score & Community Achievements')}
        </h1>
        <p className="text-sm text-stone-600 dark:text-dark-muted mt-1">
          {t('score.subtitle', 'Gamified sustainability: 40% carbon footprint reduction, 30% civic vigilance, 30% plant stewardship.')}
        </p>
      </div>

      {/* Main Score & Tier Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-eco-950 via-eco-900 to-eco-800 text-white p-8 sm:p-10 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-eco-200">
              Verified Citizen Impact Score
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="font-display font-extrabold text-5xl sm:text-6xl text-white">
                {scoreData?.totalScore ?? 0}
              </span>
              <span className="text-sm font-bold text-eco-200">
                Total Green Points
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center sm:text-right">
            <span className="text-xs text-eco-200 font-medium">Achievement Tier:</span>
            <div className="flex items-center justify-center sm:justify-end gap-2 text-xl font-bold text-white mt-1">
              <span>{scoreData?.level?.badge || '🌱'}</span>
              <span>{scoreData?.level?.name || 'Green Beginner'}</span>
            </div>
          </div>
        </div>

        {/* Progress bar to next level */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="flex justify-between text-xs text-eco-200 font-semibold">
            <span>Tier Progress</span>
            <span>Next Tier: Eco Explorer (250 pts)</span>
          </div>
          <div className="h-3 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full bg-eco-200 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (((scoreData?.totalScore ?? 0)) / 250) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Three Weight Pillars Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Carbon Footprint (40%)"
          value={`${scoreData?.carbonScore || 0} pts`}
          subtitle={`${scoreData?.recordsCount?.carbon || 0} calculations & reduction records`}
          icon={Footprints}
          badgeText="Weight 40%"
        />

        <StatCard
          title="Civic Action (30%)"
          value={`${scoreData?.civicScore || 0} pts`}
          subtitle={`${scoreData?.recordsCount?.civic || 0} street hazard reports filed`}
          icon={AlertTriangle}
          badgeText="Weight 30%"
        />

        <StatCard
          title="Plant Care (30%)"
          value={`${scoreData?.plantScore || 0} pts`}
          subtitle={`${scoreData?.recordsCount?.plants || 0} botanical diagnoses recorded`}
          icon={Sprout}
          badgeText="Weight 30%"
        />
      </div>

      {/* Chart Section: Points Distribution */}
      <div className="rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-eco-950 dark:text-dark-text flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-eco-800 dark:text-eco-300" />
          <span>Transparent Points Ledger & Weights</span>
        </h3>
        <p className="text-xs text-stone-500">
          Scores are mathematically calculated from genuine database records rather than arbitrary numbers.
        </p>
        <div className="h-64 pt-2">
          {barData && (
            <Bar
              data={barData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: { beginAtZero: true }
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Badges Earned Section */}
      <div className="rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-eco-950 dark:text-dark-text flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-600" />
            <span>{t('score.badgesEarned', 'Badges & Achievements')}</span>
          </h3>
          <span className="text-xs font-bold text-eco-800 dark:text-eco-400">
            {scoreData?.badges?.length || 0} / {BADGE_DEFINITIONS.length} Unlocked
          </span>
        </div>

        {(scoreData?.badges?.length || 0) === 0 && (
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-3">
            <span className="text-lg">🌱</span>
            <div>
              <p className="font-bold">No achievements earned yet.</p>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">Complete carbon audits, file civic reports, or heal houseplants to unlock your first community badge!</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BADGE_DEFINITIONS.map((badge) => {
            const isUnlocked = scoreData?.badges?.some(b => b.id === badge.id);
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  isUnlocked
                    ? 'bg-eco-100/50 dark:bg-dark-bg border-eco-300 dark:border-dark-border shadow-sm'
                    : 'bg-stone-50 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 opacity-60'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shrink-0 ${
                  isUnlocked ? 'bg-eco-900 text-white' : 'bg-stone-200 text-stone-400'
                }`}>
                  {isUnlocked ? '🏅' : '🔒'}
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${isUnlocked ? 'text-eco-950 dark:text-dark-text' : 'text-stone-500'}`}>
                    {badge.title}
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-dark-muted mt-0.5">
                    {badge.description}
                  </p>
                  <span className={`inline-block text-[10px] font-bold mt-1.5 px-2 py-0.5 rounded ${
                    isUnlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                  }`}>
                    {isUnlocked ? 'Unlocked' : 'In Progress'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
