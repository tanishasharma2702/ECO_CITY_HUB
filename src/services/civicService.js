// Civic Issue Reporting & Community Incident Management

import { supabase, mockSupabase } from './supabase.js';
import { awardGreenPoints } from './greenScoreService.js';
import { isDemoUser, initDemoData } from './demoService.js';

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

    const client = isDemoUser(userId) ? mockSupabase : supabase;
    const { data, error } = await client.from('civic_reports').insert(newReport);
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
    if (isDemoUser(userId)) {
      initDemoData(userId);
      const { data, error } = await mockSupabase
        .from('civic_reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data: data || [] };
    }

    const { data, error } = await supabase
      .from('civic_reports')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err) {
    console.error('Error fetching user civic reports:', err);
    if (isDemoUser(userId)) {
      const raw = JSON.parse(localStorage.getItem('ecocity_table_civic_reports') || '[]');
      return { success: true, data: raw.filter(r => r.user_id === userId) };
    }
    return { success: false, data: [] };
  }
}

/**
 * Fetch all community reports for map display
 */
export async function getAllCommunityReports() {
  try {
    let reports = [];
    try {
      const { data, error } = await supabase
        .from('civic_reports')
        .select('id, title, category, city, address, latitude, longitude, priority, status, created_at')
        .order('created_at', { ascending: false })
        .limit(50);
      if (!error && data) {
        reports = [...data];
      }
    } catch (e) {
      // Ignore remote errors in offline / demo modes
    }

    // Always merge demo/local community reports so Jaipur map has rich pins
    const mockReports = JSON.parse(localStorage.getItem('ecocity_table_civic_reports') || '[]');
    mockReports.forEach(mr => {
      if (!reports.some(r => r.id === mr.id)) {
        reports.push(mr);
      }
    });

    return { success: true, data: reports.slice(0, 50) };
  } catch (err) {
    console.error('Error fetching community reports:', err);
    const mockReports = JSON.parse(localStorage.getItem('ecocity_table_civic_reports') || '[]');
    return { success: true, data: mockReports.slice(0, 50) };
  }
}

/**
 * Update report status (e.g. Under Review or Resolved)
 */
export async function updateCivicReportStatus(reportId, newStatus) {
  try {
    // Check mock storage first
    const mockKey = 'ecocity_table_civic_reports';
    const mockReports = JSON.parse(localStorage.getItem(mockKey) || '[]');
    const mockIdx = mockReports.findIndex(r => r.id === reportId);
    if (mockIdx >= 0) {
      mockReports[mockIdx].status = newStatus;
      mockReports[mockIdx].updated_at = new Date().toISOString();
      localStorage.setItem(mockKey, JSON.stringify(mockReports));
      return { success: true, data: [mockReports[mockIdx]] };
    }

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
