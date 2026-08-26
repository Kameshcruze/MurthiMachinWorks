import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { ShieldCheck, ChevronRight } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';

export const PrivacyPage: React.FC = () => {
  const { settings } = useSettings();
  const { navigateTo } = useNavigation();

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <button onClick={() => navigateTo('home')} className="hover:text-amber-400">
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-amber-400 font-semibold">Privacy Policy</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Privacy Policy & Data Protection
          </h1>
          <p className="text-xs text-slate-300">
            Last Updated: March 2026 • {settings.business_name}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-heading font-bold text-base text-slate-900">1. Information We Collect</h2>
            <p>
              At {settings.business_name}, we collect business contact details such as company name, representative name, phone number, email address, and machinery specifications submitted through our Request for Quotation (RFQ) and contact forms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading font-bold text-base text-slate-900">2. Use of Business Information</h2>
            <p>
              The information provided is utilized exclusively to formulate customized engineering quotations, coordinate factory demonstrations, process machinery orders, and provide after-sales warranty support. We do not sell or rent commercial data to any third-party marketing firms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading font-bold text-base text-slate-900">3. Direct WhatsApp & Digital Communications</h2>
            <p>
              When initiating enquiries via WhatsApp or email, communications are encrypted and used solely by our factory engineers to share technical data sheets, foundation drawings, and freight estimation details.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading font-bold text-base text-slate-900">4. Contacting Data Officer</h2>
            <p>
              For queries concerning industrial data retention, please contact our administrative office at <strong>{settings.email}</strong> or call <strong>{settings.phone}</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
