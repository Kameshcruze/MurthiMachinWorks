import React, { useState, useEffect } from 'react';
import { EmployeeUser } from '../../types';
import { dataService, DATA_CHANGE_EVENT } from '../../services/dataService';
import { isSupabaseConfigured } from '../../services/supabase';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  UserPlus,
  Shield,
  KeyRound,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Globe,
  Clock,
  Mail,
  Building,
  Lock,
  X,
  RefreshCw,
  Search,
  Eye,
  EyeOff,
  Cloud,
  Check,
  Phone
} from 'lucide-react';

export const AdminTeam: React.FC = () => {
  const { showToast } = useSettings();
  const { user: currentAdmin } = useAuth();

  const [employees, setEmployees] = useState<EmployeeUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [revealedPasswords, setRevealedPasswords] = useState<{ [id: string]: boolean }>({});
  const [showFormPassword, setShowFormPassword] = useState<boolean>(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeUser | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'editor' as EmployeeUser['role'],
    role_label: 'Catalog Specialist',
    department: 'Catalog & Engineering',
    phone: '',
    is_active: true
  });

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const list = await dataService.getEmployees();
      setEmployees(list);
    } catch (e) {
      console.warn('Failed to load employees:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncCloud = async () => {
    setIsSyncing(true);
    try {
      const list = await dataService.getEmployees();
      setEmployees(list);
      showToast('Cloud Synced', 'Refreshed user accounts from Supabase PostgreSQL database.', 'success');
    } catch (e: any) {
      showToast('Sync Failed', e.message || 'Unable to sync with Supabase.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadEmployees();
    window.addEventListener(DATA_CHANGE_EVENT, loadEmployees);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, loadEmployees);
  }, []);

  const toggleRevealPassword = (id: string) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const openCreateModal = () => {
    setEditingEmployee(null);
    setShowFormPassword(false);
    setFormData({
      name: '',
      email: '',
      password: 'user123',
      role: 'editor',
      role_label: 'Catalog Specialist',
      department: 'Machinery Catalog',
      phone: '+91 95852 62522',
      is_active: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (emp: EmployeeUser) => {
    setEditingEmployee(emp);
    setShowFormPassword(false);
    setFormData({
      name: emp.name,
      email: emp.email,
      password: emp.password || '',
      role: emp.role,
      role_label: emp.role_label || emp.role,
      department: emp.department || 'Production',
      phone: emp.phone || '',
      is_active: emp.is_active
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      showToast('Validation Error', 'Name and Email are required.', 'error');
      return;
    }
    if (!formData.password.trim()) {
      showToast('Validation Error', 'A login password is required.', 'error');
      return;
    }

    try {
      if (editingEmployee) {
        await dataService.updateEmployee(editingEmployee.id, formData);
        showToast('Staff Updated', `Updated credentials and password for ${formData.name} in Supabase.`, 'success');
      } else {
        await dataService.createEmployee(formData);
        showToast('Employee Added', `Created login account for ${formData.name} in Supabase.`, 'success');
      }
      setIsModalOpen(false);
      loadEmployees();
    } catch (e: any) {
      showToast('Error', e.message || 'Failed to save employee profile.', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (id === currentAdmin?.id) {
      showToast('Action Blocked', 'You cannot delete your own active administrator account.', 'warning');
      return;
    }

    if (!window.confirm(`Are you sure you want to revoke access and delete login credentials for "${name}" from Supabase?`)) {
      return;
    }

    await dataService.deleteEmployee(id);
    showToast('Account Removed', `Revoked portal access for ${name}.`, 'info');
    loadEmployees();
  };

  const handleToggleStatus = async (emp: EmployeeUser) => {
    const newStatus = !emp.is_active;
    await dataService.updateEmployee(emp.id, { is_active: newStatus });
    showToast(
      newStatus ? 'Account Activated' : 'Account Suspended',
      `${emp.name}'s account is now ${newStatus ? 'active' : 'suspended'}.`,
      newStatus ? 'success' : 'warning'
    );
    loadEmployees();
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (emp.department && emp.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (emp.role_label && emp.role_label.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isSupabaseLive = isSupabaseConfigured();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-heading font-bold text-lg sm:text-xl text-white">
                Employee Access & User Management
              </h2>
              {isSupabaseLive ? (
                <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                  <Cloud className="w-3 h-3" /> SUPABASE CLOUD SYNC
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                  LOCAL + HYBRID SYNC
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Create, update, and manage employee login accounts with custom passwords, roles, and permissions stored centrally in Supabase. Every employee can log into the portal from any device, and all actions are recorded in the shared audit logs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSyncCloud}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition"
            title="Refresh accounts from Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
            <span>Sync Cloud</span>
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User Account</span>
          </button>
        </div>
      </div>

      {/* Search and Stats Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search users by name, email, role, department or ID..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>Total Staff Accounts: <strong className="text-slate-800">{employees.length}</strong></span>
          <span>•</span>
          <span>Active Logins: <strong className="text-emerald-600">{employees.filter(e => e.is_active).length}</strong></span>
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map(emp => {
          const isPassRevealed = revealedPasswords[emp.id];
          return (
            <div
              key={emp.id}
              className={`bg-white rounded-2xl border ${
                emp.is_active ? 'border-slate-200' : 'border-rose-200 bg-rose-50/20'
              } p-5 shadow-2xs space-y-4 hover:shadow-md transition flex flex-col justify-between`}
            >
              {/* Card Top */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 font-bold flex items-center justify-center font-heading text-sm shadow-xs">
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-sm text-slate-900">
                        {emp.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono">
                        ID: <span className="font-semibold text-slate-800">{emp.id}</span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      emp.is_active
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${emp.is_active ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                    {emp.is_active ? 'ACTIVE' : 'SUSPENDED'}
                  </span>
                </div>

                {/* Badges & Meta */}
                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-800 truncate">{emp.email}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{emp.department || 'Operations'}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-bold text-amber-600">{emp.role_label || emp.role}</span>
                  </div>

                  {emp.phone && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-700">{emp.phone}</span>
                    </div>
                  )}

                  {/* Password Viewer for Admin */}
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 mt-2">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-[11px] text-slate-500">Password:</span>
                      <span className="font-mono text-xs font-semibold text-slate-800">
                        {isPassRevealed ? emp.password || '••••••••' : '••••••••'}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleRevealPassword(emp.id)}
                      className="text-slate-400 hover:text-slate-700 p-1"
                      title={isPassRevealed ? 'Hide password' : 'Show password'}
                    >
                      {isPassRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Last Activity Footnote */}
              <div className="pt-3 border-t border-slate-100 text-[11px] space-y-1 bg-slate-50/60 p-2.5 rounded-xl">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" /> Last Login:
                  </span>
                  <span className="font-medium text-slate-700">
                    {emp.last_login ? new Date(emp.last_login).toLocaleDateString('en-IN') : 'Never logged in'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-500">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3 text-slate-400" /> Last Known IP:
                  </span>
                  <span className="font-mono text-slate-700 font-semibold">
                    {emp.last_ip || 'Not recorded'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  onClick={() => handleToggleStatus(emp)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                    emp.is_active
                      ? 'text-rose-600 bg-rose-50 border-rose-200 hover:bg-rose-100'
                      : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {emp.is_active ? 'Suspend Login' : 'Activate Login'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(emp)}
                    title="Edit details / reset password"
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit / Password</span>
                  </button>

                  {emp.id !== currentAdmin?.id && (
                    <button
                      onClick={() => handleDelete(emp.id, emp.name)}
                      title="Delete employee account"
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500 text-slate-950">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-white">
                    {editingEmployee ? `Edit User: ${editingEmployee.name}` : 'Add New Employee Login'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Synced with Supabase Cloud for cross-device access
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Portal Login Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ramesh@murthimachineworks.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Login Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showFormPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter password..."
                      className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowFormPassword(!showFormPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showFormPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Admins can update or reset passwords at any time.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. Production & Milling"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Role Category & Permissions
                  </label>
                  <select
                    value={formData.role}
                    onChange={e => {
                      const r = e.target.value as EmployeeUser['role'];
                      let label = 'Staff';
                      if (r === 'super_admin') label = 'Super Administrator';
                      if (r === 'admin') label = 'Production Manager';
                      if (r === 'editor') label = 'Catalog Specialist';
                      if (r === 'sales') label = 'Sales Engineer';
                      if (r === 'viewer') label = 'Portal Viewer';
                      setFormData({ ...formData, role: r, role_label: label });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="editor">Catalog Specialist / Editor (Edit Products & View Logs)</option>
                    <option value="admin">Production Manager (Admin Access)</option>
                    <option value="super_admin">Super Administrator (Full User & Database Permissions)</option>
                    <option value="sales">Sales & RFQ Representative</option>
                    <option value="viewer">Viewer (Read-only + View Logs)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 95852 62522"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                    className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Account Active (Allowed to log into portal from any device)</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-md"
                >
                  {editingEmployee ? 'Save User Changes' : 'Create User Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

