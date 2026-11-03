import React, { useState, useEffect } from 'react';
import { Star, Eye, EyeOff, Trash2, Edit2, Search, Filter, CheckCircle2, AlertCircle, X, Image as ImageIcon } from 'lucide-react';
import { dataService, DATA_CHANGE_EVENT } from '../../services/dataService';
import { CustomerReview } from '../../types';
import { useSettings } from '../../context/SettingsContext';

export const AdminReviews: React.FC = () => {
  const { showToast } = useSettings();
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'visible' | 'hidden'>('all');

  // Modal states for Editing and Deleting
  const [editingReview, setEditingReview] = useState<CustomerReview | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      // Get all reviews (including hidden/pending)
      const data = await dataService.getReviews(false);
      setReviews(data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();

    const handleDataChange = (e: any) => {
      if (e.detail?.entity === 'reviews' || e.detail?.entity === 'all') {
        fetchReviews();
      }
    };
    window.addEventListener(DATA_CHANGE_EVENT, handleDataChange);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, handleDataChange);
  }, []);

  const handleToggleVisibility = async (review: CustomerReview) => {
    const updatedApproved = !review.is_approved;
    try {
      await dataService.updateReview(review.id, { is_approved: updatedApproved });
      showToast(
        updatedApproved ? 'Review Published' : 'Review Hidden',
        updatedApproved
          ? `Review by ${review.name} is now visible on the website.`
          : `Review by ${review.name} has been hidden from public display.`,
        'success'
      );
      fetchReviews();
    } catch (err: any) {
      showToast('Update Failed', err?.message || 'Could not update review status.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await dataService.deleteReview(id);
      showToast('Review Deleted', 'The review record has been removed.', 'success');
      setIsDeletingId(null);
      fetchReviews();
    } catch (err: any) {
      showToast('Delete Failed', err?.message || 'Could not delete review.', 'error');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;
    if (!editingReview.name.trim()) {
      showToast('Validation Error', 'Customer name cannot be empty.', 'error');
      return;
    }

    try {
      await dataService.updateReview(editingReview.id, {
        name: editingReview.name.trim(),
        company: editingReview.company?.trim(),
        location: editingReview.location?.trim(),
        rating: editingReview.rating,
        comment: editingReview.comment.trim(),
        is_approved: editingReview.is_approved,
      });
      showToast('Review Updated', 'Review details successfully updated.', 'success');
      setEditingReview(null);
      fetchReviews();
    } catch (err: any) {
      showToast('Update Error', err?.message || 'Failed to update review.', 'error');
    }
  };

  // Filter and Search logic
  const filteredReviews = reviews.filter((r) => {
    if (filterStatus === 'visible' && !r.is_approved) return false;
    if (filterStatus === 'hidden' && r.is_approved) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.name.toLowerCase().includes(q);
      const matchCompany = (r.company || '').toLowerCase().includes(q);
      const matchComment = r.comment.toLowerCase().includes(q);
      return matchName || matchCompany || matchComment;
    }
    return true;
  });

  const totalCount = reviews.length;
  const visibleCount = reviews.filter((r) => r.is_approved).length;
  const hiddenCount = totalCount - visibleCount;
  const avgRating = totalCount > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalCount).toFixed(1) : '5.0';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl text-slate-900 tracking-tight">
            Customer Reviews & Testimonials
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage public feedback, toggle visibility, edit details, or delete reviews and user-submitted photos.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Reviews</span>
          <span className="font-heading font-black text-2xl text-slate-900 mt-1 block">
            {totalCount}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Live on Website</span>
          <span className="font-heading font-black text-2xl text-emerald-600 mt-1 block">
            {visibleCount}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Hidden Reviews</span>
          <span className="font-heading font-black text-2xl text-amber-500 mt-1 block">
            {hiddenCount}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block">Average Rating</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="font-heading font-black text-2xl text-slate-900">{avgRating}</span>
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, company, comment..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterStatus === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('visible')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterStatus === 'visible'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Live ({visibleCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('hidden')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterStatus === 'hidden'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Hidden ({hiddenCount})
          </button>
        </div>
      </div>

      {/* Reviews Table / Cards */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-xs font-medium">
          Loading customer reviews...
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="p-12 bg-white rounded-xl border border-slate-200 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-bold text-slate-800">No reviews found</p>
          <p className="text-xs text-slate-500">
            {searchQuery ? 'Try clearing your search query.' : 'Customer reviews submitted on the site will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between space-y-4 transition ${
                rev.is_approved
                  ? 'border-slate-200 hover:border-slate-300'
                  : 'border-amber-300/80 bg-amber-50/20'
              }`}
            >
              <div className="space-y-3">
                {/* Header: Rating & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= rev.rating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-200 fill-slate-200'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-black text-slate-800 ml-1">
                      {rev.rating}.0
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      rev.is_approved
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {rev.is_approved ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> Live on Site
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" /> Hidden from Public
                      </>
                    )}
                  </span>
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic bg-slate-50/80 p-3 rounded-lg border border-slate-100">
                  "{rev.comment}"
                </p>

                {/* Attached Photos (if any) */}
                {rev.photos && rev.photos.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                      Attached Photos ({rev.photos.length}):
                    </span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {rev.photos.map((url, i) => (
                        <button
                          type="button"
                          key={i}
                          onClick={() => setPreviewPhoto(url)}
                          className="relative rounded-lg overflow-hidden border border-slate-200 hover:border-amber-500 transition w-16 h-16 bg-slate-100 group"
                        >
                          <img
                            src={url}
                            alt={`Review ${rev.name} ${i + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer: Author Info & Admin Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-heading font-bold text-sm text-slate-900">
                    {rev.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {rev.company ? `${rev.company} ` : ''}
                    {rev.location ? `• ${rev.location}` : ''}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {new Date(rev.created_at).toLocaleDateString('en-GB')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(rev)}
                    className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1 transition ${
                      rev.is_approved
                        ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                    title={rev.is_approved ? 'Hide from public website' : 'Make visible on public website'}
                  >
                    {rev.is_approved ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{rev.is_approved ? 'Hide' : 'Publish'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingReview(rev)}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                    title="Edit review"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDeletingId(rev.id)}
                    className="p-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                    title="Delete review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Review Modal */}
      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-heading font-bold text-base text-white">
                Edit Customer Review
              </h3>
              <button
                type="button"
                onClick={() => setEditingReview(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Customer Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingReview.name}
                  onChange={(e) => setEditingReview({ ...editingReview, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={editingReview.company || ''}
                    onChange={(e) => setEditingReview({ ...editingReview, company: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editingReview.location || ''}
                    onChange={(e) => setEditingReview({ ...editingReview, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setEditingReview({ ...editingReview, rating: star })}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= editingReview.rating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">
                    {editingReview.rating} Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Review Text
                </label>
                <textarea
                  rows={4}
                  value={editingReview.comment}
                  onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="edit-approved"
                  checked={editingReview.is_approved}
                  onChange={(e) => setEditingReview({ ...editingReview, is_approved: e.target.checked })}
                  className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-400"
                />
                <label htmlFor="edit-approved" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Approved & Live on Website
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-slate-900">
                Delete Customer Review?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                This will permanently delete this review record and its attached photos from the database.
              </p>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeletingId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(isDeletingId)}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Lightbox */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm"
          onClick={() => setPreviewPhoto(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black transition z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewPhoto}
              alt="Enlarged review machinery photo"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
