import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import {
  calculateEmissions,
  saveCarbonRecord,
  getCarbonHistory,
  EMISSION_FACTORS
} from '../services/carbonService';
import { getCarbonRecommendations } from '../services/geminiService';
import {
  Footprints,
  Car,
  Zap,
  Utensils,
  Sparkles,
  TrendingDown,
  Clock,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Loader2,
  Bike
} from 'lucide-react';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title);

export default function CarbonCalculator() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  // Inputs - clean zero baseline
  const [inputs, setInputs] = useState({
    carKm: 0,
    motorbikeKm: 0,
    transitKm: 0,
    bicycleKm: 0,
    walkingKm: 0,
    electricityKwh: 0,
    dietType: 'vegetarian'
  });

  // State
  const [results, setResults] = useState(null);
  const [aiReport, setAiReport] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [history, setHistory] = useState([]);

  // Load history
  const loadHistory = async () => {
    if (!user?.id) return;
    const res = await getCarbonHistory(user.id);
    if (res.success) {
      setHistory(res.data || []);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user?.id]);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: field === 'dietType' ? value : Math.max(0, Number(value) || 0)
    }));
  };

  // Perform deterministic calculations & consult Gemini AI
  const handleCalculate = async (e) => {
    e.preventDefault();
    setSaveSuccess(false);

    // 1. Deterministic numerical emissions calculation
    const calculated = calculateEmissions(inputs);
    setResults(calculated);

    // 2. Consult Gemini AI for structured decarbonization analysis
    setLoadingAi(true);
    try {
      const aiRes = await getCarbonRecommendations({
        totalEmissions: calculated.totalEmissions,
        transportEmissions: calculated.transportEmissions,
        electricityEmissions: calculated.electricityEmissions,
        foodEmissions: calculated.foodEmissions,
        details: inputs,
        language: i18n.language || 'en'
      });
      setAiReport(aiRes?.data || null);
    } catch (err) {
      console.error('Error fetching AI recommendations:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  // Save calculation to Supabase
  const handleSave = async () => {
    if (!user?.id || !results) return;
    setSaving(true);
    const saveRes = await saveCarbonRecord(
      user.id,
      { ...inputs, ...results },
      aiReport
    );
    setSaving(false);
    if (saveRes.success) {
      setSaveSuccess(true);
      await loadHistory();
    }
  };

  // Chart Data: Doughnut Breakdown
  const doughnutData = results ? {
    labels: ['Transport', 'Electricity', 'Diet / Food'],
    datasets: [
      {
        data: [
          results.transportEmissions,
          results.electricityEmissions,
          results.foodEmissions
        ],
        backgroundColor: ['#8A5A44', '#C38E70', '#DEAB90'],
        borderColor: ['#774936', '#B07D62', '#CD9777'],
        borderWidth: 1
      }
    ]
  } : null;

  // Previous comparison
  const previousRecord = history[0] || null;
  let diffPercent = null;
  if (results && previousRecord && previousRecord.total_emissions > 0) {
    diffPercent = (((results.totalEmissions - previousRecord.total_emissions) / previousRecord.total_emissions) * 100).toFixed(1);
  }

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-eco-100 text-eco-900 border border-eco-200 mb-2">
          <Footprints className="w-3.5 h-3.5" />
          <span>Module 1: Environmental Impact</span>
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-eco-950 dark:text-dark-text tracking-tight">
          {t('carbon.title', 'Carbon Footprint Calculator')}
        </h1>
        <p className="text-sm text-stone-600 dark:text-dark-muted mt-1">
          {t('carbon.subtitle', 'Calculate your estimated CO2 emissions using verifiable factors and receive AI-guided reduction plans.')}
        </p>
      </div>

      {/* Input Form Card */}
      <form onSubmit={handleCalculate} className="rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-6 sm:p-8 shadow-sm space-y-8">
        
        {/* Section 1: Transportation */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-eco-100 dark:border-dark-border pb-3">
            <Car className="w-5 h-5 text-eco-800 dark:text-eco-300" />
            <h3 className="font-bold text-base text-eco-950 dark:text-dark-text">
              1. Weekly Transportation (km / week)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-dark-muted mb-1">
                Personal Car (Petrol/Diesel)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={inputs.carKm}
                  onChange={(e) => handleInputChange('carKm', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-eco-200 dark:border-dark-border bg-eco-50/50 dark:bg-dark-bg text-sm text-stone-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-eco-500"
                />
                <span className="text-xs text-stone-400 absolute right-3 top-2.5">km/wk</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-dark-muted mb-1">
                Motorcycle / Scooter
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={inputs.motorbikeKm}
                  onChange={(e) => handleInputChange('motorbikeKm', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-eco-200 dark:border-dark-border bg-eco-50/50 dark:bg-dark-bg text-sm text-stone-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-eco-500"
                />
                <span className="text-xs text-stone-400 absolute right-3 top-2.5">km/wk</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-dark-muted mb-1">
                Public Transit (Bus / Metro)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={inputs.transitKm}
                  onChange={(e) => handleInputChange('transitKm', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-eco-200 dark:border-dark-border bg-eco-50/50 dark:bg-dark-bg text-sm text-stone-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-eco-500"
                />
                <span className="text-xs text-stone-400 absolute right-3 top-2.5">km/wk</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-dark-muted mb-1">
                Bicycle (Zero emissions)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={inputs.bicycleKm}
                  onChange={(e) => handleInputChange('bicycleKm', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-eco-200 dark:border-dark-border bg-eco-50/50 dark:bg-dark-bg text-sm text-stone-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-eco-500"
                />
                <span className="text-xs text-stone-400 absolute right-3 top-2.5">km/wk</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-dark-muted mb-1">
                Walking (Zero emissions)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={inputs.walkingKm}
                  onChange={(e) => handleInputChange('walkingKm', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-eco-200 dark:border-dark-border bg-eco-50/50 dark:bg-dark-bg text-sm text-stone-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-eco-500"
                />
                <span className="text-xs text-stone-400 absolute right-3 top-2.5">km/wk</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Electricity */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-eco-100 dark:border-dark-border pb-3">
            <Zap className="w-5 h-5 text-eco-800 dark:text-eco-300" />
            <h3 className="font-bold text-base text-eco-950 dark:text-dark-text">
              2. Monthly Electricity Consumption
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-dark-muted mb-1">
                Monthly Electricity Units (kWh)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  value={inputs.electricityKwh}
                  onChange={(e) => handleInputChange('electricityKwh', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-eco-200 dark:border-dark-border bg-eco-50/50 dark:bg-dark-bg text-sm text-stone-900 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-eco-500"
                />
                <span className="text-xs text-stone-400 absolute right-3 top-2.5">kWh / mo</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                Typical household range: 100 to 300 kWh per month.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Food / Diet */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-eco-100 dark:border-dark-border pb-3">
            <Utensils className="w-5 h-5 text-eco-800 dark:text-eco-300" />
            <h3 className="font-bold text-base text-eco-950 dark:text-dark-text">
              3. Dietary Habits
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'vegan', title: 'Vegan', desc: '100% plant-based (~45 kg CO2e/mo)' },
              { id: 'vegetarian', title: 'Vegetarian', desc: 'Dairy and plant foods (~85 kg CO2e/mo)' },
              { id: 'mixed', title: 'Mixed / Omnivore', desc: 'Meat, poultry, & plant diet (~160 kg CO2e/mo)' }
            ].map((diet) => (
              <label
                key={diet.id}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  inputs.dietType === diet.id
                    ? 'border-eco-800 bg-eco-100/50 dark:bg-dark-bg ring-2 ring-eco-700'
                    : 'border-eco-200 dark:border-dark-border hover:bg-eco-50 dark:hover:bg-dark-bg/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-eco-950 dark:text-dark-text">{diet.title}</span>
                  <input
                    type="radio"
                    name="dietType"
                    checked={inputs.dietType === diet.id}
                    onChange={() => handleInputChange('dietType', diet.id)}
                    className="accent-eco-800"
                  />
                </div>
                <p className="text-xs text-stone-500 dark:text-dark-muted mt-2">{diet.desc}</p>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loadingAi}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-eco-900 hover:bg-eco-950 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loadingAi ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-eco-200" />
                <span>{t('carbon.calculating', 'Calculating emissions and consulting Gemini AI...')}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-eco-200" />
                <span>{t('carbon.calculateBtn', 'Calculate Emissions & Get AI Plan')}</span>
              </>
            )}
          </button>
        </div>

      </form>

      {/* =====================================================================
          RESULTS DASHBOARD (Rendered after calculation)
          ===================================================================== */}
      {results && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          <div className="rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-6 sm:p-8 shadow-sm space-y-8">
            
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-eco-100 dark:border-dark-border pb-4">
              <div>
                <span className="text-xs font-bold text-eco-800 dark:text-eco-400 uppercase tracking-wider">
                  Audit Summary
                </span>
                <h2 className="font-display font-bold text-2xl text-eco-950 dark:text-dark-text mt-0.5">
                  {t('carbon.resultsTitle', 'Your Emissions Breakdown')}
                </h2>
              </div>

              {/* Save / Save state */}
              <div className="flex items-center gap-3">
                {saveSuccess ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Saved (+30 Green Pts)</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-eco-900 hover:bg-eco-950 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{saving ? 'Saving...' : 'Save to History'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Total Highlight */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-2 p-6 rounded-2xl bg-eco-100/70 dark:bg-dark-bg border border-eco-200 dark:border-dark-border flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-stone-600 dark:text-dark-muted">
                    {t('carbon.totalEmissions', 'Total Estimated Emissions')}
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-display font-extrabold text-4xl text-eco-950 dark:text-dark-text">
                      {results.totalEmissions}
                    </span>
                    <span className="text-xs font-bold text-eco-800 dark:text-eco-400">
                      kg CO2e / month
                    </span>
                  </div>
                </div>

                {diffPercent !== null && (
                  <div className="pt-3 border-t border-eco-200 dark:border-dark-border mt-3 text-xs font-semibold flex items-center gap-1.5">
                    <TrendingDown className="w-4 h-4 text-emerald-600" />
                    <span>{diffPercent}% vs previous calculation</span>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-eco-50 dark:bg-dark-bg border border-eco-200/80 dark:border-dark-border">
                <span className="text-xs text-stone-500 font-medium">Transport</span>
                <p className="font-display font-bold text-xl text-eco-950 dark:text-dark-text mt-1">
                  {results.transportEmissions} kg
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  {((results.transportEmissions / results.totalEmissions) * 100).toFixed(0)}% of total
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-eco-50 dark:bg-dark-bg border border-eco-200/80 dark:border-dark-border">
                <span className="text-xs text-stone-500 font-medium">Electricity</span>
                <p className="font-display font-bold text-xl text-eco-950 dark:text-dark-text mt-1">
                  {results.electricityEmissions} kg
                </p>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  {((results.electricityEmissions / results.totalEmissions) * 100).toFixed(0)}% of total
                </p>
              </div>
            </div>

            {/* Doughnut Chart & Food breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-2">
              <div className="max-w-xs mx-auto w-full">
                {doughnutData && (
                  <Doughnut
                    data={doughnutData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'bottom' }
                      }
                    }}
                  />
                )}
              </div>

              <div className="space-y-3 text-xs text-stone-600 dark:text-dark-muted">
                <h4 className="font-bold text-sm text-eco-950 dark:text-dark-text">
                  Deterministic Calculation Factors
                </h4>
                <p>
                  • <strong>Passenger Car:</strong> 0.171 kg CO2e / km traveled.
                </p>
                <p>
                  • <strong>Motorcycle:</strong> 0.082 kg CO2e / km traveled.
                </p>
                <p>
                  • <strong>Public Transit:</strong> 0.041 kg CO2e / km traveled.
                </p>
                <p>
                  • <strong>Electricity Grid Factor:</strong> 0.820 kg CO2e / kWh.
                </p>
                <p>
                  • <strong>Dietary Baseline:</strong> Vegan (45 kg), Veg (85 kg), Mixed (160 kg) CO2e/month.
                </p>
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-[11px]">
                  {t('carbon.disclaimer', 'Note: Numerical figures are deterministic calculations based on standard IPCC emission factors. Recommendations are generated by Gemini AI.')}
                </div>
              </div>
            </div>

            {/* Gemini AI Personalized Plan */}
            {aiReport && (
              <div className="rounded-2xl bg-eco-50 dark:bg-dark-bg border border-eco-200 dark:border-dark-border p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-eco-800 dark:text-eco-300" />
                  <h3 className="font-bold text-base text-eco-950 dark:text-dark-text">
                    {t('carbon.aiInsights', 'Gemini AI Personalized Decarbonization Plan')}
                  </h3>
                </div>

                <p className="text-sm text-stone-700 dark:text-dark-text leading-relaxed">
                  {aiReport.summary}
                </p>

                {aiReport.personalizedTips && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    {aiReport.personalizedTips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-eco-950 dark:text-dark-text">{tip.action}</span>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            {tip.impact}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 dark:text-dark-muted leading-relaxed">
                          {tip.practicalStep}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {aiReport.longTermGoal && (
                  <div className="pt-2 flex items-start gap-2 text-xs text-stone-600 dark:text-dark-muted font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>90-Day Milestone:</strong> {aiReport.longTermGoal}</span>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      )}

      {/* =====================================================================
          CALCULATION HISTORY / EMPTY STATE
          ===================================================================== */}
      {history.length > 0 ? (
        <div className="rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-eco-800 dark:text-eco-300" />
            <h3 className="font-bold text-base text-eco-950 dark:text-dark-text">
              {t('carbon.historyTitle', 'Calculation History')}
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-eco-100 dark:border-dark-border text-stone-500 uppercase">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Total CO2e</th>
                  <th className="py-2.5 px-3">Transport</th>
                  <th className="py-2.5 px-3">Electricity</th>
                  <th className="py-2.5 px-3">Diet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-eco-50 dark:divide-dark-border">
                {history.slice(0, 5).map((rec) => (
                  <tr key={rec.id} className="hover:bg-eco-50/50 dark:hover:bg-dark-bg/40">
                    <td className="py-2.5 px-3 font-medium text-stone-700 dark:text-dark-text">
                      {new Date(rec.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-eco-950 dark:text-eco-200">
                      {rec.total_emissions} kg/mo
                    </td>
                    <td className="py-2.5 px-3 text-stone-600 dark:text-dark-muted">
                      {rec.transport_emissions} kg
                    </td>
                    <td className="py-2.5 px-3 text-stone-600 dark:text-dark-muted">
                      {rec.electricity_emissions} kg
                    </td>
                    <td className="py-2.5 px-3 capitalize text-stone-600 dark:text-dark-muted">
                      {rec.diet_type}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-8 text-center space-y-3">
          <Footprints className="w-10 h-10 text-stone-300 dark:text-stone-600 mx-auto" />
          <h4 className="font-bold text-base text-eco-950 dark:text-dark-text">
            {t('carbon.noHistoryYet', "You haven't calculated your carbon footprint yet.")}
          </h4>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Fill in your weekly transportation, monthly electricity consumption, and diet above, then click "{t('carbon.calculateBtn', 'Calculate Emissions & Get AI Plan')}" to record your first emissions audit and start earning Green Points!
          </p>
        </div>
      )}

    </div>
  );
}
