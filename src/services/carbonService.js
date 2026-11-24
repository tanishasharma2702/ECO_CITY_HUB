// Deterministic Carbon Footprint Calculations & Persistence

import { supabase } from './supabase';
import { awardGreenPoints } from './greenScoreService';

// Documented standard emission factors (kg CO2e per unit)
export const EMISSION_FACTORS = {
  carPerKm: 0.171,          // Average petrol/diesel passenger car
  motorbikePerKm: 0.082,    // Average 2-wheeler scooter/motorcycle
  transitPerKm: 0.041,      // Average urban bus & electric metro blend
  bicyclePerKm: 0.000,      // Zero direct operational emissions
  walkingPerKm: 0.000,      // Zero direct operational emissions
  electricityPerKwh: 0.820, // Grid average emission intensity (kg CO2e/kWh)
  dietMonthly: {
    vegan: 45.0,            // 1.5 kg CO2e / day * 30 days
    vegetarian: 85.0,       // 2.8 kg CO2e / day * 30 days
    mixed: 160.0            // 5.3 kg CO2e / day * 30 days
  }
};

/**
 * Deterministically compute carbon emissions.
 * Inputs are weekly km for transport, monthly kWh for electricity, and dietary choice.
 */
export function calculateEmissions({
  carKm = 0,
  motorbikeKm = 0,
  transitKm = 0,
  bicycleKm = 0,
  walkingKm = 0,
  electricityKwh = 0,
  dietType = 'mixed'
}) {
  // Convert weekly travel km to monthly (4.33 weeks per month)
  const monthlyCarKm = (Number(carKm) || 0) * 4.33;
  const monthlyBikeKm = (Number(motorbikeKm) || 0) * 4.33;
  const monthlyTransitKm = (Number(transitKm) || 0) * 4.33;

  const transportEmissions = Number((
    (monthlyCarKm * EMISSION_FACTORS.carPerKm) +
    (monthlyBikeKm * EMISSION_FACTORS.motorbikePerKm) +
    (monthlyTransitKm * EMISSION_FACTORS.transitPerKm)
  ).toFixed(2));

  const electricityEmissions = Number((
    (Number(electricityKwh) || 0) * EMISSION_FACTORS.electricityPerKwh
  ).toFixed(2));

  const foodEmissions = Number((
    EMISSION_FACTORS.dietMonthly[dietType] || EMISSION_FACTORS.dietMonthly.mixed
  ).toFixed(2));

  const totalEmissions = Number((
    transportEmissions + electricityEmissions + foodEmissions
  ).toFixed(2));

  return {
    transportEmissions,
    electricityEmissions,
    foodEmissions,
    totalEmissions,
    breakdown: {
      car: Number((monthlyCarKm * EMISSION_FACTORS.carPerKm).toFixed(2)),
      motorbike: Number((monthlyBikeKm * EMISSION_FACTORS.motorbikePerKm).toFixed(2)),
      transit: Number((monthlyTransitKm * EMISSION_FACTORS.transitPerKm).toFixed(2)),
      electricity: electricityEmissions,
      food: foodEmissions
    }
  };
}

/**
 * Save calculation record to Supabase and award Green Score points
 */
export async function saveCarbonRecord(userId, recordData, aiRecommendations) {
  try {
    const newRecord = {
      user_id: userId,
      car_km: Number(recordData.carKm) || 0,
      motorbike_km: Number(recordData.motorbikeKm) || 0,
      transit_km: Number(recordData.transitKm) || 0,
      bicycle_km: Number(recordData.bicycleKm) || 0,
      walking_km: Number(recordData.walkingKm) || 0,
      electricity_kwh: Number(recordData.electricityKwh) || 0,
      diet_type: recordData.dietType || 'mixed',
      transport_emissions: recordData.transportEmissions,
      electricity_emissions: recordData.electricityEmissions,
      food_emissions: recordData.foodEmissions,
      total_emissions: recordData.totalEmissions,
      ai_recommendations: aiRecommendations || null,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('carbon_records').insert(newRecord);
    if (error) throw error;

    // Award Green Points for conducting and saving carbon footprint assessment
    await awardGreenPoints(userId, 30, 'carbon', 'Completed Carbon Footprint calculation and personalized AI plan');

    return { success: true, data };
  } catch (err) {
    console.error('Error saving carbon record:', err);
    return { success: false, error: err };
  }
}

/**
 * Fetch calculation history for user
 */
export async function getCarbonHistory(userId) {
  try {
    const { data, error } = await supabase
      .from('carbon_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err) {
    console.error('Error fetching carbon history:', err);
    return { success: false, data: [] };
  }
}
