import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { INITIAL_BRANCHES } from '../../data/initialData';
import { BranchLocation, SiteSettings } from '../../types';
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
  CheckCircle2,
  Lock,
  ExternalLink,
  Plus,
  Trash2,
  Compass,
  Star,
  Navigation
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, showToast } = useSettings();
  const { isAdmin } = useAuth();
  const [formData, setFormData] = useState<SiteSettings>({
    ...settings,
    branches: settings.branches && settings.branches.length > 0 ? settings.branches : INITIAL_BRANCHES
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData({
      ...settings,
      branches: settings.branches && settings.branches.length > 0 ? settings.branches : INITIAL_BRANCHES
    });
  }, [settings]);

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
          <Lock className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="font-heading font-bold text-lg text-slate-900">
            Website Settings Restricted
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Only Administrator accounts have permission to view or edit company credentials, branding, WhatsApp numbers, or system configurations.
          </p>
        </div>
      </div>
    );
  }

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

  const handleAddBranch = () => {
    const newBranch: BranchLocation = {
      id: `branch-${Date.now()}`,
      name: 'MURTHI MACHIN WORKS - ',
      address: '',
      google_maps_url: '',
      phone: '98422 66521',
      landmark: '',
      is_primary: false
    };
    setFormData(prev => ({
      ...prev,
      branches: [...(prev.branches || []), newBranch]
    }));
    showToast('New Branch Added', 'Fill in the branch title, address, and Google Maps URL.', 'info');
  };

  const handleBranchChange = (index: number, field: keyof BranchLocation, value: any) => {
    setFormData(prev => {
      const branches = [...(prev.branches || [])];
      branches[index] = { ...branches[index], [field]: value };

      if (field === 'is_primary' && value === true) {
        branches.forEach((b, i) => {
          if (i !== index) b.is_primary = false;
        });
        return {
          ...prev,
          branches,
          address: branches[index].address || prev.address,
          google_maps_url: branches[index].google_maps_url || prev.google_maps_url
        };
      }

      if (branches[index].is_primary && field === 'address') {
        return { ...prev, branches, address: value };
      }
      if (branches[index].is_primary && field === 'google_maps_url') {
        return { ...prev, branches, google_maps_url: value };
      }

      return { ...prev, branches };
    });
  };

  const handleRemoveBranch = (index: number) => {
    const branches = formData.branches || [];
    if (branches.length <= 1) {
      showToast('Cannot Remove', 'At least one factory or branch address is required.', 'warning');
      return;
    }
    const branchName = branches[index]?.name || 'Branch';
    if (window.confirm(`Are you sure you want to remove ${branchName}?`)) {
      setFormData(prev => {
        const filtered = (prev.branches || []).filter((_, i) => i !== index);
        if (filtered.length > 0 && !filtered.some(b => b.is_primary)) {
          filtered[0].is_primary = true;
        }
        return {
          ...prev,
          branches: filtered,
          address: filtered[0]?.address || prev.address,
          google_maps_url: filtered[0]?.google_maps_url || prev.google_maps_url
        };
      });
      showToast('Branch Removed', `${branchName} has been removed.`, 'info');
    }
  };

  const handleResetToDefaultBranches = () => {
    if (window.confirm('Reset addresses to the 3 official Coimbatore factory locations (Ondipudur, Ramanathapuram, Avarampalayam)?')) {
      setFormData(prev => ({
        ...prev,
        branches: INITIAL_BRANCHES,
        address: INITIAL_BRANCHES[0].address,
        google_maps_url: INITIAL_BRANCHES[0].google_maps_url
      }));
      showToast('Addresses Restored', 'Loaded the 3 official Coimbatore factory branches.', 'success');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl w-full">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="min-w-0">
              <label className="text-xs font-semibold text-slate-800 block mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={formData.currency_symbol}
                onChange={e => setFormData({ ...formData, currency_symbol: e.target.value })}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="min-w-0">
              <label className="text-xs font-semibold text-slate-800 block mb-1">
                GST / Tax Label
              </label>
              <input
                type="text"
                value="GST (18% Applicable)"
                readOnly
                className="w-full px-3 py-2.5 text-xs bg-slate-100 border border-slate-300 rounded-lg text-slate-600 font-medium"
              />
            </div>

            <div className="min-w-0">
              <label className="text-xs font-semibold text-slate-800 block mb-1">
                Testing Metrology Code
              </label>
              <input
                type="text"
                value="IS:1878 / ISO 9001"
                readOnly
                className="w-full px-3 py-2.5 text-xs bg-slate-100 border border-slate-300 rounded-lg text-slate-600 font-mono"
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
                placeholder="+91 95852 62522"
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
                placeholder="+91 95852 62522"
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
                placeholder="murthimachinworks@gmail.com"
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
                value={formData.working_hours || '10:00 AM - 6:00 PM'}
                onChange={e => setFormData({ ...formData, working_hours: e.target.value })}
                placeholder="10:00 AM - 6:00 PM"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Works, Showrooms & Branch Locations (Google Maps & Addresses) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5" id="admin-branches-section">
          {/* Section Header */}
          <div className="pb-4 border-b border-slate-100 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-[#C81E1E] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="font-heading font-bold text-base text-slate-900">
                  Works, Showrooms & Branch Locations
                </h3>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                  {(formData.branches || []).length} Active Addresses
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleResetToDefaultBranches}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                  title="Restore default 3 Coimbatore addresses"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset 3 Branches</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddBranch}
                  className="px-3.5 py-2 bg-[#C81E1E] hover:bg-[#B31919] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Branch</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Configure physical addresses and attached Google Maps URLs. When visitors click an address on the Contact Us page or footer, they are navigated directly to the attached Google Maps link.
            </p>
          </div>

          {/* Branch Cards List */}
          <div className="space-y-4">
            {(formData.branches && formData.branches.length > 0 ? formData.branches : INITIAL_BRANCHES).map((branch, index) => (
              <div
                key={branch.id || `branch-${index}`}
                className={`p-4 sm:p-5 rounded-xl border transition-all ${
                  branch.is_primary
                    ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-300/60'
                    : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Branch Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 mb-3.5 border-b border-slate-200/80">
                  <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <span className="font-heading font-black text-xs sm:text-sm text-slate-900 uppercase truncate max-w-xs sm:max-w-md">
                      {branch.name || `Branch #${index + 1}`}
                    </span>
                    {branch.is_primary ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-950 border border-amber-300 shrink-0">
                        <Star className="w-3 h-3 fill-amber-600 text-amber-700" />
                        <span>Primary Head Works</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleBranchChange(index, 'is_primary', true)}
                        className="text-[11px] font-semibold text-slate-500 hover:text-amber-700 hover:underline transition cursor-pointer shrink-0"
                      >
                        Set as Primary
                      </button>
                    )}
                  </div>

                  {(formData.branches || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBranch(index)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0"
                      title="Remove this branch address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Branch Form Inputs */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
                  {/* Branch Name */}
                  <div className="col-span-1 lg:col-span-7 min-w-0">
                    <label className="font-semibold text-slate-800 block mb-1">
                      Branch / Works Name *
                    </label>
                    <input
                      type="text"
                      value={branch.name}
                      onChange={e => handleBranchChange(index, 'name', e.target.value)}
                      placeholder="e.g. MURTHI MACHIN WORKS - ONDIPUDUR"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-semibold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>

                  {/* Branch Phone */}
                  <div className="col-span-1 lg:col-span-5 min-w-0">
                    <label className="font-semibold text-slate-800 block mb-1">
                      Direct Contact Phone
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={branch.phone || ''}
                        onChange={e => handleBranchChange(index, 'phone', e.target.value)}
                        placeholder="e.g. 98422 66521"
                        className="w-full pl-8 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Physical Address */}
                  <div className="col-span-1 lg:col-span-12">
                    <label className="font-semibold text-slate-800 block mb-1">
                      Full Physical Address *
                    </label>
                    <textarea
                      rows={2}
                      value={branch.address}
                      onChange={e => handleBranchChange(index, 'address', e.target.value)}
                      placeholder="SF NO 215/4C1, IRUGUR MAIN ROAD, ONDIPUTHUR, MEENA FURNITURE OPP, COIMBATORE -641016"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 leading-relaxed font-sans text-xs sm:text-sm"
                      required
                    />
                  </div>

                  {/* Google Maps URL with Live Test Link */}
                  <div className="col-span-1 lg:col-span-7 min-w-0">
                    <label className="font-semibold text-slate-800 block mb-1">
                      Attached Google Maps Navigation URL *
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1 min-w-0">
                        <Navigation className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="url"
                          value={branch.google_maps_url}
                          onChange={e => handleBranchChange(index, 'google_maps_url', e.target.value)}
                          placeholder="https://maps.app.goo.gl/..."
                          className="w-full pl-8 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-xs"
                          required
                        />
                      </div>
                      {branch.google_maps_url && (
                        <a
                          href={branch.google_maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
                          title="Verify destination in Google Maps"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Test Map</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Landmark / Area Note */}
                  <div className="col-span-1 lg:col-span-5 min-w-0">
                    <label className="font-semibold text-slate-800 block mb-1">
                      Landmark / Area Note
                    </label>
                    <input
                      type="text"
                      value={branch.landmark || ''}
                      onChange={e => handleBranchChange(index, 'landmark', e.target.value)}
                      placeholder="e.g. Opp. Meena Furniture"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>
            ))}
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
    </div>
  );
};
