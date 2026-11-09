import React, { useState, useRef } from 'react';
import { Star, X, Upload, CheckCircle2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { dataService } from '../../services/dataService';
import { CustomerReview } from '../../types';
import { convertAndCompressToWebP, formatBytes } from '../../utils/imageUtils';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted: (review: CustomerReview) => void;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  onReviewSubmitted,
}) => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');

  // Selected files and processed WebP previews
  const [selectedPhotos, setSelectedPhotos] = useState<{
    file: File;
    previewUrl: string;
    sizeFormatted: string;
  }[]>([]);
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successSubmitted, setSuccessSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const processFiles = async (files: File[]) => {
    if (files.length === 0) return;

    if (selectedPhotos.length + files.length > 5) {
      setErrorMessage('You can attach up to 5 photos with your review.');
      return;
    }

    setIsProcessingPhotos(true);
    setErrorMessage('');

    try {
      const processedList: { file: File; previewUrl: string; sizeFormatted: string }[] = [];
      for (const file of files) {
        // Automatically convert to WebP and compress client-side
        const processed = await convertAndCompressToWebP(file, {
          maxSizeBytes: 500 * 1024,
          maxWidth: 1920,
          maxHeight: 1920,
        });

        processedList.push({
          file: processed.file,
          previewUrl: processed.dataUrl,
          sizeFormatted: processed.compressedSizeFormatted,
        });
      }

      setSelectedPhotos(prev => [...prev, ...processedList]);
    } catch (err: any) {
      setErrorMessage(`Photo processing error: ${err?.message || 'Could not process images.'}`);
    } finally {
      setIsProcessingPhotos(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files) as File[];
    await processFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    const files = (Array.from(e.dataTransfer.files) as File[]).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) {
      setErrorMessage('Please drop valid image files (JPG, PNG, WebP, etc.).');
      return;
    }
    await processFiles(files);
  };

  const handleRemovePhoto = (index: number) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMessage('Customer name is mandatory.');
      return;
    }
    if (!comment.trim()) {
      setErrorMessage('Please write your review feedback.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // 1. Upload photos via dataService (guaranteed WebP format <500KB)
      const uploadedUrls: string[] = [];
      for (const p of selectedPhotos) {
        const uploadRes = await dataService.uploadProductImage(p.file, 'reviews');
        uploadedUrls.push(uploadRes.url);
      }

      // 2. Create Review in database (is_approved: true by default)
      const created = await dataService.createReview({
        name: name.trim(),
        company: company.trim(),
        location: location.trim(),
        rating,
        comment: comment.trim(),
        photos: uploadedUrls,
        is_approved: true, // Posted live on the site by default
      });

      setSuccessSubmitted(true);
      onReviewSubmitted(created);

      // Reset and close after brief celebration
      setTimeout(() => {
        setName('');
        setCompany('');
        setLocation('');
        setRating(5);
        setComment('');
        setSelectedPhotos([]);
        setSuccessSubmitted(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(`Failed to post review: ${err?.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingLabels: Record<number, string> = {
    5: 'Excellent - Highly Recommended',
    4: 'Very Good - Satisfied',
    3: 'Good - Standard Quality',
    2: 'Fair - Needs Improvement',
    1: 'Poor - Not Satisfied',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div>
            <h3 className="font-heading font-black text-lg text-white">
              Write a Customer Review
            </h3>
            <p className="text-xs text-amber-400 mt-0.5">
              Murthi Machine Works • Verified Client Feedback
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {successSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h4 className="font-heading font-black text-xl text-slate-900">
                Review Posted Successfully!
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
                Thank you for your valuable feedback. Your review is now live on the website.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            {/* Rating Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">
                Your Overall Rating <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-115 focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          (hoverRating || rating) >= star
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-300'
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-semibold text-slate-600">
                  {ratingLabels[hoverRating || rating]}
                </span>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Your Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>

            {/* Company & Location (Optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Company / Factory Name <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Precision Engineering"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  City / Location <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Coimbatore, Tamil Nadu"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Review Comment (Mandatory) */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Your Review / Experience <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience regarding the machinery quality, installation, maintenance, or repair service..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed"
              />
            </div>

            {/* Attach Photos Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-500" />
                  <span>Attach Machine / Workshop Photos</span>
                  <span className="text-slate-400 font-normal text-[11px]">(Optional • Up to 5 photos)</span>
                </label>
              </div>

              {/* Photo Previews */}
              {selectedPhotos.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-1">
                  {selectedPhotos.map((p, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-square bg-slate-100">
                      <img
                        src={p.previewUrl}
                        alt={`Review photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 shadow transition"
                        title="Remove photo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-1 left-1 right-1 text-[9px] bg-slate-900/80 text-white text-center rounded px-1 truncate font-mono">
                        {p.sizeFormatted}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload trigger with Drag and Drop */}
              {selectedPhotos.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  disabled={isProcessingPhotos || isSubmitting}
                  className={`w-full py-3.5 px-3 border-2 border-dashed rounded-lg flex flex-col sm:flex-row items-center justify-center gap-2 text-xs font-semibold transition cursor-pointer ${
                    isDragging
                      ? 'border-amber-500 bg-amber-50 text-amber-900 scale-[1.01]'
                      : 'border-slate-300 hover:border-amber-500 text-slate-600 hover:text-slate-900 bg-slate-50/50 hover:bg-amber-50/30'
                  }`}
                >
                  {isProcessingPhotos ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                      <span>Optimizing photo...</span>
                    </>
                  ) : isDragging ? (
                    <>
                      <Upload className="w-4 h-4 text-amber-500 animate-bounce" />
                      <span className="font-bold text-amber-600">Drop photos here to attach</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Drag & drop photos here, or <span className="text-amber-600 underline">browse</span></span>
                    </>
                  )}
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isProcessingPhotos}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-md flex items-center justify-center gap-2 transition disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing Review...</span>
                  </>
                ) : (
                  <span>Submit & Post Review</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
