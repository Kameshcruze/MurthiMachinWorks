import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { Product } from '../../types';
import { dataService } from '../../services/dataService';
import { ProductCard } from '../products/ProductCard';
import { Search, ChevronRight, PackageOpen, ArrowRight } from 'lucide-react';

export const SearchResultsPage: React.FC = () => {
  const { params, navigateTo } = useNavigation();
  const query = params.q || '';
  const [searchTerm, setSearchTerm] = useState(query);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSearchTerm(query);
    const search = async () => {
      setIsLoading(true);
      try {
        const results = await dataService.searchProducts(query);
        setProducts(results);
      } catch (e) {
        console.warn('Search error:', e);
      } finally {
        setIsLoading(false);
      }
    };
    search();
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo('search', { q: searchTerm });
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Search Header */}
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <button onClick={() => navigateTo('home')} className="hover:text-amber-400">
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <button onClick={() => navigateTo('products')} className="hover:text-amber-400">
              Products
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-amber-400 font-semibold">Search Results</span>
          </div>

          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-white">
            Search Results for <span className="text-amber-400">"{query}"</span>
          </h1>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="max-w-xl flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search machine tools, lathe models, specifications..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
          <p className="text-xs font-semibold text-slate-700">
            Found <span className="font-bold text-slate-950">{products.length}</span> matching machinery model{products.length === 1 ? '' : 's'}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 h-80" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <PackageOpen className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading font-bold text-lg text-slate-800">
                No matching machinery found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                We couldn't find any products matching "{query}". Try checking for spelling errors or search by machine type (e.g., Lathe, Milling, CNC, Drill).
              </p>
            </div>
            <button
              onClick={() => navigateTo('products')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition"
            >
              <span>Explore All Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
