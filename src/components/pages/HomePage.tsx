import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';
import { Product, Category, UserEnquiryRole, CustomerReview } from '../../types';
import { dataService, DATA_CHANGE_EVENT } from '../../services/dataService';
import { ProductCard } from '../products/ProductCard';
import { WriteReviewModal } from '../reviews/WriteReviewModal';
import { formatImageUrl } from '../../utils/helpers';
import { convertAndCompressToWebP } from '../../utils/imageUtils';
import { INITIAL_BRANCHES, INITIAL_REVIEWS } from '../../data/initialData';
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
  ChevronLeft,
  Edit3,
  Image as ImageIcon,
  Factory,
  Coins,
  Gauge,
  ExternalLink,
  Timer,
  ShoppingBag,
  Tag,
  Handshake,
  Camera,
  Upload,
  Trash2,
  Building,
  X
} from 'lucide-react';
import { motion } from 'motion/react';

export const HomePage: React.FC = () => {
  const { navigateTo } = useNavigation();
  const { settings, showToast } = useSettings();
  const branches = settings.branches && settings.branches.length > 0 ? settings.branches : INITIAL_BRANCHES;

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [reviewPage, setReviewPage] = useState<number>(0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [previewReviewPhoto, setPreviewReviewPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Touch swipe support for mobile review carousel
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const handleReviewTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };
  const handleReviewTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };
  const handleReviewTouchEnd = (reviewCount: number) => {
    if (touchStartX === null || touchEndX === null) return;
    const diff = touchStartX - touchEndX;
    if (diff > 45) {
      // Swiped left -> Next
      setReviewPage(prev => (prev >= reviewCount - 1 ? 0 : prev + 1));
    } else if (diff < -45) {
      // Swiped right -> Previous
      setReviewPage(prev => (prev <= 0 ? reviewCount - 1 : prev - 1));
    }
  };

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
          // If Supabase Storage is connected, uploads directly to bucket; otherwise converts to efficient WebP
          const res = await dataService.uploadProductImage(file, 'seller-machines');
          newUrls.push(res.url);
        } catch {
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
      const [prods, cats, revs] = await Promise.all([
        dataService.getProducts({ activeOnly: true }),
        dataService.getCategories(),
        dataService.getReviews(true)
      ]);
      setFeaturedProducts(prods);
      setCategories(cats);
      setReviews(revs);
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
      if (
        !entity ||
        entities.includes('products') ||
        entities.includes('categories') ||
        entities.includes('reviews') ||
        entities.includes('all') ||
        entity === 'products' ||
        entity === 'categories' ||
        entity === 'reviews' ||
        entity === 'all'
      ) {
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
        machine_photos: (enquiryForm.machine_photos && enquiryForm.machine_photos.length > 0) ? enquiryForm.machine_photos : [],
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

  // 6 categories ordered from Lathe Machines to Industrial Workshop Equipment
  const topCategories = React.useMemo(() => {
    const categoryDefaultPhotos: Record<string, string> = {
      'lathe-machines': 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=800&q=80',
      'drilling-machines': 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
      'hydraulic-press-machines': 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=800&q=80',
      'cutting-machines': 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
      'cnc-machinery': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      'grinding-machines': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
      'tooling-accessories': 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=800&q=80',
      'industrial-workshop-equipment': 'https://images.unsplash.com/photo-1581092335878-2d9ff86ca2bf?auto=format&fit=crop&w=800&q=80',
      'fabrication-machines': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    };

    if (!categories || categories.length === 0) {
      return [
        {
          id: 'MMW-lathe',
          name: 'Lathe Machines',
          slug: 'lathe-machines',
          count: 1,
          image: categoryDefaultPhotos['lathe-machines'],
        },
        {
          id: 'MMW-drilling',
          name: 'Drilling Machines',
          slug: 'drilling-machines',
          count: 1,
          image: categoryDefaultPhotos['drilling-machines'],
        },
        {
          id: 'MMW-hydraulic',
          name: 'Hydraulic Press Machines',
          slug: 'hydraulic-press-machines',
          count: 3,
          image: categoryDefaultPhotos['hydraulic-press-machines'],
        },
        {
          id: 'MMW-cutting',
          name: 'Cutting Machines',
          slug: 'cutting-machines',
          count: 1,
          image: categoryDefaultPhotos['cutting-machines'],
        },
        {
          id: 'MMW-cnc',
          name: 'CNC Machinery',
          slug: 'cnc-machinery',
          count: 1,
          image: categoryDefaultPhotos['cnc-machinery'],
        },
        {
          id: 'MMW-workshop',
          name: 'Industrial Workshop Equipment',
          slug: 'industrial-workshop-equipment',
          count: 1,
          image: categoryDefaultPhotos['industrial-workshop-equipment'],
        },
      ];
    }

    // Explicit order rank starting from Lathe Machine to Other Industrial Machine (Industrial Workshop Equipment)
    const getOrderRank = (slug: string, name: string): number => {
      const s = (slug || '').toLowerCase();
      const n = (name || '').toLowerCase();
      if (s.includes('lathe') || n.includes('lathe')) return 1;
      if (s.includes('drill') || n.includes('drill')) return 2;
      if (s.includes('hydraulic') || n.includes('hydraulic') || s.includes('press') || n.includes('press')) return 3;
      if (s.includes('cut') || n.includes('cut') || s.includes('saw') || n.includes('saw')) return 4;
      if (s.includes('cnc') || n.includes('cnc')) return 5;
      if (s.includes('workshop') || n.includes('workshop') || s.includes('other') || n.includes('other') || s.includes('industrial-workshop') || n.includes('industrial workshop')) return 6;
      if (s.includes('fabricat') || n.includes('fabricat')) return 7;
      if (s.includes('grind') || n.includes('grind')) return 8;
      return 99;
    };

    // Map all active categories with their actual product counts and product images
    const list = categories
      .filter(c => c.is_active !== false)
      .map(cat => {
        // Collect all products belonging to this category
        const catProducts = featuredProducts.filter(p =>
          p.category_id === cat.id ||
          p.category_id === cat.slug ||
          (p.category_name && p.category_name.toLowerCase().trim() === cat.name.toLowerCase().trim()) ||
          (p.category_name && (p.category_name.toLowerCase().includes(cat.name.toLowerCase()) || cat.name.toLowerCase().includes(p.category_name.toLowerCase())))
        );

        const count = Math.max(cat.product_count || 0, catProducts.length);

        // Find product with primary image or first available image
        const productWithImg = catProducts.find(p => p.images && p.images.length > 0 && p.images[0]?.image_url);
        const productImage = productWithImg?.images?.find(i => i.is_primary)?.image_url || productWithImg?.images?.[0]?.image_url;

        // Image priority: product image in this category -> category image_url -> curated fallback
        const formattedCatImg = formatImageUrl(cat.image_url);
        const fallbackImg = categoryDefaultPhotos[cat.slug] || categoryDefaultPhotos[cat.id] || '/hero-banner.webp';
        const displayImage = productImage || (formattedCatImg && !formattedCatImg.includes('404') ? formattedCatImg : fallbackImg);

        return {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          count,
          image: displayImage,
        };
      });

    // Sort strictly by custom sequence order (Lathe -> Drilling -> Hydraulic -> Cutting -> CNC -> Other Ind Machine)
    list.sort((a, b) => {
      const rankA = getOrderRank(a.slug, a.name);
      const rankB = getOrderRank(b.slug, b.name);
      if (rankA !== rankB) return rankA - rankB;
      return a.name.localeCompare(b.name);
    });

    // Take top 6 categories
    return list.slice(0, 6);
  }, [categories, featuredProducts]);

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
              alt="Murthi Machine Works Industrial Workshop"
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
                <p className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl leading-none text-white tracking-tight">1700+</p>
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
                <p className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl leading-none text-white tracking-tight">35+</p>
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

        {/* Compact 2-Column Grid on Mobile, 3-Col on Tablet, 5-Col on Desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
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
          {topCategories.map((cat) => (
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2">
                  <span className="text-[10px] font-bold text-white bg-black/70 px-2.5 py-1 rounded-full backdrop-blur-xs border border-white/20">
                    View Catalog →
                  </span>
                </div>
              </div>

              {/* Bottom Red Name Bar (Stretches full height to eliminate bottom gaps across varying title heights) */}
              <div className="bg-[#C81E1E] group-hover:bg-[#B31919] text-white py-2.5 px-2.5 transition-colors flex-1 flex items-center justify-center w-full min-h-[46px]">
                <p className="font-heading font-bold text-xs sm:text-xs leading-snug text-center w-full">
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
              alt="Murthi Machine Works Industrial Manufacturing & Sales"
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
              35 YEARS OF MACHINERY EXPERIENCE | COIMBATORE, TAMIL NADU
            </h2>
            <div className="w-12 h-1 bg-[#F5A623] mb-4" />

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed text-justify">
              Serving the industrial and manufacturing sectors with new and used machinery sales, machinery purchase, repair, breakdown service, installation, and commissioning across South India.
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed text-justify">
              With 35 years of experience in the machinery industry and three locations in Coimbatore, we help businesses source machinery, sell surplus equipment, and access machinery service facilities.
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

          {/* 7 Column Features - Flex layout with justify-center and auto-filling */}
          <div className="flex flex-wrap justify-center items-stretch divide-y sm:divide-y-0 lg:divide-x divide-zinc-800/80 border-t border-b lg:border-t-0 lg:border-b-0 border-zinc-800/80">
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
              },
              {
                icon: (
                  <svg className="w-11 h-11 text-[#F5A623]" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="24" cy="24" r="18" />
                    <path d="M6 24h36" />
                    <path d="M24 6c4.5 5 7 11 7 18s-2.5 13-7 18c-4.5-5-7-11-7-18s2.5-13 7-18z" />
                    <circle cx="24" cy="24" r="3" fill="currentColor" />
                  </svg>
                ),
                title: 'Pan India Support',
                desc: 'Machinery sales, dispatch & service support across India.'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="w-1/2 sm:w-1/3 md:flex-1 md:min-w-[210px] lg:w-auto lg:min-w-0 px-2.5 sm:px-4 py-8 sm:py-9 flex flex-col items-center text-center group hover:bg-white/[0.02] transition-colors"
              >
                <div className="h-14 flex items-center justify-center mb-3 group-hover:scale-108 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="font-heading font-bold text-sm sm:text-[15px] text-white mb-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-zinc-400 font-normal leading-relaxed max-w-[155px]">
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
          8. TESTIMONIALS & REVIEWS SECTION (Exact Match with Reference Image)
         ========================================================================= */}
      <section className="relative bg-white py-10 sm:py-14 border-y border-slate-100 overflow-hidden">
        {/* Ambient blush glow on the right background */}
        <div className="pointer-events-none absolute top-0 right-0 w-[55%] h-full bg-gradient-to-l from-rose-100/40 via-rose-50/25 to-transparent -z-0" />

        <div className="relative z-10 max-w-[1400px] mx-auto px-0 sm:px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-6 lg:gap-8">
            
            {/* 1. Left Curved Red Panel with Workshop Texture */}
            <div className="relative w-full lg:w-[35%] xl:w-[33%] rounded-3xl lg:rounded-none lg:rounded-r-[120px] overflow-hidden bg-gradient-to-br from-[#A0161D] via-[#8C1016] to-[#750C11] p-8 sm:p-10 lg:py-14 lg:px-12 text-white flex flex-col justify-between shadow-2xl shrink-0">
              {/* Workshop lathe background overlay */}
              <div 
                className="absolute inset-0 bg-cover bg-center mix-blend-luminosity opacity-15 pointer-events-none"
                style={{ backgroundImage: 'url(/hero-banner.webp)' }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none" />

              <div className="relative z-10">
                <span className="text-white/90 font-heading font-black text-xs uppercase tracking-widest block mb-4">
                  TESTIMONIALS & REVIEWS
                </span>
                <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-[44px] text-white leading-tight">
                  What Our <br />
                  <span className="text-[#F5A623]">Clients Say</span>
                </h2>
                <div className="w-16 h-1 bg-[#F5A623] rounded-full mt-3 mb-6" />

                <p className="text-white/85 text-xs sm:text-sm leading-relaxed max-w-xs font-normal">
                  Real reviews from our valued clients, sharing their experience working with us.
                </p>
              </div>

              {/* Big Double Quote Mark glyph at bottom left */}
              <div className="relative z-10 pt-8 sm:pt-12 text-white/90">
                <svg className="w-12 h-10 fill-current" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
            </div>

            {/* 2. Right Area (Button on top right, Showcase Card with Arrows, Dots below) */}
            <div className="flex-1 w-full px-4 sm:px-0 flex flex-col justify-between py-2 sm:py-4">
              {/* Write a Review Button on Top Right */}
              <div className="flex justify-end mb-6 sm:mb-8">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setIsReviewModalOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#A0161D] to-[#880F15] hover:from-[#901319] hover:to-[#780D13] text-white font-heading font-bold text-sm tracking-wide shadow-lg shadow-red-900/25 transition cursor-pointer"
                >
                  <Edit3 className="w-4 h-4 stroke-[2.5]" />
                  <span>Write a Review</span>
                </motion.button>
              </div>

              {/* Showcase Review Card with Left & Right Circular Arrow Controls */}
              {(() => {
                const reviewList = reviews.length > 0 ? reviews : INITIAL_REVIEWS;
                const safeIndex = reviewPage % reviewList.length;
                const currentReview = reviewList[safeIndex] || reviewList[0];
                const initials = currentReview.name
                  ? currentReview.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
                  : 'KR';

                return (
                  <>
                    <div className="relative max-w-2xl w-full mx-auto my-auto px-3 sm:px-6 md:px-0">
                      {/* Left Circular Arrow */}
                      <button
                        type="button"
                        onClick={() => setReviewPage(prev => (prev <= 0 ? reviewList.length - 1 : prev - 1))}
                        className="absolute left-0 sm:-left-5 md:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-slate-200/90 shadow-lg hover:shadow-xl text-slate-700 hover:text-[#C81E1E] hover:border-slate-300 flex items-center justify-center transition-all shrink-0 cursor-pointer z-30 active:scale-95"
                        aria-label="Previous review"
                      >
                        <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
                      </button>

                      {/* Showcase Review Card with Red Underlay Accent */}
                      <div className="relative w-full">
                        {/* Red corner swoosh underlay behind card */}
                        <div className="absolute inset-0 translate-x-2 sm:translate-x-2.5 translate-y-2.5 sm:translate-y-3 bg-gradient-to-br from-[#8C1016] to-[#60080D] rounded-[24px] sm:rounded-[30px] opacity-95 -z-0" />

                        {/* Main Card */}
                        <motion.div
                          key={currentReview.id || safeIndex}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.25 }}
                          onTouchStart={handleReviewTouchStart}
                          onTouchMove={handleReviewTouchMove}
                          onTouchEnd={() => handleReviewTouchEnd(reviewList.length)}
                          className="relative z-10 bg-white rounded-[24px] sm:rounded-[28px] border border-amber-200/50 p-4 sm:p-7 shadow-xl overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6"
                        >
                          {/* Soft Watermark Quote in bottom right */}
                          <span className="absolute -bottom-7 right-3 text-amber-100/80 text-[100px] font-serif font-black select-none pointer-events-none leading-none">
                            ”
                          </span>

                          {/* Left Photo Container */}
                          {currentReview.photos && currentReview.photos.length > 0 ? (
                            <div
                              onClick={() => setPreviewReviewPhoto(currentReview.photos![0])}
                              className="w-full sm:w-48 h-44 sm:h-38 rounded-2xl overflow-hidden relative shadow-md shrink-0 cursor-pointer group bg-slate-100 border border-slate-200"
                            >
                              <img
                                src={currentReview.photos[0]}
                                alt={currentReview.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute bottom-2.5 left-2.5 bg-black/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md">
                                <Camera className="w-3.5 h-3.5 text-white stroke-[2]" />
                                <span>{currentReview.photos.length} {currentReview.photos.length === 1 ? 'Photo' : 'Photos'}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full sm:w-44 h-36 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 shrink-0">
                              <Camera className="w-8 h-8 stroke-[1.5] text-slate-300 mb-1" />
                              <span className="text-xs font-medium">No Photos</span>
                            </div>
                          )}

                          {/* Right Review Content */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch z-10">
                            <div>
                              {/* Author Header Row */}
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {currentReview.avatar_url ? (
                                    <img
                                      src={currentReview.avatar_url}
                                      alt={currentReview.name}
                                      className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-2xs shrink-0"
                                    />
                                  ) : (
                                    <div className="w-11 h-11 rounded-full bg-[#851014] text-white font-heading font-black text-sm flex items-center justify-center shrink-0 tracking-wider shadow-2xs">
                                      {initials}
                                    </div>
                                  )}

                                  <div className="h-6 w-[1.5px] bg-slate-300/80 mx-0.5 shrink-0" />

                                  <div className="min-w-0">
                                    <h4 className="font-heading font-black text-slate-900 text-sm sm:text-base leading-snug truncate">
                                      {currentReview.name}
                                    </h4>
                                    <p className="text-xs text-slate-500 font-medium truncate">
                                      {[currentReview.company, currentReview.location].filter(Boolean).join(', ') || 'Client'}
                                    </p>
                                  </div>
                                </div>

                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold shrink-0">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
                                  <span>Verified Client</span>
                                </div>
                              </div>

                              {/* 5 Golden Stars */}
                              <div className="flex text-[#F5A623] gap-1 mb-2.5">
                                {[1, 2, 3, 4, 5].map((starVal) => (
                                  <Star
                                    key={starVal}
                                    className={`w-4 h-4 ${
                                      starVal <= currentReview.rating
                                        ? 'text-[#F5A623] fill-[#F5A623]'
                                        : 'text-slate-200 fill-slate-100'
                                    }`}
                                  />
                                ))}
                              </div>

                              {/* Quoted Comment Text */}
                              <p className="text-sm sm:text-[15px] text-slate-800 leading-relaxed italic font-medium">
                                “{currentReview.comment}”
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      {/* Right Circular Arrow */}
                      <button
                        type="button"
                        onClick={() => setReviewPage(prev => (prev >= reviewList.length - 1 ? 0 : prev + 1))}
                        className="absolute right-0 sm:-right-5 md:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white border border-slate-200/90 shadow-lg hover:shadow-xl text-slate-700 hover:text-[#C81E1E] hover:border-slate-300 flex items-center justify-center transition-all shrink-0 cursor-pointer z-30 active:scale-95"
                        aria-label="Next review"
                      >
                        <ChevronRight className="w-5 h-5 stroke-[2.2]" />
                      </button>
                    </div>

                    {/* Pagination Dots with Mobile Navigation Arrows */}
                    <div className="flex items-center justify-center gap-3 mt-6 sm:mt-8">
                      <button
                        type="button"
                        onClick={() => setReviewPage(prev => (prev <= 0 ? reviewList.length - 1 : prev - 1))}
                        className="sm:hidden w-8 h-8 rounded-full bg-white border border-slate-200 shadow-xs text-slate-700 hover:text-[#C81E1E] flex items-center justify-center transition active:scale-90 cursor-pointer"
                        aria-label="Previous review"
                      >
                        <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
                      </button>

                      <div className="flex items-center gap-2">
                        {reviewList.slice(0, 5).map((_, dotIdx) => (
                          <button
                            key={dotIdx}
                            type="button"
                            onClick={() => setReviewPage(dotIdx)}
                            className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                              (safeIndex % Math.min(5, reviewList.length)) === dotIdx
                                ? 'w-7 bg-[#C81E1E]'
                                : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                            }`}
                            aria-label={`Go to slide ${dotIdx + 1}`}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setReviewPage(prev => (prev >= reviewList.length - 1 ? 0 : prev + 1))}
                        className="sm:hidden w-8 h-8 rounded-full bg-white border border-slate-200 shadow-xs text-slate-700 hover:text-[#C81E1E] flex items-center justify-center transition active:scale-90 cursor-pointer"
                        aria-label="Next review"
                      >
                        <ChevronRight className="w-4 h-4 stroke-[2.2]" />
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>

          </div>

          {/* 3. Bottom Trust Badges Strip (100% Genuine Reviews, Verified Clients, With Photo Proof) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 pt-8 sm:pt-10 mt-8 sm:mt-10 border-t border-slate-200/70 max-w-5xl mx-auto px-4 sm:px-0">
            {/* Badge 1: 100% Genuine Reviews */}
            <div className="flex items-center gap-4 justify-center sm:justify-start">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100/90 text-[#C81E1E] flex items-center justify-center shrink-0 shadow-2xs">
                <Star className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="font-heading font-black text-slate-900 text-sm sm:text-[15px] leading-tight">
                  100% Genuine Reviews
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-snug">
                  Real feedback from real clients
                </p>
              </div>
            </div>

            {/* Badge 2: Verified Clients */}
            <div className="flex items-center gap-4 justify-center sm:justify-start">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100/90 text-[#C81E1E] flex items-center justify-center shrink-0 shadow-2xs">
                <ShieldCheck className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="font-heading font-black text-slate-900 text-sm sm:text-[15px] leading-tight">
                  Verified Clients
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-snug">
                  Reviews from our actual customers
                </p>
              </div>
            </div>

            {/* Badge 3: With Photo Proof */}
            <div className="flex items-center gap-4 justify-center sm:justify-start">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100/90 text-[#C81E1E] flex items-center justify-center shrink-0 shadow-2xs">
                <ImageIcon className="w-6 h-6 stroke-[1.8]" />
              </div>
              <div>
                <h4 className="font-heading font-black text-slate-900 text-sm sm:text-[15px] leading-tight">
                  With Photo Proof
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-snug">
                  See real projects and results
                </p>
              </div>
            </div>
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
              Proudly Serving Across South India
            </h2>
            <div className="w-14 h-1 bg-[#F5A623] mx-auto mt-2.5" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra', 'Telangana', 'Pan India'].map((area) => (
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
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed text-justify">
                Have questions about our new or used machinery, repair services, or maintenance plans? Contact us today for direct quotes and advice.
              </p>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                    <MapPin className="w-4 h-4 text-[#C81E1E]" />
                    <span>Works & Branch Addresses (Coimbatore):</span>
                  </p>
                  <button
                    onClick={() => navigateTo('contact')}
                    className="text-[11px] font-bold text-[#C81E1E] hover:underline cursor-pointer"
                  >
                    View All 3 Locations →
                  </button>
                </div>

                <div className="space-y-2">
                  {branches.map((branch, idx) => (
                    <a
                      key={branch.id || idx}
                      href={branch.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 rounded-lg border border-slate-200 hover:border-[#C81E1E] bg-slate-50/80 hover:bg-rose-50/40 transition group cursor-pointer"
                      title={`Open ${branch.name} on Google Maps`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-heading font-bold text-xs text-slate-900 group-hover:text-[#C81E1E] transition">
                          {branch.name ? branch.name.replace(/\bMACHIN\b/gi, 'MACHINE') : 'MURTHI MACHINE WORKS'}
                        </span>
                        <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#C81E1E] transition shrink-0" />
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        {branch.address ? branch.address.replace(/215\/4C1/gi, '1700') : ''}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#C81E1E] mt-1.5 group-hover:underline">
                        Navigate in Google Maps ↗
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-3 pt-1">
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
                  <a href={`mailto:${settings.email || 'murthimachinworks@gmail.com'}`} className="text-slate-600 hover:text-[#C81E1E] block">
                    {settings.email || 'murthimachinworks@gmail.com'}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#C81E1E] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Working Hours:</p>
                  <p className="text-slate-600">{settings.working_hours ? `Monday - Saturday: ${settings.working_hours}` : 'Monday - Saturday: 10:00 AM - 6:00 PM'}</p>
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

      {/* Write Review Modal */}
      <WriteReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onReviewSubmitted={() => {
          loadData(false);
        }}
      />

      {/* Review Photo Lightbox Preview */}
      {previewReviewPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewReviewPhoto(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-slate-950 rounded-2xl overflow-hidden border border-white/10 shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewReviewPhoto(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 transition cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewReviewPhoto}
              alt="Customer machinery review photo"
              className="max-h-[82vh] w-auto mx-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};



