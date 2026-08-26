import React, { useState } from 'react';
import { ProductImage } from '../../types';
import { formatImageUrl } from '../../utils/helpers';
import { Maximize2, ChevronLeft, ChevronRight, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const defaultList: ProductImage[] = images && images.length > 0 ? images : [
    { id: 'default-1', image_url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=85', sort_order: 1, is_primary: true }
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<{ x: number; y: number; isHovering: boolean }>({
    x: 0,
    y: 0,
    isHovering: false,
  });

  const activeImage = defaultList[activeIndex] || defaultList[0];
  const activeImageUrl = formatImageUrl(activeImage?.image_url);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ x, y, isHovering: true });
  };

  const handleMouseLeave = () => {
    setZoomStyle(prev => ({ ...prev, isHovering: false }));
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex(prev => (prev > 0 ? prev - 1 : defaultList.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex(prev => (prev < defaultList.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="space-y-4">
      {/* Main Image Stage */}
      <div
        className="relative aspect-4/3 sm:aspect-16/11 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden cursor-crosshair group select-none shadow-xs"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => setIsLightboxOpen(true)}
      >
        <img
          src={activeImageUrl}
          alt={productName}
          className={`w-full h-full object-cover transition-transform duration-200 ${
            zoomStyle.isHovering ? 'scale-130' : 'scale-100'
          }`}
          style={
            zoomStyle.isHovering
              ? { transformOrigin: `${zoomStyle.x}% ${zoomStyle.y}%` }
              : undefined
          }
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=85';
          }}
        />

        {/* Top Control Bar */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(true);
            }}
            className="p-2 rounded-lg bg-white/90 hover:bg-white text-slate-800 shadow-md backdrop-blur-xs transition"
            title="Expand Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Carousel Navigation Arrows if multiple */}
        {defaultList.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-slate-900 shadow-md opacity-0 group-hover:opacity-100 transition duration-200"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-slate-900 shadow-md opacity-0 group-hover:opacity-100 transition duration-200"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Industrial watermark pill */}
        <div className="absolute bottom-3 left-3 pointer-events-none">
          <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded bg-slate-950/80 text-white backdrop-blur-xs flex items-center gap-1.5 shadow">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            Murthi Precision Machine
          </span>
        </div>
      </div>

      {/* Thumbnails Row */}
      {defaultList.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {defaultList.map((img, idx) => {
            const formatted = formatImageUrl(img.image_url);
            const isActive = idx === activeIndex;
            return (
              <button
                key={img.id || idx}
                onClick={() => setActiveIndex(idx)}
                className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                  isActive
                    ? 'border-amber-500 ring-2 ring-amber-500/30 scale-102'
                    : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={formatted}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 p-3 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition"
            >
              <X className="w-6 h-6" />
            </button>

            <div
              className="relative max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={activeImageUrl}
                alt={productName}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                referrerPolicy="no-referrer"
              />

              {defaultList.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 transition"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 text-white hover:bg-slate-900 transition"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
