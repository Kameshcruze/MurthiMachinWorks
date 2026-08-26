import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';
import { dataService, DATA_CHANGE_EVENT } from '../../services/dataService';
import { Product, Category, Enquiry } from '../../types';
import { formatPrice, getEnquiryStatusBadge } from '../../utils/helpers';
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
  Settings
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const { navigateTo } = useNavigation();
  const { settings, showToast } = useSettings();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const [prods, cats, enqs] = await Promise.all([
        dataService.getProducts(),
        dataService.getCategories(),
        dataService.getEnquiries()
      ]);
      setProducts(prods);
      setCategories(cats);
      setEnquiries(enqs);
    } catch (e) {
      console.warn('Dashboard load error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener(DATA_CHANGE_EVENT, loadData);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, loadData);
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

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <h2 className="font-heading font-bold text-2xl text-white">
            Operations & Machinery Control
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Welcome back to the Murthi Machine Works backend portal. Manage machinery specifications, category classifications, and track incoming commercial RFQ enquiries in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateTab('products')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Machinery</span>
          </button>
          <button
            onClick={() => onNavigateTab('enquiries')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-400" />
            <span>View All RFQs</span>
          </button>
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

        <div
          onClick={() => onNavigateTab('enquiries')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-amber-500 transition cursor-pointer flex items-center justify-between"
        >
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Quotes</p>
            <p className="font-heading font-extrabold text-2xl text-amber-600">{pendingEnquiries.length}</p>
            <p className="text-[11px] text-amber-600 font-medium">Requires Sales Follow-up</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Enquiries Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900">
              Recent Machinery Quotation Leads (RFQs)
            </h3>
            <p className="text-xs text-slate-500">Latest customer submissions across web & mobile</p>
          </div>
          <button
            onClick={() => onNavigateTab('enquiries')}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
          >
            <span>Manage All Enquiries</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {enquiries.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No enquiries received yet. Test by submitting an RFQ from the public storefront.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Customer & Company</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Machines Requested</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enquiries.slice(0, 5).map(enq => {
                  const badge = getEnquiryStatusBadge(enq.status);
                  const cleanPhone = (enq.phone || '').replace(/[^0-9]/g, '');
                  return (
                    <tr key={enq.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{enq.customer_name}</p>
                        <p className="text-[11px] text-slate-500 font-medium">{enq.company || 'Direct Buyer'}</p>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {enq.phone}
                      </td>
                      <td className="py-3.5 px-4">
                        {enq.items && enq.items.length > 0 ? (
                          <span className="font-semibold text-slate-800">
                            {enq.items.length} machine{enq.items.length > 1 ? 's' : ''} ({enq.items.map(i => i.product_name).join(', ')})
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">General Consultation</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={enq.status}
                          onChange={e => handleStatusChange(enq.id, e.target.value as any)}
                          className={`text-[11px] font-bold px-2 py-1 rounded border ${badge.bg}`}
                        >
                          <option value="new">New Lead</option>
                          <option value="in_review">In Review</option>
                          <option value="quoted">Quoted</option>
                          <option value="closed">Closed / Won</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(enq.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                              `Hello ${enq.customer_name}, regarding your machine enquiry with Murthi Machine Works.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg inline-flex items-center"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4 fill-current" />
                          </a>
                        )}
                        <button
                          onClick={() => onNavigateTab('enquiries')}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg inline-flex items-center"
                          title="View Full Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
