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
  MapPin,
  ChevronDown,
  ChevronRight,
  Lock,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Header: React.FC = () => {
  const { currentPage, navigateTo, isMobileMenuOpen, setIsMobileMenuOpen } = useNavigation();
  const { totalItems, setIsCartOpen } = useCart();
  const { settings } = useSettings();
  const { isAuthenticated } = useAuth();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [machineryDropdownOpen, setMachineryDropdownOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigateTo('search', { q: searchInput.trim() });
      setSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    { label: 'HOME', page: 'home' as const },
    { label: 'ABOUT US', page: 'about' as const },
    { label: 'SERVICES', page: 'services' as const },
    { label: 'MACHINERY', page: 'products' as const, hasDropdown: true },
    { label: 'GALLERY', page: 'gallery' as const },
    { label: 'SERVICE AREA', page: 'service-area' as const },
    { label: 'CONTACT US', page: 'contact' as const },
  ];

  const machineryCategories = [
    { label: 'Lathe Machines', slug: 'lathe-machines' },
    { label: 'Drilling Machines', slug: 'drilling-machines' },
    { label: 'Hydraulic Press Machines', slug: 'hydraulic-press-machines' },
    { label: 'Cutting Machines', slug: 'cutting-machines' },
    { label: 'Industrial Workshop Equipment', slug: 'industrial-workshop-equipment' },
    { label: 'Fabrication Machines', slug: 'fabrication-machines' },
  ];

  const handleNavClick = (page: string, e?: React.MouseEvent) => {
    if (page === 'service-area') {
      if (currentPage === 'home') {
        const el = document.getElementById('service-area-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
      navigateTo('home');
      setTimeout(() => {
        const el = document.getElementById('service-area-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
      return;
    }

    if (page === 'services') {
      if (currentPage === 'home') {
        const el = document.getElementById('our-services-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
      navigateTo('home');
      setTimeout(() => {
        const el = document.getElementById('our-services-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
      return;
    }

    if (page === 'gallery') {
      navigateTo('products');
      return;
    }

    navigateTo(page as any);
  };

  const handleGetQuoteClick = () => {
    if (currentPage === 'home') {
      const el = document.getElementById('enquiry-form-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    navigateTo('contact');
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-md">
      {/* 1. TOP YELLOW BAR */}
      <div className="bg-[#F5A623] text-black text-xs font-semibold py-1 px-4 sm:px-8 border-b border-[#E09612]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left: Location */}
          <div className="flex items-center gap-1.5 min-w-0">
            <MapPin className="w-3.5 h-3.5 fill-black text-[#F5A623] shrink-0" />
            <span className="text-[11px] sm:text-xs font-bold text-slate-950 truncate">
              Coimbatore, Tamil Nadu, India
            </span>
          </div>

          {/* Right: Social Icons & Admin */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-5 h-5 rounded-full bg-black text-[#F5A623] flex items-center justify-center text-[10px] font-bold hover:opacity-80 transition"
                title="Facebook"
              >
                f
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-5 h-5 rounded-full bg-black text-[#F5A623] flex items-center justify-center text-[10px] font-bold hover:opacity-80 transition"
                title="Instagram"
              >
                in
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-5 h-5 rounded-full bg-black text-[#F5A623] flex items-center justify-center text-[10px] font-bold hover:opacity-80 transition"
                title="YouTube"
              >
                ▶
              </a>
            </div>

            <span className="text-black/30">|</span>

            <button
              onClick={() => navigateTo(isAuthenticated ? 'admin-dashboard' : 'admin-login')}
              className="flex items-center gap-1 text-[11px] font-bold text-black hover:text-slate-900 transition"
              title="Admin Access"
            >
              <Lock className="w-3 h-3 text-black" />
              <span className="hidden xs:inline">{isAuthenticated ? 'Admin' : 'Login'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN LOGO & CONTACT HEADER */}
      <div className="bg-white max-w-7xl mx-auto px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <button
          onClick={() => navigateTo('home')}
          className="flex items-center gap-3 text-left group focus:outline-none shrink-0"
          id="btn-header-brand-logo"
        >
          {/* Yellow Cog Emblem with stylized M */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#F5A623] flex items-center justify-center shadow-md shrink-0 border-2 border-amber-600/30">
            <Cog className="w-8 h-8 sm:w-9 sm:h-9 text-slate-950 animate-[spin_20s_linear_infinite]" />
            <span className="absolute font-heading font-black text-xs sm:text-sm text-slate-950 tracking-tighter">
              M
            </span>
          </div>

          <div>
            <h1 className="font-heading font-black text-lg sm:text-2xl tracking-tight text-slate-950 leading-none group-hover:text-amber-600 transition-colors">
              MURTHI MACHIN WORKS
            </h1>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-700 mt-1 tracking-tight">
              All New and Old Machinery Sales & Service
            </p>
          </div>
        </button>

        {/* Center-Right Contact Info Widgets (Desktop) */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          {/* Phone Numbers Stack */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F5A623] flex items-center justify-center text-slate-950 shrink-0 shadow-xs">
              <Phone className="w-5 h-5 fill-current" />
            </div>
            <div className="text-xs font-bold text-slate-900 leading-tight">
              <a href="tel:9842266521" className="block hover:text-[#C81E1E] transition">
                98422 66521
              </a>
              <a href="tel:8778384248" className="block hover:text-[#C81E1E] transition">
                87783 84248
              </a>
              <a href="tel:7402114228" className="block hover:text-[#C81E1E] transition">
                74021 14228
              </a>
            </div>
          </div>

          {/* Email Widget */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F5A623] flex items-center justify-center text-slate-950 shrink-0 shadow-xs">
              <Mail className="w-5 h-5 fill-current" />
            </div>
            <div className="text-xs leading-tight">
              <a
                href="mailto:murthimachineworks@gmail.com"
                className="block font-bold text-slate-900 hover:text-[#C81E1E] transition truncate max-w-[200px]"
              >
                murthimachineworks@gmail.com
              </a>
              <span className="text-[11px] text-slate-500 font-medium">Mail Us Today</span>
            </div>
          </div>
        </div>

        {/* Right CTA Button (Red) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleGetQuoteClick}
            className="px-5 sm:px-6 py-2.5 sm:py-3 bg-[#C81E1E] hover:bg-[#B31919] active:bg-[#991414] text-white font-heading font-extrabold text-xs sm:text-sm tracking-wider uppercase rounded shadow-md hover:shadow-lg transition-all"
            id="btn-header-get-quote"
          >
            GET A QUOTE
          </button>

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-800 hover:bg-slate-100 rounded-md transition"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 3. SOLID BLACK NAVBAR */}
      <div className="bg-[#0A0A0A] text-white border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center">
            {navItems.map(item => {
              const isHomeActive = item.page === 'home' && currentPage === 'home';
              const isOtherActive =
                (item.page === 'about' && currentPage === 'about') ||
                (item.page === 'products' && (currentPage === 'products' || currentPage === 'product-details' || currentPage === 'categories')) ||
                (item.page === 'contact' && currentPage === 'contact');

              const isYellowActive = isHomeActive;

              return (
                <div
                  key={item.label}
                  className="relative group"
                  onMouseEnter={() => item.hasDropdown && setMachineryDropdownOpen(true)}
                  onMouseLeave={() => item.hasDropdown && setMachineryDropdownOpen(false)}
                >
                  <button
                    onClick={e => handleNavClick(item.page, e)}
                    className={`px-4 py-3 text-xs font-heading font-extrabold tracking-wider transition-colors flex items-center gap-1 ${
                      isYellowActive
                        ? 'bg-[#F5A623] text-slate-950'
                        : isOtherActive
                        ? 'text-[#F5A623] bg-white/5'
                        : 'text-white hover:text-[#F5A623] hover:bg-white/5'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.hasDropdown && <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {/* Machinery Dropdown */}
                  {item.hasDropdown && (
                    <AnimatePresence>
                      {machineryDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          className="absolute left-0 top-full w-64 bg-slate-900 text-white rounded-b-lg shadow-2xl border border-slate-800 py-2 z-50"
                        >
                          <button
                            onClick={() => {
                              navigateTo('products');
                              setMachineryDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-xs font-bold text-[#F5A623] hover:bg-slate-800 flex items-center justify-between border-b border-slate-800"
                          >
                            <span>All Machinery Catalog</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                          {machineryCategories.map(cat => (
                            <button
                              key={cat.slug}
                              onClick={() => {
                                navigateTo('products', { categorySlug: cat.slug });
                                setMachineryDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-between"
                            >
                              <span>{cat.label}</span>
                              <ChevronRight className="w-3 h-3 text-slate-600" />
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Quick Right Utilities (Search & Enquiry RFQ Cart) */}
          <div className="flex items-center gap-2 py-1.5 ml-auto lg:ml-0">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-slate-300 hover:text-[#F5A623] hover:bg-white/10 rounded transition"
              title="Search Machinery"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* RFQ Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-slate-300 hover:text-[#F5A623] hover:bg-white/10 rounded transition flex items-center gap-1.5"
              title="Enquiry Cart"
              id="btn-header-cart"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-bold">Enquiry Cart</span>
              {totalItems > 0 && (
                <span className="bg-[#C81E1E] text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Search Input Bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-800 bg-[#0F1115] px-4 sm:px-8 py-3 text-white overflow-hidden shadow-2xl"
          >
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                    placeholder="Search machines (Lathe, Drilling, Hydraulic Press, Cutting, Power Press)..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#F5A623] placeholder:text-slate-500"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C81E1E] hover:bg-[#B31919] text-white text-xs font-bold uppercase rounded shadow transition"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="px-3 py-2 text-slate-400 hover:text-white rounded"
                >
                  <X className="w-4 h-4" />
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
            className="lg:hidden bg-[#0A0A0A] text-white border-t border-slate-800 px-4 py-4 space-y-2 shadow-2xl"
          >
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-3">
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search machinery..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded text-xs text-white"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-[#C81E1E] text-white text-xs font-bold rounded"
              >
                Go
              </button>
            </form>

            {navItems.map(item => (
              <button
                key={item.label}
                onClick={() => {
                  handleNavClick(item.page);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-heading font-extrabold tracking-wider text-left ${
                  item.page === 'home' && currentPage === 'home'
                    ? 'bg-[#F5A623] text-black'
                    : 'text-slate-200 hover:bg-slate-900'
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight className="w-4 h-4 opacity-60" />
              </button>
            ))}

            {/* Direct Call & WhatsApp in Mobile Menu */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <a
                href="tel:9842266521"
                className="w-full py-2.5 px-3 bg-[#F5A623] text-slate-950 font-bold text-xs rounded flex items-center justify-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 fill-current" />
                <span>Call: 98422 66521</span>
              </a>

              <button
                onClick={() => {
                  handleGetQuoteClick();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 bg-[#C81E1E] text-white font-bold text-xs rounded flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <span>GET A QUOTE</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

