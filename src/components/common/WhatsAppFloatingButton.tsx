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
    const defaultText = `Hello Murthi Machin Works, I am looking for machinery details & quotation.`;
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
                    Murthi Machin Works
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

      {/* Floating Trigger Button with Ambient Pulse Effect */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative group w-12 h-12 rounded-full bg-gradient-to-tr from-[#1EBE5D] to-[#25D366] text-white shadow-lg hover:shadow-xl shadow-emerald-600/30 flex items-center justify-center transition-all duration-300 focus:outline-none"
        aria-label="Contact on WhatsApp"
        id="btn-whatsapp-floating"
      >
        {/* Ambient Ring Wave Animation */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping pointer-events-none" />
        )}

        {isOpen ? (
          <X className="w-5 h-5 transition-transform duration-300 rotate-90" />
        ) : (
          <div className="relative flex items-center justify-center">
            <MessageSquare className="w-5 h-5 fill-current transition-transform duration-300 group-hover:scale-110" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#F5A623] rounded-full border-2 border-slate-900" />
          </div>
        )}
      </motion.button>
    </div>
  );
};

