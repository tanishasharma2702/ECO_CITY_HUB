import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import {
  getChallengesWithUserState,
  toggleChallenge
} from '../services/greenScoreService';
import {
  Target,
  CheckCircle2,
  Award,
  Sparkles,
  Bus,
  ShoppingBag,
  Zap,
  Sprout,
  AlertTriangle,
  Check,
  Calendar
} from 'lucide-react';

const ICON_MAP = {
  Bus: Bus,
  ShoppingBag: ShoppingBag,
  Zap: Zap,
  Sprout: Sprout,
  AlertTriangle: AlertTriangle
};

export default function GreenChallenges() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchChallenges = async () => {
    if (!user?.id) return;
    setLoading(true);
    const data = await getChallengesWithUserState(user.id);
    setChallenges(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchChallenges();
  }, [user?.id]);

  const handleToggle = async (chId, points) => {
    await toggleChallenge(user?.id, chId, points);
    await fetchChallenges();
  };

  const completedCount = challenges.filter(c => c.isCompleted).length;

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-eco-200 text-eco-950 border border-eco-300 mb-2">
          <Target className="w-3.5 h-3.5" />
          <span>Weekly Community Missions</span>
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-eco-950 dark:text-dark-text tracking-tight">
          {t('challenges.title', 'Weekly Green Challenges')}
        </h1>
        <p className="text-sm text-stone-600 dark:text-dark-muted mt-1">
          {t('challenges.subtitle', 'Complete eco-friendly lifestyle actions to earn bonus Green Points.')}
        </p>
      </div>

      {/* Progress Card */}
      <div className="rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-eco-800 dark:text-eco-400 uppercase tracking-wider">
            Weekly Progress
          </span>
          <h3 className="font-display font-bold text-xl text-eco-950 dark:text-dark-text mt-0.5">
            {completedCount} of {challenges.length} Missions Completed
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Challenges reset every Sunday at midnight.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-eco-100 dark:bg-dark-bg text-eco-950 dark:text-eco-200 font-bold text-sm">
          <Award className="w-5 h-5 text-eco-800" />
          <span>+{completedCount * 50} pts Earned</span>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {challenges.map((challenge) => {
          const IconComponent = ICON_MAP[challenge.icon] || Target;
          return (
            <div
              key={challenge.id}
              className={`rounded-3xl border p-6 transition-all flex flex-col justify-between space-y-4 ${
                challenge.isCompleted
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 shadow-sm'
                  : 'bg-white dark:bg-dark-card border-eco-200 dark:border-dark-border hover:shadow-md'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    challenge.isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-eco-100 dark:bg-stone-800 text-eco-900 dark:text-eco-200'
                  }`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-eco-100 dark:bg-stone-800 text-eco-900 dark:text-eco-200">
                    +{challenge.points} Green Points
                  </span>
                </div>

                <div>
                  <h4 className={`text-base font-bold ${challenge.isCompleted ? 'text-emerald-900 dark:text-emerald-200' : 'text-eco-950 dark:text-dark-text'}`}>
                    {challenge.title}
                  </h4>
                  <p className="text-xs text-stone-600 dark:text-dark-muted leading-relaxed mt-1">
                    {challenge.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-eco-100 dark:border-dark-border flex items-center justify-between">
                <span className="text-xs text-stone-400 capitalize">
                  {challenge.category} • {challenge.difficulty}
                </span>

                <button
                  type="button"
                  onClick={() => handleToggle(challenge.id, challenge.points)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    challenge.isCompleted
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-eco-900 hover:bg-eco-950 text-white shadow-sm'
                  }`}
                >
                  {challenge.isCompleted ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{t('challenges.completed', 'Completed!')}</span>
                    </>
                  ) : (
                    <span>{t('challenges.markCompleted', 'Mark as Completed')}</span>
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
