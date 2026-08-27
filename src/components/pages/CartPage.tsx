import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import { useNavigation } from '../../context/NavigationContext';
import { dataService } from '../../services/dataService';
import { formatImageUrl, formatPrice, generateWhatsAppCartLink } from '../../utils/helpers';
import {
  ShoppingCart,
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
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CartPage: React.FC = () => {
  const { items, removeFromCart, updateQuantity, clearCart, totalItems } = useCart();
  const { settings, showToast } = useSettings();
  const { navigateTo } = useNavigation();

  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    whatsapp: '',
    email: '',
    company: '',
    location: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEnquiryId, setSubmittedEnquiryId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_name.trim() || !formData.phone.trim() || !formData.company.trim()) {
      showToast('Required Fields Missing', 'Please provide contact person, company name, and phone number.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const newEnq = await dataService.createEnquiry(
        {
          customer_name: formData.customer_name.trim(),
          phone: formData.phone.trim(),
          whatsapp: formData.whatsapp.trim() || formData.phone.trim(),
          email: formData.email.trim() || 'sales@murthimachineworks.com',
          company: formData.company.trim(),
          location: formData.location.trim() || 'India',
          message: formData.message.trim() || 'Please send detailed formal quotation and machine dimension catalogs.'
        },
        items
      );

      setSubmittedEnquiryId(newEnq.id);
      showToast('Enquiry Submitted', 'Our Senior Sales Engineer will contact you within 2 business hours.', 'success');
      try {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}
      clearCart();
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to submit enquiry. Please use WhatsApp for immediate quotation.', 'error');
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

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <button onClick={() => navigateTo('home')} className="hover:text-amber-400">
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <button onClick={() => navigateTo('products')} className="hover:text-amber-400">
              Products
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-amber-400 font-semibold">Enquiry List & RFQ</span>
          </div>

          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Machinery Quotation / RFQ List
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Review selected machines, adjust required batch quantities, and submit for factory ex-works / CIF pricing.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
        {submittedEnquiryId ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-5 shadow-xs">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <h2 className="font-heading font-bold text-2xl text-slate-900">
                Formal RFQ Received Successfully
              </h2>
              <p className="text-xs font-mono text-slate-500">
                Reference Order / RFQ Number: <strong className="text-slate-900">{submittedEnquiryId}</strong>
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Thank you for your enquiry. Murthi Machine Works engineering estimation team has logged your requirement and will share complete technical specifications and pricing breakdown.
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <button
                onClick={handleWhatsAppSend}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow flex items-center justify-center gap-2 transition"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>Forward Quote to WhatsApp Sales Desk</span>
              </button>
              <button
                onClick={() => {
                  setSubmittedEnquiryId(null);
                  navigateTo('products');
                }}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Explore More Machine Tools
              </button>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="font-heading font-bold text-lg text-slate-900">
                Your Quotation List is Empty
              </h2>
              <p className="text-xs text-slate-500">
                Browse our machine catalog and click "Add to RFQ" to compile an itemized technical quotation.
              </p>
            </div>
            <button
              onClick={() => navigateTo('products')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition shadow"
            >
              <span>Explore Machine Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Items List */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-heading font-bold text-base text-slate-900">
                    Selected Machinery ({totalItems} units)
                  </h3>
                  <button
                    onClick={clearCart}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {items.map(item => (
                    <div key={item.product_id} className="py-4 flex items-center gap-4">
                      <img
                        src={formatImageUrl(item.image_url)}
                        alt={item.product_name}
                        className="w-16 h-16 object-cover rounded-lg border border-slate-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {item.product_name}
                        </h4>
                        <p className="text-xs font-mono text-slate-500">SKU: {item.sku}</p>
                        {item.price && item.price > 0 ? (
                          <p className="text-xs font-bold text-slate-900 mt-0.5">
                            {formatPrice(item.price, settings.currency_symbol)}
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Price on Request</p>
                        )}
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-1 bg-slate-100 border border-slate-300 rounded px-1.5 py-0.5">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="p-1 text-slate-600 hover:text-slate-900"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-6 text-center font-mono">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="p-1 text-slate-600 hover:text-slate-900"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Instant WhatsApp Multi-product Forward Banner */}
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-4 mt-4">
                  <div>
                    <p className="text-xs font-bold text-emerald-950">Immediate WhatsApp Assistance?</p>
                    <p className="text-[11px] text-emerald-800">
                      Send this entire machine list directly to our factory sales coordinator.
                    </p>
                  </div>
                  <button
                    onClick={handleWhatsAppSend}
                    className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 shrink-0 transition"
                  >
                    <MessageSquare className="w-4 h-4 fill-current" />
                    <span>WhatsApp List</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Submission Form */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h3 className="font-heading font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
                  Company & Delivery Information
                </h3>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Contact Person Name *
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={formData.customer_name}
                        onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                        placeholder="e.g. S. Murugan"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Company / Workshop Name *
                    </label>
                    <div className="relative">
                      <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={formData.company}
                        onChange={e => setFormData({ ...formData, company: e.target.value })}
                        placeholder="e.g. Precision Components Pvt Ltd"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Phone / Mobile *
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="e.g. +91 95852 62522"
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        City / Location
                      </label>
                      <div className="relative">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={formData.location}
                          onChange={e => setFormData({ ...formData, location: e.target.value })}
                          placeholder="e.g. Coimbatore, TN"
                          className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. purchase@precision.com"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Custom Engineering Notes / Spindle Specs
                    </label>
                    <textarea
                      rows={2}
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Specify optional accessories (3-jaw chuck, DRO, coolant pump, rapid traverse)..."
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow flex items-center justify-center gap-2 transition"
                  >
                    <Send className="w-4 h-4 text-amber-400" />
                    <span>{isSubmitting ? 'Submitting RFQ...' : 'Submit Quotation Request to Factory'}</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
