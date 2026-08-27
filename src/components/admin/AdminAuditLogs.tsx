import React, { useState, useEffect } from 'react';
import { AuditLog, AuditActionType, AuditTargetType } from '../../types';
import { dataService, DATA_CHANGE_EVENT } from '../../services/dataService';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { getClientIp } from '../../utils/ipService';
import { isSupabaseConfigured } from '../../services/supabase';
import {
  Shield,
  Activity,
  Search,
  Filter,
  Download,
  Trash2,
  Calendar,
  User,
  Globe,
  Clock,
  ChevronRight,
  Package,
  Layers,
  FileSpreadsheet,
  Settings,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ArrowRight,
  RefreshCw,
  Eye,
  Cloud,
  X,
  Lock
} from 'lucide-react';

export const AdminAuditLogs: React.FC = () => {
  const { showToast } = useSettings();
  const { user, isAdmin } = useAuth();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentIp, setCurrentIp] = useState<string>('Resolving...');
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Detail / Diff Modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Fetch IP
  useEffect(() => {
    getClientIp().then(ip => setCurrentIp(ip)).catch(() => setCurrentIp('127.0.0.1 (Local)'));
  }, []);

  // Load Logs
  const loadLogs = async () => {
    if (!isAdmin) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await dataService.getAuditLogs({
        action: actionFilter,
        target_type: targetTypeFilter,
        user_id: userFilter,
        searchQuery: searchQuery.trim()
      });
      setLogs(data);
    } catch (e) {
      console.warn('Failed to load audit logs:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadLogs();
      window.addEventListener(DATA_CHANGE_EVENT, loadLogs);
      return () => window.removeEventListener(DATA_CHANGE_EVENT, loadLogs);
    } else {
      setIsLoading(false);
    }
  }, [actionFilter, targetTypeFilter, userFilter, dateFilter, isAdmin]);

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
          <Lock className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="font-heading font-bold text-lg text-slate-900">
            Audit Logs Access Restricted
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Only Administrator accounts have permission to view, filter, or export IP audit trails and employee change logs.
          </p>
        </div>
      </div>
    );
  }

  // Copy IP Helper
  const handleCopyIp = (ip: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    showToast('IP Copied', `Copied IP ${ip} to clipboard.`, 'info');
    setTimeout(() => setCopiedIp(null), 2000);
  };

  // CSV Export
  const exportToCSV = () => {
    if (logs.length === 0) {
      showToast('Export Error', 'No logs available to export.', 'warning');
      return;
    }

    const headers = [
      'Log ID',
      'Timestamp (ISO)',
      'Timestamp (Formatted)',
      'Action Type',
      'Target Type',
      'Target ID',
      'Target Name',
      'User ID',
      'User Name',
      'User Email',
      'User Role',
      'IP Address',
      'Details / Summary'
    ];

    const rows = filteredLogs.map(l => [
      `"${l.id}"`,
      `"${l.created_at}"`,
      `"${new Date(l.created_at).toLocaleString('en-IN')}"`,
      `"${l.action}"`,
      `"${l.target_type}"`,
      `"${l.target_id}"`,
      `"${(l.target_name || '').replace(/"/g, '""')}"`,
      `"${l.user_id}"`,
      `"${(l.user_name || '').replace(/"/g, '""')}"`,
      `"${l.user_email}"`,
      `"${l.user_role || ''}"`,
      `"${l.ip_address}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MMW_Audit_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Report Exported', 'Audit report downloaded as CSV.', 'success');
  };

  // Clear Logs
  const handleClearLogs = async () => {
    if (!window.confirm('Are you sure you want to clear the audit logs history? This action is irreversible.')) {
      return;
    }
    await dataService.clearAuditLogs();
    showToast('Logs Reset', 'Audit history has been reset.', 'info');
    loadLogs();
  };

  // Date Filtering
  const filteredLogs = logs.filter(log => {
    if (dateFilter === 'today') {
      const logDate = new Date(log.created_at).toDateString();
      const today = new Date().toDateString();
      return logDate === today;
    }
    if (dateFilter === 'week') {
      const sevenDaysAgo = Date.now() - 7 * 86400000;
      return new Date(log.created_at).getTime() >= sevenDaysAgo;
    }
    if (dateFilter === 'month') {
      const thirtyDaysAgo = Date.now() - 30 * 86400000;
      return new Date(log.created_at).getTime() >= thirtyDaysAgo;
    }
    return true;
  });

  // Calculate Metrics
  const totalEvents = filteredLogs.length;
  const createdEvents = filteredLogs.filter(l => l.action === 'CREATE' && l.target_type === 'PRODUCT').length;
  const updatedEvents = filteredLogs.filter(l => l.action === 'UPDATE' && l.target_type === 'PRODUCT').length;
  const deletedEvents = filteredLogs.filter(l => l.action === 'DELETE' && l.target_type === 'PRODUCT').length;
  const uniqueUsers = Array.from(new Set(filteredLogs.map(l => l.user_email || l.user_id))).length;
  const uniqueIps = Array.from(new Set(filteredLogs.map(l => l.ip_address))).length;

  const getActionBadge = (action: AuditActionType) => {
    switch (action) {
      case 'CREATE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            + CREATED
          </span>
        );
      case 'UPDATE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            ✎ UPDATED
          </span>
        );
      case 'DELETE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            ✖ DELETED
          </span>
        );
      case 'DUPLICATE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
            ⎘ DUPLICATED
          </span>
        );
      case 'STATUS_CHANGE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            ⟳ STATUS CHANGE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">
            {action}
          </span>
        );
    }
  };

  const getTargetIcon = (targetType: AuditTargetType) => {
    switch (targetType) {
      case 'PRODUCT':
        return <Package className="w-4 h-4 text-amber-500" />;
      case 'CATEGORY':
        return <Layers className="w-4 h-4 text-blue-500" />;
      case 'ENQUIRY':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-500" />;
      case 'SETTINGS':
        return <Settings className="w-4 h-4 text-purple-500" />;
      case 'USER':
        return <UserCheck className="w-4 h-4 text-sky-500" />;
      default:
        return <Activity className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Security & Active IP Header */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-heading font-bold text-lg sm:text-xl text-white">
                Enterprise Product & Access Audit Log
              </h2>
              {isSupabaseConfigured() ? (
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Cloud className="w-3 h-3" /> SUPABASE CLOUD ACTIVE
                </span>
              ) : (
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                  LIVE CAPTURE ACTIVE
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Every newly added, updated, or deleted machinery product is permanently recorded in Supabase PostgreSQL with the employee ID, login user name, timestamp, and network IP address. All portal users can view these audit logs from any device.
            </p>
          </div>
        </div>

        {/* Current Active User & IP Badge */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Your Current Session
            </p>
            <p className="text-xs font-bold text-white flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              {user?.name || 'Administrator'} ({user?.role || 'Super Admin'})
            </p>
          </div>

          <div className="border-t sm:border-t-0 sm:border-l border-slate-700 pt-2 sm:pt-0 sm:pl-3">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Your Client IP
            </p>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-amber-400">
                {currentIp}
              </span>
              <button
                onClick={() => handleCopyIp(currentIp)}
                title="Copy current IP"
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition"
              >
                {copiedIp === currentIp ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">Total Logged</span>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <p className="font-heading font-black text-2xl text-slate-900">{totalEvents}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Recorded operations</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-xs font-semibold">Products Added</span>
            <Package className="w-4 h-4" />
          </div>
          <p className="font-heading font-black text-2xl text-emerald-600">{createdEvents}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">New creations</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-blue-600 mb-1">
            <span className="text-xs font-semibold">Products Updated</span>
            <RefreshCw className="w-4 h-4" />
          </div>
          <p className="font-heading font-black text-2xl text-blue-600">{updatedEvents}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Specs & price edits</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-rose-600 mb-1">
            <span className="text-xs font-semibold">Products Deleted</span>
            <Trash2 className="w-4 h-4" />
          </div>
          <p className="font-heading font-black text-2xl text-rose-600">{deletedEvents}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Permanent deletions</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-purple-600 mb-1">
            <span className="text-xs font-semibold">Active Users</span>
            <User className="w-4 h-4" />
          </div>
          <p className="font-heading font-black text-2xl text-purple-600">{uniqueUsers}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Distinct user IDs</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-xs font-semibold">Unique IPs</span>
            <Globe className="w-4 h-4" />
          </div>
          <p className="font-heading font-black text-2xl text-amber-600">{uniqueIps}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Origin networks</p>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Product Name, SKU, Employee Email, User ID, or IP..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export CSV Report</span>
            </button>

            <button
              onClick={loadLogs}
              title="Refresh logs"
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {user?.role === 'super_admin' && (
              <button
                onClick={handleClearLogs}
                title="Reset log history"
                className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Operation Action
            </label>
            <select
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Actions (Create, Update, Delete)</option>
              <option value="CREATE">+ Newly Added (CREATE)</option>
              <option value="UPDATE">✎ Modified / Updated (UPDATE)</option>
              <option value="DELETE">✖ Removed (DELETE)</option>
              <option value="DUPLICATE">⎘ Duplicated (DUPLICATE)</option>
              <option value="STATUS_CHANGE">⟳ Status / Auth Changes</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Target Entity
            </label>
            <select
              value={targetTypeFilter}
              onChange={e => setTargetTypeFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Entities</option>
              <option value="PRODUCT">Machinery Products</option>
              <option value="CATEGORY">Categories</option>
              <option value="ENQUIRY">Enquiries & RFQs</option>
              <option value="USER">User / Employee Logins</option>
              <option value="SETTINGS">Site Settings</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Time Window
            </label>
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Recorded Time</option>
              <option value="today">Today's Activity</option>
              <option value="week">Past 7 Days</option>
              <option value="month">Past 30 Days</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Employee Filter
            </label>
            <select
              value={userFilter}
              onChange={e => setUserFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">All Employees & Admins</option>
              <option value="emp-101">Murthi Admin (Master)</option>
              <option value="emp-102">Kamesh R (Production Head)</option>
              <option value="emp-103">Praveen Kumar (Catalog)</option>
              <option value="emp-104">Suresh Rajan (Sales)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Log Feed Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-bold text-sm text-slate-900">
              Audit Event Feed ({filteredLogs.length} Records)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Auto-refreshing on every action
          </span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-500" />
            <p className="text-xs">Loading audit records...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-600">No matching audit logs found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search criteria, time window, or action filters.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {filteredLogs.map(log => {
              const dateObj = new Date(log.created_at);
              const formattedDate = dateObj.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              });
              const formattedTime = dateObj.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              });

              return (
                <div
                  key={log.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Left Column: Timestamp & Action */}
                  <div className="flex items-start gap-3 min-w-[240px]">
                    <div className="mt-0.5 p-2 rounded-xl bg-slate-100 border border-slate-200 shrink-0">
                      {getTargetIcon(log.target_type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {getActionBadge(log.action)}
                        <span className="text-[11px] font-mono font-semibold text-slate-500">
                          {log.target_type}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="font-medium text-slate-700">{formattedDate}</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-mono text-slate-600">{formattedTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle Column: Target Item Details & Summary */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {log.target_name || log.target_id}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                      {log.details || 'Operation recorded in system logs.'}
                    </p>

                    {/* Diff Preview Pill */}
                    {log.changes && log.changes.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          Changed:
                        </span>
                        {log.changes.slice(0, 3).map((ch, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center text-[10px] bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-mono"
                          >
                            {ch.field_label || ch.field}
                          </span>
                        ))}
                        {log.changes.length > 3 && (
                          <span className="text-[10px] text-slate-400">
                            +{log.changes.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right Column: User ID, Email & IP Stamp */}
                  <div className="flex flex-wrap lg:flex-col lg:items-end gap-3 lg:gap-1.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {/* User ID & Role Badge */}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-900 text-amber-400 text-[10px] font-bold flex items-center justify-center">
                        {(log.user_name || log.user_email || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div className="text-left lg:text-right">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-800">
                            {log.user_name || 'Admin Officer'}
                          </span>
                          <span className="text-[9px] font-bold uppercase bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200">
                            {log.user_role || 'Staff'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono">
                          ID: <span className="font-semibold text-slate-700">{log.user_id}</span> ({log.user_email})
                        </p>
                      </div>
                    </div>

                    {/* Network IP Address Pill */}
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                      <Globe className="w-3 h-3 text-slate-400" />
                      <span className="font-mono text-xs font-bold text-slate-700">
                        {log.ip_address}
                      </span>
                      <button
                        onClick={() => handleCopyIp(log.ip_address)}
                        title="Copy IP"
                        className="text-slate-400 hover:text-slate-700 ml-0.5"
                      >
                        {copiedIp === log.ip_address ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    {/* View Full Diff Details Button */}
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="text-[11px] text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 mt-0.5"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Inspect Details</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DETAIL / DIFF INSPECTOR MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500 text-slate-950">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-white">
                    Audit Event Inspection #{selectedLog.id}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Captured at {new Date(selectedLog.created_at).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Event Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Action Type
                  </span>
                  <div className="mt-1">{getActionBadge(selectedLog.action)}</div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Target Entity
                  </span>
                  <span className="font-bold text-slate-800 mt-1 inline-block">
                    {selectedLog.target_type} ({selectedLog.target_id})
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Target Name / SKU
                  </span>
                  <span className="font-bold text-slate-800 mt-1 inline-block truncate">
                    {selectedLog.target_name}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Performed By (User ID)
                  </span>
                  <span className="font-mono font-bold text-slate-800 mt-1 inline-block">
                    {selectedLog.user_id}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Employee Name & Email
                  </span>
                  <span className="font-medium text-slate-800 mt-1 inline-block">
                    {selectedLog.user_name} ({selectedLog.user_email})
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Client IP Address
                  </span>
                  <span className="font-mono font-bold text-amber-600 mt-1 inline-block">
                    {selectedLog.ip_address}
                  </span>
                </div>
              </div>

              {/* Summary Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Audit Summary Description
                </h4>
                <div className="p-3.5 bg-slate-100/70 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium">
                  {selectedLog.details || 'No additional summary details recorded.'}
                </div>
              </div>

              {/* Field Diffs (Before vs After) */}
              {selectedLog.changes && selectedLog.changes.length > 0 ? (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Attribute Modifications Diff ({selectedLog.changes.length} Fields)
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
                    <div className="grid grid-cols-3 bg-slate-100 p-2.5 text-[11px] font-bold text-slate-600">
                      <span>Field Modified</span>
                      <span>Previous Value (Before)</span>
                      <span>Updated Value (After)</span>
                    </div>

                    {selectedLog.changes.map((change, idx) => (
                      <div key={idx} className="grid grid-cols-3 p-3 text-xs items-center gap-2">
                        <span className="font-semibold text-slate-800">
                          {change.field_label || change.field}
                        </span>
                        <span className="font-mono text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-100 truncate">
                          {change.old_value !== null && change.old_value !== undefined
                            ? String(change.old_value)
                            : '(empty / new)'}
                        </span>
                        <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 font-bold truncate">
                          {change.new_value !== null && change.new_value !== undefined
                            ? String(change.new_value)
                            : '(deleted)'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                  Entire entity was created or deleted in this operation.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
