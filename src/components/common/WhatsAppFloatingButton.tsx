import React, { useState } from 'react';
import { MessageSquare, X, Send, Sparkles, PhoneCall, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { motion, AnimatePresence } from 'motion/react';

export const WhatsAppFloatingButton: React.FC = () => {
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  const cleanNumber = (settings.whatsapp || '9842266521').replace(/[^0-9]/g, '');

  const quickPrompts = [
    'Price quote for Lathe Machines',
    'Used machinery catalog',
    'Machine repair & maintenance support',
    'Hydraulic press technical specs'
  ];

  const handleSend = (text?: string) => {
    const defaultText = `Hello Murthi Machine Works, I am looking for machinery details & quotation.`;
    const textToSend = text || customMsg.trim() || defaultText;
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(textToSend)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
    setCustomMsg('');
  };

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="mb-3 w-[calc(100vw-32px)] max-w-sm sm:w-84 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0A0A0A] via-[#1A1A1A] to-[#0A0A0A] text-white p-4 border-b-2 border-[#F5A623] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-[#F5A623] flex items-center justify-center text-slate-950 font-black text-xs shadow-md">
                    MMW
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-heading font-black text-sm text-white tracking-wide">
                    Murthi Machine Works
                  </h4>
                  <p className="text-[11px] text-[#F5A623] font-medium flex items-center gap-1">
                    <span>Direct Technical Support</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 space-y-3 bg-gradient-to-b from-slate-50 to-white text-xs">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-xs">
                <p className="font-heading font-bold text-slate-900 text-xs flex items-center gap-1.5 mb-1 text-[#C81E1E]">
                  <Sparkles className="w-3.5 h-3.5" />
                  Quick Machinery Inquiry
                </p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Connect directly with our engineering team in Coimbatore for instant quotes and technical specifications.
                </p>
              </div>

              {/* Quick Select Prompts */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Frequently Asked:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(prompt)}
                      className="text-left text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-[#F5A623]/20 hover:text-slate-950 hover:border-[#F5A623]/50 border border-slate-200 text-slate-700 transition font-medium active:scale-95"
                    >
                      {prompt} →
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="space-y-2 pt-1">
                <textarea
                  value={customMsg}
                  onChange={e => setCustomMsg(e.target.value)}
                  placeholder="Or type your custom requirement here..."
                  rows={2}
                  className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#25D366] text-slate-800 placeholder:text-slate-400 resize-none"
                />
                
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-3 bg-[#25D366] hover:bg-[#20ba5a] active:bg-[#1da851] text-white text-xs font-heading font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 transition active:scale-98"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>WhatsApp Quote</span>
                  </button>

                  <a
                    href="tel:9842266521"
                    className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-heading font-bold rounded-xl flex items-center justify-center gap-1.5 transition active:scale-98"
                    title="Direct Call"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-[#F5A623]" />
                  </a>
                </div>
              </form>
            </div>

            <div className="px-4 py-2 bg-slate-100 border-t border-slate-200/60 text-[10px] text-center text-slate-500 font-medium">
              ⚡ Typical response time: &lt; 15 minutes
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button with Ambient Pulse Effect & Authentic WhatsApp Icon */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative group w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xl hover:shadow-2xl shadow-emerald-600/40 border-2 border-white/20 flex items-center justify-center transition-all duration-300 focus:outline-none cursor-pointer"
        aria-label="Contact on WhatsApp"
        id="btn-whatsapp-floating"
      >
        {/* Ambient Ring Wave Animation */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-35 animate-ping pointer-events-none" />
        )}

        {isOpen ? (
          <X className="w-6 h-6 transition-transform duration-300 rotate-90 text-white" />
        ) : (
          <motion.div
            animate={{
              rotate: [0, -10, 10, -8, 8, -4, 4, 0],
              scale: [1, 1.05, 1.05, 1.03, 1.03, 1, 1, 1],
            }}
            transition={{
              repeat: Infinity,
              repeatDelay: 3.5,
              duration: 1.2,
              ease: 'easeInOut',
            }}
            className="flex items-center justify-center"
          >
            {/* Authentic Official WhatsApp SVG Logo */}
            <svg
              viewBox="0 0 448 512"
              className="w-8 h-8 fill-white drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
              aria-hidden="true"
            >
              <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
            </svg>
          </motion.div>
        )}
      </motion.button>
    </div>
  );
};

