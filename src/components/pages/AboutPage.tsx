import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';
import {
  ChevronRight,
  ShieldCheck,
  Award,
  Factory,
  Cog,
  Wrench,
  Users,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Layers,
  Sparkles
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { navigateTo } = useNavigation();
  const { settings } = useSettings();

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white py-12 sm:py-16 px-4 sm:px-8 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 industrial-dark-grid opacity-40" />

        <div className="relative max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <button onClick={() => navigateTo('home')} className="hover:text-amber-400 transition">
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-amber-400 font-semibold">About Murthi Machine Works</span>
          </div>

          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Factory className="w-3.5 h-3.5" />
              <span>Coimbatore Machine Tools Foundry & Assembly Works</span>
            </div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
              Engineering Reliability. Precision Since 1985.
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Murthi Machine Works is a premier manufacturer and supplier of heavy-duty industrial lathe machines, universal milling machines, CNC machining centers, and custom industrial machinery.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-12 space-y-16">
        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Our Legacy of Craftsmanship</span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Four Decades of Heavy Metal Cutting Innovation
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Founded in the industrial hub of Coimbatore, Tamil Nadu, Murthi Machine Works started with a simple commitment: to build machine tools that deliver micron-level repeatable accuracy while standing up to high continuous duty cycles.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Today, our state-of-the-art facility integrates specialized captive foundry castings, induction bed hardening, multi-axis slide-way grinding, and laser interferometry alignment testing to ensure every lathe, mill, and press that rolls out of our facility surpasses global standards.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                <span className="font-heading font-extrabold text-2xl sm:text-3xl text-amber-500 block">3,500+</span>
                <span className="text-xs font-bold text-slate-800">Installed Machinery Base</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Across auto-clusters, pump manufacturers & toolrooms</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                <span className="font-heading font-extrabold text-2xl sm:text-3xl text-amber-500 block">100%</span>
                <span className="text-xs font-bold text-slate-800">In-house Quality Tested</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Laser interferometer & dynamic run-out checked</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200">
              <img
                src="https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=85"
                alt="Factory Foundry"
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
                  Plant Infrastructure
                </span>
                <p className="text-sm font-semibold text-slate-100">
                  Heavy Cast Iron Casting, Precision Slide-way Grinding & Assembly Line • Coimbatore
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quality Pillars */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-xs space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
              Our Core Engineering Principles
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Every single machine bearing the Murthi emblem is built to rigorous mechanical specifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="font-heading font-bold text-base text-slate-900">Meehanite Grade 25 Castings</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Strict metallurgical control with 2% Nickel-Chrome alloy composition, natural artificial seasoning, and induction flame-hardened bedways for lifetime rigidity.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-heading font-bold text-base text-slate-900">IS:1878 Grade-1 Testing Protocol</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Total radial and axial run-out of main spindles kept within 0.005mm. Beds scraped to 20-25 contact spots per sq. inch for friction-free smooth carriage traverse.
              </p>
            </div>

            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                <Wrench className="w-5 h-5" />
              </div>
              <h4 className="font-heading font-bold text-base text-slate-900">Lifetime Spares & Service Guarantee</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                We maintain an extensive inventory of hardened gears, lead screws, apron assemblies, spindle bearings, and electrical components for immediate dispatch.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Footer in About */}
        <div className="bg-slate-900 rounded-2xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-heading font-bold text-2xl">Plan a Visit to Our Coimbatore Plant</h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Inspect ongoing assembly, witness test cuts under live heavy loads, and consult with our technical designers.
            </p>
          </div>

          <button
            onClick={() => navigateTo('contact')}
            className="px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition shrink-0 flex items-center gap-2"
          >
            <span>Contact & Location Details</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
