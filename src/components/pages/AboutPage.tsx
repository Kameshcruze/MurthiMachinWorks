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
              <span>35 Years of Industrial Excellence</span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Murthi Machine Works – 35 Years of Machinery Experience
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed text-justify">
              <p>
                Murthi Machine Works is a Coimbatore-based industrial machinery business with 35 years of experience in the machinery industry. We specialise in the buying and selling of new and used machinery, along with machine repair, breakdown service, installation, and commissioning.
              </p>
              <p>
                Founded under the leadership of <strong className="font-bold text-slate-800">Mr. Maruthachala Murthi P</strong>, our business caters to the diverse machinery requirements of manufacturing industries, engineering companies, fabrication units, industrial workshops, and businesses across South India.
              </p>
              <p>
                Over the years, we have developed an understanding of the machinery requirements of various industrial and manufacturing businesses. Our business focuses on helping customers identify machinery suited to their applications, production requirements, and operational needs.
              </p>
              <p>
                We deal in a broad range of industrial equipment, from conventional machine tools to CNC and VMC machinery, metalworking equipment, and sheet metal machinery.
              </p>
              <p>
                Our new and used machinery trading services cater to businesses setting up new facilities, expanding existing production capacity, replacing machinery, or selling equipment that is no longer required.
              </p>
              <p>
                Beyond machinery trading, we also provide repair and breakdown service, installation, and commissioning support, helping customers address important machinery-related requirements.
              </p>
              <p>
                With three locations in Coimbatore — Ondipudur, Ramanathapuram, and Avarampalayam — we are positioned to serve customers in Coimbatore and industrial regions across South India.
              </p>
              <p>
                At Murthi Machine Works, our focus is on understanding customer requirements, providing machinery-related solutions, and building lasting business relationships through professional dealings and customer service.
              </p>
              <p className="font-semibold text-slate-800">
                Our business philosophy is simple: connect businesses with the machinery and service solutions they need to keep moving forward.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                <span className="font-heading font-extrabold text-2xl sm:text-3xl text-amber-500 block">35+</span>
                <span className="text-xs font-bold text-slate-800">Years of Experience</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Founded by Mr. Maruthachala Murthi P</p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
                <span className="font-heading font-extrabold text-2xl sm:text-3xl text-amber-500 block">3</span>
                <span className="text-xs font-bold text-slate-800">Coimbatore Locations</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Ondipudur, Ramanathapuram & Avarampalayam</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 flex-1 min-h-[380px]">
              <img
                src="/about-us.webp"
                alt="Murthi Machine Works Coimbatore Facility"
                className="w-full h-full min-h-[380px] object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=85";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-1">
                  Plant & Service Locations
                </span>
                <p className="text-sm font-semibold text-slate-100">
                  Ondipudur • Ramanathapuram • Avarampalayam — Coimbatore
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
