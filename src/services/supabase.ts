/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseConfig(): { url: string; key: string; isCustom: boolean } {
  let envUrl = '';
  let envKey = '';
  try {
    const meta = import.meta as any;
    if (meta && meta.env) {
      envUrl = meta.env.VITE_SUPABASE_URL || '';
      envKey = meta.env.VITE_SUPABASE_ANON_KEY || '';
    }
  } catch (e) {}

  const localUrl = typeof localStorage !== 'undefined' ? localStorage.getItem('mmw_supabase_url') || '' : '';
  const localKey = typeof localStorage !== 'undefined' ? localStorage.getItem('mmw_supabase_anon_key') || '' : '';

  if (localUrl && localKey) {
    return { url: localUrl, key: localKey, isCustom: true };
  }

  return { url: envUrl, key: envKey, isCustom: false };
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

  if (!supabaseClient) {
    try {
      supabaseClient = createClient(config.url, config.key);
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
    } else {
      localStorage.removeItem('mmw_supabase_url');
      localStorage.removeItem('mmw_supabase_anon_key');
      supabaseClient = null;
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

