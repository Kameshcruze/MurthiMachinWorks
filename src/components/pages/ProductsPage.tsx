import React, { useState, useEffect, useMemo } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';
import { Product, Category, FilterState } from '../../types';
import { dataService, DATA_CHANGE_EVENT } from '../../services/dataService';
import { ProductCard } from '../products/ProductCard';
import { ProductFilters } from '../products/ProductFilters';
import {
  Search,
  Filter,
  Grid,
  List,
  SlidersHorizontal,
  ChevronRight,
  RotateCcw,
  Sparkles,
  PackageOpen
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { params, navigateTo } = useNavigation();
  const { settings } = useSettings();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const initialCategorySlug = params.categorySlug || '';

  const [filters, setFilters] = useState<FilterState>({
    category: initialCategorySlug,
    brand: '',
    stockStatus: '',
    priceMin: 0,
    priceMax: 5000000,
    searchQuery: params.q || '',
    sortBy: 'featured'
  });

  // Sync category param from navigation
  useEffect(() => {
    if (params.categorySlug !== undefined) {
      setFilters(prev => ({ ...prev, category: params.categorySlug || '' }));
    }
  }, [params.categorySlug]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        dataService.getProducts({ activeOnly: true }),
        dataService.getCategories()
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (e) {
      console.warn('Failed to load products:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener(DATA_CHANGE_EVENT, loadData);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, loadData);
  }, []);

  // Compute available brands
  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    products.forEach(p => {
      if (p.brand) brandsSet.add(p.brand);
    });
    return Array.from(brandsSet);
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        // Category filter
        if (filters.category) {
          const targetCat = categories.find(c => c.slug === filters.category || c.id === filters.category);
          if (targetCat && p.category_id !== targetCat.id) return false;
        }

        // Brand filter
        if (filters.brand && p.brand !== filters.brand) {
          return false;
        }

        // Stock status filter
        if (filters.stockStatus && p.stock_status !== filters.stockStatus) {
          return false;
        }

        // Search query
        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          const match =
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.short_description.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q);
          if (!match) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'featured') {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return 0;
        }
        if (filters.sortBy === 'newest') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (filters.sortBy === 'price_asc') {
          const priceA = a.sale_price || a.price;
          const priceB = b.sale_price || b.price;
          return priceA - priceB;
        }
        if (filters.sortBy === 'price_desc') {
          const priceA = a.sale_price || a.price;
          const priceB = b.sale_price || b.price;
          return priceB - priceA;
        }
        if (filters.sortBy === 'name_asc') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [products, categories, filters]);

  const handleFilterChange = (updates: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters({
      category: '',
      brand: '',
      stockStatus: '',
      priceMin: 0,
      priceMax: 5000000,
      searchQuery: '',
      sortBy: 'featured'
    });
  };

  const currentCategoryObj = categories.find(c => c.slug === filters.category || c.id === filters.category);

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Breadcrumb & Header Banner */}
      <div className="bg-slate-900 text-white py-8 sm:py-12 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-3">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <button onClick={() => navigateTo('home')} className="hover:text-amber-400 transition">
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <button onClick={() => handleFilterChange({ category: '' })} className="hover:text-amber-400 transition">
              Products
            </button>
            {currentCategoryObj && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-amber-400 font-semibold">{currentCategoryObj.name}</span>
              </>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
                {currentCategoryObj ? currentCategoryObj.name : 'Industrial Machinery Catalog'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                {currentCategoryObj
                  ? currentCategoryObj.description
                  : 'Precision lathe machines, universal milling, high-speed CNC machining centers, and heavy engineering tools.'}
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300">
              <span className="font-bold text-amber-400">{filteredProducts.length}</span>
              <span>Machinery Models Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        {/* Top Search & Controls Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={e => handleFilterChange({ searchQuery: e.target.value })}
              placeholder="Search machinery by name, SKU, or specs..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            {/* Desktop Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium hidden md:inline">Sort:</span>
              <select
                value={filters.sortBy}
                onChange={e => handleFilterChange({ sortBy: e.target.value as any })}
                className="py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="featured">Featured First</option>
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Layout Grid: Sidebar Filters + Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filters Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <ProductFilters
                categories={categories}
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                availableBrands={availableBrands}
                totalResults={filteredProducts.length}
              />
            </div>
          </div>

          {/* Mobile Filter Modal */}
          {isMobileFilterOpen && (
            <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
              <div className="w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h3 className="font-heading font-bold text-base">Filter Machinery</h3>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-1 text-slate-500 hover:text-slate-900"
                  >
                    Done
                  </button>
                </div>
                <ProductFilters
                  categories={categories}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onResetFilters={handleResetFilters}
                  availableBrands={availableBrands}
                  totalResults={filteredProducts.length}
                />
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full py-3 bg-amber-500 text-slate-950 font-bold text-xs rounded-lg"
                >
                  Apply Filters ({filteredProducts.length} Results)
                </button>
              </div>
            </div>
          )}

          {/* Products Grid Area */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
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
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <PackageOpen className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading font-bold text-lg text-slate-800">
                    No Matching Machinery Found
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try adjusting your search criteria, category selection, or reset all active filters.
                  </p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
