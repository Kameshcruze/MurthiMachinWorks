import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { dataService } from '../../services/dataService';
import {
  Sliders,
  Building,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Save,
  RotateCcw,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, showToast } = useSettings();
  const [formData, setFormData] = useState({ ...settings });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings(formData);
      showToast('Settings Saved', 'Business and contact configurations updated.', 'success');
    } catch (err) {
      showToast('Error', 'Failed to save settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDemoData = async () => {
    if (window.confirm('Reset catalog database to initial default factory products and categories? Any new custom items will be overwritten with factory defaults.')) {
      try {
        dataService.resetToDemoData();
        showToast('Reset Complete', 'Default machinery catalog re-initialized.', 'success');
      } catch (e) {
        showToast('Reset Error', 'Could not reset database.', 'error');
      }
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Brand Identity */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-base text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Building className="w-4 h-4 text-amber-500" />
            Company & Business Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-800 block mb-1">
                Business Legal Name
              </label>
              <input
                type="text"
                value={formData.business_name}
                onChange={e => setFormData({ ...formData, business_name: e.target.value })}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-800 block mb-1">
                Brand Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-800 block mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={formData.currency_symbol}
                onChange={e => setFormData({ ...formData, currency_symbol: e.target.value })}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-800 block mb-1">
                GST / Tax Label
              </label>
              <input
                type="text"
                value="GST (18% Applicable)"
                readOnly
                className="w-full p-2.5 text-xs bg-slate-100 border border-slate-300 rounded-lg text-slate-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-800 block mb-1">
                Testing Metrology Code
              </label>
              <input
                type="text"
                value="IS:1878 / ISO 9001"
                readOnly
                className="w-full p-2.5 text-xs bg-slate-100 border border-slate-300 rounded-lg text-slate-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Contact Numbers & Channels */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-base text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            Communication & RFQ Routing
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-800 block mb-1">
                Official WhatsApp Number (With Country Code)
              </label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="+91 98422 54321"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
              <p className="text-[10px] text-slate-500 mt-1">
                All 1-Click WhatsApp Enquiry buttons will redirect to this number.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-800 block mb-1">
                Direct Phone Hotline
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98422 54321"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-800 block mb-1">
                Commercial Inquiries Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="sales@murthimachineworks.com"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-800 block mb-1">
                Factory Working Hours
              </label>
              <input
                type="text"
                value={formData.working_hours}
                onChange={e => setFormData({ ...formData, working_hours: e.target.value })}
                placeholder="Mon - Sat: 8:30 AM - 6:30 PM IST"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-800 block mb-1">
              Factory Physical Address
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>

      {/* Database Maintenance & Reset Card */}
      <div className="bg-white rounded-xl border border-rose-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-rose-100">
          <div>
            <h3 className="font-heading font-bold text-base text-rose-950">
              Database Re-Initialization & Seed Data
            </h3>
            <p className="text-xs text-slate-600">
              Restore the full factory sample dataset of Heavy Lathes, CNC Mills, Radial Drills, and Hydraulic Presses.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetDemoData}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Catalog</span>
          </button>
        </div>
      </div>
    </div>
  );
};
