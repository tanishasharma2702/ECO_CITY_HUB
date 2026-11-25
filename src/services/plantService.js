// Plant Health Diagnostic History & Plant Care Services

import { supabase, mockSupabase } from './supabase.js';
import { awardGreenPoints } from './greenScoreService.js';
import { isDemoUser, initDemoData } from './demoService.js';

/**
 * Save plant diagnosis and award green points
 */
export async function savePlantAnalysis(userId, analysisData) {
  try {
    const record = {
      user_id: userId,
      plant_name: analysisData.plantName || 'Unknown Specimen',
      health_status: analysisData.healthStatus || 'Mild Issue',
      symptoms: analysisData.visibleSymptoms || [],
      possible_causes: analysisData.possibleCauses || [],
      recommended_treatment: analysisData.recommendedTreatment || '',
      home_care: Array.isArray(analysisData.homeCareSuggestions) ? analysisData.homeCareSuggestions.join('\n') : analysisData.homeCareSuggestions || '',
      prevention_tips: Array.isArray(analysisData.preventionTips) ? analysisData.preventionTips.join('\n') : analysisData.preventionTips || '',
      confidence_score: analysisData.confidenceScore || 85,
      image_url: analysisData.imageUrl || null,
      created_at: new Date().toISOString()
    };

    const client = isDemoUser(userId) ? mockSupabase : supabase;
    const { data, error } = await client.from('plant_analyses').insert(record);
    if (error) throw error;

    // Award Green Points for plant stewardship
    if (userId) {
      await awardGreenPoints(userId, 40, 'plant', `Diagnosed and treated ${record.plant_name} with AI organic care`);
    }

    return { success: true, data: record };
  } catch (err) {
    console.error('Error saving plant analysis:', err);
    return { success: false, error: err };
  }
}

/**
 * Fetch all plant records for user
 */
export async function getUserPlantHistory(userId) {
  try {
    if (isDemoUser(userId)) {
      initDemoData(userId);
      const { data, error } = await mockSupabase
        .from('plant_analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    }

    const { data, error } = await supabase
      .from('plant_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err) {
    console.error('Error fetching plant history:', err);
    if (isDemoUser(userId)) {
      const raw = JSON.parse(localStorage.getItem('ecocity_table_plant_analyses') || '[]');
      return { success: true, data: raw.filter(r => r.user_id === userId) };
    }
    return { success: false, data: [] };
  }
}
