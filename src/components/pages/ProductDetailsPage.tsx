import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { Product } from '../../types';
import { dataService } from '../../services/dataService';
import { ProductGallery } from '../products/ProductGallery';
import { ProductCard } from '../products/ProductCard';
import { formatPrice, getStockStatusBadge, generateWhatsAppProductLink } from '../../utils/helpers';
import {
  ChevronRight,
  MessageSquare,
  Plus,
  Check,
  Download,
  Share2,
  ShieldCheck,
  Truck,
  Wrench,
  FileText,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Layers,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

export const ProductDetailsPage: React.FC = () => {
  const { params, navigateTo } = useNavigation();
  const { items, addToCart, setIsCartOpen } = useCart();
  const { settings, showToast } = useSettings();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'features' | 'applications' | 'downloads'>('specs');

  const slug = params.slug || '';

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        if (slug) {
          const found = await dataService.getProductBySlug(slug);
          if (found) {
            setProduct(found);
            // fetch related products
            const all = await dataService.getProducts({ categoryId: found.category_id, activeOnly: true });
            setRelatedProducts(all.filter(p => p.id !== found.id).slice(0, 3));
          } else {
            setProduct(null);
          }
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-4/3 bg-slate-200 rounded-xl" />
          <div className="space-y-6">
            <div className="h-6 bg-slate-200 rounded w-1/4" />
            <div className="h-10 bg-slate-200 rounded w-3/4" />
            <div className="h-6 bg-slate-200 rounded w-1/2" />
            <div className="h-24 bg-slate-200 rounded" />
            <div className="h-12 bg-slate-200 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="font-heading font-bold text-2xl text-slate-900">Machine Tool Not Found</h2>
        <p className="text-sm text-slate-600">
          The requested machine specifications might have been updated or moved.
        </p>
        <button
          onClick={() => navigateTo('products')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold shadow hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Machine Catalog</span>
        </button>
      </div>
    );
  }

  const isItemInCart = items.some(it => it.product_id === product.id);
  const stockBadge = getStockStatusBadge(product.stock_status);
  const specs = product.specifications || [];
  const features = product.features || [];
  const downloads = product.downloads || [];

  const handleAddToCart = () => {
    addToCart(product, quantity);
    showToast('Added to RFQ List', `${product.name} (Qty: ${quantity}) has been added to your quotation list.`, 'success');
  };

  const handleImmediateEnquiry = () => {
    addToCart(product, quantity);
    setIsCartOpen(true);
  };

  const handleWhatsApp = () => {
    const link = generateWhatsAppProductLink(settings.whatsapp, product.name, product.sku, settings.business_name);
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.short_description,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link Copied', 'Product link copied to clipboard.', 'info');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap">
            <button onClick={() => navigateTo('home')} className="hover:text-amber-600 transition">
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <button onClick={() => navigateTo('products')} className="hover:text-amber-600 transition">
              Machinery
            </button>
            {product.category_name && (
              <>
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                <button
                  onClick={() => navigateTo('products', { categorySlug: product.category_name?.toLowerCase() })}
                  className="hover:text-amber-600 transition"
                >
                  {product.category_name}
                </button>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <span className="text-slate-900 font-semibold truncate">{product.name}</span>
          </div>

          <button
            onClick={handleShare}
            className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-50 transition shrink-0"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Main Hero Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          {/* Left: Gallery (5 cols) */}
          <div className="lg:col-span-6">
            <ProductGallery images={product.images || []} productName={product.name} />
          </div>

          {/* Right: Product Details & Actions (7 cols) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category & Stock Row */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {product.category_name && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-900 text-amber-400">
                      {product.category_name}
                    </span>
                  )}
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    SKU: {product.sku}
                  </span>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded border ${stockBadge.bg}`}>
                  {stockBadge.label}
                </span>
              </div>

              {/* Product Title */}
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-slate-950 tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Brand & Origin */}
              <div className="flex items-center gap-4 text-xs text-slate-600">
                <span>Brand: <strong className="text-slate-900">{product.brand || 'Murthi Precision'}</strong></span>
                <span>•</span>
                <span>Origin: <strong className="text-slate-900">Coimbatore, India</strong></span>
              </div>

              {/* Short Description */}
              <p className="text-sm text-slate-600 leading-relaxed">
                {product.short_description}
              </p>

              {/* Pricing Box */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <span className="text-xs text-slate-500 block">Ex-Factory Indicative Pricing</span>
                  {product.show_price && product.price > 0 ? (
                    <div className="flex items-baseline gap-2.5 mt-0.5">
                      <span className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-950">
                        {formatPrice(product.sale_price || product.price, settings.currency_symbol)}
                      </span>
                      {product.sale_price && (
                        <span className="text-sm text-slate-400 line-through">
                          {formatPrice(product.price, settings.currency_symbol)}
                        </span>
                      )}
                      <span className="text-xs text-slate-500 font-medium">+ GST (18%)</span>
                    </div>
                  ) : (
                    <span className="text-lg font-bold text-slate-800">
                      Price Available on Commercial Request
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    12 Months Factory Warranty
                  </span>
                </div>
              </div>

              {/* Key Quick Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 block">Bed Casting</span>
                  <span className="text-xs font-bold text-slate-800">Grade 25 / Meehanite</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 block">Hardness</span>
                  <span className="text-xs font-bold text-slate-800">450 - 500 BHN</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                  <span className="text-[11px] text-slate-500 block">Testing</span>
                  <span className="text-xs font-bold text-slate-800">Laser Interferometry</span>
                </div>
              </div>
            </div>

            {/* Quantity Selector & Action CTAs */}
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700">Quantity (Units):</span>
                <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-100 transition"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold text-slate-900 font-mono">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-100 transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Buttons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className={`py-3 px-4 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 ${
                    isItemInCart
                      ? 'bg-amber-50 border-amber-400 text-amber-900'
                      : 'bg-white border-slate-300 hover:border-slate-400 text-slate-900 hover:bg-slate-50 shadow-xs'
                  }`}
                  id="btn-add-to-cart"
                >
                  {isItemInCart ? (
                    <>
                      <Check className="w-4 h-4 text-amber-600" />
                      <span>Added to RFQ List ({items.find(i => i.product_id === product.id)?.quantity})</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add to RFQ List</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleImmediateEnquiry}
                  className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                  id="btn-instant-quote"
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Request Instant Quotation</span>
                </button>
              </div>

              {/* Direct WhatsApp Callout */}
              <button
                onClick={handleWhatsApp}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow hover:shadow-md transition flex items-center justify-center gap-2"
                id="btn-product-whatsapp"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>Chat with Product Specialist on WhatsApp</span>
              </button>
            </div>

            {/* Industrial Service Commitments */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-[11px] text-slate-500">
              <div className="flex flex-col items-center">
                <Truck className="w-4 h-4 text-slate-700 mb-1" />
                <span>Pan-India Transit Safe</span>
              </div>
              <div className="flex flex-col items-center">
                <Wrench className="w-4 h-4 text-slate-700 mb-1" />
                <span>Plant Erection Support</span>
              </div>
              <div className="flex flex-col items-center">
                <PhoneCall className="w-4 h-4 text-slate-700 mb-1" />
                <span>Dedicated AMC & Spares</span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Tabs Section */}
        <div className="mt-12 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          {/* Tabs Bar */}
          <div className="flex border-b border-slate-200 overflow-x-auto bg-slate-50">
            <button
              onClick={() => setActiveTab('specs')}
              className={`px-6 py-4 text-xs font-bold uppercase tracking-wider transition border-b-2 whitespace-nowrap ${
                activeTab === 'specs'
                  ? 'border-amber-500 text-slate-950 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Technical Specifications ({specs.length})
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`px-6 py-4 text-xs font-bold uppercase tracking-wider transition border-b-2 whitespace-nowrap ${
                activeTab === 'features'
                  ? 'border-amber-500 text-slate-950 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Machine Features & Construction
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-6 py-4 text-xs font-bold uppercase tracking-wider transition border-b-2 whitespace-nowrap ${
                activeTab === 'applications'
                  ? 'border-amber-500 text-slate-950 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Industrial Applications
            </button>
            {downloads.length > 0 && (
              <button
                onClick={() => setActiveTab('downloads')}
                className={`px-6 py-4 text-xs font-bold uppercase tracking-wider transition border-b-2 whitespace-nowrap ${
                  activeTab === 'downloads'
                    ? 'border-amber-500 text-slate-950 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Brochures & Manuals ({downloads.length})
              </button>
            )}
          </div>

          {/* Tab Content Panels */}
          <div className="p-6 sm:p-8">
            {activeTab === 'specs' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 mb-1">
                    Standard Technical Parameters
                  </h3>
                  <p className="text-xs text-slate-500">
                    Engineered according to Indian Standards (IS:1878) and ISO metrology accuracy protocols.
                  </p>
                </div>

                {specs.length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-white font-heading uppercase text-[11px] tracking-wider">
                        <tr>
                          <th className="py-3 px-4 font-bold w-1/3">Specification Parameter</th>
                          <th className="py-3 px-4 font-bold w-1/3">Rated Value</th>
                          <th className="py-3 px-4 font-bold w-1/3">Unit / Tolerance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {specs.map((s, idx) => (
                          <tr key={s.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="py-3 px-4 font-semibold text-slate-800">{s.spec_key}</td>
                            <td className="py-3 px-4 font-mono font-bold text-slate-950">{s.spec_value}</td>
                            <td className="py-3 px-4 text-slate-500">{s.unit || 'Standard'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No specific parameters tabulated for this model.</p>
                )}

                {/* Additional detailed description */}
                {product.description && (
                  <div className="pt-4 border-t border-slate-200 space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Engineering Overview</h4>
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                      {product.description}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'features' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 mb-1">
                    Design & Mechanical Construction Highlights
                  </h3>
                  <p className="text-xs text-slate-500">
                    Engineered for high metal removal rates, vibration damping, and zero operator fatigue.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-800 font-medium leading-relaxed">
                        {feat}
                      </p>
                    </div>
                  ))}
                  {features.length === 0 && (
                    <p className="text-xs text-slate-500 italic">Standard features apply for this category.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'applications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 mb-1">
                    Recommended Industries & Workpiece Applications
                  </h3>
                  <p className="text-xs text-slate-500">
                    Proven in heavy-duty production workshops across Tamil Nadu, Gujarat, Maharashtra, and pan-India.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-amber-600" />
                      Automotive Tier-1 & 2
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      Axle turning, flange machining, brake drum facing, transmission shafts, and engine block boring.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-amber-600" />
                      Agricultural Pumps & Motors
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      Submersible pump impeller turning, motor body boring, pump casing milling, and rotor shaft grinding.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <Wrench className="w-4 h-4 text-amber-600" />
                      Heavy Fabrication & Railways
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      Hydraulic cylinder fabrication, valve body turning, railway axle machining, and heavy mold dies.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'downloads' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 mb-1">
                    Technical Catalogues & Foundation Drawings
                  </h3>
                  <p className="text-xs text-slate-500">
                    Download official engineering PDF brochures and civil foundation layout diagrams.
                  </p>
                </div>

                <div className="space-y-3 max-w-xl">
                  {downloads.map((dl, idx) => (
                    <div
                      key={dl.id || idx}
                      className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-amber-400 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{dl.title}</h4>
                          <span className="text-[10px] text-slate-500 uppercase">{dl.file_type} • {dl.file_size || 'PDF'}</span>
                        </div>
                      </div>
                      <a
                        href={dl.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-slate-800 transition"
                        title="Download Document"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Machinery Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 space-y-6">
            <div>
              <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900">
                Related Industrial Machinery
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Explore other high-performance models within the {product.category_name || 'machinery'} category.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map(rel => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
