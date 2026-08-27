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
  | 'admin-audit-logs'
  | 'admin-team'
  | 'admin-settings'
  | 'admin-sql-setup'
  | 'admin-database';

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
      else if (sub === 'audit-logs' || sub === 'audit') setCurrentPage('admin-audit-logs');
      else if (sub === 'team' || sub === 'employees' || sub === 'users') setCurrentPage('admin-team');
      else if (sub === 'settings') setCurrentPage('admin-settings');
      else if (sub === 'sql-setup' || sub === 'database' || sub === 'supabase') setCurrentPage('admin-sql-setup');
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
      case 'admin/sql-setup':
      case 'admin/database':
      case 'admin/supabase':
        setCurrentPage('admin-sql-setup');
        break;
      case 'admin/audit-logs':
      case 'admin/audit':
        setCurrentPage('admin-audit-logs');
        break;
      case 'admin/team':
      case 'admin/employees':
      case 'admin/users':
        setCurrentPage('admin-team');
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
    else if (page === 'admin-audit-logs') hash = 'admin/audit-logs';
    else if (page === 'admin-team') hash = 'admin/team';
    else if (page === 'admin-settings') hash = 'admin/settings';
    else if (page === 'admin-sql-setup' || page === 'admin-database') hash = 'admin/sql-setup';
    else if (typeof page === 'string' && (page as string).startsWith('admin-')) {
      hash = `admin/${(page as string).replace('admin-', '')}`;
    }

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
