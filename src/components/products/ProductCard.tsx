import React from 'react';
import { Product } from '../../types';
import { useNavigation } from '../../context/NavigationContext';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { formatImageUrl, formatPrice, getStockStatusBadge, generateWhatsAppProductLink } from '../../utils/helpers';
import { MessageSquare, Plus, Check, Eye, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  featuredBadge?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, featuredBadge = false }) => {
  const { navigateTo } = useNavigation();
  const { items, addToCart } = useCart();
  const { settings, showToast } = useSettings();

  const isItemInCart = items.some(it => it.product_id === product.id);
  const primaryImg = product.images?.find(i => i.is_primary)?.image_url || product.images?.[0]?.image_url;
  const displayImage = formatImageUrl(primaryImg);
  const stockBadge = getStockStatusBadge(product.stock_status);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    showToast('Added to Enquiry List', `${product.name} has been added to your quotation list.`, 'success');
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = generateWhatsAppProductLink(settings.whatsapp, product.name, product.sku, settings.business_name);
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={() => navigateTo('product-details', { slug: product.slug })}
      className="group bg-white rounded-xl border border-slate-200/90 hover:border-amber-400/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer relative"
      id={`product-card-${product.id}`}
    >
      {/* Top Image Section */}
      <div className="relative aspect-4/3 bg-slate-100 overflow-hidden border-b border-slate-100">
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
          {product.category_name && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-900/85 text-amber-400 backdrop-blur-xs shadow-xs">
              {product.category_name}
            </span>
          )}

          <div className="flex items-center gap-1 ml-auto">
            {featuredBadge && product.is_featured && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500 text-slate-950 shadow-xs">
                Featured
              </span>
            )}
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${stockBadge.bg}`}>
              {stockBadge.label}
            </span>
          </div>
        </div>

        {/* Quick View Floating Pill on Hover */}
        <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white/90 backdrop-blur-xs text-slate-900 px-2.5 py-1 rounded shadow-sm">
            <Eye className="w-3.5 h-3.5" />
            View Specs
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* SKU & Brand */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-mono">
            <span>SKU: {product.sku}</span>
            {product.brand && <span className="text-slate-600 font-medium font-sans">{product.brand}</span>}
          </div>

          {/* Product Title */}
          <h3 className="font-heading font-bold text-slate-900 text-base leading-snug group-hover:text-amber-600 transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-3">
            {product.short_description}
          </p>
        </div>

        {/* Pricing & Actions */}
        <div className="pt-3 border-t border-slate-100 mt-2">
          {/* Price Row */}
          <div className="flex items-baseline justify-between mb-3.5">
            <div>
              {product.show_price && product.price > 0 ? (
                <div className="flex items-baseline gap-2">
                  <span className="font-heading font-extrabold text-slate-950 text-lg">
                    {formatPrice(product.sale_price || product.price, settings.currency_symbol)}
                  </span>
                  {product.sale_price && (
                    <span className="text-xs text-slate-400 line-through">
                      {formatPrice(product.price, settings.currency_symbol)}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500 font-medium">+ GST</span>
                </div>
              ) : (
                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
                  Contact for Price
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              1 Yr Warranty
            </span>
          </div>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAddToCart}
              className={`py-2 px-3 text-xs font-bold rounded-lg border transition flex items-center justify-center gap-1.5 ${
                isItemInCart
                  ? 'bg-amber-50 border-amber-400 text-amber-800'
                  : 'bg-white border-slate-300 hover:border-slate-400 text-slate-800 hover:bg-slate-50'
              }`}
              title="Add to Enquiry Quotation"
            >
              {isItemInCart ? (
                <>
                  <Check className="w-3.5 h-3.5 text-amber-600" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to RFQ</span>
                </>
              )}
            </button>

            <button
              onClick={handleWhatsApp}
              className="py-2 px-3 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-2xs hover:shadow transition flex items-center justify-center gap-1.5"
              title="Chat on WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-current" />
              <span>Enquire</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
