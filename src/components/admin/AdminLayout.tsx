import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '../../context/NavigationContext';
import { useSettings } from '../../context/SettingsContext';
import { getClientIp } from '../../utils/ipService';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  FileSpreadsheet,
  Settings,
  LogOut,
  ExternalLink,
  Shield,
  Database,
  Menu,
  X,
  Bell,
  Activity,
  Users,
  UserCheck,
  Lock
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeSection: string;
  onSelectSection: (section: string) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeSection,
  onSelectSection
}) => {
  const { user, isAdmin, isSuperAdmin, logout } = useAuth();
  const { navigateTo } = useNavigation();
  const { settings } = useSettings();
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);
  const [currentIp, setCurrentIp] = useState<string>('127.0.0.1');

  useEffect(() => {
    getClientIp().then(ip => setCurrentIp(ip)).catch(() => {});
  }, []);

  // Define full list of navigation items with admin-only flag
  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
    { id: 'products', label: 'Machinery Catalog (CRUD)', icon: Package, adminOnly: false },
    { id: 'categories', label: 'Categories (CRUD)', icon: FolderTree, adminOnly: false },
    { id: 'enquiries', label: 'Enquiries / RFQ Leads', icon: FileSpreadsheet, adminOnly: false },
    { id: 'audit-logs', label: 'Audit Logs (IP & User)', icon: Activity, highlight: true, adminOnly: true },
    { id: 'team', label: 'Employee Access & Roles', icon: Users, adminOnly: true },
    { id: 'settings', label: 'Website Settings', icon: Settings, adminOnly: true },
  ];

  // Filter items: Only show admin-only tabs to admin/super_admin users
  const navItems = allNavItems.filter(item => !item.adminOnly || isAdmin);

  const isRestrictedCurrentSection = !isAdmin && (
    activeSection === 'audit-logs' ||
    activeSection === 'audit' ||
    activeSection === 'team' ||
    activeSection === 'employees' ||
    activeSection === 'users' ||
    activeSection === 'settings' ||
    activeSection === 'database' ||
    activeSection === 'sql-setup' ||
    activeSection === 'supabase'
  );

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'super_admin':
        return { label: 'SUPER ADMIN', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
      case 'admin':
        return { label: 'ADMIN', bg: 'bg-blue-500/20 text-blue-400 border-blue-500/40' };
      case 'manager':
        return { label: 'MANAGER', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
      case 'editor':
        return { label: 'CATALOG EDITOR', bg: 'bg-purple-500/20 text-purple-400 border-purple-500/40' };
      case 'sales':
        return { label: 'SALES REP', bg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' };
      default:
        return { label: 'STAFF USER', bg: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  const userRoleBadge = getRoleBadge(user?.role);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-slate-950 text-white flex flex-col justify-between border-r border-slate-800 transition-transform duration-300 ${
          isMobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Top */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg font-heading shadow-md">
              M
            </div>
            <div>
              <h2 className="font-heading font-bold text-sm tracking-tight text-white leading-none">
                Murthi Admin
              </h2>
              <p className="text-[10px] text-amber-400 font-mono mt-1">
                {isAdmin ? 'Admin Console' : 'Staff Portal'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsMobileNavOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id || 
              (item.id === 'sql-setup' && (activeSection === 'database' || activeSection === 'supabase')) ||
              (item.id === 'database' && activeSection === 'sql-setup');
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectSection(item.id);
                  setIsMobileNavOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.highlight && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                    isActive ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    LIVE IP
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Footer with Live Employee Profile & IP */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 space-y-3">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold font-heading">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate max-w-[110px]">
                    {user?.name || 'Murthi User'}
                  </p>
                  <p className="text-[10px] text-amber-400 font-mono truncate max-w-[110px]">
                    ID: {user?.id || 'emp-101'}
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                title="Logout from portal"
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Role Badge */}
            <div className="flex items-center justify-between">
              <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md border ${userRoleBadge.bg}`}>
                {userRoleBadge.label}
              </span>
              <span className="text-[10px] text-slate-400 truncate max-w-[90px]">
                {user?.department || 'Operations'}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigateTo('home')}
            className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-[11px] font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition"
          >
            <span>Open Public Storefront</span>
            <ExternalLink className="w-3 h-3 text-amber-400" />
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-heading font-bold text-base sm:text-lg text-slate-900 capitalize leading-none">
                {activeSection === 'audit-logs'
                  ? 'Audit & Activity Logs'
                  : activeSection === 'team'
                  ? 'Employee Access & User Management'
                  : activeSection.replace('-', ' ')}
              </h1>
              <p className="text-[11px] text-slate-500 mt-0.5 hidden sm:block">
                Murthi Machine Works • Industrial Portal Control
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Active User IP Pill */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-500 font-medium">Employee IP:</span>
              <span className="font-mono font-bold text-slate-800">{currentIp}</span>
              <span className="text-slate-300">|</span>
              <span className="font-semibold text-amber-600 font-mono">
                {user?.id || 'emp-101'}
              </span>
            </div>

            {/* Audit Logs button visible ONLY to Admin */}
            {isAdmin && (
              <button
                onClick={() => onSelectSection('audit-logs')}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                  activeSection === 'audit-logs'
                    ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
                title="View Audit Logs (Admin Only)"
              >
                <Activity className="w-4 h-4 text-amber-600" />
                <span className="hidden md:inline">Audit Logs</span>
              </button>
            )}
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-8 flex-1 overflow-x-hidden">
          {isRestrictedCurrentSection ? (
            <div className="max-w-2xl mx-auto my-12 bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-bold text-lg text-slate-900">
                  Administrator Privileges Required
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  This feature (Audit Logs, Employee Management, Website Settings, or Supabase SQL Setup) is restricted exclusively to Admin accounts. Other users do not have permissions to view or edit this section.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => onSelectSection('dashboard')}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold rounded-xl transition shadow-xs"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
};

