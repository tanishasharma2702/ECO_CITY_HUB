// Civic Issue Reporting & Community Incident Management

import { supabase } from './supabase';
import { awardGreenPoints } from './greenScoreService';

export const CIVIC_CATEGORIES = [
  'Potholes',
  'Garbage accumulation',
  'Water leakage',
  'Broken streetlights',
  'Damaged roads',
  'Overflowing drains',
  'Other civic problems'
];

export const REPORT_STATUSES = [
  'Draft',
  'Submitted',
  'Under Review',
  'Resolved'
];

/**
 * Create a new civic report
 */
export async function createCivicReport(userId, reportData) {
  try {
    const reportId = 'REP-' + Math.floor(10000 + Math.random() * 90000);
    const newReport = {
      id: reportId,
      user_id: userId,
      title: reportData.title || `Civic Issue: ${reportData.category || 'General'}`,
      category: reportData.category || 'Other civic problems',
      description: reportData.description || '',
      image_url: reportData.imageUrl || null,
      country: reportData.country || 'India',
      state: reportData.state || 'Rajasthan',
      city: reportData.city || 'Jaipur',
      address: reportData.address || '',
      latitude: reportData.latitude || 26.9124,
      longitude: reportData.longitude || 75.7873,
      priority: reportData.priority || 'Medium',
      suggested_department: reportData.suggestedDepartment || 'Municipal Corporation',
      status: reportData.status || 'Submitted',
      generated_complaint: reportData.generatedComplaint || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('civic_reports').insert(newReport);
    if (error) throw error;

    // Award Green Points for active civic reporting
    if (userId) {
      await awardGreenPoints(userId, 50, 'civic', `Reported civic hazard: ${newReport.category} in ${newReport.city}`);
    }

    return { success: true, data: newReport };
  } catch (err) {
    console.error('Error creating civic report:', err);
    return { success: false, error: err };
  }
}

/**
 * Fetch reports for a specific user
 */
export async function getUserCivicReports(userId) {
  try {
    const { data, error } = await supabase
      .from('civic_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err) {
    console.error('Error fetching user civic reports:', err);
    return { success: false, data: [] };
  }
}

/**
 * Fetch all community reports for map display
 */
export async function getAllCommunityReports() {
  try {
    const { data, error } = await supabase
      .from('civic_reports')
      .select('id, title, category, city, address, latitude, longitude, priority, status, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err) {
    console.error('Error fetching community reports:', err);
    return { success: false, data: [] };
  }
}

/**
 * Update report status (e.g. Under Review or Resolved)
 */
export async function updateCivicReportStatus(reportId, newStatus) {
  try {
    const { data, error } = await supabase
      .from('civic_reports')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', reportId);

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Error updating report status:', err);
    return { success: false, error: err };
  }
}
