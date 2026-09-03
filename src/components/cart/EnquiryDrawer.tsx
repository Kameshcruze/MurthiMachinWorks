import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { useNavigation } from '../../context/NavigationContext';
import { dataService } from '../../services/dataService';
import { formatImageUrl, formatPrice, generateWhatsAppCartLink } from '../../utils/helpers';
import {
  X,
  Trash2,
  Plus,
  Minus,
  MessageSquare,
  Send,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckCircle2,
  ShoppingCart,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

export const EnquiryDrawer: React.FC = () => {
  const { items, removeFromCart, updateQuantity, clearCart, totalItems, isCartOpen, setIsCartOpen } = useCart();
  const { settings, showToast } = useSettings();
  const { navigateTo } = useNavigation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEnquiryId, setSubmittedEnquiryId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    whatsapp: '',
    email: '',
    company: '',
    location: '',
    message: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.customer_name.trim()) errs.customer_name = 'Full name is required';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    if (!formData.company.trim()) errs.company = 'Company name is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Valid email is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (items.length === 0) {
      showToast('Enquiry List Empty', 'Please add at least one machine tool to your enquiry.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const newEnquiry = await dataService.createEnquiry(
        {
          customer_name: formData.customer_name.trim(),
          phone: formData.phone.trim(),
          whatsapp: (formData.whatsapp.trim() || formData.phone.trim()),
          email: formData.email.trim() || 'sales@murthimachineworks.com',
          company: formData.company.trim(),
          location: formData.location.trim() || 'Coimbatore / India',
          message: formData.message.trim() || 'Please share detailed quotation with technical specifications and delivery timeframe.'
        },
        items
      );

      setSubmittedEnquiryId(newEnquiry.id);
      showToast('Enquiry Submitted Successfully!', 'Our Senior Sales Engineer will contact you within 2 business hours.', 'success');

      // Trigger confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }

      clearCart();
    } catch (err) {
      console.error('Error submitting enquiry:', err);
      showToast('Submission Error', 'Failed to submit enquiry. Please retry or contact us directly on WhatsApp.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppSend = () => {
    const waLink = generateWhatsAppCartLink(
      settings.whatsapp,
      items.map(i => ({ productName: i.product_name, sku: i.sku, quantity: i.quantity })),
      {
        name: formData.customer_name,
        company: formData.company,
        location: formData.location
      },
      settings.business_name
    );
    window.open(waLink, '_blank', 'noopener,noreferrer');
  };

  const handleClose = () => {
    setIsCartOpen(false);
    if (submittedEnquiryId) {
      setSubmittedEnquiryId(null);
      setFormData({
        customer_name: '',
        phone: '',
        whatsapp: '',
        email: '',
        company: '',
        location: '',
        message: ''
      });
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
          />

          {/* Slide-over Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-screen max-w-lg bg-white shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-5 bg-[#0A0A0A] text-white flex items-center justify-between border-b-2 border-[#C81E1E]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#F5A623] text-slate-950 flex items-center justify-center font-bold shadow-md shrink-0">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-base text-white tracking-wide">
                      Enquiry Quotation Cart
                    </h3>
                    <p className="text-xs text-[#F5A623] font-semibold">
                      {totalItems} {totalItems === 1 ? 'machine' : 'machines'} selected for RFQ
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {submittedEnquiryId ? (
                  /* Success Confirmation Screen */
                  <div className="py-8 text-center space-y-4">
                    <div className="w-16 h-16 bg-amber-50 border border-amber-200 text-[#F5A623] rounded-full flex items-center justify-center mx-auto shadow-inner">
                      <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-heading font-black text-xl text-slate-950">
                        Enquiry Received!
                      </h4>
                      <p className="text-xs font-mono text-slate-500">
                        Reference ID: <span className="font-bold text-[#C81E1E]">{submittedEnquiryId}</span>
                      </p>
                      <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                        Thank you for your enquiry with Murthi Machine Works. Our Coimbatore sales engineering desk will prepare your formal proposal and contact you shortly.
                      </p>
                    </div>

                    {/* Immediate WhatsApp Forward CTA */}
                    <div className="pt-4 max-w-xs mx-auto space-y-2.5">
                      <button
                        onClick={handleWhatsAppSend}
                        className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20ba5a] active:bg-[#1da851] text-white text-xs font-heading font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition"
                      >
                        <MessageSquare className="w-4 h-4 fill-current" />
                        <span>Forward Quote on WhatsApp</span>
                      </button>
                      <button
                        onClick={handleClose}
                        className="w-full py-2.5 px-4 bg-[#0A0A0A] hover:bg-slate-800 text-white text-xs font-heading font-bold rounded-xl transition"
                      >
                        Continue Browsing Machinery
                      </button>
                    </div>
                  </div>
                ) : items.length === 0 ? (
                  /* Empty State */
                  <div className="py-16 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-[#F5A623]/30 text-[#F5A623] flex items-center justify-center mx-auto">
                      <ShoppingCart className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-heading font-bold text-base text-slate-800">
                        Your Enquiry List is Empty
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                        Browse our machine tools and click "Add to RFQ" to compile an instant price and delivery quotation.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        handleClose();
                        navigateTo('products');
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#C81E1E] hover:bg-[#B31919] text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md"
                    >
                      <span>Explore Machine Catalog</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  /* Cart Items List & Submission Form */
                  <div className="space-y-6">
                    {/* Items Group */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-700 font-heading font-bold uppercase tracking-wider pb-1.5 border-b border-slate-200">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#F5A623]" />
                          Selected Machines
                        </span>
                        <button
                          onClick={clearCart}
                          className="text-[#C81E1E] hover:text-[#991414] flex items-center gap-1 normal-case font-semibold transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Clear List
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {items.map(item => (
                          <div
                            key={item.product_id}
                            className="flex items-center gap-3 p-3 bg-white border border-slate-200/90 rounded-xl hover:border-[#F5A623] shadow-xs transition"
                          >
                            <img
                              src={formatImageUrl(item.image_url)}
                              alt={item.product_name}
                              className="w-14 h-14 object-cover rounded-lg border border-slate-200 shrink-0 bg-slate-100"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-heading font-bold text-slate-900 line-clamp-1">
                                {item.product_name}
                              </h4>
                              <p className="text-[11px] font-mono text-slate-500">
                                SKU: {item.sku}
                              </p>
                              {item.price && item.price > 0 ? (
                                <p className="text-xs font-heading font-extrabold text-[#C81E1E] mt-0.5">
                                  {formatPrice(item.price, settings.currency_symbol)}
                                </p>
                              ) : (
                                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                                  Price on Request
                                </p>
                              )}
                            </div>

                            {/* Quantity Adjust */}
                            <div className="flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-lg px-1.5 py-0.5">
                              <button
                                onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                className="p-1 text-slate-600 hover:text-[#C81E1E] transition"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold w-5 text-center font-mono text-slate-900">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                className="p-1 text-slate-600 hover:text-[#C81E1E] transition"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.product_id)}
                              className="p-1.5 text-slate-400 hover:text-[#C81E1E] hover:bg-red-50 rounded-lg transition"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Instant WhatsApp Multi-product Forward Banner (Clean Industrial Styling) */}
                    <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-[#F5A623]/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-heading font-bold text-slate-900 flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4 text-[#F5A623] fill-current" />
                          Need Immediate WhatsApp Quote?
                        </p>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Click to send this entire list directly to our sales desk.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleWhatsAppSend}
                        className="py-2 px-3.5 bg-[#25D366] hover:bg-[#20ba5a] active:bg-[#1da851] text-white text-xs font-heading font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 shrink-0 transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5 fill-current" />
                        <span>Send on WhatsApp</span>
                      </button>
                    </div>

                    {/* Enquiry Submission Form */}
                    <form onSubmit={handleSubmit} className="space-y-3.5 pt-2 border-t border-slate-200">
                      <h4 className="font-heading font-black text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1.5 h-3.5 bg-[#C81E1E] rounded-xs" />
                        Business & Contact Details
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-heading font-bold text-slate-700 block mb-1">
                            Contact Person *
                          </label>
                          <div className="relative">
                            <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={formData.customer_name}
                              onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                              placeholder="e.g. K. Murugan"
                              className={`w-full pl-8 pr-2.5 py-2 text-xs bg-slate-50/80 hover:bg-white border rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-[#C81E1E] focus:ring-2 focus:ring-[#C81E1E]/20 transition ${
                                errors.customer_name ? 'border-[#C81E1E]' : 'border-slate-300'
                              }`}
                            />
                          </div>
                          {errors.customer_name && (
                            <p className="text-[10px] text-[#C81E1E] mt-0.5 font-medium">{errors.customer_name}</p>
                          )}
                        </div>

                        <div>
                          <label className="text-[11px] font-heading font-bold text-slate-700 block mb-1">
                            Company / Works Name *
                          </label>
                          <div className="relative">
                            <Building className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={formData.company}
                              onChange={e => setFormData({ ...formData, company: e.target.value })}
                              placeholder="e.g. Apex Auto Parts"
                              className={`w-full pl-8 pr-2.5 py-2 text-xs bg-slate-50/80 hover:bg-white border rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-[#C81E1E] focus:ring-2 focus:ring-[#C81E1E]/20 transition ${
                                errors.company ? 'border-[#C81E1E]' : 'border-slate-300'
                              }`}
                            />
                          </div>
                          {errors.company && (
                            <p className="text-[10px] text-[#C81E1E] mt-0.5 font-medium">{errors.company}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-heading font-bold text-slate-700 block mb-1">
                            Phone / Mobile *
                          </label>
                          <div className="relative">
                            <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={e => setFormData({ ...formData, phone: e.target.value })}
                              placeholder="e.g. +91 95852 62522"
                              className={`w-full pl-8 pr-2.5 py-2 text-xs bg-slate-50/80 hover:bg-white border rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-[#C81E1E] focus:ring-2 focus:ring-[#C81E1E]/20 transition ${
                                errors.phone ? 'border-[#C81E1E]' : 'border-slate-300'
                              }`}
                            />
                          </div>
                          {errors.phone && (
                            <p className="text-[10px] text-[#C81E1E] mt-0.5 font-medium">{errors.phone}</p>
                          )}
                        </div>

                        <div>
                          <label className="text-[11px] font-heading font-bold text-slate-700 block mb-1">
                            Location / City
                          </label>
                          <div className="relative">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={formData.location}
                              onChange={e => setFormData({ ...formData, location: e.target.value })}
                              placeholder="e.g. Coimbatore, Tamil Nadu"
                              className="w-full pl-8 pr-2.5 py-2 text-xs bg-slate-50/80 hover:bg-white border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-[#C81E1E] focus:ring-2 focus:ring-[#C81E1E]/20 transition"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-heading font-bold text-slate-700 block mb-1">
                          Email Address (Optional)
                        </label>
                        <div className="relative">
                          <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            placeholder="e.g. purchase@company.com"
                            className={`w-full pl-8 pr-2.5 py-2 text-xs bg-slate-50/80 hover:bg-white border rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-[#C81E1E] focus:ring-2 focus:ring-[#C81E1E]/20 transition ${
                              errors.email ? 'border-[#C81E1E]' : 'border-slate-300'
                            }`}
                          />
                        </div>
                        {errors.email && (
                          <p className="text-[10px] text-[#C81E1E] mt-0.5 font-medium">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-[11px] font-heading font-bold text-slate-700 block mb-1">
                          Machinery Requirement / Notes
                        </label>
                        <textarea
                          rows={2}
                          value={formData.message}
                          onChange={e => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Specific bed length, spindle power, controller preference, or delivery requirements..."
                          className="w-full p-2.5 text-xs bg-slate-50/80 hover:bg-white border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:border-[#C81E1E] focus:ring-2 focus:ring-[#C81E1E]/20 transition"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-[#C81E1E] to-[#A81717] hover:from-[#B31919] hover:to-[#911313] active:bg-[#991414] disabled:bg-slate-400 text-white font-heading font-black text-xs sm:text-sm tracking-wider uppercase rounded-xl shadow-lg shadow-red-900/25 flex items-center justify-center gap-2 transition cursor-pointer"
                      >
                        <Send className="w-4 h-4 text-[#F5A623]" />
                        <span>{isSubmitting ? 'Submitting Enquiry...' : 'Submit Formal RFQ to Factory'}</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Bottom Security Footer */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#C81E1E]" />
                  Direct Factory Pricing • No Middlemen
                </span>
                <span className="font-heading font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded text-[10px]">
                  ISO 9001:2015
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
