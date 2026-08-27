/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default project credentials configured for Murthi Machine Works
const DEFAULT_SUPABASE_URL = 'https://apsqlkojfspbxzboowah.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwc3Fsa29qZnNwYnh6Ym9vd2FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NDc3ODMsImV4cCI6MjEwMzMyMzc4M30.fy1jI5cf4Nt7R5AjBhqqc42VpZ3plbzQnaqYsIfZTP8';

let supabaseClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export function getSupabaseConfig(): { url: string; key: string; isCustom: boolean } {
  // 1. Check for manual override in localStorage
  const localUrl = typeof localStorage !== 'undefined' ? localStorage.getItem('mmw_supabase_url') || '' : '';
  const localKey = typeof localStorage !== 'undefined' ? localStorage.getItem('mmw_supabase_anon_key') || '' : '';

  if (localUrl && localKey) {
    return { url: localUrl.trim(), key: localKey.trim(), isCustom: true };
  }

  // 2. Check for VITE_ environment variables (direct token for Vite static AST replacement)
  const envUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) || '';
  const envKey = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) || '';

  if (envUrl && envKey && envUrl.startsWith('https://')) {
    return { url: envUrl.trim(), key: envKey.trim(), isCustom: false };
  }

  // 3. Fallback to default project credentials
  return { url: DEFAULT_SUPABASE_URL, key: DEFAULT_SUPABASE_ANON_KEY, isCustom: false };
}

export function isSupabaseConfigured(): boolean {
  const config = getSupabaseConfig();
  return Boolean(config.url && config.key && config.url.startsWith('https://') && config.key.length > 20);
}

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  
  if (!config.url || !config.key || !config.url.startsWith('https://')) {
    return null;
  }

  // Re-create client if credentials changed or if not initialized yet
  if (!supabaseClient || lastUsedUrl !== config.url || lastUsedKey !== config.key) {
    try {
      supabaseClient = createClient(config.url, config.key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      lastUsedUrl = config.url;
      lastUsedKey = config.key;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return supabaseClient;
}

export function setCustomSupabaseCredentials(url: string, key: string): boolean {
  try {
    if (url && key) {
      localStorage.setItem('mmw_supabase_url', url.trim());
      localStorage.setItem('mmw_supabase_anon_key', key.trim());
      supabaseClient = createClient(url.trim(), key.trim());
      lastUsedUrl = url.trim();
      lastUsedKey = key.trim();
    } else {
      localStorage.removeItem('mmw_supabase_url');
      localStorage.removeItem('mmw_supabase_anon_key');
      supabaseClient = null;
      lastUsedUrl = '';
      lastUsedKey = '';
    }
    return true;
  } catch (err) {
    console.error('Error saving custom Supabase config:', err);
    return false;
  }
}

export const setCustomSupabaseConfig = setCustomSupabaseCredentials;

export function clearCustomSupabaseConfig(): void {
  setCustomSupabaseCredentials('', '');
}


