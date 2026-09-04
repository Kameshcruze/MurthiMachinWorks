import React, { useState, useRef } from 'react';
import { ProductImage } from '../../types';
import { dataService } from '../../services/dataService';
import { useSettings } from '../../context/SettingsContext';
import { formatImageUrl } from '../../utils/helpers';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Star,
  CheckCircle2,
  AlertCircle,
  Link,
  Loader2,
  ArrowUpRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export interface ProductImageManagerProps {
  images: Array<{
    id?: string;
    image_url: string;
    is_primary?: boolean;
    sort_order?: number;
    caption?: string;
  }>;
  onChange: (images: Array<{
    id: string;
    image_url: string;
    is_primary: boolean;
    sort_order: number;
    caption?: string;
  }>) => void;
  maxImages?: number;
}

export const ProductImageManager: React.FC<ProductImageManagerProps> = ({
  images,
  onChange,
  maxImages = 10,
}) => {
  const { showToast } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Normalize image records to ensure required fields exist
  const normalizedImages = images.map((img, idx) => ({
    id: img.id || `img-${idx}-${Date.now()}`,
    image_url: img.image_url,
    is_primary: img.is_primary ?? idx === 0,
    sort_order: img.sort_order ?? idx + 1,
    caption: img.caption || '',
  }));

  // Handle file uploads (with client-side WebP conversion & <500KB compression)
  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));

    if (fileArray.length === 0) {
      showToast('No Images Selected', 'Please select valid image files (JPG, PNG, WebP, etc.)', 'warning');
      return;
    }

    if (normalizedImages.length + fileArray.length > maxImages) {
      showToast(
        'Upload Limit',
        `You can upload up to ${maxImages} images per product. Please select fewer images.`,
        'warning'
      );
      return;
    }

    setIsUploading(true);
    setUploadProgress('Uploading...');

    try {
      const uploadPromises = fileArray.map(async (file, i) => {
        try {
          const result = await dataService.uploadProductImage(file);
          return {
            id: `img-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
            image_url: result.url,
            is_primary: false,
            sort_order: 0,
            caption: file.name.replace(/\.[^/.]+$/, ''),
          };
        } catch (err: any) {
          console.error(`Failed to process ${file.name}:`, err);
          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      const successful = results.filter(Boolean) as any[];

      if (successful.length > 0) {
        const updatedImages = [...normalizedImages];
        successful.forEach((img) => {
          if (updatedImages.length === 0) {
            img.is_primary = true;
          }
          img.sort_order = updatedImages.length + 1;
          updatedImages.push(img);
        });

        onChange(updatedImages);
        showToast(
          'Images Uploaded',
          `Successfully uploaded ${successful.length} image(s).`,
          'success'
        );
      } else {
        showToast('Upload Error', 'Could not upload selected image(s). Please check format.', 'error');
      }
    } finally {
      setIsUploading(false);
      setUploadProgress('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Manual URL handler
  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    const url = urlInput.trim();

    const isFirst = normalizedImages.length === 0;
    const next = [
      ...normalizedImages,
      {
        id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        image_url: url,
        is_primary: isFirst,
        sort_order: normalizedImages.length + 1,
        caption: 'Catalog Photo',
      },
    ];

    onChange(next);
    setUrlInput('');
    showToast('Image URL Added', 'Image added to product gallery.', 'success');
  };

  // Set primary
  const handleSetPrimary = (targetIndex: number) => {
    const next = normalizedImages.map((img, idx) => ({
      ...img,
      is_primary: idx === targetIndex,
    }));
    onChange(next);
    showToast('Primary Image Set', 'Thumbnail display updated.', 'info');
  };

  // Remove image
  const handleRemove = (targetIndex: number) => {
    const wasPrimary = normalizedImages[targetIndex]?.is_primary;
    const filtered = normalizedImages.filter((_, idx) => idx !== targetIndex);

    // If we removed the primary image, promote the first remaining one
    const next = filtered.map((img, idx) => ({
      ...img,
      is_primary: wasPrimary && idx === 0 ? true : img.is_primary,
      sort_order: idx + 1,
    }));

    onChange(next);
  };

  // Move image forward / backward in gallery order
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= normalizedImages.length) return;

    const copy = [...normalizedImages];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    // Re-index sort_order
    const next = copy.map((img, idx) => ({
      ...img,
      sort_order: idx + 1,
    }));

    onChange(next);
  };

  return (
    <div className="space-y-4">
      {/* 1. UPLOAD DROP ZONE */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-amber-500 bg-amber-500/10 scale-[1.01]'
            : 'border-slate-300 hover:border-amber-500 bg-slate-50/80 hover:bg-slate-50'
        } ${isUploading ? 'pointer-events-none opacity-80' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg,image/avif,image/bmp,image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && processFiles(e.target.files)}
        />

        {isUploading ? (
          <div className="py-4 space-y-3">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800">{uploadProgress}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center shadow-xs">
              <Upload className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800">
                Click to upload from device, or drag & drop photos here
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. SECONDARY: EXTERNAL URL TOGGLE */}
      <div className="flex items-center justify-end text-xs">
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1.5 transition"
        >
          <Link className="w-3.5 h-3.5 text-amber-500" />
          <span>{showUrlInput ? 'Hide URL paste input' : 'Or paste direct image URL (Unsplash / CDN)'}</span>
          {showUrlInput ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* URL INPUT COLLAPSIBLE */}
      {showUrlInput && (
        <div className="p-3 bg-slate-100/80 rounded-xl border border-slate-200 flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste image URL (https://images.unsplash.com/... or https://cdn...)"
            className="flex-1 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition"
          >
            Add URL
          </button>
        </div>
      )}

      {/* 3. CURRENT IMAGES GRID */}
      {normalizedImages.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Product Photos ({normalizedImages.length}/{maxImages})</span>
            <span className="text-[11px] text-slate-500">First photo is used as primary thumbnail</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {normalizedImages.map((img, idx) => {
              const isWebP = img.image_url.includes('.webp') || img.image_url.startsWith('data:image/webp');
              const isSupabase = img.image_url.includes('supabase.co');

              return (
                <div
                  key={img.id}
                  className={`group relative aspect-4/3 rounded-xl overflow-hidden border-2 bg-slate-100 transition-all ${
                    img.is_primary ? 'border-amber-500 shadow-md ring-2 ring-amber-500/20' : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img
                    src={formatImageUrl(img.image_url)}
                    alt={img.caption || `Machine Image ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />

                  {/* Primary Badge */}
                  {img.is_primary && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-heading font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <span>Primary</span>
                    </div>
                  )}

                  {/* Format Pill */}
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-mono font-semibold">
                    {isWebP ? 'WEBP' : 'IMAGE'}
                  </div>

                  {/* Storage Indicator */}
                  {isSupabase && (
                    <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-emerald-700/85 backdrop-blur-xs text-white text-[9px] font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>Cloud</span>
                    </div>
                  )}

                  {/* Hover Actions Overlay */}
                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5">
                    <div className="flex items-center justify-end gap-1">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMove(idx, 'up')}
                          className="p-1 bg-white/20 hover:bg-white text-white hover:text-slate-900 rounded transition"
                          title="Move Left"
                        >
                          ←
                        </button>
                      )}
                      {idx < normalizedImages.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMove(idx, 'down')}
                          className="p-1 bg-white/20 hover:bg-white text-white hover:text-slate-900 rounded transition"
                          title="Move Right"
                        >
                          →
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemove(idx)}
                        className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition"
                        title="Delete Image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      {!img.is_primary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(idx)}
                          className="w-full py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-heading font-black uppercase rounded transition flex items-center justify-center gap-1"
                        >
                          <Star className="w-3 h-3 fill-current" />
                          <span>Make Primary</span>
                        </button>
                      )}
                      <a
                        href={img.image_url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-1 bg-white/20 hover:bg-white/30 text-white text-[10px] font-semibold rounded text-center block transition"
                      >
                        View Full Size
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-100/60 border border-slate-200 text-center text-xs text-slate-500">
          <ImageIcon className="w-6 h-6 mx-auto mb-1 text-slate-400" />
          No images uploaded yet. Upload machinery photos from your computer or phone above.
        </div>
      )}
    </div>
  );
};
