import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';
import { Product, Category, UserEnquiryRole } from '../../types';
import { dataService, DATA_CHANGE_EVENT } from '../../services/dataService';
import { ProductCard } from '../products/ProductCard';
import { formatImageUrl } from '../../utils/helpers';
import { convertAndCompressToWebP } from '../../utils/imageUtils';
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
  ChevronRight,
  Factory,
  Coins,
  Gauge,
  Timer,
  ShoppingBag,
  Tag,
  Handshake,
  Camera,
  Upload,
  Trash2,
  Building
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
    user_type: 'buyer' as UserEnquiryRole,
    name: '',
    phone: '',
    email: '',
    company: '',
    address: '',
    service: 'New Machinery Sales',
    message: '',
    machine_photos: [] as string[]
  });
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressingPhoto(true);
    try {
      const remainingSlots = 3 - enquiryForm.machine_photos.length;
      const filesToProcess = (Array.from(files) as File[]).slice(0, remainingSlots);
      const newUrls: string[] = [];

      for (const file of filesToProcess) {
        try {
          const res = await convertAndCompressToWebP(file, { maxSizeBytes: 350 * 1024, maxWidth: 1200 });
          newUrls.push(res.dataUrl);
        } catch {
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          newUrls.push(dataUrl);
        }
      }

      setEnquiryForm(prev => ({
        ...prev,
        machine_photos: [...prev.machine_photos, ...newUrls]
      }));
      showToast('Photo Attached', `${newUrls.length} machine photo(s) added successfully.`, 'success');
    } catch (err) {
      showToast('Upload Error', 'Could not process image. Please try another picture.', 'error');
    } finally {
      setIsCompressingPhoto(false);
      e.target.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setEnquiryForm(prev => ({
      ...prev,
      machine_photos: prev.machine_photos.filter((_, i) => i !== index)
    }));
  };

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
      const entities: string[] = e.detail?.entities || (entity ? [entity] : []);
      if (!entity || entities.includes('products') || entities.includes('categories') || entities.includes('all') || entity === 'products' || entity === 'categories' || entity === 'all') {
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
        customer_name: enquiryForm.name.trim(),
        phone: enquiryForm.phone.trim(),
        whatsapp: enquiryForm.phone.trim(),
        email: (enquiryForm.email || '').trim(),
        company: (enquiryForm.company || '').trim(),
        address: (enquiryForm.address || '').trim(),
        location: (enquiryForm.address || 'Coimbatore / India').trim(),
        user_type: enquiryForm.user_type,
        machine_photos: enquiryForm.user_type === 'seller' ? enquiryForm.machine_photos : [],
        message: `Service / Machine Requested: ${enquiryForm.service}\nRequirements: ${enquiryForm.message.trim() || (enquiryForm.user_type === 'seller' ? 'Seller has machine available for inspection and sale.' : 'Customer requested quotation, pricing, and machine availability.')}`,
        status: 'new',
        notes: `Selected Service: ${enquiryForm.service}`
      });
      setFormSuccess(true);
      showToast('Enquiry Sent Successfully', 'Thank you! Our sales engineering team will contact you with quote details shortly.', 'success');
      setEnquiryForm({
        user_type: 'buyer',
        name: '',
        phone: '',
        email: '',
        company: '',
        address: '',
        service: 'New Machinery Sales',
        message: '',
        machine_photos: []
      });
      setTimeout(() => setFormSuccess(false), 5000);
    } catch (err) {
      showToast('Failed to send enquiry', 'Please call us directly at 98422 66521 or reach out on WhatsApp.', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // The 6 exact categories from the design with verified high-resolution industrial machine imagery
  const categoryCards = [
    {
      id: 'lathe-machines',
      name: 'Lathe Machines',
      slug: 'lathe-machines',
      image: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=600&q=80',
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
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
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
      image: 'https://images.unsplash.com/photo-1581092335878-2d9ff86ca2bf?auto=format&fit=crop&w=600&q=80',
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
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#C81E1E] text-[#C81E1E] flex items-center justify-center">
          <Layers className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
        </div>
      )
    },
    {
      title: 'Used Machinery Sales',
      desc: 'Certified used machines at the best market price.',
      icon: (
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#C81E1E] text-[#C81E1E] flex items-center justify-center">
          <BadgeCheck className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
        </div>
      )
    },
    {
      title: 'Machine Repair Services',
      desc: 'Expert repair services for all types of industrial machines.',
      icon: (
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#C81E1E] text-[#C81E1E] flex items-center justify-center">
          <Wrench className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
        </div>
      )
    },
    {
      title: 'Industrial Maintenance',
      desc: 'Preventive & annual maintenance for long-lasting performance.',
      icon: (
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#C81E1E] text-[#C81E1E] flex items-center justify-center">
          <Activity className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
        </div>
      )
    },
    {
      title: 'Machine Reconditioning',
      desc: 'Complete mechanical overhauling & precision accuracy restoration.',
      icon: (
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#C81E1E] text-[#C81E1E] flex items-center justify-center">
          <Cog className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
        </div>
      )
    },
    {
      title: 'Machinery Buyback & Exchange',
      desc: 'Fair market valuation & exchange options for old workshop machinery.',
      icon: (
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-[#C81E1E] text-[#C81E1E] flex items-center justify-center">
          <Sliders className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
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
    <div className="space-y-0 pb-8 bg-white">
      {/* =========================================================================
          1. HERO SECTION (Exact Industrial Lathe Workshop Background + Large Typography)
         ========================================================================= */}
      <section 
        className="hero-mobile-viewport relative bg-[#0A0D14] text-white overflow-hidden flex items-center"
      >
        {/* Industrial Workshop Lathe Background (Desktop /hero-banner.webp & Mobile /hero-banner-mob.webp) */}
        <div 
          className="absolute inset-0 z-0 overflow-hidden"
          style={{ backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <picture className="w-full h-full block">
            <source media="(max-width: 639px)" srcSet="/hero-banner-mob.webp" />
            <source media="(min-width: 640px)" srcSet={settings.hero_image && settings.hero_image !== '/hero-banner.png' ? settings.hero_image : "/hero-banner.webp"} />
            <img
              src={settings.hero_image && settings.hero_image !== '/hero-banner.png' ? settings.hero_image : "/hero-banner.webp"}
              alt="Murthi Machin Works Industrial Workshop"
              className="w-full h-full object-cover object-center filter contrast-105 brightness-95"
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              referrerPolicy="no-referrer"
            />
          </picture>
          {/* Precise gradient overlay matching reference: dark on left for text legibility, clear lathe on right */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0D14]/95 via-[#0A0D14]/85 sm:via-[#0A0D14]/65 md:via-[#0A0D14]/45 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14]/75 via-[#0A0D14]/35 to-transparent sm:hidden" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-14 md:py-16 w-full h-full flex flex-col justify-center">
          <div className="max-w-2xl sm:max-w-3xl space-y-3 sm:space-y-6">
            {/* Modern Status Badge */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white"
            >
              <span className="w-2 h-2 rounded-full bg-[#F5A623] animate-pulse shrink-0" />
              <span className="font-semibold tracking-wide text-slate-200 text-[11px] sm:text-xs">
                Coimbatore's Premier Machinery Hub
              </span>
            </motion.div>

            {/* Main Headline - Prominently Scaled Up matching reference */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-heading font-black text-[clamp(1.75rem,7vw,2.15rem)] sm:text-5xl md:text-6xl lg:text-[64px] text-white tracking-tight leading-[1.08]"
            >
              Leading Machinery<br />
              Sales & Service<br />
              Experts in <span className="text-[#F5A623]">Coimbatore</span>
            </motion.h1>

            {/* Subtitle with bullet points - Enlarged matching reference */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xs sm:text-base md:text-lg text-slate-100 font-medium leading-relaxed max-w-xl drop-shadow-sm"
            >
              New Machinery • Used Machinery • Repairs • Maintenance • Reconditioning
            </motion.p>

            {/* Action Buttons: VIEW AVAILABLE MACHINERIES & CALL NOW */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap items-center gap-2.5 sm:gap-4 pt-0.5 sm:pt-2"
            >
              <motion.button
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigateTo('products')}
                className="px-5 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-[#C81E1E] to-[#A81717] hover:from-[#B31919] hover:to-[#911313] text-white font-heading font-black text-xs sm:text-sm tracking-wider uppercase shadow-xl shadow-red-900/30 transition flex items-center gap-2 group whitespace-nowrap"
                id="btn-hero-get-quote"
              >
                <Boxes className="w-4 h-4 text-amber-300 transition-transform group-hover:scale-110 shrink-0" />
                <span>VIEW AVAILABLE MACHINERIES</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 shrink-0" />
              </motion.button>

              <motion.a
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.96 }}
                href="tel:9842266521"
                className="px-5 sm:px-8 py-3 sm:py-4 rounded-xl bg-[#F5A623] hover:bg-[#e69818] text-slate-950 font-heading font-black text-xs sm:text-sm tracking-wider uppercase shadow-xl shadow-amber-500/20 transition flex items-center gap-2 whitespace-nowrap"
                id="btn-hero-call-now"
              >
                <Phone className="w-4 h-4 fill-current shrink-0" />
                <span>CALL NOW</span>
              </motion.a>
            </motion.div>

            {/* Trust Micro-Bullets */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-0.5 sm:pt-2 flex flex-wrap items-center gap-x-3 gap-y-1 sm:gap-4 text-[11px] sm:text-sm text-slate-300"
            >
              <span className="flex items-center gap-1.5 font-medium whitespace-nowrap">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F5A623] shrink-0" /> 100% Tested Machinery
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-500 hidden sm:inline" />
              <span className="flex items-center gap-1.5 font-medium whitespace-nowrap">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" /> On-site Commissioning
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-500 hidden sm:inline" />
              <span className="flex items-center gap-1.5 font-medium whitespace-nowrap">
                <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F5A623] shrink-0" /> 24/7 Breakdown Support
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
          3. OUR SERVICES SECTION (Mobile Compact Carousel / Grid + Desktop 6-Col)
         ========================================================================= */}
      <section id="our-services-section" className="py-6 sm:py-14 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-7">
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
            className="font-heading font-black text-xl sm:text-3xl lg:text-4xl text-slate-950 tracking-tight leading-tight"
          >
            Complete Machinery<br className="hidden sm:inline" /> Solutions for Your Business
          </motion.h2>
          <div className="w-12 sm:w-16 h-1 bg-[#F5A623] mx-auto mt-2 sm:mt-3 rounded-full" />
        </div>

        {/* Compact 2-Column Grid on Mobile, 3-Col on Tablet, 6-Col on Desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
          {servicesList.map((srv, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              onClick={() => {
                setEnquiryForm(prev => ({ ...prev, service: srv.title }));
                handleGetQuoteScroll();
              }}
              className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 p-3 sm:p-5 text-center flex flex-col items-center justify-between hover:shadow-lg hover:border-[#C81E1E]/50 transition-all duration-300 cursor-pointer group relative overflow-hidden"
            >
              {/* Subtle top indicator bar on hover */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C81E1E] to-[#F5A623] opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="w-full flex flex-col items-center">
                <div className="mb-2 sm:mb-3.5 p-0.5 rounded-full group-hover:scale-105 transition-all">
                  {srv.icon}
                </div>
                <h3 className="font-heading font-bold text-xs sm:text-sm text-slate-950 mb-1 sm:mb-2 leading-snug group-hover:text-[#C81E1E] transition-colors">
                  {srv.title}
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-600 leading-snug font-normal line-clamp-2 sm:line-clamp-none">
                  {srv.desc}
                </p>
              </div>

              <div className="mt-2.5 sm:mt-4 pt-1.5 sm:pt-2 w-full border-t border-slate-100 text-[10px] sm:text-[11px] font-bold text-[#C81E1E] flex items-center justify-center gap-0.5">
                <span>Book Service</span>
                <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          4. MACHINERY CATEGORIES SECTION (6 Category Cards with Red Bottom Bars)
         ========================================================================= */}
      <section className="py-10 sm:py-14 px-4 sm:px-8 max-w-7xl mx-auto border-t border-slate-200/60">
        <div className="text-center max-w-3xl mx-auto mb-7">
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
          <div className="w-16 h-1 bg-[#F5A623] mx-auto mt-3 rounded-full" />
        </div>

        {/* 6 Category Cards with Zoom Physics and Hover Shine */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {categoryCards.map((cat) => (
            <motion.div
              key={cat.id}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              onClick={() => navigateTo('products', { categorySlug: cat.slug })}
              className="group rounded-2xl overflow-hidden border border-slate-200/90 hover:border-[#C81E1E] shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col bg-[#C81E1E]"
            >
              <div className="relative aspect-4/3 sm:aspect-square bg-slate-100 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-112 transition-transform duration-700 ease-out"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/hero-banner.webp';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2">
                  <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-xs">
                    View Catalog →
                  </span>
                </div>
              </div>

              {/* Bottom Red Name Bar (Stretches full height to eliminate bottom gaps across varying title heights) */}
              <div className="bg-[#C81E1E] group-hover:bg-[#B31919] text-white py-3 px-2 text-center transition-colors flex-1 flex items-center justify-center w-full min-h-[48px]">
                <p className="font-heading font-bold text-xs sm:text-xs leading-snug">
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
      <section className="py-10 sm:py-14 px-4 sm:px-8 max-w-7xl mx-auto bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Workshop Image matching reference photo */}
          <div className="lg:col-span-6 rounded-2xl overflow-hidden shadow-md border border-slate-200 aspect-4/3 bg-white">
            <img
              id="about-us-hero-image"
              src="/about-us.webp"
              alt="Murthi Machin Works Industrial Manufacturing & Sales"
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = "/about-us.webp";
              }}
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
          6. WHY CHOOSE US SECTION (Exact Match with Reference Image)
         ========================================================================= */}
      <section className="bg-[#121316] text-white py-12 sm:py-16 px-4 sm:px-6 relative">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-[#F5A623] font-heading font-bold text-xs tracking-widest uppercase block mb-1.5"
            >
              WHY CHOOSE US
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight"
            >
              Delivering Excellence Every Time
            </motion.h2>
            <div className="w-12 h-1 bg-[#F5A623] mx-auto mt-2.5 rounded-full" />
          </div>

          {/* 6 Column Row with Thin Dividers matching reference exactly */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-y md:divide-y-0 lg:divide-x divide-zinc-800/80 border-t border-b lg:border-t-0 lg:border-b-0 border-zinc-800/80">
            {[
              {
                icon: (
                  <svg className="w-11 h-11 text-[#F5A623]" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="6" y="10" width="36" height="28" rx="4" />
                    <circle cx="24" cy="24" r="7" />
                    <path d="M24 13v4M24 31v4M13 24h4M31 24h4M16.2 16.2l2.8 2.8M29 29l2.8 2.8M16.2 31.8l2.8-2.8M29 19l2.8-2.8" />
                  </svg>
                ),
                title: 'Genuine Machinery',
                desc: 'Selling genuine and quality assured machines.'
              },
              {
                icon: (
                  <svg className="w-11 h-11 text-[#F5A623]" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="28" cy="14" r="7" />
                    <path d="M28 11v6M26 14h4" />
                    <path d="M10 32c3-1 6-2 10-2h8c2.5 0 4.5 1.5 5 4l1 5H6l2-6c.5-1.5 1.2-2.5 2-3z" />
                    <path d="M18 30l-4-4c-1.5-1.5-3.5-1.5-5 0s-1.5 3.5 0 5l6 6" />
                  </svg>
                ),
                title: 'Affordable Pricing',
                desc: 'Best prices in the market with great value.'
              },
              {
                icon: (
                  <svg className="w-11 h-11 text-[#F5A623]" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="24" cy="14" r="5" />
                    <path d="M16 28c0-4 3.5-7 8-7s8 3 8 7" />
                    <circle cx="12" cy="18" r="4" />
                    <path d="M6 31c0-3 2.5-5 6-5" />
                    <circle cx="36" cy="18" r="4" />
                    <path d="M42 31c0-3-2.5-5-6-5" />
                    <circle cx="24" cy="38" r="3" />
                    <path d="M24 33v2M24 41v2M19 38h2M27 38h2" />
                  </svg>
                ),
                title: 'Expert Technicians',
                desc: 'Skilled & experienced professionals for all services.'
              },
              {
                icon: (
                  <svg className="w-11 h-11 text-[#F5A623]" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="24" cy="24" r="16" />
                    <path d="M24 14v10l7 4" />
                    <path d="M8 10l4-4M4 18h5M40 18h4M36 10l4-4" />
                    <circle cx="24" cy="24" r="3" fill="currentColor" />
                  </svg>
                ),
                title: 'Fast Service',
                desc: 'Quick response and timely service guaranteed.'
              },
              {
                icon: (
                  <svg className="w-11 h-11 text-[#F5A623]" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 40V16l12 7V16l12 7V8h8v32H8z" />
                    <rect x="14" y="28" width="4" height="6" />
                    <rect x="22" y="28" width="4" height="6" />
                    <rect x="34" y="16" width="4" height="6" />
                    <rect x="34" y="26" width="4" height="6" />
                  </svg>
                ),
                title: 'Trusted by Industries',
                desc: 'Serving multiple industries with trust and reliability.'
              },
              {
                icon: (
                  <svg className="w-11 h-11 text-[#F5A623]" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="8" y="10" width="32" height="24" rx="3" />
                    <path d="M16 34v6M32 34v6M12 40h24" />
                    <circle cx="24" cy="22" r="5" />
                    <path d="M24 15v2M24 27v2M17 22h2M29 22h2" />
                  </svg>
                ),
                title: 'On-site Support',
                desc: 'We provide on-site inspection and support.'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="px-3 sm:px-4 py-8 sm:py-9 flex flex-col items-center text-center group hover:bg-white/[0.02] transition-colors"
              >
                <div className="h-14 flex items-center justify-center mb-3 group-hover:scale-108 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="font-heading font-bold text-sm sm:text-[15px] text-white mb-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-zinc-400 font-normal leading-relaxed max-w-[165px]">
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
      <section className="py-10 sm:py-14 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-7">
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
          <div className="w-16 h-1 bg-[#F5A623] mx-auto mt-3 rounded-full" />
        </div>

        {/* 4 Featured Products Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 4).map(product => (
            <ProductCard key={product.id} product={product} featuredBadge={true} />
          ))}
        </div>

        <div className="mt-8 text-center">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigateTo('products')}
            className="px-8 py-3.5 bg-gradient-to-r from-[#F5A623] to-[#e69818] hover:from-[#e69818] hover:to-[#c97e08] text-slate-950 font-heading font-black text-xs sm:text-sm tracking-wider uppercase rounded-xl shadow-lg shadow-amber-500/20 transition inline-flex items-center gap-2"
          >
            <span>View All Machinery</span>
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </section>

      {/* =========================================================================
          8. TESTIMONIALS SECTION (What Our Clients Say)
         ========================================================================= */}
      <section className="bg-slate-50 py-10 sm:py-14 px-4 sm:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-7">
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
            <div className="w-16 h-1 bg-[#F5A623] mx-auto mt-3 rounded-full" />
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
      <section id="service-area-section" className="bg-[#0D0F12] text-white py-9 sm:py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
            <span className="text-[#F5A623] font-heading font-black text-xs uppercase tracking-widest block mb-1">
              SERVICE AREA
            </span>
            <h2 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight">
              Proudly Serving Across Tamil Nadu
            </h2>
            <div className="w-14 h-1 bg-[#F5A623] mx-auto mt-2.5" />
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
      <section id="enquiry-form-section" className="py-10 sm:py-14 px-4 sm:px-8 max-w-7xl mx-auto">
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
                <p>Our sales and machinery engineering team will contact you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-4">
                {/* 1. Choose whether Buyer, Seller, or Mediator */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    I am a *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setEnquiryForm({ ...enquiryForm, user_type: 'buyer' })}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${
                        enquiryForm.user_type === 'buyer'
                          ? 'bg-amber-500/10 border-amber-500 text-amber-950 font-bold ring-2 ring-amber-500/30'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <ShoppingBag className={`w-5 h-5 mb-1 ${enquiryForm.user_type === 'buyer' ? 'text-amber-600' : 'text-slate-400'}`} />
                      <span className="text-xs font-bold">Buyer</span>
                      <span className="text-[10px] text-slate-500 font-normal">Buy Machinery</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEnquiryForm({ ...enquiryForm, user_type: 'seller' })}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${
                        enquiryForm.user_type === 'seller'
                          ? 'bg-rose-500/10 border-[#C81E1E] text-rose-950 font-bold ring-2 ring-rose-500/30'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Tag className={`w-5 h-5 mb-1 ${enquiryForm.user_type === 'seller' ? 'text-[#C81E1E]' : 'text-slate-400'}`} />
                      <span className="text-xs font-bold">Seller</span>
                      <span className="text-[10px] text-slate-500 font-normal">Sell Machine</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEnquiryForm({ ...enquiryForm, user_type: 'mediator' })}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${
                        enquiryForm.user_type === 'mediator'
                          ? 'bg-indigo-500/10 border-indigo-500 text-indigo-950 font-bold ring-2 ring-indigo-500/30'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Handshake className={`w-5 h-5 mb-1 ${enquiryForm.user_type === 'mediator' ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span className="text-xs font-bold">Mediator</span>
                      <span className="text-[10px] text-slate-500 font-normal">Agent / Broker</span>
                    </button>
                  </div>
                </div>

                {/* 2. Seller Machine Photo Upload Section */}
                {enquiryForm.user_type === 'seller' && (
                  <div className="p-4 bg-amber-50/70 border border-amber-300/80 rounded-xl space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <Camera className="w-4 h-4 text-[#C81E1E]" />
                          <span>Machine Photo(s) You Are Selling</span>
                          <span className="text-[10px] text-slate-500 font-normal">(Attach Photos)</span>
                        </label>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Upload clear pictures of the machine, nameplate, chuck, bed, or overall condition (Max 3 photos).
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                      {enquiryForm.machine_photos.map((photo, index) => (
                        <div key={index} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-slate-300 shadow-xs bg-slate-100">
                          <img src={photo} alt={`Machine ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow transition cursor-pointer"
                            title="Remove photo"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {enquiryForm.machine_photos.length < 3 && (
                        <label className="w-20 h-20 border-2 border-dashed border-amber-400 hover:border-[#C81E1E] bg-white rounded-lg flex flex-col items-center justify-center cursor-pointer transition text-slate-500 hover:text-[#C81E1E] p-1 text-center">
                          <Upload className="w-4 h-4 mb-0.5" />
                          <span className="text-[10px] font-bold leading-tight">Add Photo</span>
                          <span className="text-[8px] text-slate-400">JPG/PNG/WebP</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handlePhotoUpload}
                            className="hidden"
                            disabled={isCompressingPhoto}
                          />
                        </label>
                      )}
                    </div>

                    {isCompressingPhoto && (
                      <p className="text-[11px] text-amber-800 font-medium animate-pulse flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
                        Processing & optimizing machine image...
                      </p>
                    )}
                  </div>
                )}

                {/* Primary Contact Details */}
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

                {/* 3. Company Name and Address (NOT mandatory) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Company / Works Name <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={enquiryForm.company}
                      onChange={e => setEnquiryForm({ ...enquiryForm, company: e.target.value })}
                      placeholder="e.g. Apex Auto Parts (Optional)"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#C81E1E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Address / Location <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={enquiryForm.address}
                      onChange={e => setEnquiryForm({ ...enquiryForm, address: e.target.value })}
                      placeholder="e.g. SIDCO Industrial Estate, Coimbatore (Optional)"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#C81E1E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      value={enquiryForm.email}
                      onChange={e => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                      placeholder="yourname@gmail.com"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#C81E1E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {enquiryForm.user_type === 'seller' ? 'Machinery Category to Sell' : 'Select Service / Machinery'}
                    </label>
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
                      <option value="Milling & Shaping Machines">Milling & Shaping Machines</option>
                      <option value="Other Industrial Machinery">Other Industrial Machinery</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {enquiryForm.user_type === 'seller' 
                      ? 'Machine Details (Make, Model, Year, Condition, Expected Price)' 
                      : 'Your Message / Requirements'}
                  </label>
                  <textarea
                    rows={3}
                    value={enquiryForm.message}
                    onChange={e => setEnquiryForm({ ...enquiryForm, message: e.target.value })}
                    placeholder={
                      enquiryForm.user_type === 'seller'
                        ? 'e.g. HMT LB-17 Lathe Machine, 1998 make, working condition in Coimbatore factory, expected ₹2,75,000...'
                        : 'Tell us about your machine specifications or repair requirements...'
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#C81E1E]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formSubmitting || isCompressingPhoto}
                  className="w-full py-3 bg-[#C81E1E] hover:bg-[#B31919] text-white font-heading font-black text-xs sm:text-sm tracking-wider uppercase rounded-lg shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {formSubmitting
                      ? 'Sending...'
                      : enquiryForm.user_type === 'seller'
                      ? 'SUBMIT MACHINE FOR SALE / VALUATION'
                      : enquiryForm.user_type === 'mediator'
                      ? 'SUBMIT DEAL / MEDIATOR ENQUIRY'
                      : 'REQUEST MACHINERY QUOTE'}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};



