import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_BRANCHES } from '../../data/initialData';
import {
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Cog,
  ArrowRight,
  Lock,
  Clock,
  Wrench,
  ExternalLink
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo } = useNavigation();
  const { settings } = useSettings();
  const { isAuthenticated } = useAuth();
  const branches = settings.branches && settings.branches.length > 0 ? settings.branches : INITIAL_BRANCHES;

  const cleanWhatsAppNumber = (settings.whatsapp || '+91 95852 62522').replace(/[^0-9]/g, '');

  const quickLinks = [
    { label: 'Home', page: 'home' as const },
    { label: 'All Machinery & Products', page: 'products' as const },
    { label: 'Machinery Categories', page: 'categories' as const },
    { label: 'Our Services', page: 'home' as const, section: 'our-services-section' },
    { label: 'Service Coverage Area', page: 'home' as const, section: 'service-area-section' },
    { label: 'About Murthi Machin Works', page: 'about' as const },
    { label: 'Contact & Location', page: 'contact' as const },
    { label: 'Enquiry / Quote RFQ', page: 'cart' as const },
  ];

  const featuredCategories = [
    { label: 'Lathe Machines', slug: 'lathe-machines' },
    { label: 'Drilling Machines', slug: 'drilling-machines' },
    { label: 'Hydraulic Press Machines', slug: 'hydraulic-press-machines' },
    { label: 'Cutting Machines', slug: 'cutting-machines' },
    { label: 'Industrial Workshop Equipment', slug: 'workshop-equipment' },
    { label: 'Fabrication Machines', slug: 'fabrication-machines' },
  ];

  const handleLinkClick = (page: any, section?: string) => {
    navigateTo(page);
    if (section) {
      setTimeout(() => {
        const el = document.getElementById(section);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <footer className="bg-[#0A0A0A] text-slate-300 border-t-4 border-[#F5A623]">
      {/* Industrial Certification & Value Proposition Banner */}
      <div className="border-b border-slate-800/80 bg-slate-950 py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-lg bg-[#F5A623]/10 border border-[#F5A623]/30 flex items-center justify-center text-[#F5A623] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-black text-white text-sm">Quality Assured</h4>
              <p className="text-xs text-slate-400">Inspected, tested & certified machinery</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-lg bg-[#F5A623]/10 border border-[#F5A623]/30 flex items-center justify-center text-[#F5A623] shrink-0">
              <Cog className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-black text-white text-sm">15+ Years Experience</h4>
              <p className="text-xs text-slate-400">Trusted Coimbatore machine tool experts</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-lg bg-[#F5A623]/10 border border-[#F5A623]/30 flex items-center justify-center text-[#F5A623] shrink-0">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-black text-white text-sm">Pan-India Support</h4>
              <p className="text-xs text-slate-400">On-site erection, repairs & maintenance</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-lg bg-[#C81E1E]/20 border border-[#C81E1E]/40 flex items-center justify-center text-[#C81E1E] shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-heading font-black text-white text-sm">Instant Quotes</h4>
              <p className="text-xs text-slate-400">Call: 98422 66521 / WhatsApp support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 lg:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Company Info */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-[#F5A623] flex items-center justify-center text-slate-950 shadow-md shrink-0">
              <Cog className="w-6 h-6" />
            </div>
            <div>
              <span className="font-heading font-black text-lg text-white tracking-wider block">
                MURTHI MACHIN WORKS
              </span>
              <p className="text-[10px] text-[#F5A623] font-black tracking-widest uppercase">
                MACHINERY SALES & SERVICE • COIMBATORE
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Murthi Machin Works is one of Coimbatore's trusted machinery sales and service providers, offering both new and used industrial machinery with complete maintenance and support.
          </p>

          {/* Quick Action Button */}
          <div className="pt-2">
            <button
              onClick={() => {
                const el = document.getElementById('enquiry-form-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else navigateTo('contact');
              }}
              className="px-5 py-2.5 rounded bg-[#C81E1E] hover:bg-[#B31919] text-white font-heading font-black text-xs uppercase tracking-wider shadow transition"
            >
              Get a Quote Today
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="lg:col-span-2 space-y-3">
          <h4 className="font-heading font-black text-white text-xs sm:text-sm uppercase tracking-wider text-[#F5A623]">
            Quick Links
          </h4>
          <ul className="space-y-2 text-xs">
            {quickLinks.map((link, idx) => (
              <li key={idx}>
                <button
                  onClick={() => handleLinkClick(link.page, link.section)}
                  className="text-slate-400 hover:text-white transition flex items-center gap-1.5 group"
                >
                  <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-[#F5A623] group-hover:translate-x-0.5 transition shrink-0" />
                  <span>{link.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Popular Categories */}
        <div className="lg:col-span-3 space-y-3">
          <h4 className="font-heading font-black text-white text-xs sm:text-sm uppercase tracking-wider text-[#F5A623]">
            Machinery Categories
          </h4>
          <ul className="space-y-2 text-xs">
            {featuredCategories.map((cat, idx) => (
              <li key={idx}>
                <button
                  onClick={() => navigateTo('products', { categorySlug: cat.slug })}
                  className="text-slate-400 hover:text-white transition flex items-center gap-1.5 group text-left"
                >
                  <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-[#F5A623] group-hover:translate-x-0.5 transition shrink-0" />
                  <span>{cat.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Plant & Contact Info */}
        <div className="lg:col-span-3 space-y-3">
          <h4 className="font-heading font-black text-white text-xs sm:text-sm uppercase tracking-wider text-[#F5A623]">
            Works & Locations
          </h4>
          
          <div className="space-y-2.5 text-xs text-slate-400">
            {branches.map((branch, idx) => (
              <a
                key={branch.id || idx}
                href={branch.google_maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-[#F5A623] transition group"
                title={`Navigate to ${branch.name} via Google Maps`}
              >
                <MapPin className="w-3.5 h-3.5 text-[#F5A623] shrink-0 mt-0.5" />
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-white group-hover:text-[#F5A623] transition text-[11px] truncate">
                      {branch.name}
                    </span>
                    <ExternalLink className="w-2.5 h-2.5 text-slate-500 group-hover:text-[#F5A623] shrink-0" />
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                    {branch.address}
                  </p>
                </div>
              </a>
            ))}

            <div className="flex items-start gap-2.5 pt-1">
              <Phone className="w-4 h-4 text-[#F5A623] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <a href="tel:9842266521" className="block text-white font-bold hover:text-[#F5A623] transition">
                  98422 66521
                </a>
                <a href="tel:8778384248" className="block text-white font-bold hover:text-[#F5A623] transition">
                  87783 84248
                </a>
                <a href="tel:7402114228" className="block text-white font-bold hover:text-[#F5A623] transition">
                  74021 14228
                </a>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#F5A623] shrink-0" />
              <a href={`mailto:${settings.email || 'murthimachinworks@gmail.com'}`} className="hover:text-white transition">
                {settings.email || 'murthimachinworks@gmail.com'}
              </a>
            </div>

            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#F5A623] shrink-0" />
              <span>{settings.working_hours ? `${settings.working_hours} IST` : 'Mon – Sat: 10:00 AM – 6:00 PM IST'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Admin Strip */}
      <div className="border-t border-slate-900 bg-black py-4 px-4 sm:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Murthi Machin Works. All rights reserved.</p>

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
              className="flex items-center gap-1 text-slate-400 hover:text-[#F5A623] transition"
            >
              <Lock className="w-3 h-3 text-[#F5A623]" />
              <span>Admin Access</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

