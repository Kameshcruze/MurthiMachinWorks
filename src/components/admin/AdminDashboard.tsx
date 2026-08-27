import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { dataService, DATA_CHANGE_EVENT } from '../../services/dataService';
import { Product, Category, Enquiry, AuditLog, EmployeeUser } from '../../types';
import { formatPrice, getEnquiryStatusBadge } from '../../utils/helpers';
import { getClientIp } from '../../utils/ipService';
import {
  Package,
  FolderTree,
  FileSpreadsheet,
  Clock,
  Plus,
  ArrowRight,
  MessageSquare,
  Eye,
  CheckCircle2,
  TrendingUp,
  Settings,
  Activity,
  Users,
  Globe,
  Shield,
  RefreshCw,
  UserCheck
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const { navigateTo } = useNavigation();
  const { settings, showToast } = useSettings();
  const { user, isAdmin } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [employees, setEmployees] = useState<EmployeeUser[]>([]);
  const [currentIp, setCurrentIp] = useState<string>('Resolving...');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [prods, cats, enqs, logs, emps, ip] = await Promise.all([
        dataService.getProducts(),
        dataService.getCategories(),
        dataService.getEnquiries(),
        isAdmin ? dataService.getAuditLogs({ limit: 8 }) : Promise.resolve([]),
        isAdmin ? dataService.getEmployees() : Promise.resolve([]),
        getClientIp()
      ]);
      setProducts(prods);
      setCategories(cats);
      setEnquiries(enqs);
      setAuditLogs(logs);
      setEmployees(emps);
      setCurrentIp(ip);
    } catch (e) {
      console.warn('Dashboard load error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleDataChange = () => {
      loadData();
    };
    window.addEventListener(DATA_CHANGE_EVENT, handleDataChange);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, handleDataChange);
  }, []);

  const pendingEnquiries = enquiries.filter(e => e.status === 'new' || e.status === 'in_review');

  const handleStatusChange = async (enquiryId: string, newStatus: any) => {
    try {
      await dataService.updateEnquiryStatus(enquiryId, newStatus);
      showToast('Status Updated', `Enquiry marked as ${newStatus}`, 'success');
      loadData();
    } catch (e) {
      showToast('Error', 'Failed to update status', 'error');
    }
  };

  const getActionBadge = (action: AuditLog['action']) => {
    switch (action) {
      case 'CREATE':
        return <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">+ CREATED</span>;
      case 'UPDATE':
        return <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200">✎ UPDATED</span>;
      case 'DELETE':
        return <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">✖ DELETED</span>;
      case 'DUPLICATE':
        return <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200">⎘ DUPLICATED</span>;
      default:
        return <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">{action}</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
              Industrial Portal Active
            </span>
          </div>
          <h2 className="font-heading font-bold text-2xl text-white">
            Operations & Machinery Control
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateTab('products')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Machinery</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => onNavigateTab('audit-logs')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
            >
              <Activity className="w-4 h-4 text-amber-400" />
              <span>Audit History</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          onClick={() => onNavigateTab('products')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-amber-500 transition cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Machinery</p>
            <p className="font-heading font-extrabold text-2xl text-slate-900">{products.length}</p>
            <p className="text-[11px] text-emerald-600 font-medium">Active in Catalog</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('categories')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-amber-500 transition cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Categories</p>
            <p className="font-heading font-extrabold text-2xl text-slate-900">{categories.length}</p>
            <p className="text-[11px] text-slate-500">Machine Tool Divisions</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FolderTree className="w-6 h-6" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('enquiries')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-amber-500 transition cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Enquiries</p>
            <p className="font-heading font-extrabold text-2xl text-slate-900">{enquiries.length}</p>
            <p className="text-[11px] text-slate-500">Customer Quotation RFQs</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>

        {isAdmin ? (
          <div
            onClick={() => onNavigateTab('team')}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-amber-500 transition cursor-pointer flex items-center justify-between"
          >
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Staff Logins</p>
              <p className="font-heading font-extrabold text-2xl text-purple-600">{employees.length}</p>
              <p className="text-[11px] text-purple-600 font-medium">Active Staff Access</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
        ) : (
          <div
            onClick={() => onNavigateTab('enquiries')}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-amber-500 transition cursor-pointer flex items-center justify-between"
          >
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending RFQs</p>
              <p className="font-heading font-extrabold text-2xl text-amber-600">{pendingEnquiries.length}</p>
              <p className="text-[11px] text-amber-600 font-medium">Require Quotation</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        )}
      </div>

      {/* Split Grid: Live Audit Activity (Admin) / Catalog Actions (Staff) & Quotation Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isAdmin ? (
          /* Left Column: Live Audit Event Feed for Admin */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-600">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-slate-900">
                      Live Audit Trail & IP Log
                    </h3>
                    <p className="text-[11px] text-slate-500">Real-time catalog CRUD updates</p>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateTab('audit-logs')}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                >
                  <span>View Full Log</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {auditLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No recent activity recorded.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {auditLogs.slice(0, 5).map(log => (
                    <div key={log.id} className="p-4 hover:bg-slate-50/80 transition flex items-start justify-between gap-3 text-xs">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {getActionBadge(log.action)}
                          <span className="font-bold text-slate-900 truncate">
                            {log.target_name || log.target_id}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 truncate">
                          {log.details}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          <span>By: <strong className="text-slate-700">{log.user_name}</strong> ({log.user_id})</span>
                          <span>•</span>
                          <span>IP: <strong className="text-amber-600">{log.ip_address}</strong></span>
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono shrink-0 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <button
                onClick={() => onNavigateTab('audit-logs')}
                className="text-xs font-bold text-slate-700 hover:text-amber-600 transition"
              >
                Inspect all {auditLogs.length} audit records and field diffs →
              </button>
            </div>
          </div>
        ) : (
          /* Left Column: Machinery Catalog Operations for Staff */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-600">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-slate-900">
                      Machinery Catalog Operations
                    </h3>
                    <p className="text-[11px] text-slate-500">Quick catalog management</p>
                  </div>
                </div>

                <button
                  onClick={() => onNavigateTab('products')}
                  className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                >
                  <span>Open Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onNavigateTab('products')}
                    className="p-3 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/30 text-left transition group"
                  >
                    <p className="text-xs font-bold text-slate-900 group-hover:text-amber-700">Browse Machines</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{products.length} active models</p>
                  </button>
                  <button
                    onClick={() => onNavigateTab('categories')}
                    className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 text-left transition group"
                  >
                    <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700">Categories</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{categories.length} divisions</p>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Authorized Staff Access
                  </p>
                  <p className="text-[11px] text-slate-500">
                    You have permission to view, add, and manage machinery products, categories, and customer RFQ leads.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <button
                onClick={() => onNavigateTab('products')}
                className="text-xs font-bold text-slate-700 hover:text-amber-600 transition"
              >
                Go to Machinery Catalog (CRUD) →
              </button>
            </div>
          </div>
        )}

        {/* Right Column: Recent Quotation Leads */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-600">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900">
                    Recent Customer RFQs
                  </h3>
                  <p className="text-[11px] text-slate-500">Commercial quotation leads</p>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab('enquiries')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <span>Manage RFQs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {enquiries.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No RFQs received yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {enquiries.slice(0, 5).map(enq => {
                  const badge = getEnquiryStatusBadge(enq.status);
                  return (
                    <div key={enq.id} className="p-4 hover:bg-slate-50/80 transition flex items-center justify-between gap-3 text-xs">
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 truncate">{enq.customer_name}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.2 rounded ${badge.bg}`}>
                            {enq.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {enq.phone} • {enq.company || 'Direct Buyer'}
                        </p>
                        <p className="text-[11px] text-slate-700 font-semibold truncate">
                          {enq.items?.length || 0} item(s): {enq.items?.map(i => i.product_name).join(', ')}
                        </p>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {new Date(enq.created_at).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
            <button
              onClick={() => onNavigateTab('enquiries')}
              className="text-xs font-bold text-slate-700 hover:text-emerald-600 transition"
            >
              Open all quotation inquiries & follow-ups →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
