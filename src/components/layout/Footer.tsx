import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import {
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Cog,
  ArrowRight,
  ExternalLink,
  Lock,
  Clock,
  FileText
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo } = useNavigation();
  const { settings } = useSettings();
  const { isAuthenticated } = useAuth();

  const cleanWhatsAppNumber = (settings.whatsapp || '+91 95852 62522').replace(/[^0-9]/g, '');

  const quickLinks = [
    { label: 'Home', page: 'home' as const },
    { label: 'All Machinery & Products', page: 'products' as const },
    { label: 'Machinery Categories', page: 'categories' as const },
    { label: 'About Murthi Machine Works', page: 'about' as const },
    { label: 'Contact & Factory Location', page: 'contact' as const },
    { label: 'Enquiry / Quote Cart', page: 'cart' as const },
    { label: 'Privacy Policy', page: 'privacy' as const },
    { label: 'Terms & Conditions', page: 'terms' as const },
  ];

  const featuredCategories = [
    { label: 'Heavy Duty Lathes', slug: 'lathe-machines' },
    { label: 'Universal Milling Machines', slug: 'milling-machines' },
    { label: 'CNC Vertical Machining Centers', slug: 'cnc-machinery' },
    { label: 'Radial Arm Drills', slug: 'drilling-machines' },
    { label: 'Hydraulic Surface Grinders', slug: 'grinding-machines' },
    { label: 'Metal Cutting Bandsaws', slug: 'cutting-and-sawing' },
    { label: 'Industrial Hydraulic Presses', slug: 'hydraulic-presses' },
  ];

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      {/* Industrial Certification & Value Proposition Banner */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-white text-sm">ISO 9001:2015 Certified</h4>
              <p className="text-xs text-slate-400">Strict zero-defect quality control protocols</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Cog className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-white text-sm">40+ Years of Craft</h4>
              <p className="text-xs text-slate-400">Pioneering Coimbatore machine tool maker since 1985</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-white text-sm">Pan-India Support</h4>
              <p className="text-xs text-slate-400">On-site erection, commissioning & spares</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-white text-sm">Direct WhatsApp Quotes</h4>
              <p className="text-xs text-slate-400">Rapid reply from our engineering specialists</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 lg:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Company Info */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400 shadow">
              <Cog className="w-6 h-6 animate-[spin_16s_linear_infinite]" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-lg text-white tracking-tight">
                MURTHI MACHINE WORKS
              </span>
              <p className="text-[11px] text-amber-400 font-semibold tracking-wider uppercase">
                Est. {settings.established_year || '1985'} • Coimbatore
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            {settings.about_content
              ? settings.about_content.slice(0, 180) + '...'
              : 'Precision engineering and manufacturing of heavy duty machine tools, all-geared lathes, milling machines, radial drills, and CNC machining centers.'}
          </p>

          <div className="pt-2 text-xs text-slate-400 space-y-1.5 border-t border-slate-800/80">
            {settings.gstin && (
              <p className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">GSTIN:</span>
                <span className="font-mono text-slate-300 font-semibold">{settings.gstin}</span>
              </p>
            )}
            <p className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Manufacturing Units:</span>
              <span className="text-slate-300">Coimbatore Industrial Belt (SIDCO)</span>
            </p>
          </div>

          {/* Direct WhatsApp Callout */}
          <div className="pt-3">
            <a
              href={`https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(
                'Hello Murthi Machine Works, I am reaching out for technical consultation and machinery quotation.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow transition"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span>Contact Senior Sales Engineer</span>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="lg:col-span-2 space-y-3">
          <h4 className="font-heading font-bold text-white text-sm uppercase tracking-wider text-amber-400">
            Quick Links
          </h4>
          <ul className="space-y-2 text-xs">
            {quickLinks.map((link, idx) => (
              <li key={idx}>
                <button
                  onClick={() => navigateTo(link.page)}
                  className="text-slate-400 hover:text-white transition flex items-center gap-1.5 group"
                >
                  <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition" />
                  <span>{link.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Popular Categories */}
        <div className="lg:col-span-3 space-y-3">
          <h4 className="font-heading font-bold text-white text-sm uppercase tracking-wider text-amber-400">
            Machinery Categories
          </h4>
          <ul className="space-y-2 text-xs">
            {featuredCategories.map((cat, idx) => (
              <li key={idx}>
                <button
                  onClick={() => navigateTo('products', { categorySlug: cat.slug })}
                  className="text-slate-400 hover:text-white transition flex items-center gap-1.5 group text-left"
                >
                  <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition shrink-0" />
                  <span>{cat.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Plant & Contact Info */}
        <div className="lg:col-span-3 space-y-3">
          <h4 className="font-heading font-bold text-white text-sm uppercase tracking-wider text-amber-400">
            Works & Head Office
          </h4>
          
          <div className="space-y-3 text-xs text-slate-400">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{settings.address}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-amber-400 shrink-0" />
              <a href={`tel:${settings.phone}`} className="hover:text-white transition font-medium">
                {settings.phone}
              </a>
            </div>

            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <a href={`mailto:${settings.email}`} className="hover:text-white transition">
                {settings.email}
              </a>
            </div>

            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Mon – Sat: 8:30 AM – 7:00 PM IST</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Admin Strip */}
      <div className="border-t border-slate-900 bg-slate-950 py-4 px-4 sm:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} {settings.business_name}. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateTo('privacy')}
              className="hover:text-slate-300 transition"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={() => navigateTo('terms')}
              className="hover:text-slate-300 transition"
            >
              Terms & Conditions
            </button>
            <span>•</span>
            <button
              onClick={() => navigateTo(isAuthenticated ? 'admin-dashboard' : 'admin-login')}
              className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition"
            >
              <Lock className="w-3 h-3 text-amber-500" />
              <span>Admin Access</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
