import React, { useState } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import {
  Phone,
  Mail,
  Search,
  ShoppingCart,
  MessageSquare,
  Menu,
  X,
  Cog,
  ShieldCheck,
  MapPin,
  ChevronRight,
  ExternalLink,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Header: React.FC = () => {
  const { currentPage, navigateTo } = useNavigation();
  const { totalItems, setIsCartOpen } = useCart();
  const { settings } = useSettings();
  const { isAuthenticated } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigateTo('search', { q: searchInput.trim() });
      setSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  const cleanWhatsAppNumber = (settings.whatsapp || '+91 95852 62522').replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(
    `Hello ${settings.business_name}, I am contacting you from your website regarding machinery enquiries.`
  )}`;

  const navLinks = [
    { label: 'Home', page: 'home' as const },
    { label: 'Products', page: 'products' as const },
    { label: 'Categories', page: 'categories' as const },
    { label: 'About Us', page: 'about' as const },
    { label: 'Contact', page: 'contact' as const },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Bar / Industrial Info Strip */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-6 overflow-x-auto py-0.5 scrollbar-none">
            <span className="flex items-center gap-1.5 whitespace-nowrap text-slate-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              ISO 9001:2015 Certified Machinery Manufacturer
            </span>
            <a
              href={`tel:${settings.phone}`}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white transition whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>{settings.phone}</span>
            </a>
            <a
              href={`mailto:${settings.email}`}
              className="hidden md:flex items-center gap-1.5 text-slate-300 hover:text-white transition whitespace-nowrap"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>{settings.email}</span>
            </a>
          </div>

          <div className="flex items-center gap-4 ml-auto text-xs">
            <span className="hidden sm:inline-block text-slate-400">
              Coimbatore Works, Tamil Nadu
            </span>
            <button
              onClick={() => navigateTo(isAuthenticated ? 'admin-dashboard' : 'admin-login')}
              className="flex items-center gap-1 text-slate-300 hover:text-amber-400 transition font-medium px-2 py-0.5 rounded hover:bg-slate-800"
              title="Admin Portal"
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span>{isAuthenticated ? 'Admin Portal' : 'Admin Login'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <button
          onClick={() => navigateTo('home')}
          className="flex items-center gap-3 text-left group focus:outline-none"
          id="btn-header-logo"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 shadow-md group-hover:scale-105 transition-transform duration-200">
            <Cog className="w-6 h-6 animate-[spin_12s_linear_infinite]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors">
                MURTHI
              </span>
              <span className="font-heading font-bold text-lg sm:text-xl tracking-tight text-slate-700">
                MACHINE WORKS
              </span>
            </div>
            <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">
              Precision Engineering & Machine Tools
            </p>
          </div>
        </button>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map(link => {
            const isActive =
              currentPage === link.page ||
              (link.page === 'products' && (currentPage === 'product-details' || currentPage === 'search'));
            return (
              <button
                key={link.page}
                onClick={() => navigateTo(link.page)}
                className={`px-3.5 py-2 rounded-md text-sm font-semibold transition-colors duration-150 ${
                  isActive
                    ? 'text-amber-600 bg-amber-50/80 font-bold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search Button */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 sm:p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            aria-label="Search machinery"
            title="Search products"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Enquiry Cart Drawer Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 sm:p-2.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition flex items-center gap-1.5"
            aria-label="Enquiry list"
            title="View RFQ / Enquiry Cart"
            id="btn-header-cart"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden md:inline text-xs font-semibold text-slate-700">
              Enquiry List
            </span>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                {totalItems}
              </span>
            )}
          </button>

          {/* WhatsApp CTA Button */}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2.5 rounded-lg shadow-xs hover:shadow transition-all"
            id="btn-header-whatsapp"
          >
            <MessageSquare className="w-4 h-4 fill-current" />
            <span>WhatsApp Enquiry</span>
          </a>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Expandable Search Dropdown */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-200 bg-slate-50 px-4 sm:px-8 py-3 overflow-hidden shadow-inner"
          >
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    placeholder="Search by machine name, model, SKU, or category (e.g. Lathe, VMC, Radial Drill)..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900 placeholder:text-slate-400"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg shadow transition"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="px-3 py-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-lg"
          >
            {/* Search Input for Mobile */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Search machine tools..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg"
              >
                Go
              </button>
            </form>

            <div className="flex flex-col space-y-1">
              {navLinks.map(link => {
                const isActive = currentPage === link.page;
                return (
                  <button
                    key={link.page}
                    onClick={() => {
                      navigateTo(link.page);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-left ${
                      isActive ? 'bg-amber-50 text-amber-700 font-bold' : 'text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-2">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 shadow"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>Instant WhatsApp Enquiry</span>
              </a>

              <button
                onClick={() => {
                  navigateTo(isAuthenticated ? 'admin-dashboard' : 'admin-login');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition"
              >
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>{isAuthenticated ? 'Go to Admin Dashboard' : 'Admin Portal Login'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
