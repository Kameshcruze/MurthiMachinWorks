import React, { useState, useEffect } from 'react';
import { SUPABASE_SCHEMA_SQL } from '../../data/supabaseSchema';
import { useSettings } from '../../context/SettingsContext';
import { getSupabaseConfig, isSupabaseConfigured, setCustomSupabaseConfig, clearCustomSupabaseConfig, getSupabaseClient } from '../../services/supabase';
import { dataService } from '../../services/dataService';
import { Database, Copy, Check, ShieldCheck, Terminal, ExternalLink, Key, CheckCircle2, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';

export const AdminDatabaseSetup: React.FC = () => {
  const { showToast } = useSettings();
  const [copied, setCopied] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const currentConfig = getSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.url);
  const [supabaseKey, setSupabaseKey] = useState(currentConfig.key);

  const isConnected = isSupabaseConfigured();

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopied(true);
    showToast('SQL Copied', 'Full PostgreSQL schema script copied to clipboard.', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      showToast('Missing Fields', 'Please enter both Supabase Project URL and Anon Public Key.', 'warning');
      return;
    }

    setTestStatus('testing');
    setTestMessage('Verifying connection with Supabase...');

    try {
      setCustomSupabaseConfig(supabaseUrl.trim(), supabaseKey.trim());
      const client = getSupabaseClient();
      if (!client) {
        throw new Error('Failed to initialize Supabase client.');
      }

      // Test a light query
      const { data, error } = await client.from('site_settings').select('id').limit(1);
      
      if (error && error.code === '42P01') {
        // Table doesn't exist yet, but connection succeeded!
        setTestStatus('success');
        setTestMessage('Connected to Supabase! (Tables not found yet — please run the SQL Schema script below in your Supabase SQL Editor).');
        showToast('Connected to Supabase', 'Credentials verified. Run the SQL schema to create tables.', 'info');
      } else if (error) {
        setTestStatus('error');
        setTestMessage(`Supabase responded with: ${error.message}`);
        showToast('Connection Warning', error.message, 'warning');
      } else {
        setTestStatus('success');
        setTestMessage('Connected successfully! Supabase database and tables are online.');
        showToast('Connection Active', 'Supabase PostgreSQL database is connected.', 'success');
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(err.message || 'Failed to connect to Supabase.');
      showToast('Connection Failed', err.message || 'Check URL and Key', 'error');
    }
  };

  const handleDisconnect = () => {
    clearCustomSupabaseConfig();
    setSupabaseUrl('');
    setSupabaseKey('');
    setTestStatus('idle');
    setTestMessage('');
    showToast('Disconnected', 'Reverted to local client storage.', 'info');
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      const res = await dataService.seedSupabase(true);
      if (res.success) {
        showToast('Seeding Complete', res.message, 'success');
        setTestStatus('success');
        setTestMessage('Supabase database populated with all machine tools and categories.');
      } else {
        showToast('Seeding Issue', res.message, 'warning');
        setTestStatus('error');
        setTestMessage(res.message);
      }
    } catch (err: any) {
      showToast('Seeding Error', err.message || 'Failed to seed data', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="font-heading font-bold text-xl text-slate-900">
          Supabase PostgreSQL Setup & Migration Guide
        </h2>
        <p className="text-xs text-slate-500">
          Follow these 4 simple steps to connect your Murthi Machine Works catalog to a live Supabase PostgreSQL backend.
        </p>
      </div>

      {/* Step by Step Flow */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center">
            1
          </div>
          <h4 className="font-bold text-xs text-slate-900">Create Project</h4>
          <p className="text-[11px] text-slate-500 leading-normal">
            Sign up at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-amber-600 font-semibold underline">supabase.com</a> and create a new project.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center">
            2
          </div>
          <h4 className="font-bold text-xs text-slate-900">Run SQL Schema</h4>
          <p className="text-[11px] text-slate-500 leading-normal">
            Open the <b>SQL Editor</b> in Supabase, paste the schema below, and click <b>Run</b>.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center">
            3
          </div>
          <h4 className="font-bold text-xs text-slate-900">Copy API Keys</h4>
          <p className="text-[11px] text-slate-500 leading-normal">
            Go to <b>Project Settings → API</b> and copy your <b>Project URL</b> & <b>anon public key</b>.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs font-black flex items-center justify-center">
            4
          </div>
          <h4 className="font-bold text-xs text-slate-900">Connect & Sync</h4>
          <p className="text-[11px] text-slate-500 leading-normal">
            Paste them into the credentials form below and click <b>Connect Database</b>.
          </p>
        </div>
      </div>

      {/* Connection Config Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Key className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-heading font-bold text-sm text-slate-900">
                Supabase Credentials Connector
              </h3>
              <p className="text-xs text-slate-500">
                Connect your live database directly or via environment variables (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">VITE_SUPABASE_URL</code>).
              </p>
            </div>
          </div>

          <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
            isConnected
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'}`} />
            <span>{isConnected ? 'Supabase Live' : 'Local Fallback'}</span>
          </div>
        </div>

        <form onSubmit={handleSaveCredentials} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-800 block mb-1">
                Supabase Project URL
              </label>
              <input
                type="url"
                value={supabaseUrl}
                onChange={e => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full p-2.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-800 block mb-1">
                Supabase Anon (Public) Key
              </label>
              <input
                type="password"
                value={supabaseKey}
                onChange={e => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full p-2.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
          </div>

          {testMessage && (
            <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              testStatus === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : testStatus === 'error'
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-slate-100 text-slate-700'
            }`}>
              {testStatus === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : testStatus === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <RefreshCw className="w-4 h-4 text-slate-600 animate-spin shrink-0" />
              )}
              <span>{testMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div>
              {isConnected && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold underline"
                >
                  Disconnect & Revert to Local Storage
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSeedDatabase}
                disabled={isSeeding}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
                <span>{isSeeding ? 'Seeding...' : 'Seed Initial Products'}</span>
              </button>

              <button
                type="submit"
                disabled={testStatus === 'testing'}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5"
              >
                <span>{testStatus === 'testing' ? 'Connecting...' : 'Connect Database'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* SQL Migration Script Card */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-md">
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span className="font-bold">schema.sql (PostgreSQL 15+ compatible with Row-Level Security)</span>
          </div>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-amber-500 text-slate-950 hover:bg-amber-400 text-xs font-bold rounded-md flex items-center gap-1.5 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy All SQL'}</span>
          </button>
        </div>

        <div className="p-4 bg-slate-900/60 border-b border-slate-800/80 text-slate-400 text-xs space-y-1">
          <p className="font-semibold text-slate-200">What this script creates:</p>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-400">
            <li><code className="text-amber-300">categories</code>: Machinery types & divisions with slug, sorting, and image URLs.</li>
            <li><code className="text-amber-300">products</code>: Complete machinery models, SKUs, pricing, specifications JSONB, and features.</li>
            <li><code className="text-amber-300">product_images</code>: Image galleries and primary thumbnail mappings.</li>
            <li><code className="text-amber-300">enquiries</code> & <code className="text-amber-300">enquiry_items</code>: Customer quotation RFQ submissions.</li>
            <li><code className="text-amber-300">site_settings</code>: Company profile, GSTIN, WhatsApp hotline, and factory location.</li>
            <li><code className="text-amber-300">RLS Policies</code>: Public read for catalog, public insert for enquiries, and secure admin access.</li>
          </ul>
        </div>

        <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-96 leading-relaxed">
          {SUPABASE_SCHEMA_SQL}
        </pre>
      </div>
    </div>
  );
};

export const AdminSqlSetup = AdminDatabaseSetup;


