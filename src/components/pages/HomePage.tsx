import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';
import { Product, Category } from '../../types';
import { dataService, DATA_CHANGE_EVENT } from '../../services/dataService';
import { ProductCard } from '../products/ProductCard';
import { formatImageUrl } from '../../utils/helpers';
import {
  ArrowRight,
  MessageSquare,
  ShieldCheck,
  Cog,
  Wrench,
  Cpu,
  Layers,
  Award,
  Users,
  CheckCircle,
  PhoneCall,
  Search,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

export const HomePage: React.FC = () => {
  const { navigateTo } = useNavigation();
  const { settings } = useSettings();

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        dataService.getProducts({ activeOnly: true }),
        dataService.getCategories()
      ]);
      setFeaturedProducts(prods);
      setCategories(cats);
    } catch (e) {
      console.warn('Failed to load home page data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
    const handleDataChange = (e: any) => {
      const entity = e.detail?.entity;
      if (!entity || entity === 'products' || entity === 'categories' || entity === 'all') {
        loadData(false);
      }
    };
    window.addEventListener(DATA_CHANGE_EVENT, handleDataChange);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, handleDataChange);
  }, []);

  const cleanWhatsAppNumber = (settings.whatsapp || '+91 95852 62522').replace(/[^0-9]/g, '');
  const waHeroUrl = `https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(
    `Hello ${settings.business_name}, I am interested in exploring your machine tools catalog and requesting technical specifications.`
  )}`;

  const filteredProducts = selectedCategoryTab === 'all'
    ? featuredProducts.slice(0, 6)
    : featuredProducts.filter(p => p.category_id === selectedCategoryTab || p.category_name?.toLowerCase().includes(selectedCategoryTab)).slice(0, 6);

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative bg-slate-950 text-white overflow-hidden border-b border-slate-800">
        {/* Background Image with Deep Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={formatImageUrl(settings.hero_image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1920&q=85')}
            alt="Industrial Machinery"
            className="w-full h-full object-cover object-center opacity-25 filter grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/70" />
          <div className="absolute inset-0 industrial-dark-grid" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-24 lg:py-32">
          <div className="max-w-3xl space-y-6">
            {/* Trust Pill */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-amber-400 text-xs font-bold tracking-wide shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>EST. 1985 • COIMBATORE PRECISION MACHINE TOOLS</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1]"
            >
              {settings.hero_title || 'Precision Machinery. Built for Performance.'}
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-2xl"
            >
              {settings.hero_description ||
                'Quality machine tools and engineering solutions from Murthi Machine Works. Engineered for high-duty workshops, heavy turning, milling, drilling, and CNC machining.'}
            </motion.p>

            {/* CTA Buttons Group */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-3.5 pt-2"
            >
              <button
                onClick={() => navigateTo('products')}
                className="px-6 py-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold shadow-lg hover:shadow-amber-500/20 transition-all duration-200 flex items-center gap-2 group"
                id="btn-hero-explore"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href={waHeroUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-sm font-bold shadow-lg hover:shadow-emerald-600/20 transition-all duration-200 flex items-center gap-2"
                id="btn-hero-whatsapp"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>Enquire on WhatsApp</span>
              </a>

              <button
                onClick={() => navigateTo('contact')}
                className="px-5 py-3.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-sm font-semibold border border-slate-700 transition"
              >
                Request Plant Visit
              </button>
            </motion.div>

            {/* Key Metric Counters */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-slate-800/80 text-left"
            >
              <div>
                <p className="font-heading font-extrabold text-2xl sm:text-3xl text-amber-400">40+ Yrs</p>
                <p className="text-xs text-slate-400 mt-0.5">Manufacturing Craft</p>
              </div>
              <div>
                <p className="font-heading font-extrabold text-2xl sm:text-3xl text-amber-400">3,500+</p>
                <p className="text-xs text-slate-400 mt-0.5">Machines Installed</p>
              </div>
              <div>
                <p className="font-heading font-extrabold text-2xl sm:text-3xl text-amber-400">ISO 9001</p>
                <p className="text-xs text-slate-400 mt-0.5">Certified Quality</p>
              </div>
              <div>
                <p className="font-heading font-extrabold text-2xl sm:text-3xl text-amber-400">24/7</p>
                <p className="text-xs text-slate-400 mt-0.5">Technical & Spares Support</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. MACHINERY CATEGORIES SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider mb-1.5">
              <Cog className="w-4 h-4 animate-[spin_8s_linear_infinite]" />
              <span>Engineered Solutions</span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Machinery Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              Explore our comprehensive range of high-rigidity machine tools, lathes, milling, grinding, and CNC machining centers.
            </p>
          </div>
          <button
            onClick={() => navigateTo('categories')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-amber-600 transition"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.filter(c => c.is_active).map(cat => (
            <div
              key={cat.id}
              onClick={() => navigateTo('products', { categorySlug: cat.slug })}
              className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-400 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                <img
                  src={formatImageUrl(cat.image_url)}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                  <h3 className="font-heading font-bold text-base leading-tight drop-shadow-sm">
                    {cat.name}
                  </h3>
                  {typeof cat.product_count === 'number' && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                      {cat.product_count} models
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                  {cat.description}
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600 group-hover:text-amber-700">
                  <span>Browse Machinery</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS CATALOG */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider mb-1.5">
              <Award className="w-4 h-4" />
              <span>Flagship Range</span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              {settings.featured_heading || 'Industrial Grade Machine Tools'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
              Precision tested and quality-certified machine tools ready for immediate dispatch or custom configuration.
            </p>
          </div>

          <button
            onClick={() => navigateTo('products')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow transition shrink-0"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          <button
            onClick={() => setSelectedCategoryTab('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition ${
              selectedCategoryTab === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            All Featured Machinery ({featuredProducts.length})
          </button>
          {categories.filter(c => c.is_active).map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryTab(cat.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedCategoryTab === cat.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 animate-pulse">
                <div className="aspect-4/3 bg-slate-200 rounded-lg" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
                <div className="h-10 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-8">
            <p className="text-sm font-semibold text-slate-700">No machine models found in this category.</p>
            <button
              onClick={() => setSelectedCategoryTab('all')}
              className="mt-3 text-xs text-amber-600 font-bold underline"
            >
              View all machines
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} featuredBadge={true} />
            ))}
          </div>
        )}
      </section>

      {/* 4. WHY CHOOSE MURTHI MACHINE WORKS */}
      <section className="bg-slate-900 text-white py-16 sm:py-20 border-y border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 industrial-dark-grid opacity-50" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Engineering Standard</span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
              Why Industry Leaders Choose Murthi
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Over 40 years of precision craftsmanship and relentless commitment to high metal removal efficiency, dimensional stability, and operator safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white">
                Meehanite Castings & Induction Hardened Beds
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                All bed castings undergo natural aging and induction hardening (450-500 BHN) for vibration-free damping and micron-level accuracy under high cutting loads.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white">
                ISO 9001:2015 Rigorous Metrology & QC
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Every machine undergoes laser interferometry alignment, ballbar circularity tests, and full continuous load running before final dispatch from our Coimbatore plant.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-6 space-y-3">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white">
                Pan-India Erection, Commissioning & Spares
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our factory-trained service engineers provide on-site foundation guidance, machine commissioning, operator training, and guaranteed spare parts availability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE QUOTATION & CONSULTATION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 rounded-2xl p-8 sm:p-12 text-slate-950 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl text-center lg:text-left">
            <span className="text-xs font-extrabold uppercase tracking-widest bg-slate-950 text-white px-3 py-1 rounded-full">
              Custom Industrial Manufacturing
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-slate-950 tracking-tight leading-tight">
              Need a Custom Machine Specification or Turnkey Workshop Setup?
            </h2>
            <p className="text-xs sm:text-sm text-slate-900/90 font-medium leading-relaxed">
              Speak directly with our senior machine tool design engineers. We customize center distances, spindle bores, power press capacities, and automated CNC tooling fixtures.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <a
              href={waHeroUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-950 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 transition"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400 fill-current" />
              <span>WhatsApp Chief Engineer</span>
            </a>

            <a
              href={`tel:${settings.phone}`}
              className="w-full sm:w-auto px-5 py-3.5 bg-white/90 hover:bg-white text-slate-950 text-xs font-bold rounded-lg shadow flex items-center justify-center gap-2 transition"
            >
              <PhoneCall className="w-4 h-4 text-slate-900" />
              <span>Call: {settings.phone}</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
