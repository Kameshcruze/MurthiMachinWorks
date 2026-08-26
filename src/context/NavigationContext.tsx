import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type PageRoute =
  | 'home'
  | 'products'
  | 'product-details'
  | 'categories'
  | 'about'
  | 'contact'
  | 'search'
  | 'cart'
  | 'privacy'
  | 'terms'
  | 'admin-login'
  | 'admin-dashboard'
  | 'admin-products'
  | 'admin-product-new'
  | 'admin-product-edit'
  | 'admin-categories'
  | 'admin-enquiries'
  | 'admin-customers'
  | 'admin-settings'
  | 'admin-sql-setup';

interface NavigationContextType {
  currentPage: PageRoute;
  params: Record<string, string>;
  navigateTo: (page: PageRoute, params?: Record<string, string>) => void;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageRoute>('home');
  const [params, setParams] = useState<Record<string, string>>({});

  // Parse current URL path / hash on mount
  const parseLocation = useCallback(() => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    const searchParams = new URLSearchParams(window.location.search);
    
    if (hash.startsWith('admin/')) {
      const sub = hash.replace('admin/', '');
      if (sub === 'login') setCurrentPage('admin-login');
      else if (sub === 'products/new') setCurrentPage('admin-product-new');
      else if (sub.startsWith('products/edit/')) {
        const id = sub.replace('products/edit/', '');
        setCurrentPage('admin-product-edit');
        setParams({ productId: id });
      }
      else if (sub === 'products') setCurrentPage('admin-products');
      else if (sub === 'categories') setCurrentPage('admin-categories');
      else if (sub === 'enquiries') setCurrentPage('admin-enquiries');
      else if (sub === 'customers') setCurrentPage('admin-customers');
      else if (sub === 'settings') setCurrentPage('admin-settings');
      else if (sub === 'sql-setup') setCurrentPage('admin-sql-setup');
      else setCurrentPage('admin-dashboard');
      return;
    }

    if (hash.startsWith('product/')) {
      const slug = hash.replace('product/', '');
      setCurrentPage('product-details');
      setParams({ slug });
      return;
    }

    if (hash.startsWith('products/category/')) {
      const catSlug = hash.replace('products/category/', '');
      setCurrentPage('products');
      setParams({ categorySlug: catSlug });
      return;
    }

    if (hash.startsWith('search')) {
      const q = searchParams.get('q') || '';
      setCurrentPage('search');
      setParams({ q });
      return;
    }

    switch (hash) {
      case 'products':
        setCurrentPage('products');
        break;
      case 'categories':
        setCurrentPage('categories');
        break;
      case 'about':
        setCurrentPage('about');
        break;
      case 'contact':
        setCurrentPage('contact');
        break;
      case 'cart':
      case 'enquiry':
        setCurrentPage('cart');
        break;
      case 'privacy':
        setCurrentPage('privacy');
        break;
      case 'terms':
        setCurrentPage('terms');
        break;
      case 'admin':
      case 'admin/login':
        setCurrentPage('admin-login');
        break;
      case 'admin/dashboard':
        setCurrentPage('admin-dashboard');
        break;
      default:
        setCurrentPage('home');
        break;
    }
  }, []);

  useEffect(() => {
    parseLocation();
    window.addEventListener('popstate', parseLocation);
    window.addEventListener('hashchange', parseLocation);
    return () => {
      window.removeEventListener('popstate', parseLocation);
      window.removeEventListener('hashchange', parseLocation);
    };
  }, [parseLocation]);

  const navigateTo = (page: PageRoute, newParams: Record<string, string> = {}) => {
    setCurrentPage(page);
    setParams(newParams);

    // Update hash for bookmarkable clean URLs
    let hash = '';
    if (page === 'home') hash = '';
    else if (page === 'products') {
      hash = newParams.categorySlug ? `products/category/${newParams.categorySlug}` : 'products';
    }
    else if (page === 'product-details') hash = `product/${newParams.slug || newParams.id}`;
    else if (page === 'categories') hash = 'categories';
    else if (page === 'about') hash = 'about';
    else if (page === 'contact') hash = 'contact';
    else if (page === 'cart') hash = 'cart';
    else if (page === 'search') hash = `search?q=${encodeURIComponent(newParams.q || '')}`;
    else if (page === 'privacy') hash = 'privacy';
    else if (page === 'terms') hash = 'terms';
    else if (page === 'admin-login') hash = 'admin/login';
    else if (page === 'admin-dashboard') hash = 'admin/dashboard';
    else if (page === 'admin-products') hash = 'admin/products';
    else if (page === 'admin-product-new') hash = 'admin/products/new';
    else if (page === 'admin-product-edit') hash = `admin/products/edit/${newParams.productId}`;
    else if (page === 'admin-categories') hash = 'admin/categories';
    else if (page === 'admin-enquiries') hash = 'admin/enquiries';
    else if (page === 'admin-customers') hash = 'admin/customers';
    else if (page === 'admin-settings') hash = 'admin/settings';
    else if (page === 'admin-sql-setup') hash = 'admin/sql-setup';

    window.location.hash = hash;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigateTo('home');
    }
  };

  return (
    <NavigationContext.Provider value={{ currentPage, params, navigateTo, goBack }}>
      {children}
    </NavigationContext.Provider>
  );
};

export function useNavigation(): NavigationContextType {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}
