import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useCart } from '../../context/CartContext';
import { Home, Package, LayoutGrid, Menu, X } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { currentPage, navigateTo, isMobileMenuOpen, toggleMobileMenu } = useNavigation();

  const isHomeActive = currentPage === 'home' && !isMobileMenuOpen;
  const isProductsActive = (currentPage === 'products' || currentPage === 'product-details') && !isMobileMenuOpen;
  const isCategoriesActive = currentPage === 'categories' && !isMobileMenuOpen;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] md:hidden pb-safe">
      <nav className="max-w-md mx-auto grid grid-cols-4 h-16 items-center px-1">
        {/* 1. Home */}
        <button
          onClick={() => {
            if (isMobileMenuOpen) toggleMobileMenu();
            navigateTo('home');
          }}
          className={`flex flex-col items-center justify-center h-full w-full py-1 transition-colors relative ${
            isHomeActive
              ? 'text-amber-600 font-bold'
              : 'text-slate-600 hover:text-slate-900 font-medium'
          }`}
          id="mobile-bottom-nav-home"
        >
          {isHomeActive && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-amber-500 rounded-b-full" />
          )}
          <Home className={`w-5 h-5 mb-0.5 ${isHomeActive ? 'stroke-[2.5px] scale-105' : ''} transition-transform`} />
          <span className="text-[11px] leading-tight tracking-tight">Home</span>
        </button>

        {/* 2. Products */}
        <button
          onClick={() => {
            if (isMobileMenuOpen) toggleMobileMenu();
            navigateTo('products');
          }}
          className={`flex flex-col items-center justify-center h-full w-full py-1 transition-colors relative ${
            isProductsActive
              ? 'text-amber-600 font-bold'
              : 'text-slate-600 hover:text-slate-900 font-medium'
          }`}
          id="mobile-bottom-nav-products"
        >
          {isProductsActive && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-amber-500 rounded-b-full" />
          )}
          <Package className={`w-5 h-5 mb-0.5 ${isProductsActive ? 'stroke-[2.5px] scale-105' : ''} transition-transform`} />
          <span className="text-[11px] leading-tight tracking-tight">Products</span>
        </button>

        {/* 3. Categories */}
        <button
          onClick={() => {
            if (isMobileMenuOpen) toggleMobileMenu();
            navigateTo('categories');
          }}
          className={`flex flex-col items-center justify-center h-full w-full py-1 transition-colors relative ${
            isCategoriesActive
              ? 'text-amber-600 font-bold'
              : 'text-slate-600 hover:text-slate-900 font-medium'
          }`}
          id="mobile-bottom-nav-categories"
        >
          {isCategoriesActive && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-amber-500 rounded-b-full" />
          )}
          <LayoutGrid className={`w-5 h-5 mb-0.5 ${isCategoriesActive ? 'stroke-[2.5px] scale-105' : ''} transition-transform`} />
          <span className="text-[11px] leading-tight tracking-tight">Categories</span>
        </button>

        {/* 4. Menu */}
        <button
          onClick={toggleMobileMenu}
          className={`flex flex-col items-center justify-center h-full w-full py-1 transition-colors relative ${
            isMobileMenuOpen
              ? 'text-amber-600 font-bold'
              : 'text-slate-600 hover:text-slate-900 font-medium'
          }`}
          id="mobile-bottom-nav-menu"
        >
          {isMobileMenuOpen && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-amber-500 rounded-b-full" />
          )}
          {isMobileMenuOpen ? (
            <X className="w-5 h-5 mb-0.5 stroke-[2.5px] text-amber-600 transition-transform" />
          ) : (
            <Menu className="w-5 h-5 mb-0.5 transition-transform" />
          )}
          <span className="text-[11px] leading-tight tracking-tight">Menu</span>
        </button>
      </nav>
    </div>
  );
};
