import React, { useState, useEffect } from 'react';
import { Enquiry } from '../../types';
import { dataService, DATA_CHANGE_EVENT } from '../../services/dataService';
import { useSettings } from '../../context/SettingsContext';
import { formatPrice, getEnquiryStatusBadge } from '../../utils/helpers';
import {
  FileSpreadsheet,
  Search,
  MessageSquare,
  Eye,
  Trash2,
  X,
  Phone,
  Mail,
  Building,
  MapPin,
  Clock,
  CheckCircle2,
  Edit,
  Camera,
  Tag,
  ShoppingBag,
  Handshake
} from 'lucide-react';

export const AdminEnquiries: React.FC = () => {
  const { settings, showToast } = useSettings();

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const loadData = async () => {
    try {
      const data = await dataService.getEnquiries();
      setEnquiries(data);
    } catch (e) {
      console.warn('Error loading enquiries:', e);
    }
  };

  useEffect(() => {
    loadData();
    const handleDataChange = (e: any) => {
      const entity = e.detail?.entity;
      const entities = e.detail?.entities || [];
      if (!entity || entity === 'enquiries' || entity === 'all' || entities.includes('enquiries') || entities.includes('all')) {
        loadData();
      }
    };
    window.addEventListener(DATA_CHANGE_EVENT, handleDataChange);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, handleDataChange);
  }, []);

  const handleStatusChange = async (enquiryId: string, status: any) => {
    try {
      await dataService.updateEnquiryStatus(enquiryId, status);
      showToast('Status Updated', `Enquiry marked as ${status}`, 'success');
      loadData();
      if (selectedEnquiry && selectedEnquiry.id === enquiryId) {
        setSelectedEnquiry(prev => (prev ? { ...prev, status } : null));
      }
    } catch (e) {
      showToast('Error', 'Failed to update status', 'error');
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedEnquiry) return;
    try {
      await dataService.updateEnquiryStatus(selectedEnquiry.id, selectedEnquiry.status, adminNotes);
      showToast('Notes Saved', 'Internal quotation notes updated.', 'success');
      setSelectedEnquiry(prev => (prev ? { ...prev, notes: adminNotes, admin_notes: adminNotes } : null));
      loadData();
    } catch (e) {
      showToast('Error', 'Failed to save notes', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete enquiry from ${name}?`)) return;
    try {
      await dataService.deleteEnquiry(id);
      showToast('Deleted', 'Enquiry removed.', 'info');
      if (selectedEnquiry?.id === id) setSelectedEnquiry(null);
      loadData();
    } catch (e) {
      showToast('Error', 'Failed to delete enquiry.', 'error');
    }
  };

  const openDetails = (enq: Enquiry) => {
    setSelectedEnquiry(enq);
    setAdminNotes(enq.admin_notes || enq.notes || '');
  };

  const filtered = enquiries.filter(enq => {
    if (statusFilter && enq.status !== statusFilter) {
      if (statusFilter === 'contacted' && enq.status === 'in_review') {
        // match legacy status
      } else if (statusFilter === 'quotation_sent' && enq.status === 'quoted') {
        // match legacy status
      } else {
        return false;
      }
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      return (
        (enq.customer_name || '').toLowerCase().includes(q) ||
        (enq.company || '').toLowerCase().includes(q) ||
        (enq.phone || '').toLowerCase().includes(q) ||
        (enq.whatsapp || '').toLowerCase().includes(q) ||
        (enq.email || '').toLowerCase().includes(q) ||
        (enq.location || '').toLowerCase().includes(q) ||
        (enq.message || '').toLowerCase().includes(q) ||
        (enq.notes || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading font-bold text-xl text-slate-900">
          Commercial Enquiries & RFQ Leads
        </h2>
        <p className="text-xs text-slate-500">
          Total {enquiries.length} customer quotations logged in system
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by customer, company, or phone..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Statuses</option>
            <option value="new">New Enquiry</option>
            <option value="contacted">Customer Contacted / In Review</option>
            <option value="quotation_sent">Quotation Sent</option>
            <option value="converted">Order Converted</option>
            <option value="closed">Closed / Archived</option>
          </select>
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Customer & Company</th>
                <th className="py-3 px-4">Contact Phone / WA</th>
                <th className="py-3 px-4">Requested Machinery</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(enq => {
                const badge = getEnquiryStatusBadge(enq.status);
                const cleanPhone = (enq.whatsapp || enq.phone || '').replace(/[^0-9]/g, '');
                const userRole = enq.user_type || 'buyer';
                return (
                  <tr key={enq.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-bold text-slate-900">{enq.customer_name}</p>
                        {userRole === 'seller' ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <Tag className="w-2.5 h-2.5" /> SELLER
                          </span>
                        ) : userRole === 'mediator' ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                            <Handshake className="w-2.5 h-2.5" /> MEDIATOR
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <ShoppingBag className="w-2.5 h-2.5" /> BUYER
                          </span>
                        )}
                        {enq.machine_photos && enq.machine_photos.length > 0 && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <Camera className="w-2.5 h-2.5 text-[#C81E1E]" /> {enq.machine_photos.length} photo{enq.machine_photos.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">{enq.company || 'Not Specified'}</p>
                      {(enq.address || enq.location) && (
                        <p className="text-[10px] text-slate-400">{enq.address || enq.location}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      <div>{enq.phone}</div>
                      {enq.email && <div className="text-[10px] text-slate-400 font-sans">{enq.email}</div>}
                    </td>
                    <td className="py-3.5 px-4">
                      {enq.items && enq.items.length > 0 ? (
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800">
                            {enq.items.length} machine model{enq.items.length > 1 ? 's' : ''}
                          </span>
                          <p className="text-[11px] text-slate-500 line-clamp-1">
                            {enq.items.map(i => `${i.product_name} (${i.quantity})`).join(', ')}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">General Machine Enquiry</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={enq.status}
                        onChange={e => handleStatusChange(enq.id, e.target.value as any)}
                        className={`text-[11px] font-bold px-2 py-1 rounded border ${badge.bg}`}
                      >
                        <option value="new">New</option>
                        <option value="contacted">In Review / Contacted</option>
                        <option value="quotation_sent">Quote Sent</option>
                        <option value="converted">Order Converted</option>
                        <option value="closed">Closed / Archived</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(enq.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      {cleanPhone && (
                        <a
                          href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                            `Hello ${enq.customer_name},\n\nThis is regarding your machine quotation enquiry with Murthi Machine Works.`
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
                        onClick={() => openDetails(enq)}
                        className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 rounded-lg inline-flex items-center"
                        title="View Full RFQ"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(enq.id, enq.customer_name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg inline-flex items-center"
                        title="Delete Enquiry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enquiry Details Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col justify-between">
            {/* Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-base">
                  RFQ Quotation Details #{selectedEnquiry.id}
                </h3>
                <p className="text-xs text-slate-400">
                  Received on {new Date(selectedEnquiry.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Customer Profile Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold uppercase">Customer Name & Role</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="font-bold text-slate-900 text-sm">{selectedEnquiry.customer_name}</p>
                    {selectedEnquiry.user_type === 'seller' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        SELLER
                      </span>
                    ) : selectedEnquiry.user_type === 'mediator' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                        MEDIATOR
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        BUYER
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold uppercase">Company / Works</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedEnquiry.company || 'Not Specified'}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold uppercase">Phone & WhatsApp</span>
                  <p className="font-mono font-bold text-slate-900 mt-0.5">{selectedEnquiry.phone}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold uppercase">Email</span>
                  <p className="font-medium text-slate-900 mt-0.5">{selectedEnquiry.email || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase">Address / Location</span>
                  <p className="font-medium text-slate-900 mt-0.5">
                    {selectedEnquiry.address || selectedEnquiry.location || 'Coimbatore / India'}
                  </p>
                </div>
              </div>

              {/* Machine Photos Gallery (Seller Uploads) */}
              {selectedEnquiry.machine_photos && selectedEnquiry.machine_photos.length > 0 && (
                <div className="space-y-2 p-4 bg-amber-50/60 border border-amber-200 rounded-xl">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#C81E1E]" />
                    <span>Machine Photos Provided by Seller ({selectedEnquiry.machine_photos.length})</span>
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Click any picture to open full-resolution inspection view.
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-1">
                    {selectedEnquiry.machine_photos.map((photo, pIdx) => (
                      <a
                        key={pIdx}
                        href={photo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative block aspect-square rounded-lg overflow-hidden border border-slate-300 shadow-xs bg-black/5 hover:border-[#C81E1E] transition"
                        title="Click to view full photo"
                      >
                        <img
                          src={photo}
                          alt={`Seller machine photo ${pIdx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-[10px] font-bold">
                          View
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Items List */}
              {selectedEnquiry.items && selectedEnquiry.items.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider">
                    Requested Machines ({selectedEnquiry.items.length})
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                    {selectedEnquiry.items.map((it, idx) => (
                      <div key={idx} className="p-3 bg-white flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{it.product_name}</p>
                          <p className="text-[11px] font-mono text-slate-500">SKU: {it.sku}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-slate-900 px-2 py-0.5 bg-slate-100 rounded">
                            Qty: {it.quantity}
                          </span>
                          {it.price && it.price > 0 && (
                            <p className="text-xs text-slate-600 font-mono mt-0.5">
                              {formatPrice(it.price, settings.currency_symbol)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Message */}
              {selectedEnquiry.message && (
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider">
                    Customer Requirement Note
                  </h4>
                  <p className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-line">
                    {selectedEnquiry.message}
                  </p>
                </div>
              )}

              {/* Internal Admin Notes */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider">
                  Internal Factory / Sales Notes
                </h4>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  placeholder="Add notes (e.g. Quoted ₹4.2L CIF Chennai, client requested 3-jaw chuck and DRO, callback on Friday)..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg"
                >
                  Save Internal Notes
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Status:</span>
                <select
                  value={selectedEnquiry.status}
                  onChange={e => handleStatusChange(selectedEnquiry.id, e.target.value as any)}
                  className="text-xs font-bold p-1.5 bg-white border border-slate-300 rounded-lg"
                >
                  <option value="new">New</option>
                  <option value="contacted">In Review / Contacted</option>
                  <option value="quotation_sent">Quote Sent</option>
                  <option value="converted">Order Converted</option>
                  <option value="closed">Closed / Archived</option>
                </select>
              </div>

              <button
                onClick={() => setSelectedEnquiry(null)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
