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
  | 'admin-bills'
  | 'admin-quotations'
  | 'admin-products'
  | 'admin-product-new'
  | 'admin-product-edit'
  | 'admin-categories'
  | 'admin-enquiries'
  | 'admin-reviews'
  | 'admin-testimonials'
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
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

function getCleanRouteString(): string {
  const pathname = window.location.pathname.replace(/^\/+|\/+$/g, '');
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (!pathname && hash) {
    return hash;
  }
  return pathname;
}

function resolveRoute(routeStr: string, searchStr: string): { page: PageRoute; params: Record<string, string> } {
  const searchParams = new URLSearchParams(searchStr);

  if (routeStr.startsWith('admin/')) {
    const sub = routeStr.replace('admin/', '');
    if (sub === 'login') return { page: 'admin-login', params: {} };
    if (sub === 'bills' || sub === 'billing' || sub === 'bill') return { page: 'admin-bills', params: {} };
    if (sub === 'quotations' || sub === 'quotation') return { page: 'admin-quotations', params: {} };
    if (sub === 'products/new') return { page: 'admin-product-new', params: {} };
    if (sub.startsWith('products/edit/')) {
      const id = sub.replace('products/edit/', '');
      return { page: 'admin-product-edit', params: { productId: id } };
    }
    if (sub === 'products') return { page: 'admin-products', params: {} };
    if (sub === 'categories') return { page: 'admin-categories', params: {} };
    if (sub === 'enquiries') return { page: 'admin-enquiries', params: {} };
    if (sub === 'reviews' || sub === 'testimonials') return { page: 'admin-reviews', params: {} };
    if (sub === 'customers') return { page: 'admin-customers', params: {} };
    if (sub === 'audit-logs' || sub === 'audit') return { page: 'admin-audit-logs', params: {} };
    if (sub === 'team' || sub === 'employees' || sub === 'users') return { page: 'admin-team', params: {} };
    if (sub === 'settings') return { page: 'admin-settings', params: {} };
    if (sub === 'sql-setup' || sub === 'database' || sub === 'supabase') return { page: 'admin-sql-setup', params: {} };
    return { page: 'admin-dashboard', params: {} };
  }

  if (routeStr.startsWith('product/')) {
    const slug = routeStr.replace('product/', '');
    return { page: 'product-details', params: { slug } };
  }

  if (routeStr.startsWith('products/category/')) {
    const catSlug = routeStr.replace('products/category/', '');
    return { page: 'products', params: { categorySlug: catSlug } };
  }

  if (routeStr.startsWith('search')) {
    const queryPart = routeStr.includes('?') ? routeStr.split('?')[1] : '';
    const mergedSearch = new URLSearchParams(queryPart || searchStr);
    const q = searchParams.get('q') || mergedSearch.get('q') || '';
    return { page: 'search', params: { q } };
  }

  switch (routeStr) {
    case 'products':
      return { page: 'products', params: {} };
    case 'categories':
      return { page: 'categories', params: {} };
    case 'about':
      return { page: 'about', params: {} };
    case 'contact':
      return { page: 'contact', params: {} };
    case 'cart':
    case 'enquiry':
      return { page: 'cart', params: {} };
    case 'privacy':
      return { page: 'privacy', params: {} };
    case 'terms':
      return { page: 'terms', params: {} };
    case 'admin':
    case 'admin/login':
      return { page: 'admin-login', params: {} };
    case 'admin/dashboard':
      return { page: 'admin-dashboard', params: {} };
    case 'admin/bills':
    case 'admin/bill':
    case 'admin/billing':
      return { page: 'admin-bills', params: {} };
    case 'admin/quotations':
    case 'admin/quotation':
      return { page: 'admin-quotations', params: {} };
    case 'admin/reviews':
    case 'admin/testimonials':
      return { page: 'admin-reviews', params: {} };
    case 'admin/sql-setup':
    case 'admin/database':
    case 'admin/supabase':
      return { page: 'admin-sql-setup', params: {} };
    case 'admin/audit-logs':
    case 'admin/audit':
      return { page: 'admin-audit-logs', params: {} };
    case 'admin/team':
    case 'admin/employees':
    case 'admin/users':
      return { page: 'admin-team', params: {} };
    default:
      return { page: 'home', params: {} };
  }
}

function buildPath(page: PageRoute, newParams: Record<string, string> = {}): string {
  if (page === 'home') return '/';
  if (page === 'products') {
    return newParams.categorySlug ? `/products/category/${newParams.categorySlug}` : '/products';
  }
  if (page === 'product-details') return `/product/${newParams.slug || newParams.id}`;
  if (page === 'categories') return '/categories';
  if (page === 'about') return '/about';
  if (page === 'contact') return '/contact';
  if (page === 'cart') return '/cart';
  if (page === 'search') return `/search?q=${encodeURIComponent(newParams.q || '')}`;
  if (page === 'privacy') return '/privacy';
  if (page === 'terms') return '/terms';
  if (page === 'admin-login') return '/admin/login';
  if (page === 'admin-dashboard') return '/admin/dashboard';
  if (page === 'admin-bills') return '/admin/bills';
  if (page === 'admin-quotations') return '/admin/quotations';
  if (page === 'admin-products') return '/admin/products';
  if (page === 'admin-product-new') return '/admin/products/new';
  if (page === 'admin-product-edit') return `/admin/products/edit/${newParams.productId}`;
  if (page === 'admin-categories') return '/admin/categories';
  if (page === 'admin-enquiries') return '/admin/enquiries';
  if (page === 'admin-reviews' || page === 'admin-testimonials') return '/admin/reviews';
  if (page === 'admin-customers') return '/admin/customers';
  if (page === 'admin-audit-logs') return '/admin/audit-logs';
  if (page === 'admin-team') return '/admin/team';
  if (page === 'admin-settings') return '/admin/settings';
  if (page === 'admin-sql-setup' || page === 'admin-database') return '/admin/sql-setup';
  if (typeof page === 'string' && (page as string).startsWith('admin-')) {
    return `/admin/${(page as string).replace('admin-', '')}`;
  }
  return '/';
}

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialRoute = resolveRoute(getCleanRouteString(), window.location.search);
  const [currentPage, setCurrentPage] = useState<PageRoute>(initialRoute.page);
  const [params, setParams] = useState<Record<string, string>>(initialRoute.params);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);

  // Parse current URL path (and migrate any legacy # hash URLs to clean paths)
  const parseLocation = useCallback(() => {
    const rawHash = window.location.hash.replace(/^#\/?/, '');
    const cleanRoute = getCleanRouteString();
    const resolved = resolveRoute(cleanRoute, window.location.search);

    setCurrentPage(resolved.page);
    setParams(resolved.params);

    if (rawHash) {
      const targetCleanUrl = buildPath(resolved.page, resolved.params);
      window.history.replaceState({}, '', targetCleanUrl);
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
    setIsMobileMenuOpen(false);

    const targetPath = buildPath(page, newParams);
    if (window.location.pathname + window.location.search !== targetPath || window.location.hash) {
      window.history.pushState({}, '', targetPath);
    }
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
    <NavigationContext.Provider
      value={{
        currentPage,
        params,
        navigateTo,
        goBack,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        toggleMobileMenu,
      }}
    >
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
