import React from 'react';
import { Category, FilterState } from '../../types';
import { Filter, RotateCcw, Check, ChevronDown, Sparkles } from 'lucide-react';

interface ProductFiltersProps {
  categories: Category[];
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  availableBrands: string[];
  totalResults: number;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  filters,
  onFilterChange,
  onResetFilters,
  availableBrands,
  totalResults
}) => {
  const stockOptions = [
    { value: '', label: 'All Stock Status' },
    { value: 'in_stock', label: 'In Stock (Ready to Dispatch)' },
    { value: 'made_to_order', label: 'Made to Order' },
    { value: 'low_stock', label: 'Limited Stock' }
  ];

  const hasActiveFilters = Boolean(
    filters.category ||
    filters.brand ||
    filters.stockStatus ||
    filters.searchQuery ||
    filters.priceMin > 0 ||
    filters.priceMax < 5000000
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber-500" />
          <h3 className="font-heading font-bold text-slate-900 text-sm uppercase tracking-wider">
            Filters ({totalResults})
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3 h-3" />
            Reset All
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
          Machinery Category
        </label>
        <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
          <button
            onClick={() => onFilterChange({ category: '' })}
            className={`w-full flex items-center justify-between text-xs py-1.5 px-2.5 rounded-md transition text-left ${
              !filters.category
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>All Machinery Categories</span>
          </button>

          {categories.filter(c => c.is_active).map(cat => {
            const isSelected = filters.category === cat.id || filters.category === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => onFilterChange({ category: isSelected ? '' : cat.slug })}
                className={`w-full flex items-center justify-between text-xs py-1.5 px-2.5 rounded-md transition text-left ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="truncate">{cat.name}</span>
                {typeof cat.product_count === 'number' && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {cat.product_count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Brand Filter */}
      {availableBrands.length > 0 && (
        <div className="space-y-2.5 pt-4 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
            Brand / Series
          </label>
          <div className="space-y-1">
            <button
              onClick={() => onFilterChange({ brand: '' })}
              className={`w-full flex items-center justify-between text-xs py-1.5 px-2.5 rounded-md transition text-left ${
                !filters.brand
                  ? 'bg-slate-900 text-white font-bold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span>All Brands</span>
            </button>
            {availableBrands.map(brand => (
              <button
                key={brand}
                onClick={() => onFilterChange({ brand: filters.brand === brand ? '' : brand })}
                className={`w-full flex items-center justify-between text-xs py-1.5 px-2.5 rounded-md transition text-left ${
                  filters.brand === brand
                    ? 'bg-slate-900 text-white font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="truncate">{brand}</span>
                {filters.brand === brand && <Check className="w-3 h-3 text-amber-400" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stock Availability */}
      <div className="space-y-2.5 pt-4 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
          Stock Availability
        </label>
        <select
          value={filters.stockStatus}
          onChange={e => onFilterChange({ stockStatus: e.target.value })}
          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          {stockOptions.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Sort By Option */}
      <div className="space-y-2.5 pt-4 border-t border-slate-100">
        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
          Sort Machinery
        </label>
        <select
          value={filters.sortBy}
          onChange={e => onFilterChange({ sortBy: e.target.value as any })}
          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="featured">Featured First</option>
          <option value="newest">Newest Additions</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name: A to Z</option>
        </select>
      </div>
    </div>
  );
};
