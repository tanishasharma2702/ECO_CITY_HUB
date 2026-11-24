// Green Score System & Gamification Engine
// Calculates real scores from actual recorded database activities

import { supabase } from './supabase';

export const ACHIEVEMENT_LEVELS = [
  { name: 'Green Beginner', minScore: 0, maxScore: 200, badge: '🌱', color: '#B07D62' },
  { name: 'Eco Explorer', minScore: 201, maxScore: 500, badge: '🌿', color: '#9D6B53' },
  { name: 'Green Guardian', minScore: 501, maxScore: 1000, badge: '🛡️', color: '#8A5A44' },
  { name: 'Eco Champion', minScore: 1001, maxScore: 2000, badge: '🏆', color: '#774936' },
  { name: 'Planet Protector', minScore: 2001, maxScore: 99999, badge: '🌍', color: '#2E7D32' }
];

export const BADGE_DEFINITIONS = [
  { id: 'first_step', title: 'First Green Step', description: 'Recorded your very first environmental action', icon: 'Footprints' },
  { id: 'carbon_pioneer', title: 'Carbon Pioneer', description: 'Calculated emissions and reviewed AI reduction plan', icon: 'Gauge' },
  { id: 'civic_sentinel', title: 'Civic Sentinel', description: 'Reported a hazardous civic issue to improve urban streets', icon: 'ShieldCheck' },
  { id: 'botanical_healer', title: 'Botanical Healer', description: 'Diagnosed and treated a plant using AI care guidance', icon: 'Leaf' },
  { id: 'challenge_master', title: 'Challenge Conqueror', description: 'Completed 3 or more weekly green challenges', icon: 'Award' },
  { id: 'eco_champion', title: 'Master Ecologist', description: 'Attained Eco Champion tier or above', icon: 'Crown' }
];

export function getLevelForScore(score) {
  for (let i = ACHIEVEMENT_LEVELS.length - 1; i >= 0; i--) {
    if (score >= ACHIEVEMENT_LEVELS[i].minScore) {
      return ACHIEVEMENT_LEVELS[i];
    }
  }
  return ACHIEVEMENT_LEVELS[0];
}

/**
 * Calculates genuine Green Score dynamically from actual database records
 * Weights: Carbon Footprint (40%), Civic Participation (30%), Plant Care (30%)
 */
export async function calculateGreenScore(userId) {
  if (!userId) {
    return {
      totalScore: 0,
      carbonScore: 0,
      civicScore: 0,
      plantScore: 0,
      challengeBonus: 0,
      level: ACHIEVEMENT_LEVELS[0],
      badges: [],
      recordsCount: { carbon: 0, civic: 0, plants: 0, challenges: 0 },
      recentActivities: []
    };
  }

  try {
    // 1. Fetch user records across all tables
    const [carbonRes, civicRes, plantRes, challengeRes, activityRes] = await Promise.all([
      supabase.from('carbon_records').select('id, total_emissions, created_at').eq('user_id', userId),
      supabase.from('civic_reports').select('id, status, created_at').eq('user_id', userId),
      supabase.from('plant_analyses').select('id, created_at').eq('user_id', userId),
      supabase.from('user_challenges').select('id, challenge_id, completed').eq('user_id', userId).eq('completed', true),
      supabase.from('user_activities').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    ]);

    const carbonCount = carbonRes.data?.length || 0;
    const civicCount = civicRes.data?.length || 0;
    const plantCount = plantRes.data?.length || 0;
    const challengeCount = challengeRes.data?.length || 0;

    // A. Carbon Points (Max 400 pts from actual audits + reduction progress)
    let carbonPoints = Math.min(400, carbonCount * 40);
    // Extra bonus if user has 2+ records and emissions decreased
    if (carbonCount >= 2) {
      const records = carbonRes.data;
      const latest = Number(records[0]?.total_emissions) || 0;
      const prev = Number(records[1]?.total_emissions) || 0;
      if (prev > 0 && latest < prev) {
        carbonPoints = Math.min(400, carbonPoints + 50); // bonus for reducing
      }
    }

    // B. Civic Points (50 pts per report filed, +25 for resolved)
    let civicPoints = 0;
    civicRes.data?.forEach(rep => {
      civicPoints += 50;
      if (rep.status === 'Resolved') civicPoints += 25;
    });
    civicPoints = Math.min(300, civicPoints);

    // C. Plant Points (40 pts per diagnosis/care action)
    const plantPoints = Math.min(300, plantCount * 40);

    // D. Challenge Bonus Points
    const challengeBonus = challengeCount * 50;

    // Total Score computed strictly from actual activities
    const totalScore = carbonPoints + civicPoints + plantPoints + challengeBonus;
    const level = getLevelForScore(totalScore);

    // Earned Badges based strictly on actual achievements
    const badges = [];
    if (carbonCount + civicCount + plantCount > 0) badges.push(BADGE_DEFINITIONS[0]); // First Step
    if (carbonCount >= 1) badges.push(BADGE_DEFINITIONS[1]); // Carbon Pioneer
    if (civicCount >= 1) badges.push(BADGE_DEFINITIONS[2]); // Civic Sentinel
    if (plantCount >= 1) badges.push(BADGE_DEFINITIONS[3]); // Botanical Healer
    if (challengeCount >= 3) badges.push(BADGE_DEFINITIONS[4]); // Challenge Conqueror
    if (totalScore >= 1000) badges.push(BADGE_DEFINITIONS[5]); // Master Ecologist

    // Persist or sync with green_scores table
    await supabase.from('green_scores').upsert({
      user_id: userId,
      total_score: totalScore,
      carbon_score: carbonPoints,
      civic_score: civicPoints,
      plant_score: plantPoints,
      level_name: level.name,
      updated_at: new Date().toISOString()
    });

    return {
      totalScore,
      carbonScore: carbonPoints,
      civicScore: civicPoints,
      plantScore: plantPoints,
      challengeBonus,
      level,
      badges,
      recordsCount: {
        carbon: carbonCount,
        civic: civicCount,
        plants: plantCount,
        challenges: challengeCount
      },
      recentActivities: activityRes.data || []
    };
  } catch (err) {
    console.error('Error computing green score:', err);
    return {
      totalScore: 0,
      carbonScore: 0,
      civicScore: 0,
      plantScore: 0,
      challengeBonus: 0,
      level: ACHIEVEMENT_LEVELS[0],
      badges: [],
      recordsCount: { carbon: 0, civic: 0, plants: 0, challenges: 0 },
      recentActivities: []
    };
  }
}

/**
 * Record an activity entry and award points
 */
export async function awardGreenPoints(userId, points, activityType, description) {
  if (!userId) return;
  try {
    await supabase.from('user_activities').insert({
      user_id: userId,
      activity_type: activityType,
      description,
      points_earned: points,
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error logging activity points:', err);
  }
}

/**
 * Fetch green challenges and user completion state
 */
export async function getChallengesWithUserState(userId) {
  try {
    // 1. Get all active challenges
    const { data: challenges, error: chErr } = await supabase
      .from('green_challenges')
      .select('*')
      .eq('is_active', true);

    if (chErr) throw chErr;

    // 2. Get user completions
    let completedMap = {};
    if (userId) {
      const { data: userChs } = await supabase
        .from('user_challenges')
        .select('challenge_id, completed')
        .eq('user_id', userId);

      userChs?.forEach(item => {
        if (item.completed) completedMap[item.challenge_id] = true;
      });
    }

    return (challenges || []).map(ch => ({
      ...ch,
      isCompleted: Boolean(completedMap[ch.id])
    }));
  } catch (err) {
    console.error('Error fetching challenges:', err);
    return [];
  }
}

/**
 * Toggle challenge completed
 */
export async function toggleChallenge(userId, challengeId, points = 50) {
  if (!userId) return { success: false };
  try {
    const { data: existing } = await supabase
      .from('user_challenges')
      .select('*')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId);

    const isCurrentlyDone = existing && existing.length > 0 && existing[0].completed;
    const newStatus = !isCurrentlyDone;

    if (existing && existing.length > 0) {
      await supabase
        .from('user_challenges')
        .update({ completed: newStatus, completed_at: newStatus ? new Date().toISOString() : null })
        .eq('user_id', userId)
        .eq('challenge_id', challengeId);
    } else {
      await supabase
        .from('user_challenges')
        .insert({
          user_id: userId,
          challenge_id: challengeId,
          completed: true,
          completed_at: new Date().toISOString()
        });
    }

    if (newStatus) {
      await awardGreenPoints(userId, points, 'challenge', `Completed weekly green challenge (${challengeId})`);
    }

    return { success: true, completed: newStatus };
  } catch (err) {
    console.error('Error toggling challenge:', err);
    return { success: false, error: err };
  }
}
