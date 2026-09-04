import { Category, Product, SiteSettings, Enquiry, EnquiryItem, AuditLog, AuditFieldChange, EmployeeUser } from '../types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_ENQUIRIES, INITIAL_SETTINGS, INITIAL_EMPLOYEES, INITIAL_AUDIT_LOGS } from '../data/initialData';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { slugify } from '../utils/helpers';
import { getClientIp, getCachedIpSync } from '../utils/ipService';
import { convertAndCompressToWebP, formatBytes, ProcessedImageResult } from '../utils/imageUtils';

const STORAGE_KEYS = {
  PRODUCTS: 'mmw_db_products_v2',
  CATEGORIES: 'mmw_db_categories_v2',
  ENQUIRIES: 'mmw_db_enquiries_v2',
  SETTINGS: 'mmw_db_settings_v2',
  AUDIT_LOGS: 'mmw_db_audit_logs_v1',
  EMPLOYEES: 'mmw_db_employees_v1',
};

// Event bus for live synchronization across components
export const DATA_CHANGE_EVENT = 'mmw_data_changed';
let notifyTimer: any = null;
const pendingChangedEntities = new Set<string>();

export function notifyDataChanged(entity: string) {
  if (typeof window === 'undefined') return;
  pendingChangedEntities.add(entity);
  if (notifyTimer) clearTimeout(notifyTimer);
  notifyTimer = setTimeout(() => {
    const list = Array.from(pendingChangedEntities);
    pendingChangedEntities.clear();
    window.dispatchEvent(new CustomEvent(DATA_CHANGE_EVENT, { detail: { entity, entities: list } }));
  }, 60);
}

// ---------------------------------------------
// HELPER: Retrieve active logged-in user details
// ---------------------------------------------
function getActiveUser(): { id: string; email: string; name: string; role: string } {
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mmw_admin_session_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          id: parsed.id || 'emp-101',
          email: parsed.email || 'admin@murthimachineworks.com',
          name: parsed.name || 'Murthi Admin',
          role: parsed.role_label || parsed.role || 'Super Administrator'
        };
      }
    }
  } catch {
    // ignore
  }
  return {
    id: 'emp-101',
    email: 'admin@murthimachineworks.com',
    name: 'Murthi Admin',
    role: 'Super Administrator'
  };
}

// ---------------------------------------------
// HELPER: Calculate field diffs for updates
// ---------------------------------------------
function computeProductDiff(oldProd: Product, newProd: Partial<Product>): AuditFieldChange[] {
  const changes: AuditFieldChange[] = [];
  const fieldsToCheck: Array<{ key: keyof Product; label: string }> = [
    { key: 'name', label: 'Machine Name' },
    { key: 'sku', label: 'SKU Code' },
    { key: 'price', label: 'Unit Price (₹)' },
    { key: 'sale_price', label: 'Sale Price (₹)' },
    { key: 'category_id', label: 'Category' },
    { key: 'stock_status', label: 'Stock Status' },
    { key: 'is_active', label: 'Catalog Visibility' },
    { key: 'is_featured', label: 'Featured Status' },
    { key: 'brand', label: 'Brand Name' },
    { key: 'short_description', label: 'Short Description' }
  ];

  for (const field of fieldsToCheck) {
    if (newProd[field.key] !== undefined && newProd[field.key] !== oldProd[field.key]) {
      changes.push({
        field: String(field.key),
        field_label: field.label,
        old_value: oldProd[field.key] ?? null,
        new_value: newProd[field.key] ?? null
      });
    }
  }

  // Keywords diff
  if (newProd.keywords && JSON.stringify(newProd.keywords) !== JSON.stringify(oldProd.keywords)) {
    changes.push({
      field: 'keywords',
      field_label: 'Search Keywords / Tags',
      old_value: oldProd.keywords ? oldProd.keywords.join(', ') : 'None',
      new_value: newProd.keywords.join(', ')
    });
  }

  // Specifications diff
  if (newProd.specifications && JSON.stringify(newProd.specifications) !== JSON.stringify(oldProd.specifications)) {
    changes.push({
      field: 'specifications',
      field_label: 'Technical Specifications',
      old_value: `${oldProd.specifications?.length || 0} specs configured`,
      new_value: `${newProd.specifications.length} specs configured`
    });
  }

  // Images diff
  if (newProd.images && newProd.images.length !== (oldProd.images?.length || 0)) {
    changes.push({
      field: 'images',
      field_label: 'Gallery Images',
      old_value: `${oldProd.images?.length || 0} images`,
      new_value: `${newProd.images.length} images`
    });
  }

  return changes;
}

// ---------------------------------------------
// LOCAL STORAGE PERSISTENCE ENGINE (Fallback / Offline)
// ---------------------------------------------
function getLocalProducts(): Product[] {
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_PRODUCTS;
  }
}

function saveLocalProducts(products: Product[], notify = true): void {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  if (notify) notifyDataChanged('products');
}

function getLocalCategories(): Category[] {
  const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    return INITIAL_CATEGORIES;
  }
  try {
    const cats: Category[] = JSON.parse(data);
    // Auto-heal any broken legacy Unsplash 404 URLs
    let modified = false;
    const healed = cats.map(c => {
      if (c.image_url?.includes('photo-1504917599217-d4dc5ebe6122')) {
        modified = true;
        return { ...c, image_url: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=800&q=80' };
      }
      if (c.image_url?.includes('photo-1581093458791-9f3c3900df4b')) {
        modified = true;
        return { ...c, image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80' };
      }
      if (c.image_url?.includes('photo-1581092335397-9583fe92d232')) {
        modified = true;
        return { ...c, image_url: 'https://images.unsplash.com/photo-1581092335878-2d9ff86ca2bf?auto=format&fit=crop&w=800&q=80' };
      }
      return c;
    });
    if (modified) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(healed));
    }
    return healed;
  } catch {
    return INITIAL_CATEGORIES;
  }
}

function saveLocalCategories(cats: Category[], notify = true): void {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(cats));
  if (notify) notifyDataChanged('categories');
}

function getLocalEnquiries(): Enquiry[] {
  const data = localStorage.getItem(STORAGE_KEYS.ENQUIRIES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(INITIAL_ENQUIRIES));
    return INITIAL_ENQUIRIES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_ENQUIRIES;
  }
}

function saveLocalEnquiries(enqs: Enquiry[], notify = true): void {
  localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(enqs));
  if (notify) notifyDataChanged('enquiries');
}

function getLocalSettings(): SiteSettings {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    return INITIAL_SETTINGS;
  }
  try {
    const parsed = JSON.parse(data);
    let changed = false;
    if (parsed.phone?.includes('98422') || parsed.phone?.includes('54321') || !parsed.phone) {
      parsed.phone = '+91 95852 62522';
      changed = true;
    }
    if (parsed.whatsapp?.includes('98422') || parsed.whatsapp?.includes('54321') || !parsed.whatsapp) {
      parsed.whatsapp = '+91 95852 62522';
      changed = true;
    }
    if (parsed.hero_image === '/hero-banner.png' || !parsed.hero_image) {
      parsed.hero_image = '/hero-banner.webp';
      changed = true;
    }
    if (changed) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return INITIAL_SETTINGS;
  }
}

function saveLocalSettings(settings: SiteSettings, notify = true): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  if (notify) notifyDataChanged('settings');
}

function getLocalAuditLogs(): AuditLog[] {
  const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    return INITIAL_AUDIT_LOGS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_AUDIT_LOGS;
  }
}

function saveLocalAuditLogs(logs: AuditLog[], notify = true): void {
  localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  if (notify) notifyDataChanged('audit_logs');
}

function getLocalEmployees(): EmployeeUser[] {
  const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
    return INITIAL_EMPLOYEES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_EMPLOYEES;
  }
}

function saveLocalEmployees(emps: EmployeeUser[], notify = true): void {
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(emps));
  if (notify) notifyDataChanged('employees');
}

// ---------------------------------------------
// UNIFIED DATA SERVICE (Supabase + Local fallback)
// ---------------------------------------------
export const dataService = {
  // Check if Supabase connection is healthy and responsive
  async testSupabaseConnection(): Promise<{ connected: boolean; count?: number; error?: string }> {
    const supabase = getSupabaseClient();
    if (!supabase || !isSupabaseConfigured()) {
      return { connected: false, error: 'Supabase credentials not configured' };
    }
    try {
      const { data, error } = await supabase.from('products').select('id', { count: 'exact' }).limit(1);
      if (error) {
        return { connected: false, error: `${error.message} (Code: ${error.code})` };
      }
      return { connected: true, count: data?.length || 0 };
    } catch (err: any) {
      return { connected: false, error: err.message || 'Unknown network error' };
    }
  },

  // SEED TO SUPABASE
  async seedSupabase(force = false): Promise<{ success: boolean; message: string }> {
    const supabase = getSupabaseClient();
    if (!supabase || !isSupabaseConfigured()) {
      return { success: false, message: 'Supabase is not configured yet.' };
    }

    try {
      // 1. Seed Categories
      for (const cat of INITIAL_CATEGORIES) {
        await supabase.from('categories').upsert([cat], { onConflict: 'id' });
      }

      // 2. Seed Site Settings
      await supabase.from('site_settings').upsert([INITIAL_SETTINGS], { onConflict: 'id' });

      // 3. Seed Products and Images
      for (const prod of INITIAL_PRODUCTS) {
        const { images, category_name, ...prodData } = prod;
        await supabase.from('products').upsert([prodData], { onConflict: 'id' });

        if (images && images.length > 0) {
          for (let idx = 0; idx < images.length; idx++) {
            const img = images[idx];
            await supabase.from('product_images').upsert([
              {
                id: img.id || `img-${prod.id}-${idx + 1}`,
                product_id: prod.id,
                image_url: img.image_url,
                sort_order: img.sort_order || idx + 1,
                is_primary: img.is_primary || idx === 0,
                caption: img.caption || ''
              }
            ], { onConflict: 'id' });
          }
        }
      }

      // 4. Seed Audit Logs
      for (const log of INITIAL_AUDIT_LOGS) {
        await supabase.from('audit_logs').upsert([log], { onConflict: 'id' });
      }

      // 5. Seed Employees
      for (const emp of INITIAL_EMPLOYEES) {
        await supabase.from('admin_users').upsert([emp], { onConflict: 'id' });
      }

      return { success: true, message: `Successfully seeded all categories, products, team users, and audit logs to Supabase.` };
    } catch (err: any) {
      console.error('Seed error:', err);
      return { success: false, message: `Seeding error: ${err.message}` };
    }
  },

  // ---------------------------------------------
  // AUDIT LOGGING ENGINE
  // ---------------------------------------------
  async logAction(entry: {
    action: AuditLog['action'];
    target_type: AuditLog['target_type'];
    target_id: string;
    target_name: string;
    details?: string;
    changes?: AuditFieldChange[];
    user?: Partial<EmployeeUser> | { id: string; email: string; name: string; role?: string };
    ip_address?: string;
  }): Promise<AuditLog> {
    const activeUser = entry.user || getActiveUser();
    const resolvedIp = entry.ip_address || await getClientIp();

    const logItem: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      action: entry.action,
      target_type: entry.target_type,
      target_id: entry.target_id,
      target_name: entry.target_name,
      user_id: activeUser.id || 'emp-101',
      user_email: activeUser.email || 'admin@murthimachineworks.com',
      user_name: activeUser.name || 'Murthi Admin',
      user_role: (activeUser as any).role_label || (activeUser as any).role || 'Administrator',
      ip_address: resolvedIp || '127.0.0.1 (Local Gateway)',
      details: entry.details || '',
      changes: entry.changes || [],
      created_at: new Date().toISOString()
    };

    // Save locally
    const currentLogs = getLocalAuditLogs();
    saveLocalAuditLogs([logItem, ...currentLogs]);

    // Save to Supabase Cloud Database (for cross-device synchronization)
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('audit_logs').insert([logItem]);
        if (error) {
          console.warn('Supabase audit log insert error:', error.message);
        }
      } catch (err) {
        console.warn('Supabase audit log insert fallback:', err);
      }
    }

    return logItem;
  },

  async getAuditLogs(options?: {
    action?: string;
    target_type?: string;
    user_id?: string;
    searchQuery?: string;
    limit?: number;
  }): Promise<AuditLog[]> {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false });

        if (options?.action && options.action !== 'all') {
          query = query.eq('action', options.action);
        }
        if (options?.target_type && options.target_type !== 'all') {
          query = query.eq('target_type', options.target_type);
        }
        if (options?.user_id && options.user_id !== 'all') {
          query = query.eq('user_id', options.user_id);
        }
        if (options?.limit) {
          query = query.limit(options.limit);
        }

        const { data, error } = await query;
        if (!error && data) {
          if (data.length > 0) {
            // Keep local backup in sync
            try {
              localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(data));
            } catch {}

            if (options?.searchQuery) {
              const q = options.searchQuery.toLowerCase();
              return data.filter((log: AuditLog) =>
                log.target_name?.toLowerCase().includes(q) ||
                log.target_id?.toLowerCase().includes(q) ||
                log.user_name?.toLowerCase().includes(q) ||
                log.user_email?.toLowerCase().includes(q) ||
                log.user_id?.toLowerCase().includes(q) ||
                log.ip_address?.toLowerCase().includes(q) ||
                log.details?.toLowerCase().includes(q)
              );
            }
            return data;
          } else if (!options?.action && !options?.target_type && !options?.user_id && !options?.searchQuery) {
            // If table is newly created on Supabase and empty, bootstrap initial logs
            for (const log of INITIAL_AUDIT_LOGS) {
              await supabase.from('audit_logs').upsert([log], { onConflict: 'id' });
            }
            return INITIAL_AUDIT_LOGS;
          }
        }
      } catch (err) {
        console.warn('Supabase getAuditLogs fallback to local:', err);
      }
    }

    let logs = getLocalAuditLogs();

    if (options?.action && options.action !== 'all') {
      logs = logs.filter(l => l.action === options.action);
    }
    if (options?.target_type && options.target_type !== 'all') {
      logs = logs.filter(l => l.target_type === options.target_type);
    }
    if (options?.user_id && options.user_id !== 'all') {
      logs = logs.filter(l => l.user_id === options.user_id || l.user_email === options.user_id);
    }
    if (options?.searchQuery) {
      const q = options.searchQuery.toLowerCase();
      logs = logs.filter(l =>
        l.target_name?.toLowerCase().includes(q) ||
        l.target_id?.toLowerCase().includes(q) ||
        l.user_name?.toLowerCase().includes(q) ||
        l.user_email?.toLowerCase().includes(q) ||
        l.user_id?.toLowerCase().includes(q) ||
        l.ip_address?.toLowerCase().includes(q) ||
        l.details?.toLowerCase().includes(q)
      );
    }
    if (options?.limit) {
      logs = logs.slice(0, options.limit);
    }

    return logs;
  },

  async clearAuditLogs(): Promise<boolean> {
    const currentUser = getActiveUser();
    const currentIp = await getClientIp();

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('audit_logs').delete().neq('id', 'keep_schema_safe');
      } catch (err) {
        console.warn('Supabase clear audit logs fallback:', err);
      }
    }

    // Keep a single log noting the clear action
    const clearLog: AuditLog = {
      id: `log-${Date.now()}-reset`,
      action: 'DELETE',
      target_type: 'SETTINGS',
      target_id: 'audit-log-history',
      target_name: 'Audit Log System Reset',
      user_id: currentUser.id,
      user_email: currentUser.email,
      user_name: currentUser.name,
      user_role: currentUser.role,
      ip_address: currentIp,
      details: 'Audit history was purged by Super Administrator.',
      created_at: new Date().toISOString()
    };

    saveLocalAuditLogs([clearLog]);
    return true;
  },

  // ---------------------------------------------
  // EMPLOYEES & TEAM ACCESS (Cross-device Cloud Sync)
  // ---------------------------------------------
  async getEmployees(): Promise<EmployeeUser[]> {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          if (data.length > 0) {
            saveLocalEmployees(data, false);
            return data;
          } else {
            // Seed initial employees if table was just created
            for (const emp of INITIAL_EMPLOYEES) {
              await supabase.from('admin_users').upsert([emp], { onConflict: 'id' });
            }
            return INITIAL_EMPLOYEES;
          }
        }
      } catch (err) {
        console.warn('Supabase getEmployees fallback to local:', err);
      }
    }
    return getLocalEmployees();
  },

  async createEmployee(empData: Omit<EmployeeUser, 'id' | 'created_at'>): Promise<EmployeeUser> {
    const newId = `emp-${Date.now().toString().slice(-4)}`;
    const newEmp: EmployeeUser = {
      ...empData,
      id: newId,
      created_at: new Date().toISOString()
    };

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('admin_users').insert([newEmp]);
        if (error) {
          console.warn('Supabase createEmployee insert error:', error.message);
        }
      } catch (err) {
        console.warn('Supabase createEmployee fallback:', err);
      }
    }

    const current = getLocalEmployees();
    saveLocalEmployees([newEmp, ...current]);

    // Audit log in Supabase & Local
    await this.logAction({
      action: 'CREATE',
      target_type: 'USER',
      target_id: newEmp.id,
      target_name: `${newEmp.name} (${newEmp.email})`,
      details: `Created new employee login account for ${newEmp.name} with role ${newEmp.role_label || newEmp.role}.`
    });

    return newEmp;
  },

  async updateEmployee(id: string, updates: Partial<EmployeeUser>): Promise<EmployeeUser | null> {
    const current = getLocalEmployees();
    const index = current.findIndex(e => e.id === id);
    if (index === -1) return null;

    const updated: EmployeeUser = {
      ...current[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('admin_users').update({
          ...updates,
          updated_at: new Date().toISOString()
        }).eq('id', id);
        if (error) {
          console.warn('Supabase updateEmployee error:', error.message);
        }
      } catch (err) {
        console.warn('Supabase updateEmployee fallback:', err);
      }
    }

    current[index] = updated;
    saveLocalEmployees([...current]);

    // Audit log
    const changedPassword = updates.password ? ' (Password updated)' : '';
    await this.logAction({
      action: 'UPDATE',
      target_type: 'USER',
      target_id: id,
      target_name: `${updated.name} (${updated.email})`,
      details: `Updated profile / credentials for employee ${updated.name}${changedPassword}.`
    });

    return updated;
  },

  async deleteEmployee(id: string): Promise<boolean> {
    const current = getLocalEmployees();
    const target = current.find(e => e.id === id);
    
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('admin_users').delete().eq('id', id);
        if (error) {
          console.warn('Supabase deleteEmployee error:', error.message);
        }
      } catch (err) {
        console.warn('Supabase deleteEmployee fallback:', err);
      }
    }

    saveLocalEmployees(current.filter(e => e.id !== id));

    if (target) {
      await this.logAction({
        action: 'DELETE',
        target_type: 'USER',
        target_id: id,
        target_name: `${target.name} (${target.email})`,
        details: `Revoked portal access and deleted login credentials for ${target.name}.`
      });
    }

    return true;
  },

  async recordEmployeeLogin(email: string, ip: string): Promise<void> {
    const employees = getLocalEmployees();
    const emp = employees.find(e => e.email.toLowerCase() === email.toLowerCase());
    if (emp) {
      emp.last_login = new Date().toISOString();
      emp.last_ip = ip;
      saveLocalEmployees([...employees]);

      const supabase = getSupabaseClient();
      if (supabase && isSupabaseConfigured()) {
        try {
          await supabase.from('admin_users').update({
            last_login: emp.last_login,
            last_ip: ip
          }).eq('id', emp.id);
        } catch {
          // ignore
        }
      }
    }
  },

  // ---------------------------------------------
  // PRODUCTS CRUD + AUDIT LOGGING
  // ---------------------------------------------
  async getProducts(options?: {
    categorySlug?: string;
    categoryId?: string;
    isFeatured?: boolean;
    activeOnly?: boolean;
    searchQuery?: string;
    brand?: string;
    stockStatus?: string;
    priceMin?: number;
    priceMax?: number;
    sortBy?: string;
  }): Promise<Product[]> {
    const supabase = getSupabaseClient();

    if (supabase && isSupabaseConfigured()) {
      try {
        let query = supabase
          .from('products')
          .select('*, product_images(*)')
          .order('created_at', { ascending: false });

        if (options?.isFeatured !== undefined) {
          query = query.eq('is_featured', options.isFeatured);
        }
        if (options?.activeOnly) {
          query = query.eq('is_active', true);
        }
        if (options?.categoryId) {
          query = query.eq('category_id', options.categoryId);
        }
        if (options?.brand) {
          query = query.eq('brand', options.brand);
        }
        if (options?.stockStatus) {
          query = query.eq('stock_status', options.stockStatus);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const categories = getLocalCategories();
          let prods: Product[] = data.map((p: any) => {
            const rawImages = p.product_images || [];
            const sortedImages = [...rawImages].sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
            const cat = categories.find(c => c.id === p.category_id || c.slug === p.category_id);

            return {
              id: p.id,
              name: p.name,
              slug: p.slug,
              sku: p.sku,
              category_id: p.category_id || '',
              category_name: cat ? cat.name : (p.category_name || 'Machinery'),
              brand: p.brand || 'Murthi Precision',
              short_description: p.short_description || '',
              description: p.description || '',
              price: Number(p.price) || 0,
              sale_price: p.sale_price !== null && p.sale_price !== undefined && !isNaN(Number(p.sale_price)) ? Number(p.sale_price) : null,
              show_price: p.show_price !== false,
              stock_status: p.stock_status || 'in_stock',
              features: Array.isArray(p.features) ? p.features : [],
              specifications: Array.isArray(p.specifications) ? p.specifications : [],
              keywords: Array.isArray(p.keywords) ? p.keywords : [],
              is_featured: !!p.is_featured,
              is_active: p.is_active !== false,
              created_at: p.created_at,
              updated_at: p.updated_at,
              images: sortedImages.map((img: any) => ({
                id: img.id,
                product_id: img.product_id,
                image_url: img.image_url,
                sort_order: img.sort_order || 1,
                is_primary: !!img.is_primary,
                caption: img.caption || ''
              }))
            };
          });

          // Sync to local storage
          try {
            localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(prods));
          } catch {}

          if (options?.categorySlug) {
            const cat = categories.find(c => c.slug === options.categorySlug || c.id === options.categorySlug);
            if (cat) {
              prods = prods.filter(p => p.category_id === cat.id || p.category_id === cat.slug);
            }
          }

          if (options?.searchQuery) {
            const q = options.searchQuery.toLowerCase().trim();
            const terms = q.split(/\s+/).filter(Boolean);
            prods = prods.filter(p => {
              const cat = categories.find(c => c.id === p.category_id || c.slug === p.category_id);
              const pKeywords = Array.isArray(p.keywords) ? p.keywords : [];
              const catKeywords = cat && Array.isArray(cat.keywords) ? cat.keywords : [];
              const allKeywords = [...pKeywords, ...catKeywords].map(k => k.toLowerCase());

              const searchableText = `${p.name} ${p.sku} ${p.short_description || ''} ${p.description || ''} ${p.brand || ''} ${p.category_name || ''} ${allKeywords.join(' ')}`.toLowerCase();

              return terms.every(t => searchableText.includes(t));
            });
          }
          return prods;
        }
      } catch (err) {
        console.warn('Supabase getProducts error, fallback to local storage:', err);
      }
    }

    let list = getLocalProducts();

    if (options?.activeOnly) {
      list = list.filter(p => p.is_active !== false);
    }
    if (options?.categoryId) {
      list = list.filter(p => p.category_id === options.categoryId);
    }
    if (options?.categorySlug) {
      const cats = getLocalCategories();
      const cat = cats.find(c => c.slug === options.categorySlug || c.id === options.categorySlug);
      if (cat) {
        list = list.filter(p => p.category_id === cat.id);
      }
    }
    if (options?.isFeatured !== undefined) {
      list = list.filter(p => p.is_featured === options.isFeatured);
    }
    if (options?.brand) {
      list = list.filter(p => p.brand.toLowerCase() === options.brand!.toLowerCase());
    }
    if (options?.stockStatus) {
      list = list.filter(p => p.stock_status === options.stockStatus);
    }
    if (options?.priceMin !== undefined) {
      list = list.filter(p => p.price >= options.priceMin!);
    }
    if (options?.priceMax !== undefined) {
      list = list.filter(p => p.price <= options.priceMax!);
    }
    if (options?.searchQuery) {
      const q = options.searchQuery.toLowerCase().trim();
      const terms = q.split(/\s+/).filter(Boolean);
      const cats = getLocalCategories();
      list = list.filter(p => {
        const cat = cats.find(c => c.id === p.category_id || c.slug === p.category_id);
        const pKeywords = Array.isArray(p.keywords) ? p.keywords : [];
        const catKeywords = cat && Array.isArray(cat.keywords) ? cat.keywords : [];
        const allKeywords = [...pKeywords, ...catKeywords].map(k => k.toLowerCase());

        const searchableText = `${p.name} ${p.sku} ${p.short_description || ''} ${p.description || ''} ${p.brand || ''} ${p.category_name || ''} ${allKeywords.join(' ')}`.toLowerCase();

        return terms.every(t => searchableText.includes(t));
      });
    }

    return list;
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, product_images(*)')
          .eq('slug', slug)
          .single();

        if (!error && data) {
          const rawImages = data.product_images || [];
          return {
            ...data,
            price: Number(data.price) || 0,
            sale_price: data.sale_price !== null && data.sale_price !== undefined ? Number(data.sale_price) : null,
            features: Array.isArray(data.features) ? data.features : [],
            specifications: Array.isArray(data.specifications) ? data.specifications : [],
            keywords: Array.isArray(data.keywords) ? data.keywords : [],
            images: rawImages
          };
        }
      } catch (err) {
        console.warn('Supabase getProductBySlug fallback:', err);
      }
    }

    const list = getLocalProducts();
    return list.find(p => p.slug === slug || p.id === slug) || null;
  },

  async getProductById(id: string): Promise<Product | null> {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, product_images(*)')
          .eq('id', id)
          .single();

        if (!error && data) {
          const rawImages = data.product_images || [];
          return {
            ...data,
            price: Number(data.price) || 0,
            sale_price: data.sale_price !== null && data.sale_price !== undefined ? Number(data.sale_price) : null,
            features: Array.isArray(data.features) ? data.features : [],
            specifications: Array.isArray(data.specifications) ? data.specifications : [],
            keywords: Array.isArray(data.keywords) ? data.keywords : [],
            images: rawImages
          };
        }
      } catch (err) {
        console.warn('Supabase getProductById fallback:', err);
      }
    }

    const list = getLocalProducts();
    return list.find(p => p.id === id) || null;
  },

  async createProduct(productData: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    const newId = `prod-${Date.now()}`;
    const slug = productData.slug || slugify(productData.name);
    
    // Find category info
    const categories = getLocalCategories();
    const cat = categories.find(c => c.id === productData.category_id || c.slug === productData.category_id);

    const newProduct: Product = {
      ...productData,
      id: newId,
      slug,
      category_id: productData.category_id || (cat ? cat.id : ''),
      category_name: cat?.name || (productData as any).category_name || 'Machinery',
      price: Number(productData.price) || 0,
      sale_price: productData.sale_price !== undefined && productData.sale_price !== null && !isNaN(Number(productData.sale_price)) ? Number(productData.sale_price) : null,
      show_price: productData.show_price ?? true,
      stock_status: productData.stock_status || 'in_stock',
      brand: productData.brand || 'Murthi Precision',
      features: productData.features || [],
      specifications: productData.specifications || [],
      is_active: productData.is_active ?? true,
      is_featured: productData.is_featured ?? false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      images: productData.images || []
    };

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        // 1. Ensure foreign key constraint is satisfied by verifying category in Supabase
        let validCategoryId: string | null = null;
        if (newProduct.category_id) {
          const { data: dbCatById } = await supabase.from('categories').select('id').eq('id', newProduct.category_id).maybeSingle();
          if (dbCatById && dbCatById.id) {
            validCategoryId = dbCatById.id;
          } else {
            // Check by slug or name
            const catSlug = slugify(cat?.name || newProduct.category_id);
            const { data: dbCatBySlug } = await supabase.from('categories').select('id').eq('slug', catSlug).maybeSingle();
            if (dbCatBySlug && dbCatBySlug.id) {
              validCategoryId = dbCatBySlug.id;
            } else {
              // Create category in DB so foreign key constraint is satisfied
              const newDbCat = {
                id: newProduct.category_id,
                name: cat?.name || newProduct.category_name,
                slug: catSlug,
                description: cat?.description || '',
                image_url: cat?.image_url || 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
                is_active: true,
                sort_order: cat?.sort_order || 99
              };
              const { data: insertedCat, error: catErr } = await supabase.from('categories').insert([newDbCat]).select('id').maybeSingle();
              if (!catErr && insertedCat) {
                validCategoryId = insertedCat.id;
              }
            }
          }
        }

        const { id, images, category_name, ...dbPayload } = newProduct;
        const insertPayload = {
          id: newId,
          ...dbPayload,
          category_id: validCategoryId,
          price: Number(dbPayload.price) || 0,
          sale_price: dbPayload.sale_price !== null && dbPayload.sale_price !== undefined ? Number(dbPayload.sale_price) : null,
          features: dbPayload.features || [],
          specifications: dbPayload.specifications || []
        };

        const { error: insertErr } = await supabase.from('products').insert([insertPayload]);
        if (insertErr) {
          console.error('Supabase product insert error:', insertErr);
          // If foreign key constraint failed, insert with category_id: null
          if (insertErr.code === '23503') {
            await supabase.from('products').insert([{ ...insertPayload, category_id: null }]);
          }
        }

        // Insert gallery images into product_images table
        if (images && images.length > 0) {
          const imageRows = images.map((img, idx) => ({
            id: img.id || `img-${newId}-${idx + 1}`,
            product_id: newId,
            image_url: img.image_url,
            sort_order: img.sort_order || idx + 1,
            is_primary: img.is_primary !== undefined ? img.is_primary : idx === 0,
            caption: img.caption || ''
          }));
          await supabase.from('product_images').insert(imageRows);
        }
      } catch (err) {
        console.warn('Supabase createProduct error:', err);
      }
    }

    const current = getLocalProducts();
    saveLocalProducts([newProduct, ...current]);

    // AUTOMATIC AUDIT LOGGING
    await this.logAction({
      action: 'CREATE',
      target_type: 'PRODUCT',
      target_id: newId,
      target_name: `${newProduct.name} (${newProduct.sku})`,
      details: `Added new machine "${newProduct.name}" under category "${newProduct.category_name}" with price ₹${newProduct.price.toLocaleString('en-IN')}.`,
      changes: [
        { field: 'sku', field_label: 'Model SKU', old_value: null, new_value: newProduct.sku },
        { field: 'name', field_label: 'Machine Name', old_value: null, new_value: newProduct.name },
        { field: 'price', field_label: 'Unit Price (₹)', old_value: null, new_value: newProduct.price },
        { field: 'stock_status', field_label: 'Stock Status', old_value: null, new_value: newProduct.stock_status },
        { field: 'category_id', field_label: 'Category ID', old_value: null, new_value: newProduct.category_id }
      ]
    });

    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const current = getLocalProducts();
    const index = current.findIndex(p => p.id === id);
    const existing = index !== -1 ? current[index] : await this.getProductById(id);
    if (!existing) return null;

    const oldProduct = { ...existing };
    const categories = getLocalCategories();
    const catId = updates.category_id || existing.category_id;
    const cat = categories.find(c => c.id === catId || c.slug === catId);

    const updated: Product = {
      ...existing,
      ...updates,
      category_id: cat ? cat.id : catId,
      category_name: cat ? cat.name : existing.category_name,
      price: updates.price !== undefined ? Number(updates.price) : existing.price,
      sale_price: updates.sale_price !== undefined ? (updates.sale_price !== null && !isNaN(Number(updates.sale_price)) ? Number(updates.sale_price) : null) : existing.sale_price,
      updated_at: new Date().toISOString()
    };

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        let validCategoryId: string | null = null;
        if (updated.category_id) {
          const { data: dbCat } = await supabase.from('categories').select('id').eq('id', updated.category_id).maybeSingle();
          if (dbCat && dbCat.id) {
            validCategoryId = dbCat.id;
          }
        }

        const { id: _, images, category_name, ...dbPayload } = updated;
        const updatePayload = {
          ...dbPayload,
          category_id: validCategoryId,
          price: Number(dbPayload.price) || 0,
          sale_price: dbPayload.sale_price !== null && dbPayload.sale_price !== undefined ? Number(dbPayload.sale_price) : null,
          features: dbPayload.features || [],
          specifications: dbPayload.specifications || []
        };

        const { error: updateErr } = await supabase.from('products').update(updatePayload).eq('id', id);
        if (updateErr) {
          console.warn('Supabase updateProduct error:', updateErr);
          if (updateErr.code === '23503') {
            await supabase.from('products').update({ ...updatePayload, category_id: null }).eq('id', id);
          }
        }

        // Sync images in product_images table
        if (updates.images !== undefined) {
          await supabase.from('product_images').delete().eq('product_id', id);
          if (updates.images.length > 0) {
            const imageRows = updates.images.map((img, idx) => ({
              id: img.id || `img-${id}-${Date.now()}-${idx + 1}`,
              product_id: id,
              image_url: img.image_url,
              sort_order: img.sort_order || idx + 1,
              is_primary: img.is_primary !== undefined ? img.is_primary : idx === 0,
              caption: img.caption || ''
            }));
            await supabase.from('product_images').insert(imageRows);
          }
        }
      } catch (err) {
        console.warn('Supabase updateProduct fallback:', err);
      }
    }

    if (index !== -1) {
      current[index] = updated;
      saveLocalProducts([...current]);
    } else {
      saveLocalProducts([updated, ...current]);
    }

    // Compute exact field diffs
    const diffs = computeProductDiff(oldProduct, updates);
    const detailSummary = diffs.length > 0 
      ? `Modified ${diffs.map(d => d.field_label || d.field).join(', ')} on ${updated.name}`
      : `Updated machinery specifications and parameters for ${updated.name}`;

    // AUTOMATIC AUDIT LOGGING
    await this.logAction({
      action: 'UPDATE',
      target_type: 'PRODUCT',
      target_id: id,
      target_name: `${updated.name} (${updated.sku})`,
      details: detailSummary,
      changes: diffs
    });

    return updated;
  },

  async deleteProduct(id: string): Promise<boolean> {
    const current = getLocalProducts();
    const target = current.find(p => p.id === id);

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete fallback:', err);
      }
    }

    const filtered = current.filter(p => p.id !== id);
    saveLocalProducts(filtered);

    // AUTOMATIC AUDIT LOGGING
    if (target) {
      await this.logAction({
        action: 'DELETE',
        target_type: 'PRODUCT',
        target_id: id,
        target_name: `${target.name} (${target.sku})`,
        details: `Permanently deleted "${target.name}" (${target.sku}) from the catalog.`,
        changes: [
          { field: 'status', field_label: 'Status', old_value: 'Active in Catalog', new_value: 'Deleted' },
          { field: 'sku', field_label: 'Model SKU', old_value: target.sku, new_value: null },
          { field: 'price', field_label: 'Last Recorded Price', old_value: target.price, new_value: null }
        ]
      });
    }

    return true;
  },

  async duplicateProduct(id: string): Promise<Product | null> {
    const original = await this.getProductById(id);
    if (!original) return null;

    const dupName = `${original.name} (Copy)`;
    const dupSku = `${original.sku}-COPY`;
    const dupSlug = slugify(dupName) + `-${Date.now().toString().slice(-4)}`;

    const { id: _, created_at: __, ...rest } = original;
    const cloned = await this.createProduct({
      ...rest,
      name: dupName,
      sku: dupSku,
      slug: dupSlug,
    });

    if (cloned) {
      await this.logAction({
        action: 'DUPLICATE',
        target_type: 'PRODUCT',
        target_id: cloned.id,
        target_name: `${cloned.name} (${cloned.sku})`,
        details: `Duplicated from master template "${original.name}" (${original.sku}).`
      });
    }

    return cloned;
  },

  // ---------------------------------------------
  // CATEGORIES CRUD + AUDIT LOGGING
  // ---------------------------------------------
  async getCategories(): Promise<Category[]> {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
        if (!error && data && data.length > 0) {
          const products = getLocalProducts();
          const list = data.map((c: Category) => ({
            ...c,
            product_count: products.filter(p => p.category_id === c.id || p.category_id === c.slug).length
          }));
          saveLocalCategories(list, false);
          return list;
        }
      } catch (err) {
        console.warn('Supabase getCategories fallback:', err);
      }
    }

    const cats = getLocalCategories();
    const products = getLocalProducts();
    return cats.map(c => ({
      ...c,
      product_count: products.filter(p => p.category_id === c.id).length
    }));
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const cats = await this.getCategories();
    return cats.find(c => c.slug === slug || c.id === slug || c.id.toLowerCase() === slug.toLowerCase()) || null;
  },

  async createCategory(catData: Omit<Category, 'id'>): Promise<Category> {
    const newId = `MMW-${Date.now()}`;
    const slug = catData.slug || slugify(catData.name);
    const newCat: Category = {
      ...catData,
      id: newId,
      slug,
      is_active: catData.is_active ?? true,
      sort_order: catData.sort_order || 99,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('categories').insert([newCat]);
      } catch (err) {
        console.warn('Supabase createCategory fallback:', err);
      }
    }

    const current = getLocalCategories();
    saveLocalCategories([...current, newCat]);

    // Audit log
    await this.logAction({
      action: 'CREATE',
      target_type: 'CATEGORY',
      target_id: newId,
      target_name: newCat.name,
      details: `Created new machinery category "${newCat.name}" with slug "${newCat.slug}".`
    });

    return newCat;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const current = getLocalCategories();
    const index = current.findIndex(c => c.id === id);
    if (index === -1) return null;

    const updated: Category = {
      ...current[index],
      ...updates,
      updated_at: new Date().toISOString()
    };

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('categories').update(updates).eq('id', id);
      } catch (err) {
        console.warn('Supabase updateCategory fallback:', err);
      }
    }

    current[index] = updated;
    saveLocalCategories([...current]);

    // Audit log
    await this.logAction({
      action: 'UPDATE',
      target_type: 'CATEGORY',
      target_id: id,
      target_name: updated.name,
      details: `Updated category properties for "${updated.name}".`
    });

    return updated;
  },

  async deleteCategory(id: string): Promise<boolean> {
    const current = getLocalCategories();
    const target = current.find(c => c.id === id);

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('categories').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteCategory fallback:', err);
      }
    }

    saveLocalCategories(current.filter(c => c.id !== id));

    if (target) {
      await this.logAction({
        action: 'DELETE',
        target_type: 'CATEGORY',
        target_id: id,
        target_name: target.name,
        details: `Deleted machinery category "${target.name}".`
      });
    }

    return true;
  },

  // ---------------------------------------------
  // ENQUIRIES & RFQ
  // ---------------------------------------------
  async getEnquiries(): Promise<Enquiry[]> {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('enquiries')
          .select('*, enquiry_items(*)')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((e: any) => ({
            ...e,
            items: e.enquiry_items || []
          }));
        }
      } catch (err) {
        console.warn('Supabase getEnquiries fallback:', err);
      }
    }
    return getLocalEnquiries();
  },

  async createEnquiry(
    enquiryData: Omit<Enquiry, 'id' | 'created_at'> | any,
    itemsParam?: EnquiryItem[]
  ): Promise<Enquiry> {
    const newId = `enq-${Date.now()}`;
    const resolvedItems = itemsParam || enquiryData.items || [];
    const newEnquiry: Enquiry = {
      ...enquiryData,
      id: newId,
      status: 'new',
      created_at: new Date().toISOString(),
      items: resolvedItems
    };

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { items, ...dbPayload } = newEnquiry;
        await supabase.from('enquiries').insert([{ id: newId, ...dbPayload }]);

        if (items && items.length > 0) {
          await supabase.from('enquiry_items').insert(
            items.map(it => ({
              enquiry_id: newId,
              product_id: it.product_id,
              product_name: it.product_name,
              sku: it.sku,
              quantity: it.quantity || 1,
              price: it.price || 0
            }))
          );
        }
      } catch (err) {
        console.warn('Supabase createEnquiry fallback:', err);
      }
    }

    const current = getLocalEnquiries();
    saveLocalEnquiries([newEnquiry, ...current]);

    // Client IP for enquiry
    getClientIp().then(ip => {
      this.logAction({
        action: 'CREATE',
        target_type: 'ENQUIRY',
        target_id: newId,
        target_name: `RFQ from ${newEnquiry.customer_name} (${newEnquiry.company || 'Direct'})`,
        details: `Received quotation request for ${newEnquiry.items.length} item(s) from ${newEnquiry.customer_name} (${newEnquiry.phone}).`,
        ip_address: ip
      }).catch(() => {});
    });

    return newEnquiry;
  },

  async updateEnquiry(id: string, updates: Partial<Enquiry>): Promise<boolean> {
    const current = getLocalEnquiries();
    const index = current.findIndex(e => e.id === id);
    if (index === -1) return false;

    const old = current[index];
    current[index] = {
      ...old,
      ...updates,
      updated_at: new Date().toISOString()
    };

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { items: _, ...dbUpdates } = updates;
        await supabase.from('enquiries').update({
          ...dbUpdates,
          updated_at: new Date().toISOString()
        }).eq('id', id);
      } catch (err) {
        console.warn('Supabase update enquiry error:', err);
      }
    }

    saveLocalEnquiries([...current]);

    if (updates.status && updates.status !== old.status) {
      await this.logAction({
        action: 'STATUS_CHANGE',
        target_type: 'ENQUIRY',
        target_id: id,
        target_name: `RFQ from ${old.customer_name}`,
        details: `Changed enquiry status from "${old.status}" to "${updates.status}".`
      });
    }

    return true;
  },

  async updateEnquiryStatus(id: string, status: Enquiry['status'], notes?: string): Promise<boolean> {
    return this.updateEnquiry(id, {
      status,
      ...(notes !== undefined ? { notes, admin_notes: notes } : {})
    });
  },

  async deleteEnquiry(id: string): Promise<boolean> {
    const current = getLocalEnquiries();
    const target = current.find(e => e.id === id);
    saveLocalEnquiries(current.filter(e => e.id !== id));

    if (target) {
      await this.logAction({
        action: 'DELETE',
        target_type: 'ENQUIRY',
        target_id: id,
        target_name: `RFQ ${target.customer_name}`,
        details: `Archived and removed quotation enquiry from ${target.customer_name}.`
      });
    }
    return true;
  },

  // ---------------------------------------------
  // SITE SETTINGS
  // ---------------------------------------------
  async getSiteSettings(): Promise<SiteSettings> {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('site_settings').select('*').limit(1).single();
        if (!error && data) {
          let needsUpdate = false;
          if (data.phone?.includes('98422') || data.phone?.includes('54321') || !data.phone) {
            data.phone = '+91 95852 62522';
            needsUpdate = true;
          }
          if (data.whatsapp?.includes('98422') || data.whatsapp?.includes('54321') || !data.whatsapp) {
            data.whatsapp = '+91 95852 62522';
            needsUpdate = true;
          }
          if (data.hero_image === '/hero-banner.png' || !data.hero_image) {
            data.hero_image = '/hero-banner.webp';
            needsUpdate = true;
          }
          if (needsUpdate) {
            supabase.from('site_settings').upsert([data]).then(() => {});
            saveLocalSettings(data, false);
          }
          return data;
        }
      } catch (err) {
        console.warn('Supabase getSettings fallback:', err);
      }
    }
    return getLocalSettings();
  },

  async updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const current = getLocalSettings();
    const updated = { ...current, ...settings };

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('site_settings').upsert([updated]);
      } catch (err) {
        console.warn('Supabase updateSettings error:', err);
      }
    }

    saveLocalSettings(updated);

    // Audit log
    await this.logAction({
      action: 'UPDATE',
      target_type: 'SETTINGS',
      target_id: 'site-config',
      target_name: 'Website Global Configuration',
      details: `Updated contact numbers, company info, and header metadata.`
    });

    return updated;
  },

  // IMAGE UPLOAD & CONVERSION TO WEBP (GUARANTEED < 500 KB)
  async uploadProductImage(file: File, folder: 'products' | 'categories' | string = 'products'): Promise<{
    url: string;
    fileName: string;
    storagePath?: string;
    size: number;
    sizeFormatted: string;
    originalSize: number;
    originalSizeFormatted: string;
    format: string;
    isSupabase: boolean;
    warning?: string;
  }> {
    // 1. Convert image to WebP and compress under 500 KB client-side
    let processed: ProcessedImageResult;
    try {
      processed = await convertAndCompressToWebP(file, {
        maxSizeBytes: 500 * 1024, // 500 KB = 512,000 bytes
        maxWidth: 1920,
        maxHeight: 1920,
      });
    } catch (err: any) {
      console.error('Image compression error:', err);
      throw new Error(`Failed to process image: ${err?.message || 'Unknown error'}`);
    }

    const supabase = getSupabaseClient();
    const cleanBaseName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .toLowerCase()
      .substring(0, 32);
    const datePrefix = new Date().toISOString().slice(0, 7); // YYYY-MM
    const uniqueId = Math.random().toString(36).substring(2, 8);
    const storageFileName = `${cleanBaseName}-${Date.now()}-${uniqueId}.webp`;
    const filePath = `${folder}/${datePrefix}/${storageFileName}`;

    // 2. Upload to Supabase Storage if configured (with 3.5s timeout guarantee)
    if (supabase && isSupabaseConfigured()) {
      try {
        const timeoutPromise = new Promise<{ data: any; error: any }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: { message: 'Supabase storage request timed out' } }), 3500)
        );

        const uploadPromise = supabase.storage
          .from('product-images')
          .upload(filePath, processed.blob, {
            contentType: 'image/webp',
            cacheControl: '31536000', // 1 year cache
            upsert: true,
          });

        const { error: uploadError } = await Promise.race([uploadPromise, timeoutPromise]);

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

          if (urlData?.publicUrl) {
            return {
              url: urlData.publicUrl,
              fileName: storageFileName,
              storagePath: filePath,
              size: processed.compressedSizeBytes,
              sizeFormatted: processed.compressedSizeFormatted,
              originalSize: processed.originalSizeBytes,
              originalSizeFormatted: processed.originalSizeFormatted,
              format: 'image/webp',
              isSupabase: true,
            };
          }
        } else {
          console.warn('Supabase storage upload notice:', uploadError.message);
          return {
            url: processed.dataUrl,
            fileName: storageFileName,
            size: processed.compressedSizeBytes,
            sizeFormatted: processed.compressedSizeFormatted,
            originalSize: processed.originalSizeBytes,
            originalSizeFormatted: processed.originalSizeFormatted,
            format: 'image/webp',
            isSupabase: false,
            warning: `Supabase Storage: ${uploadError.message}. Image saved in WebP format.`,
          };
        }
      } catch (err: any) {
        console.warn('Supabase image upload failed with exception, using base64 WebP:', err);
        return {
          url: processed.dataUrl,
          fileName: storageFileName,
          size: processed.compressedSizeBytes,
          sizeFormatted: processed.compressedSizeFormatted,
          originalSize: processed.originalSizeBytes,
          originalSizeFormatted: processed.originalSizeFormatted,
          format: 'image/webp',
          isSupabase: false,
          warning: `Supabase storage not accessible (${err?.message || 'network error'}). Saved locally as WebP.`,
        };
      }
    }

    // 3. Fallback when Supabase is not configured: return high-efficiency WebP Data URL
    return {
      url: processed.dataUrl,
      fileName: storageFileName,
      size: processed.compressedSizeBytes,
      sizeFormatted: processed.compressedSizeFormatted,
      originalSize: processed.originalSizeBytes,
      originalSizeFormatted: processed.originalSizeFormatted,
      format: 'image/webp',
      isSupabase: false,
      warning: 'Supabase credentials not configured. Image converted to WebP and saved locally in browser database.',
    };
  },

  // Legacy string-only method maintained for backward compatibility
  async uploadImage(file: File): Promise<string> {
    const result = await this.uploadProductImage(file);
    return result.url;
  },

  // SEARCH PRODUCTS
  async searchProducts(query: string): Promise<Product[]> {
    return this.getProducts({ searchQuery: query });
  },

  // RESET TO DEMO DATA
  resetToDemoData(): void {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(INITIAL_ENQUIRIES));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(INITIAL_EMPLOYEES));
    notifyDataChanged('all');
  },

  resetToDefaultData(): void {
    this.resetToDemoData();
  }
};
