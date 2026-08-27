import React from 'react';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { SettingsProvider } from './context/SettingsContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public Layout Components
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { WhatsAppFloatingButton } from './components/common/WhatsAppFloatingButton';
import { EnquiryDrawer } from './components/cart/EnquiryDrawer';

// Public Pages
import { HomePage } from './components/pages/HomePage';
import { ProductsPage } from './components/pages/ProductsPage';
import { ProductDetailsPage } from './components/pages/ProductDetailsPage';
import { CategoriesPage } from './components/pages/CategoriesPage';
import { AboutPage } from './components/pages/AboutPage';
import { ContactPage } from './components/pages/ContactPage';
import { SearchResultsPage } from './components/pages/SearchResultsPage';
import { CartPage } from './components/pages/CartPage';
import { PrivacyPage } from './components/pages/PrivacyPage';
import { TermsPage } from './components/pages/TermsPage';

// Admin Components
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminProducts } from './components/admin/AdminProducts';
import { AdminCategories } from './components/admin/AdminCategories';
import { AdminEnquiries } from './components/admin/AdminEnquiries';
import { AdminSettings } from './components/admin/AdminSettings';
import { AdminDatabaseSetup } from './components/admin/AdminDatabaseSetup';
import { AdminAuditLogs } from './components/admin/AdminAuditLogs';
import { AdminTeam } from './components/admin/AdminTeam';

const AppContent: React.FC = () => {
  const { currentPage, navigateTo } = useNavigation();
  const { isAuthenticated } = useAuth();

  // Is current view inside the Admin Portal?
  const isAdminRoute = currentPage.startsWith('admin-');

  // ADMIN ROUTING
  if (isAdminRoute) {
    if (currentPage === 'admin-login') {
      return (
        <>
          <AdminLogin />
          <ToastContainer />
        </>
      );
    }

    // Require admin authentication for admin portal
    if (!isAuthenticated) {
      return (
        <>
          <AdminLogin />
          <ToastContainer />
        </>
      );
    }

    const activeAdminSection = currentPage.replace('admin-', '') || 'dashboard';

    const handleSelectAdminSection = (section: string) => {
      navigateTo(`admin-${section}` as any);
    };

    let AdminView = <AdminDashboard onNavigateTab={handleSelectAdminSection} />;
    if (activeAdminSection === 'products' || activeAdminSection === 'product-new' || activeAdminSection === 'product-edit') {
      AdminView = <AdminProducts />;
    } else if (activeAdminSection === 'categories') {
      AdminView = <AdminCategories />;
    } else if (activeAdminSection === 'enquiries') {
      AdminView = <AdminEnquiries />;
    } else if (activeAdminSection === 'audit-logs' || activeAdminSection === 'audit') {
      AdminView = <AdminAuditLogs />;
    } else if (activeAdminSection === 'team' || activeAdminSection === 'employees' || activeAdminSection === 'users') {
      AdminView = <AdminTeam />;
    } else if (activeAdminSection === 'settings') {
      AdminView = <AdminSettings />;
    } else if (activeAdminSection === 'database' || activeAdminSection === 'sql-setup') {
      AdminView = <AdminDatabaseSetup />;
    }

    return (
      <AdminLayout
        activeSection={activeAdminSection}
        onSelectSection={handleSelectAdminSection}
      >
        {AdminView}
        <ToastContainer />
      </AdminLayout>
    );
  }

  // PUBLIC STOREFRONT ROUTING
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-amber-500 selection:text-slate-950 font-sans antialiased">
      <Header />

      <main className="flex-grow">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'products' && <ProductsPage />}
        {currentPage === 'search' && <SearchResultsPage />}
        {currentPage === 'product-details' && <ProductDetailsPage />}
        {currentPage === 'categories' && <CategoriesPage />}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'contact' && <ContactPage />}
        {currentPage === 'cart' && <CartPage />}
        {currentPage === 'terms' && <TermsPage />}
        {currentPage === 'privacy' && <PrivacyPage />}
      </main>

      <Footer />
      <EnquiryDrawer />
      <WhatsAppFloatingButton />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <CartProvider>
          <NavigationProvider>
            <AppContent />
          </NavigationProvider>
        </CartProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
