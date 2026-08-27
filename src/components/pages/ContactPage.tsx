import React, { useState } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';
import { dataService } from '../../services/dataService';
import {
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  Building,
  User,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ContactPage: React.FC = () => {
  const { navigateTo } = useNavigation();
  const { settings, showToast } = useSettings();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    location: '',
    subject: 'General Machinery Enquiry',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
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

    setIsSubmitting(true);
    try {
      await dataService.createEnquiry(
        {
          customer_name: formData.name.trim(),
          phone: formData.phone.trim(),
          whatsapp: formData.phone.trim(),
          email: formData.email.trim() || 'sales@murthimachineworks.com',
          company: formData.company.trim(),
          location: formData.location.trim() || 'Coimbatore / India',
          message: `[${formData.subject}] ${formData.message.trim()}`
        },
        []
      );

      setIsSubmitted(true);
      showToast('Enquiry Sent', 'Our technical sales team will contact you shortly.', 'success');

      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
    } catch (err) {
      console.error('Contact error:', err);
      showToast('Error Sending', 'Failed to send message. Please reach out directly on WhatsApp.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cleanWhatsAppNumber = (settings.whatsapp || '+91 95852 62522').replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanWhatsAppNumber}?text=${encodeURIComponent(
    `Hello Murthi Machine Works, I would like to schedule a consultation regarding industrial machinery tools.`
  )}`;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white py-12 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <button onClick={() => navigateTo('home')} className="hover:text-amber-400 transition">
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-amber-400 font-semibold">Contact & Works Location</span>
          </div>

          <div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
              Get in Touch with Our Engineering Team
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Request formal quotations, discuss customized machine specifications, order replacement spares, or schedule a plant visit.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Contact Info Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Works Factory Location Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              <h3 className="font-heading font-bold text-lg text-slate-900 pb-3 border-b border-slate-100">
                Manufacturing Works & Headquarters
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-semibold mb-0.5">Factory & Office Address:</strong>
                    <p className="text-slate-600 leading-relaxed">
                      {settings.address || 'SF No. 248/2, Industrial Estate Road, Peelamedu, Coimbatore - 641004, Tamil Nadu, India'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-semibold mb-0.5">Direct Phone Line:</strong>
                    <a href={`tel:${settings.phone}`} className="text-slate-800 font-bold hover:text-amber-600 transition">
                      {settings.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-semibold mb-0.5">Instant WhatsApp Sales Desk:</strong>
                    <a href={waUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold hover:underline">
                      {settings.whatsapp}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-semibold mb-0.5">Commercial & Technical Inquiries:</strong>
                    <a href={`mailto:${settings.email}`} className="text-slate-800 font-medium hover:text-amber-600 transition">
                      {settings.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-900 font-semibold mb-0.5">Factory Working Hours:</strong>
                    <p className="text-slate-600">
                      Monday to Saturday: 8:30 AM – 6:30 PM IST<br />
                      Sunday: Technical Emergency Support Available
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp Callout Box */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-emerald-950">Quick Technical Consultation?</p>
                  <p className="text-[11px] text-emerald-800">Our machine tool designers are active on WhatsApp.</p>
                </div>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 shrink-0 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5 fill-current" />
                  <span>Chat Now</span>
                </a>
              </div>
            </div>

            {/* Industrial Trust Credentials */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>GST & Quality Credentials</span>
              </div>
              <div className="space-y-1 text-xs text-slate-300">
                <p><strong>GSTIN:</strong> 33AABCM9482L1Z4</p>
                <p><strong>Quality Standard:</strong> ISO 9001:2015 Metrology Certified</p>
                <p><strong>Testing Facility:</strong> Laser Interferometry Calibration Unit 2</p>
              </div>
            </div>
          </div>

          {/* Right: Contact Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            {isSubmitted ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-heading font-bold text-2xl text-slate-900">
                    Message Successfully Dispatched!
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    Thank you for reaching out to Murthi Machine Works. Our engineering estimation desk will review your requirements and respond with technical specifications and pricing.
                  </p>
                </div>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        name: '',
                        phone: '',
                        email: '',
                        company: '',
                        location: '',
                        subject: 'General Machinery Enquiry',
                        message: ''
                      });
                    }}
                    className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-heading font-bold text-lg text-slate-900">
                    Request Machinery Quotation / Factory Plant Visit
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Fill out your requirements below and our technical sales engineer will get back to you.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-800 block mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. S. Rajendran"
                        className={`w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                          errors.name ? 'border-rose-400' : 'border-slate-300'
                        }`}
                      />
                    </div>
                    {errors.name && <p className="text-[10px] text-rose-600 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-800 block mb-1">
                      Company / Workshop Name *
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={formData.company}
                        onChange={e => setFormData({ ...formData, company: e.target.value })}
                        placeholder="e.g. Precision Engineering Ltd"
                        className={`w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                          errors.company ? 'border-rose-400' : 'border-slate-300'
                        }`}
                      />
                    </div>
                    {errors.company && <p className="text-[10px] text-rose-600 mt-1">{errors.company}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-800 block mb-1">
                      Phone / Mobile Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. +91 95852 62522"
                        className={`w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                          errors.phone ? 'border-rose-400' : 'border-slate-300'
                        }`}
                      />
                    </div>
                    {errors.phone && <p className="text-[10px] text-rose-600 mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-800 block mb-1">
                      Email Address (Optional)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. contact@precision.com"
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-800 block mb-1">
                      City / State / Location
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g. Chennai, Tamil Nadu"
                        className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-800 block mb-1">
                      Inquiry Category
                    </label>
                    <select
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="New Machine Tool Quotation">New Machine Tool Quotation</option>
                      <option value="Custom Built Machinery Specification">Custom Built Machinery Specification</option>
                      <option value="Replacement Parts & Tooling Spares">Replacement Parts & Tooling Spares</option>
                      <option value="Plant Visit & Inspection Request">Plant Visit & Inspection Request</option>
                      <option value="Dealership / Distributorship Enquiry">Dealership / Distributorship Enquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-800 block mb-1">
                    Machinery Requirements & Technical Details
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Specify workpiece dimensions, bed length, swing diameter, spindle bore, power requirements, or target delivery timeline..."
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 disabled:bg-slate-600 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-amber-400" />
                  <span>{isSubmitting ? 'Sending Enquiry...' : 'Submit Inquiry to Sales Desk'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
