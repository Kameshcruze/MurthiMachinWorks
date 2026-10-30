import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { ChevronRight } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';

export const TermsPage: React.FC = () => {
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
            <span className="text-amber-400 font-semibold">Terms & Conditions</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Commercial Terms & Manufacturing Conditions
          </h1>
          <p className="text-xs text-slate-300">
            Murthi Machine Works • Coimbatore, Tamil Nadu
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-heading font-bold text-base text-slate-900">1. Quotations & Validity</h2>
            <p>
              All prices displayed or communicated are Ex-Works Coimbatore unless specified as CIF. Official quotation documents remain valid for 30 days from the date of issuance due to raw material (cast iron & steel) market fluctuations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading font-bold text-base text-slate-900">2. Taxes & Duties</h2>
            <p>
              GST at prevailing government rates (standard 18% on machine tools and capital goods) applies to all commercial invoices. E-way bills and transit insurance must be confirmed prior to factory dispatch.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading font-bold text-base text-slate-900">3. Commissioning & Warranty</h2>
            <p>
              All Murthi Machine Works tools carry a standard 12-month mechanical warranty against manufacturing defects from the date of dispatch. Electrical motors and CNC controllers carry OEM standard warranties.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading font-bold text-base text-slate-900">4. Jurisdiction</h2>
            <p>
              All contracts and commercial disputes are subject to the exclusive jurisdiction of the courts of Coimbatore, Tamil Nadu, India.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
