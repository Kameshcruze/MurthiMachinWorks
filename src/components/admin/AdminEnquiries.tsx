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
  Handshake,
  Download,
  Upload,
  ExternalLink
} from 'lucide-react';

export const AdminEnquiries: React.FC = () => {
  const { settings, showToast } = useSettings();

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; index: number } | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

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

  const handleDownloadPhoto = async (photoUrl: string, index: number) => {
    if (!selectedEnquiry) return;
    setDownloadingIndex(index);
    try {
      const cleanCustomer = (selectedEnquiry.customer_name || 'seller').replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `Machine_${cleanCustomer}_${selectedEnquiry.id}_photo_${index + 1}.webp`;

      if (photoUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = photoUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Photo Downloaded', `Saved ${filename}`, 'success');
        return;
      }

      // Fetch blob to enable download for cross-origin or remote storage URLs
      const response = await fetch(photoUrl, { mode: 'cors' });
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
      showToast('Photo Downloaded', `Saved ${filename}`, 'success');
    } catch (err) {
      // Direct link fallback
      const link = document.createElement('a');
      link.href = photoUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = `machine_photo_${index + 1}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Photo Opened', 'Image opened in a new tab for download.', 'info');
    } finally {
      setDownloadingIndex(null);
    }
  };

  const handleDownloadAllPhotos = async () => {
    if (!selectedEnquiry || !selectedEnquiry.machine_photos || selectedEnquiry.machine_photos.length === 0) return;
    showToast('Downloading Photos', `Downloading ${selectedEnquiry.machine_photos.length} photos...`, 'info');
    for (let i = 0; i < selectedEnquiry.machine_photos.length; i++) {
      await handleDownloadPhoto(selectedEnquiry.machine_photos[i], i);
      if (i < selectedEnquiry.machine_photos.length - 1) {
        await new Promise(r => setTimeout(r, 400));
      }
    }
  };

  const handleAdminPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedEnquiry) return;

    setIsUploadingPhoto(true);
    try {
      const currentPhotos = selectedEnquiry.machine_photos || [];
      const newUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
          const res = await dataService.uploadProductImage(file, 'seller-machines');
          newUrls.push(res.url);
        } catch {
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          newUrls.push(dataUrl);
        }
      }

      const updatedPhotos = [...currentPhotos, ...newUrls];
      await dataService.updateEnquiry(selectedEnquiry.id, {
        machine_photos: updatedPhotos
      });

      setSelectedEnquiry(prev => prev ? { ...prev, machine_photos: updatedPhotos } : null);
      showToast('Photos Attached', `${newUrls.length} machine photo(s) added successfully.`, 'success');
      loadData();
    } catch (err) {
      showToast('Upload Error', 'Failed to upload photo.', 'error');
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleDeletePhoto = async (photoIndex: number) => {
    if (!selectedEnquiry || !selectedEnquiry.machine_photos) return;
    if (!window.confirm(`Remove photo ${photoIndex + 1}?`)) return;

    const updatedPhotos = selectedEnquiry.machine_photos.filter((_, idx) => idx !== photoIndex);
    try {
      await dataService.updateEnquiry(selectedEnquiry.id, {
        machine_photos: updatedPhotos
      });
      setSelectedEnquiry(prev => prev ? { ...prev, machine_photos: updatedPhotos } : null);
      showToast('Photo Removed', 'Photo removed from enquiry.', 'info');
      loadData();
    } catch (err) {
      showToast('Error', 'Failed to remove photo.', 'error');
    }
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
                          <button
                            type="button"
                            onClick={() => openDetails(enq)}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition cursor-pointer"
                            title="Click to view machine photos"
                          >
                            <Camera className="w-2.5 h-2.5 text-[#C81E1E]" /> {enq.machine_photos.length} photo{enq.machine_photos.length > 1 ? 's' : ''}
                          </button>
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
                      {enq.machine_photos && enq.machine_photos.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            openDetails(enq);
                            setPreviewPhoto({ url: enq.machine_photos![0], index: 0 });
                          }}
                          className="p-1.5 text-[#C81E1E] hover:bg-rose-50 rounded-lg inline-flex items-center cursor-pointer"
                          title={`View / Download ${enq.machine_photos.length} Photo(s)`}
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => openDetails(enq)}
                        className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 rounded-lg inline-flex items-center cursor-pointer"
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

              {/* Machine Photos Gallery (Seller / Customer Uploads) */}
              <div className="p-4 bg-amber-50/70 border border-amber-300/90 rounded-xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#C81E1E]" />
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
                      Machine Photos {selectedEnquiry.user_type === 'seller' ? '(Seller Upload)' : ''}
                      {selectedEnquiry.machine_photos && selectedEnquiry.machine_photos.length > 0
                        ? ` (${selectedEnquiry.machine_photos.length})`
                        : ''}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedEnquiry.machine_photos && selectedEnquiry.machine_photos.length > 1 && (
                      <button
                        type="button"
                        onClick={handleDownloadAllPhotos}
                        className="px-2.5 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        <span>Download All ({selectedEnquiry.machine_photos.length})</span>
                      </button>
                    )}

                    <label className="px-2.5 py-1.5 text-xs font-bold bg-[#C81E1E] hover:bg-[#B31919] text-white rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingPhoto ? 'Processing...' : 'Attach / Upload Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleAdminPhotoUpload}
                        disabled={isUploadingPhoto}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {selectedEnquiry.machine_photos && selectedEnquiry.machine_photos.length > 0 ? (
                  <>
                    <p className="text-[11px] text-slate-600">
                      High-resolution machinery pictures uploaded by the customer. Click <strong>Download</strong> to save any photo directly to your computer, or click image to enlarge.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                      {selectedEnquiry.machine_photos.map((photo, pIdx) => (
                        <div
                          key={pIdx}
                          className="group relative flex flex-col bg-white rounded-xl overflow-hidden border border-slate-300 shadow-xs hover:border-[#C81E1E] transition"
                        >
                          {/* Image Thumbnail with enlarge overlay */}
                          <div
                            onClick={() => setPreviewPhoto({ url: photo, index: pIdx })}
                            className="aspect-4/3 w-full bg-slate-100 relative overflow-hidden cursor-pointer"
                            title="Click to inspect full photo"
                          >
                            <img
                              src={photo}
                              alt={`Machine photo ${pIdx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 text-white text-xs font-bold">
                              <span className="flex items-center gap-1 bg-black/70 px-2.5 py-1 rounded-md">
                                <Eye className="w-3.5 h-3.5" /> Enlarge
                              </span>
                            </div>
                            <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/75 text-white rounded text-[10px] font-bold tracking-wide">
                              Photo #{pIdx + 1}
                            </span>
                          </div>

                          {/* Action Toolbar with Download Button */}
                          <div className="p-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleDownloadPhoto(photo, pIdx)}
                              disabled={downloadingIndex === pIdx}
                              className="flex-1 py-1.5 px-2.5 bg-[#C81E1E] hover:bg-[#B31919] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
                              title="Download full size photo"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>{downloadingIndex === pIdx ? 'Saving...' : 'Download'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setPreviewPhoto({ url: photo, index: pIdx })}
                              className="p-1.5 text-slate-600 hover:text-slate-950 hover:bg-slate-200 rounded-lg transition"
                              title="Inspect full screen"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeletePhoto(pIdx)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              title="Delete photo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="py-5 px-4 bg-white/90 rounded-xl border border-dashed border-amber-300 text-center space-y-2.5">
                    <p className="text-xs font-bold text-slate-800">
                      No machine photos currently attached to this enquiry
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                      If the seller sent machine photos over WhatsApp ({selectedEnquiry.whatsapp || selectedEnquiry.phone}) or Email, click <strong>Attach / Upload Photo</strong> above to link them to this quotation for technical review and valuation.
                    </p>
                  </div>
                )}
              </div>

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
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Enlarge / Lightbox Modal with Direct Download Button */}
      {previewPhoto && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-slate-700 shadow-2xl">
            <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-xs uppercase tracking-wider">
                  Machine Photo #{previewPhoto.index + 1}
                  {selectedEnquiry?.customer_name ? ` • ${selectedEnquiry.customer_name}` : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadPhoto(previewPhoto.url, previewPhoto.index)}
                  disabled={downloadingIndex === previewPhoto.index}
                  className="px-3 py-1.5 bg-[#C81E1E] hover:bg-[#B31919] text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloadingIndex === previewPhoto.index ? 'Downloading...' : 'Download Image'}</span>
                </button>
                <a
                  href={previewPhoto.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                  title="Open in new window"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewPhoto(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                  title="Close viewer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-slate-950/60">
              <img
                src={previewPhoto.url}
                alt="Enlarged machine view"
                className="max-h-[72vh] max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
