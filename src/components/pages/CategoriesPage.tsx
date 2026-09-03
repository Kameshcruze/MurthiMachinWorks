import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { Category, Product } from '../../types';
import { dataService, DATA_CHANGE_EVENT } from '../../services/dataService';
import { formatImageUrl } from '../../utils/helpers';
import { ArrowRight, ChevronRight, Layers, Cog, ShieldCheck } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const { navigateTo } = useNavigation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        dataService.getCategories(),
        dataService.getProducts({ activeOnly: true })
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch (e) {
      console.warn('Error loading categories:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
    const handleDataChange = (e: any) => {
      const entity = e.detail?.entity;
      if (!entity || entity === 'categories' || entity === 'products' || entity === 'all') {
        loadData(false);
      }
    };
    window.addEventListener(DATA_CHANGE_EVENT, handleDataChange);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, handleDataChange);
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white py-12 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <button onClick={() => navigateTo('home')} className="hover:text-amber-400 transition">
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-amber-400 font-semibold">Machinery Categories</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
                Machinery Classification & Tooling Range
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                Browse our comprehensive manufacturing range: Precision Heavy Lathes, Universal Milling, CNC Machining Centers, Radial Drills, Surface Grinders, and Hydraulic Presses.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 text-xs text-slate-300">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>{categories.filter(c => c.is_active).length} Active Categories</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Categories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-10">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 animate-pulse">
                <div className="aspect-16/10 bg-slate-200 rounded-lg" />
                <div className="h-5 bg-slate-200 rounded w-1/2" />
                <div className="h-3 bg-slate-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.filter(c => c.is_active).map(cat => {
              const catProducts = products.filter(p => p.category_id === cat.id);

              return (
                <div
                  key={cat.id}
                  onClick={() => navigateTo('products', { categorySlug: cat.slug })}
                  className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-400 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                    <img
                      src={formatImageUrl(cat.image_url)}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/hero-banner.webp';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                      <h3 className="font-heading font-bold text-lg text-white">
                        {cat.name}
                      </h3>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 shadow">
                        {catProducts.length} Models
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {cat.description}
                    </p>

                    {/* Preview product tags */}
                    {catProducts.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                          Popular Models in this Category
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {catProducts.slice(0, 3).map(p => (
                            <span
                              key={p.id}
                              className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                            >
                              {p.sku}
                            </span>
                          ))}
                          {catProducts.length > 3 && (
                            <span className="text-[11px] text-amber-600 font-semibold px-1 py-0.5">
                              +{catProducts.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600 group-hover:text-amber-700">
                      <span>View Specifications & Models</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
