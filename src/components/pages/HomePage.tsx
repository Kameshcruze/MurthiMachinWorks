import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';
import { Product, Category } from '../../types';
import { dataService, DATA_CHANGE_EVENT } from '../../services/dataService';
import { ProductCard } from '../products/ProductCard';
import { formatImageUrl } from '../../utils/helpers';
import {
  ArrowRight,
  MessageSquare,
  ShieldCheck,
  Cog,
  Wrench,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Award,
  Sparkles,
  Send,
  Sliders,
  Check,
  Users,
  Layers,
  FileSpreadsheet,
  Headphones,
  CheckCircle,
  Star,
  HardHat,
  Boxes,
  Activity,
  Cpu,
  BadgeCheck,
  Disc,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';

export const HomePage: React.FC = () => {
  const { navigateTo } = useNavigation();
  const { settings, showToast } = useSettings();

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Quick Enquiry Form state
  const [enquiryForm, setEnquiryForm] = useState({
    name: '',
    phone: '',
    email: '',
    service: 'New Machinery Sales',
    message: ''
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const loadData = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const [prods, cats] = await Promise.all([
        dataService.getProducts({ activeOnly: true }),
        dataService.getCategories()
      ]);
      setFeaturedProducts(prods);
      setCategories(cats);
    } catch (e) {
      console.warn('Failed to load home page data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
    const handleDataChange = (e: any) => {
      const entity = e.detail?.entity;
      if (!entity || entity === 'products' || entity === 'categories' || entity === 'all') {
        loadData(false);
      }
    };
    window.addEventListener(DATA_CHANGE_EVENT, handleDataChange);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, handleDataChange);
  }, []);

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryForm.name || !enquiryForm.phone) {
      showToast('Required fields missing', 'Please provide your name and phone number.', 'error');
      return;
    }

    setFormSubmitting(true);
    try {
      await dataService.createEnquiry({
        customer_name: enquiryForm.name,
        customer_phone: enquiryForm.phone,
        customer_email: enquiryForm.email || undefined,
        company_name: '',
        status: 'new',
        priority: 'high',
        notes: `Service/Machine Requested: ${enquiryForm.service}\nMessage: ${enquiryForm.message || 'General Quote Request'}`
      });
      setFormSuccess(true);
      showToast('Enquiry Sent', 'Thank you! We will contact you with quote details shortly.', 'success');
      setEnquiryForm({ name: '', phone: '', email: '', service: 'New Machinery Sales', message: '' });
      setTimeout(() => setFormSuccess(false), 5000);
    } catch (err) {
      showToast('Failed to send enquiry', 'Please call us directly at 98422 66521.', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // The 6 exact categories from the design
  const categoryCards = [
    {
      id: 'lathe-machines',
      name: 'Lathe Machines',
      slug: 'lathe-machines',
      image: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'drilling-machines',
      name: 'Drilling Machines',
      slug: 'drilling-machines',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'hydraulic-press-machines',
      name: 'Hydraulic Press Machines',
      slug: 'hydraulic-press-machines',
      image: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'cutting-machines',
      name: 'Cutting Machines',
      slug: 'cutting-machines',
      image: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'industrial-workshop-equipment',
      name: 'Industrial Workshop Equipment',
      slug: 'industrial-workshop-equipment',
      image: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'fabrication-machines',
      name: 'Fabrication Machines',
      slug: 'fabrication-machines',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
    },
  ];

  // The 6 exact services from the design
  const servicesList = [
    {
      title: 'New Machinery Sales',
      desc: 'Wide range of high-quality new industrial machinery.',
      icon: (
        <div className="w-12 h-12 rounded-full border-2 border-[#C81E1E] text-[#C81E1E] flex items-center justify-center">
          <Layers className="w-6 h-6 stroke-[1.8]" />
        </div>
      )
    },
    {
      title: 'Used Machinery Sales',
      desc: 'Certified used machines at the best market price.',
      icon: (
        <div className="w-12 h-12 rounded-full border-2 border-[#C81E1E] text-[#C81E1E] flex items-center justify-center">
          <BadgeCheck className="w-6 h-6 stroke-[1.8]" />
        </div>
      )
    },
    {
      title: 'Machine Repair Services',
      desc: 'Expert repair services for all types of industrial machines.',
      icon: (
        <div className="w-12 h-12 rounded-full border-2 border-[#C81E1E] text-[#C81E1E] flex items-center justify-center">
          <Wrench className="w-6 h-6 stroke-[1.8]" />
        </div>
      )
    },
    {
      title: 'Industrial Maintenance',
      desc: 'Preventive & annual maintenance for long-lasting performance.',
      icon: (
        <div className="w-12 h-12 rounded-full border-2 border-[#C81E1E] text-[#C81E1E] flex items-center justify-center">
          <Activity className="w-6 h-6 stroke-[1.8]" />
        </div>
      )
    },
    {
      title: 'Machine Reconditioning',
      desc: 'Complete mechanical overhauling & precision accuracy restoration.',
      icon: (
        <div className="w-12 h-12 rounded-full border-2 border-[#C81E1E] text-[#C81E1E] flex items-center justify-center">
          <Cog className="w-6 h-6 stroke-[1.8]" />
        </div>
      )
    },
    {
      title: 'Machinery Buyback & Exchange',
      desc: 'Fair market valuation & exchange options for old workshop machinery.',
      icon: (
        <div className="w-12 h-12 rounded-full border-2 border-[#C81E1E] text-[#C81E1E] flex items-center justify-center">
          <Sliders className="w-6 h-6 stroke-[1.8]" />
        </div>
      )
    }
  ];

  const handleGetQuoteScroll = () => {
    const el = document.getElementById('enquiry-form-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigateTo('contact');
    }
  };

  return (
    <div className="space-y-0 pb-16 bg-white">
      {/* =========================================================================
          1. HERO SECTION (Modern Industrial Vibe + Ambient Glow + Spring CTAs)
         ========================================================================= */}
      <section className="relative bg-[#0A0D14] text-white overflow-hidden min-h-[520px] sm:min-h-[580px] flex items-center">
        {/* Background Image of Lathe Machine & Machine Shop with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1920&q=85"
            alt="Murthi Machin Works Workshop"
            className="w-full h-full object-cover object-center opacity-35 filter contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0D14] via-[#0A0D14]/90 to-transparent" />
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#F5A623]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#C81E1E]/20 rounded-full blur-3xl pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-24 w-full">
          <div className="max-w-2xl space-y-6">
            {/* Modern Status Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white"
            >
              <span className="w-2 h-2 rounded-full bg-[#F5A623] animate-pulse" />
              <span className="font-semibold tracking-wide text-slate-200">Coimbatore's Premier Machinery Hub</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-heading font-black text-3.5xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.12]"
            >
              Leading Machinery<br />
              Sales & Service<br />
              Experts in <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5A623] via-[#ffc04d] to-[#F5A623]">Coimbatore</span>
            </motion.h1>

            {/* Subtitle with bullet points */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-xl"
            >
              New Machinery • Used Machinery • Repairs •<br className="hidden sm:inline" />
              Maintenance • Reconditioning
            </motion.p>

            {/* Two Action Buttons: GET QUOTE (Red) & CALL NOW (Yellow) with Spring Hover */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleGetQuoteScroll}
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#C81E1E] to-[#A81717] hover:from-[#B31919] hover:to-[#911313] text-white font-heading font-black text-xs sm:text-sm tracking-wider uppercase shadow-xl shadow-red-900/30 transition flex items-center gap-2.5 group"
                id="btn-hero-get-quote"
              >
                <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                <span>GET QUOTE</span>
              </motion.button>

              <motion.a
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                href="tel:9842266521"
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#F5A623] to-[#e69818] hover:from-[#e69818] hover:to-[#c97e08] text-slate-950 font-heading font-black text-xs sm:text-sm tracking-wider uppercase shadow-xl shadow-amber-500/20 transition flex items-center gap-2.5"
                id="btn-hero-call-now"
              >
                <Phone className="w-4 h-4 fill-current" />
                <span>CALL NOW</span>
              </motion.a>
            </motion.div>

            {/* Trust Micro-Bullets */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-3 flex flex-wrap items-center gap-4 text-xs text-slate-400"
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#F5A623]" /> 100% Tested Machinery
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-600 hidden sm:inline" />
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> On-site Commissioning
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-600 hidden sm:inline" />
              <span className="flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-[#F5A623]" /> 24/7 Breakdown Support
              </span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. RED STATS STRIP (500+ Machines Sold, 1000+ Happy Clients, etc.)
         ========================================================================= */}
      <section className="bg-gradient-to-r from-[#B31919] via-[#C81E1E] to-[#B31919] text-white py-6 px-4 sm:px-8 border-y border-[#A81717] shadow-inner relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-white/20">
            {/* Stat 1 */}
            <motion.div
              whileHover={{ scale: 1.04 }}
              className="flex items-center justify-center gap-3 sm:gap-4 py-3 sm:py-1 px-2 sm:px-4 cursor-default group"
            >
              <div className="p-2.5 rounded-xl bg-white/10 group-hover:bg-white/20 transition">
                <Cog className="w-7 h-7 sm:w-9 sm:h-9 text-[#F5A623] group-hover:rotate-90 transition-transform duration-500 stroke-[1.8] shrink-0" />
              </div>
              <div>
                <p className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl leading-none text-white tracking-tight">500+</p>
                <p className="text-xs sm:text-sm font-medium text-white/90 mt-1">Machines Sold</p>
              </div>
            </motion.div>

            {/* Stat 2 */}
            <motion.div
              whileHover={{ scale: 1.04 }}
              className="flex items-center justify-center gap-3 sm:gap-4 py-3 sm:py-1 px-2 sm:px-4 cursor-default group"
            >
              <div className="p-2.5 rounded-xl bg-white/10 group-hover:bg-white/20 transition">
                <Users className="w-7 h-7 sm:w-9 sm:h-9 text-[#F5A623] stroke-[1.8] shrink-0" />
              </div>
              <div>
                <p className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl leading-none text-white tracking-tight">1000+</p>
                <p className="text-xs sm:text-sm font-medium text-white/90 mt-1">Happy Clients</p>
              </div>
            </motion.div>

            {/* Stat 3 */}
            <motion.div
              whileHover={{ scale: 1.04 }}
              className="flex items-center justify-center gap-3 sm:gap-4 py-3 sm:py-1 px-2 sm:px-4 cursor-default group"
            >
              <div className="p-2.5 rounded-xl bg-white/10 group-hover:bg-white/20 transition">
                <Award className="w-7 h-7 sm:w-9 sm:h-9 text-[#F5A623] stroke-[1.8] shrink-0" />
              </div>
              <div>
                <p className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl leading-none text-white tracking-tight">15+</p>
                <p className="text-xs sm:text-sm font-medium text-white/90 mt-1">Years Experience</p>
              </div>
            </motion.div>

            {/* Stat 4 */}
            <motion.div
              whileHover={{ scale: 1.04 }}
              className="flex items-center justify-center gap-3 sm:gap-4 py-3 sm:py-1 px-2 sm:px-4 cursor-default group"
            >
              <div className="p-2.5 rounded-xl bg-white/10 group-hover:bg-white/20 transition">
                <Clock className="w-7 h-7 sm:w-9 sm:h-9 text-[#F5A623] stroke-[1.8] shrink-0" />
              </div>
              <div>
                <p className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl leading-none text-white tracking-tight">24/7</p>
                <p className="text-xs sm:text-sm font-medium text-white/90 mt-1">Service Support</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. OUR SERVICES SECTION (6 Modern White Cards with Spring Hover)
         ========================================================================= */}
      <section id="our-services-section" className="py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[#C81E1E] font-heading font-black text-xs uppercase tracking-widest block mb-1"
          >
            OUR SERVICES
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-slate-950 tracking-tight leading-tight"
          >
            Complete Machinery<br className="hidden sm:inline" /> Solutions for Your Business
          </motion.h2>
          <div className="w-16 h-1 bg-[#F5A623] mx-auto mt-3.5 rounded-full" />
        </div>

        {/* 6 Services Grid with Spring Hover Animation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {servicesList.map((srv, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              onClick={() => {
                setEnquiryForm(prev => ({ ...prev, service: srv.title }));
                handleGetQuoteScroll();
              }}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 text-center flex flex-col items-center justify-between hover:shadow-xl hover:border-[#C81E1E]/50 transition-all duration-300 cursor-pointer group relative overflow-hidden"
            >
              {/* Subtle top indicator bar on hover */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C81E1E] to-[#F5A623] opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="w-full flex flex-col items-center">
                <div className="mb-3.5 p-1 rounded-full group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                  {srv.icon}
                </div>
                <h3 className="font-heading font-bold text-sm text-slate-950 mb-2 leading-snug group-hover:text-[#C81E1E] transition-colors">
                  {srv.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {srv.desc}
                </p>
              </div>

              <div className="mt-4 pt-2 w-full border-t border-slate-100 text-[11px] font-bold text-[#C81E1E] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <span>Book Service</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          4. MACHINERY CATEGORIES SECTION (6 Category Cards with Red Bottom Bars)
         ========================================================================= */}
      <section className="py-16 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto border-t border-slate-200/60">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[#C81E1E] font-heading font-black text-xs uppercase tracking-widest block mb-1"
          >
            MACHINERY CATEGORIES
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-slate-950 tracking-tight"
          >
            Explore Our Wide Range of Machinery
          </motion.h2>
          <div className="w-16 h-1 bg-[#F5A623] mx-auto mt-3.5 rounded-full" />
        </div>

        {/* 6 Category Cards with Zoom Physics and Hover Shine */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {categoryCards.map((cat) => (
            <motion.div
              key={cat.id}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              onClick={() => navigateTo('products', { categorySlug: cat.slug })}
              className="group rounded-2xl overflow-hidden border border-slate-200/90 hover:border-[#C81E1E] shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col bg-white"
            >
              <div className="relative aspect-4/3 sm:aspect-square bg-slate-100 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-112 transition-transform duration-700 ease-out"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2">
                  <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-xs">
                    View Catalog →
                  </span>
                </div>
              </div>

              {/* Bottom Red Name Bar */}
              <div className="bg-[#C81E1E] group-hover:bg-[#B31919] text-white py-3 px-2 text-center transition-colors">
                <p className="font-heading font-bold text-xs leading-snug">
                  {cat.name}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          5. ABOUT US SECTION (Left Image + Right Story & Read More)
         ========================================================================= */}
      <section className="py-14 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto bg-slate-50 border-y border-slate-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Workshop Image */}
          <div className="lg:col-span-6 rounded-2xl overflow-hidden shadow-lg border border-slate-200 aspect-4/3">
            <img
              src="https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1000&q=80"
              alt="Murthi Machin Works Facilities"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Content */}
          <div className="lg:col-span-6 space-y-4">
            <span className="text-[#C81E1E] font-heading font-black text-xs uppercase tracking-widest block">
              ABOUT US
            </span>
            <h2 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-slate-950 tracking-tight leading-tight">
              Your Trusted Machinery Partner in Coimbatore
            </h2>
            <div className="w-12 h-1 bg-[#F5A623] mb-4" />

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Murthi Machin Works is one of Coimbatore's trusted machinery sales and service providers, offering both new and used industrial machinery with complete maintenance and support.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              With over 15 years of experience, we have built a strong reputation for quality, reliability, and customer satisfaction. Our team of skilled technicians ensures the best service and support for all types of industrial machinery.
            </p>

            <div className="pt-2">
              <button
                onClick={() => navigateTo('about')}
                className="px-6 py-2.5 rounded bg-[#F5A623] hover:bg-[#E09612] text-slate-950 font-heading font-bold text-xs uppercase tracking-wider shadow transition"
              >
                READ MORE
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. WHY CHOOSE US SECTION (Modern Dark Slate + Glowing Amber Accents)
         ========================================================================= */}
      <section className="bg-[#0A0D14] text-white py-16 sm:py-24 px-4 sm:px-8 relative overflow-hidden">
        {/* Subtle radial ambient glows */}
        <div className="absolute top-1/2 -left-20 w-80 h-80 bg-[#F5A623]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-20 w-80 h-80 bg-[#C81E1E]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-[#F5A623] font-heading font-black text-xs uppercase tracking-widest block mb-1"
            >
              WHY CHOOSE US
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight"
            >
              Delivering Excellence Every Time
            </motion.h2>
            <div className="w-16 h-1 bg-[#F5A623] mx-auto mt-3.5 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <ShieldCheck className="w-6 h-6 text-slate-950" />,
                title: 'Genuine Machinery',
                desc: 'Selling genuine and quality-assured machines with full inspection and performance certification.'
              },
              {
                icon: <Award className="w-6 h-6 text-slate-950" />,
                title: 'Affordable Pricing',
                desc: 'Best prices in the market with great value for both new and certified pre-owned equipment.'
              },
              {
                icon: <Wrench className="w-6 h-6 text-slate-950" />,
                title: 'Expert Technicians',
                desc: 'Skilled & experienced professionals for all repairs, overhaul, installation, and troubleshooting.'
              },
              {
                icon: <Clock className="w-6 h-6 text-slate-950" />,
                title: 'Fast Service',
                desc: 'Quick response time and punctual emergency breakdown support to minimize workshop downtime.'
              },
              {
                icon: <Users className="w-6 h-6 text-slate-950" />,
                title: 'Trusted by Industries',
                desc: 'Serving hundreds of machine shops, automotive component units, and textile manufacturers.'
              },
              {
                icon: <MapPin className="w-6 h-6 text-slate-950" />,
                title: 'On-site Support',
                desc: 'We provide on-site inspection, machine foundations, commissioning, and preventive maintenance.'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -6, scale: 1.01 }}
                className="bg-slate-900/90 border border-slate-800 hover:border-[#F5A623]/60 p-6 sm:p-7 rounded-2xl space-y-3.5 shadow-lg transition-all duration-300 group relative overflow-hidden backdrop-blur-xs"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#F5A623] to-[#ffc566] text-slate-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="font-heading font-bold text-lg text-white group-hover:text-[#F5A623] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. FEATURED MACHINERY (Our Best Selling Machines - 4 Cards)
         ========================================================================= */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[#C81E1E] font-heading font-black text-xs uppercase tracking-widest block mb-1"
          >
            FEATURED MACHINERY
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-slate-950 tracking-tight"
          >
            Our Best Selling Machines
          </motion.h2>
          <div className="w-16 h-1 bg-[#F5A623] mx-auto mt-3.5 rounded-full" />
        </div>

        {/* 4 Featured Products Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 4).map(product => (
            <ProductCard key={product.id} product={product} featuredBadge={true} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigateTo('products')}
            className="px-9 py-4 bg-gradient-to-r from-[#F5A623] to-[#e69818] hover:from-[#e69818] hover:to-[#c97e08] text-slate-950 font-heading font-black text-xs sm:text-sm tracking-wider uppercase rounded-xl shadow-lg shadow-amber-500/20 transition inline-flex items-center gap-2"
          >
            <span>View All Machinery</span>
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </section>

      {/* =========================================================================
          8. TESTIMONIALS SECTION (What Our Clients Say)
         ========================================================================= */}
      <section className="bg-slate-50 py-16 sm:py-24 px-4 sm:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-[#C81E1E] font-heading font-black text-xs uppercase tracking-widest block mb-1"
            >
              TESTIMONIALS
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-slate-950 tracking-tight"
            >
              What Our Clients Say
            </motion.h2>
            <div className="w-16 h-1 bg-[#F5A623] mx-auto mt-3.5 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "Purchased a heavy duty lathe machine for our Coimbatore workshop. Excellent machine quality and prompt installation service by their engineering team.",
                author: "Ramesh Kumar",
                org: "Precision Engineering, Coimbatore"
              },
              {
                quote: "We rely on Murthi Machin Works for our factory's hydraulic press repairs and annual maintenance. Their technicians are always dependable and fast.",
                author: "Suresh Babu",
                org: "Auto Components Works, Tiruppur"
              },
              {
                quote: "Got a certified used milling machine at a great price. Machine is performing accurately with zero issues. Highly recommend for any machine shop.",
                author: "Karthik Vel",
                org: "Vel Tool Tech, Erode"
              }
            ].map((testi, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -6 }}
                className="bg-white p-7 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex text-[#F5A623] gap-1">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                    "{testi.quote}"
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="font-heading font-bold text-sm text-slate-900">{testi.author}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{testi.org}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Verified Buyer
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. SERVICE AREA SECTION (Serving Across Tamil Nadu)
         ========================================================================= */}
      <section id="service-area-section" className="bg-[#0D0F12] text-white py-14 sm:py-20 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-[#F5A623] font-heading font-black text-xs uppercase tracking-widest block mb-1">
              SERVICE AREA
            </span>
            <h2 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight">
              Proudly Serving Across Tamil Nadu
            </h2>
            <div className="w-14 h-1 bg-[#F5A623] mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {['Coimbatore', 'Tiruppur', 'Erode', 'Salem', 'Karur', 'Across South India'].map((area) => (
              <div
                key={area}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center hover:border-[#F5A623] transition flex flex-col items-center justify-center gap-2"
              >
                <MapPin className="w-5 h-5 text-[#F5A623]" />
                <span className="font-heading font-bold text-xs sm:text-sm text-slate-100">{area}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          10. CONTACT US & INSTANT ENQUIRY FORM SECTION
         ========================================================================= */}
      <section id="enquiry-form-section" className="py-14 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left: Contact Info */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <span className="text-[#C81E1E] font-heading font-black text-xs uppercase tracking-widest block mb-1">
                CONTACT US
              </span>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-slate-950 tracking-tight">
                Get In Touch With Us
              </h2>
              <div className="w-12 h-1 bg-[#F5A623] mt-2 mb-4" />
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Have questions about our new or used machinery, repair services, or maintenance plans? Contact us today for direct quotes and advice.
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#C81E1E] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Address:</p>
                  <p className="text-slate-600">No. 45, South Street No. 1, Avarampalayam, Coimbatore - 641 006, Tamil Nadu, India.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#C81E1E] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Phone Numbers:</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 font-semibold text-slate-800 mt-0.5">
                    <a href="tel:9842266521" className="hover:text-[#C81E1E]">98422 66521</a>
                    <span>•</span>
                    <a href="tel:8778384248" className="hover:text-[#C81E1E]">87783 84248</a>
                    <span>•</span>
                    <a href="tel:7402114228" className="hover:text-[#C81E1E]">74021 14228</a>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#C81E1E] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Email Address:</p>
                  <a href="mailto:murthimachineworks@gmail.com" className="text-slate-600 hover:text-[#C81E1E] block">
                    murthimachineworks@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#C81E1E] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Working Hours:</p>
                  <p className="text-slate-600">Monday - Saturday: 8:30 AM - 7:30 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Instant Enquiry Form */}
          <div className="lg:col-span-7 bg-slate-50 border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm">
            <h3 className="font-heading font-black text-xl text-slate-950 mb-1">
              Quick Enquiry Form
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Fill out this form and our engineering specialist will call you with quotation and availability.
            </p>

            {formSuccess ? (
              <div className="p-6 bg-emerald-50 border border-emerald-300 rounded-xl text-center space-y-2 text-emerald-800 text-xs">
                <Check className="w-8 h-8 mx-auto text-emerald-600" />
                <p className="font-bold text-sm">Thank You for Your Enquiry!</p>
                <p>Our sales team will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={enquiryForm.name}
                      onChange={e => setEnquiryForm({ ...enquiryForm, name: e.target.value })}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#C81E1E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={enquiryForm.phone}
                      onChange={e => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                      placeholder="e.g. 98422 66521"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#C81E1E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={enquiryForm.email}
                      onChange={e => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                      placeholder="yourname@gmail.com"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#C81E1E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Select Service / Machinery</label>
                    <select
                      value={enquiryForm.service}
                      onChange={e => setEnquiryForm({ ...enquiryForm, service: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#C81E1E]"
                    >
                      <option value="New Machinery Sales">New Machinery Sales</option>
                      <option value="Used Machinery Sales">Used Machinery Sales</option>
                      <option value="Machine Repair Services">Machine Repair Services</option>
                      <option value="Industrial Maintenance">Industrial Maintenance</option>
                      <option value="Machine Reconditioning">Machine Reconditioning</option>
                      <option value="Machinery Buyback & Exchange">Machinery Buyback & Exchange</option>
                      <option value="Lathe Machines">Lathe Machines</option>
                      <option value="Drilling Machines">Drilling Machines</option>
                      <option value="Hydraulic Press Machines">Hydraulic Press Machines</option>
                      <option value="Power Press Machines">Power Press Machines</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Message / Requirements</label>
                  <textarea
                    rows={3}
                    value={enquiryForm.message}
                    onChange={e => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                    placeholder="Tell us about your machine specifications or repair requirements..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#C81E1E]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full py-3 bg-[#C81E1E] hover:bg-[#B31919] text-white font-heading font-black text-xs sm:text-sm tracking-wider uppercase rounded-lg shadow-md transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{formSubmitting ? 'Sending...' : 'SEND MESSAGE'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};



