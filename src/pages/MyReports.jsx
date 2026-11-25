import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserCivicReports,
  updateCivicReportStatus,
  REPORT_STATUSES
} from '../services/civicService';
import { awardGreenPoints } from '../services/greenScoreService';
import SecureMediaViewer from '../components/SecureMediaViewer';
import {
  ClipboardList,
  AlertTriangle,
  Clock,
  CheckCircle2,
  MapPin,
  Building,
  FileText,
  Download,
  Copy,
  ExternalLink,
  Plus,
  Filter,
  Check,
  Map as MapIcon,
  LayoutGrid
} from 'lucide-react';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix default Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MyReports() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [selectedReport, setSelectedReport] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchReports = async () => {
    if (!user?.id) return;
    setLoading(true);
    const res = await getUserCivicReports(user.id);
    setReports(res.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, [user?.id]);

  const handleStatusChange = async (reportId, newStatus) => {
    await updateCivicReportStatus(reportId, newStatus);
    if (newStatus === 'Resolved') {
      await awardGreenPoints(user.id, 25, 'civic', `Civic report ${reportId} marked as Resolved!`);
    }
    await fetchReports();
    if (selectedReport && selectedReport.id === reportId) {
      setSelectedReport(prev => ({ ...prev, status: newStatus }));
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredReports = activeTab === 'All'
    ? reports
    : reports.filter(r => r.status === activeTab);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300';
      case 'Under Review':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
      case 'Draft':
        return 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300';
      default:
        return 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300';
    }
  };

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-stone-100 text-stone-700';
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-eco-200 text-eco-950 border border-eco-300 mb-2">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>{t('reports.badge', 'Community Vigilance History')}</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-eco-950 dark:text-dark-text tracking-tight">
            {t('reports.title', 'My Reports')}
          </h1>
          <p className="text-sm text-stone-600 dark:text-dark-muted mt-1">
            {t('reports.subtitle', 'Track the status of your reported street hazards from initial submission to verified municipal resolution.')}
          </p>
        </div>

        <Link
          to="/civic-reporter"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-eco-900 hover:bg-eco-950 shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-eco-200" />
          <span>{t('reports.reportNew', 'Report New Hazard')}</span>
        </Link>
      </div>

      {/* Filter Tabs & View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-eco-200 dark:border-dark-border pb-3">
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
          {['All', ...REPORT_STATUSES].map((tab) => {
            const tabLabelMap = {
              'All': t('reports.tabAll', 'All'),
              'Draft': t('reports.tabDraft', 'Draft'),
              'Submitted': t('reports.tabSubmitted', 'Submitted'),
              'Under Review': t('reports.tabUnderReview', 'Under Review'),
              'Resolved': t('reports.tabResolved', 'Resolved')
            };
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-eco-900 text-white shadow-sm'
                    : 'bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border text-stone-700 dark:text-dark-muted hover:bg-eco-100 dark:hover:bg-dark-bg'
                }`}
              >
                {tabLabelMap[tab] || tab} {tab === 'All' ? `(${reports.length})` : `(${reports.filter(r => r.status === tab).length})`}
              </button>
            );
          })}
        </div>

        {/* View Toggle: Cards vs Map */}
        <div className="inline-flex p-1 rounded-xl bg-eco-100 dark:bg-dark-bg border border-eco-200 dark:border-dark-border">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'list'
                ? 'bg-eco-900 text-white shadow-sm'
                : 'text-stone-600 dark:text-dark-muted hover:text-eco-950 dark:hover:text-dark-text'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{t('reports.viewList', 'Cards')}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'map'
                ? 'bg-eco-900 text-white shadow-sm'
                : 'text-stone-600 dark:text-dark-muted hover:text-eco-950 dark:hover:text-dark-text'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>{t('reports.viewMap', 'Map View')}</span>
          </button>
        </div>
      </div>

      {/* Reports Display: Map View or Cards List */}
      {viewMode === 'map' ? (
        <div className="rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="font-bold text-base text-eco-950 dark:text-dark-text">
                {t('reports.mapTitle', 'Interactive Civic Hazard Map')}
              </h3>
              <p className="text-xs text-stone-500 dark:text-dark-muted">
                {t('reports.mapSubtitle', 'Locate and track all your submitted municipal reports on the city map.')}
              </p>
            </div>
            <span className="text-xs font-bold text-eco-800 dark:text-eco-400 bg-eco-100 dark:bg-stone-800 px-2.5 py-1 rounded-lg">
              {filteredReports.filter(r => r.latitude && r.longitude).length} {t('reports.pinsOnMap', 'Hazards Placed')}
            </span>
          </div>

          <div className="h-[460px] rounded-2xl overflow-hidden border border-eco-200 dark:border-dark-border">
            <MapContainer
              center={
                filteredReports.find(r => r.latitude && r.longitude)
                  ? [Number(filteredReports.find(r => r.latitude && r.longitude).latitude), Number(filteredReports.find(r => r.latitude && r.longitude).longitude)]
                  : [26.9124, 75.7873]
              }
              zoom={13}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredReports.filter(r => r.latitude && r.longitude).map((rep) => (
                <Marker key={rep.id} position={[Number(rep.latitude), Number(rep.longitude)]}>
                  <Popup>
                    <div className="p-1 space-y-1.5 text-xs max-w-[220px]">
                      <div className="flex items-center justify-between gap-1 font-mono font-bold text-eco-800">
                        <span>{rep.id}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">{rep.priority}</span>
                      </div>
                      <h4 className="font-bold text-stone-900 leading-tight">{rep.title}</h4>
                      <p className="text-[11px] text-stone-500">{rep.address || rep.city}</p>
                      <button
                        type="button"
                        onClick={() => setSelectedReport(rep)}
                        className="w-full mt-2 py-1 px-2 rounded-lg bg-eco-900 text-white font-bold text-[10px] hover:bg-eco-950 text-center"
                      >
                        {t('reports.viewDetails', 'View Details')}
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      ) : (
        /* Reports Cards List */
        filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReports.map((report) => {
            const prioMap = {
              'Critical': t('civic.priorityCritical', 'Critical'),
              'High': t('civic.priorityHigh', 'High'),
              'Medium': t('civic.priorityMedium', 'Medium'),
              'Low': t('civic.priorityLow', 'Low')
            };
            const statusMap = {
              'Resolved': t('reports.tabResolved', 'Resolved'),
              'Under Review': t('reports.tabUnderReview', 'Under Review'),
              'Submitted': t('reports.tabSubmitted', 'Submitted'),
              'Draft': t('reports.tabDraft', 'Draft')
            };

            return (
              <div
                key={report.id}
                className="rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  
                  {/* Header row: ID + Status */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-eco-800 dark:text-eco-400">
                      {report.id}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${getPriorityBadge(report.priority)}`}>
                        {prioMap[report.priority] || report.priority}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${getStatusBadge(report.status)}`}>
                        {statusMap[report.status] || report.status}
                      </span>
                    </div>
                  </div>

                  {/* Media Thumbnail (Photo or Video) if present */}
                  {report.image_url && (
                    <div className="rounded-xl overflow-hidden h-40 bg-black/5 dark:bg-black/30 border border-eco-100 dark:border-dark-border">
                      <SecureMediaViewer
                        bucket="civic-media"
                        src={report.image_url}
                        alt={report.title}
                        isVideo={report.media_type === 'video'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div>
                    <h3 className="font-bold text-base text-eco-950 dark:text-dark-text">
                      {report.title}
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-dark-muted line-clamp-2 mt-1">
                      {report.description}
                    </p>
                  </div>

                  <div className="space-y-1 text-xs text-stone-600 dark:text-dark-muted">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{report.address || report.city}, {report.state}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{report.suggested_department}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{t('reports.filedDate', { date: new Date(report.created_at).toLocaleDateString() })}</span>
                    </div>
                  </div>

                </div>

                {/* Action row */}
                <div className="pt-3 border-t border-eco-100 dark:border-dark-border flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedReport(report)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-eco-900 dark:text-eco-300 hover:underline"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{t('reports.viewDetails', 'View Details')}</span>
                  </button>

                  {/* Status Switcher (for testing & verification) */}
                  <select
                    value={report.status}
                    onChange={(e) => handleStatusChange(report.id, e.target.value)}
                    className="text-[11px] font-semibold py-1 px-2 rounded-lg border border-eco-200 dark:border-dark-border bg-eco-50 dark:bg-dark-bg text-stone-800 dark:text-dark-text"
                  >
                    <option value="Draft">{t('reports.tabDraft', 'Draft')}</option>
                    <option value="Submitted">{t('reports.tabSubmitted', 'Submitted')}</option>
                    <option value="Under Review">{t('reports.tabUnderReview', 'Under Review')}</option>
                    <option value="Resolved">{t('reports.tabResolved', 'Resolved')} (+25 pts)</option>
                  </select>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-dark-card border border-eco-200 dark:border-dark-border p-12 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-eco-950 dark:text-dark-text">
              {t('reports.noReports', 'No reports submitted yet.')}
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              {t('reports.noReportsHelp', "You haven't filed any civic issue reports in this category yet. Photograph street issues to notify local municipal squads and earn Green Score points!")}
            </p>
          </div>
          <Link
            to="/civic-reporter"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-eco-900"
          >
            <Plus className="w-4 h-4 text-eco-200" />
            <span>{t('reports.fileFirstBtn', 'File Your First Report (+50 pts)')}</span>
          </Link>
        </div>
      ))}

      {/* Modal / Dialog to Inspect Complaint Letter */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-dark-card rounded-3xl border border-eco-200 dark:border-dark-border max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-eco-100 dark:border-dark-border flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-eco-800 dark:text-eco-400">
                  {selectedReport.id}
                </span>
                <h3 className="font-bold text-lg text-eco-950 dark:text-dark-text mt-0.5">
                  {selectedReport.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="p-2 rounded-xl text-stone-500 hover:bg-eco-100 dark:hover:bg-dark-bg text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Media Preview in Modal */}
              {selectedReport.image_url && (
                <div className="rounded-2xl overflow-hidden max-h-56 bg-black/5 dark:bg-black/30 border border-eco-100 dark:border-dark-border">
                  <SecureMediaViewer
                    bucket="civic-media"
                    src={selectedReport.image_url}
                    alt={selectedReport.title}
                    isVideo={selectedReport.media_type === 'video'}
                    className="w-full max-h-56 object-contain mx-auto"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-eco-50 dark:bg-dark-bg border border-eco-200 dark:border-dark-border">
                <div>
                  <span className="text-stone-400">{t('reports.modalCategory', 'Category:')}</span>
                  <p className="font-bold text-stone-800 dark:text-dark-text">{selectedReport.category}</p>
                </div>
                <div>
                  <span className="text-stone-400">{t('reports.modalStatus', 'Status:')}</span>
                  <p className="font-bold text-stone-800 dark:text-dark-text">{selectedReport.status}</p>
                </div>
                <div>
                  <span className="text-stone-400">{t('reports.modalJurisdiction', 'Jurisdiction:')}</span>
                  <p className="font-bold text-stone-800 dark:text-dark-text">{selectedReport.city}, {selectedReport.state}</p>
                </div>
                <div>
                  <span className="text-stone-400">{t('reports.modalDept', 'Department:')}</span>
                  <p className="font-bold text-stone-800 dark:text-dark-text">{selectedReport.suggested_department}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-stone-700 dark:text-dark-muted uppercase">
                    {t('reports.modalComplaintHeading', 'Official Municipal Complaint Letter')}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(selectedReport.generated_complaint)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-eco-200 dark:border-dark-border hover:bg-eco-100 font-semibold"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? t('reports.copied', 'Copied') : t('reports.copyText', 'Copy Text')}</span>
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={10}
                  value={selectedReport.generated_complaint || 'No complaint text stored.'}
                  className="w-full font-mono text-xs p-3.5 rounded-xl border border-eco-200 dark:border-dark-border bg-stone-50 dark:bg-dark-bg text-stone-800 dark:text-dark-text leading-relaxed"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-eco-100 dark:border-dark-border flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-eco-900"
              >
                {t('reports.closeModal', 'Close')}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
