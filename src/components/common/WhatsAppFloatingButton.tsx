import React, { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { motion, AnimatePresence } from 'motion/react';

export const WhatsAppFloatingButton: React.FC = () => {
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  const cleanNumber = (settings.whatsapp || '+91 95852 62522').replace(/[^0-9]/g, '');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const defaultText = `Hello ${settings.business_name}, I have an enquiry regarding machine tools and industrial solutions. Please share your product catalog.`;
    const textToSend = customMsg.trim() || defaultText;
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(textToSend)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
    setCustomMsg('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="mb-4 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white shadow-inner">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm leading-tight">{settings.business_name}</h4>
                  <p className="text-xs text-emerald-100 flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                    Sales & Tech Support Online
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-emerald-100 hover:text-white p-1 rounded transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 text-xs text-slate-700 leading-relaxed">
              <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 mb-3">
                <p className="font-medium text-slate-900 mb-1">Industrial Machinery Help Desk</p>
                <p className="text-slate-600">
                  Welcome to Murthi Machine Works! Need instant technical specifications, layout drawings, or custom quotes?
                </p>
              </div>

              <form onSubmit={handleSend} className="space-y-2.5">
                <textarea
                  value={customMsg}
                  onChange={e => setCustomMsg(e.target.value)}
                  placeholder="Type your enquiry or machinery requirement..."
                  rows={2}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow flex items-center justify-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  Chat on WhatsApp Now
                </button>
              </form>
            </div>

            <div className="px-4 py-2 bg-slate-100 text-[10px] text-center text-slate-500">
              Direct reply from Coimbatore Works Sales Office
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-emerald-600/30 transition-all duration-300 hover:scale-105"
        aria-label="Contact on WhatsApp"
        id="btn-whatsapp-floating"
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5 fill-current" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-emerald-600 animate-ping"></span>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-emerald-600"></span>
        </div>
        <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">
          {isOpen ? 'Close Chat' : 'WhatsApp Enquiry'}
        </span>
      </button>
    </div>
  );
};
