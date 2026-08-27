import { Category, Product, SiteSettings, Enquiry, EnquiryItem } from '../types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_ENQUIRIES, INITIAL_SETTINGS } from '../data/initialData';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { slugify } from '../utils/helpers';

const STORAGE_KEYS = {
  PRODUCTS: 'mmw_db_products_v2',
  CATEGORIES: 'mmw_db_categories_v2',
  ENQUIRIES: 'mmw_db_enquiries_v2',
  SETTINGS: 'mmw_db_settings_v2',
};

// Event bus for live synchronization across components
export const DATA_CHANGE_EVENT = 'mmw_data_changed';
export function notifyDataChanged(entity: string) {
  window.dispatchEvent(new CustomEvent(DATA_CHANGE_EVENT, { detail: { entity } }));
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

function saveLocalProducts(products: Product[]): void {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  notifyDataChanged('products');
}

function getLocalCategories(): Category[] {
  const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    return INITIAL_CATEGORIES;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_CATEGORIES;
  }
}

function saveLocalCategories(cats: Category[]): void {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(cats));
  notifyDataChanged('categories');
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

function saveLocalEnquiries(enqs: Enquiry[]): void {
  localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(enqs));
  notifyDataChanged('enquiries');
}

function getLocalSettings(): SiteSettings {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    return INITIAL_SETTINGS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_SETTINGS;
  }
}

function saveLocalSettings(settings: SiteSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  notifyDataChanged('settings');
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
                is_primary: img.is_primary ?? (idx === 0),
                caption: img.caption || ''
              }
            ], { onConflict: 'id' });
          }
        }
      }

      // 4. Seed Initial Enquiries if empty
      const { data: existingEnqs } = await supabase.from('enquiries').select('id').limit(1);
      if (!existingEnqs || existingEnqs.length === 0) {
        for (const enq of INITIAL_ENQUIRIES) {
          const { items, ...enqData } = enq;
          await supabase.from('enquiries').upsert([enqData], { onConflict: 'id' });
          if (items && items.length > 0) {
            for (const it of items) {
              await supabase.from('enquiry_items').insert([{
                enquiry_id: enq.id,
                product_id: it.product_id,
                product_name: it.product_name,
                sku: it.sku,
                price: it.price || 0,
                quantity: it.quantity,
                image_url: it.image_url || '',
                category_name: it.category_name || ''
              }]);
            }
          }
        }
      }

      notifyDataChanged('all');
      return { success: true, message: 'Successfully populated Supabase database with machinery catalog!' };
    } catch (err: any) {
      console.error('Failed to seed Supabase:', err);
      return { success: false, message: err.message || 'Error occurred while writing to Supabase.' };
    }
  },

  // PRODUCTS
  async getProducts(options?: {
    categorySlug?: string;
    categoryId?: string;
    featuredOnly?: boolean;
    activeOnly?: boolean;
    searchQuery?: string;
  }): Promise<Product[]> {
    const supabase = getSupabaseClient();

    if (supabase && isSupabaseConfigured()) {
      try {
        let query = supabase.from('products').select('*, product_images(*)');
        if (options?.activeOnly !== false) {
          query = query.eq('is_active', true);
        }
        if (options?.featuredOnly) {
          query = query.eq('is_featured', true);
        }
        if (options?.categoryId) {
          query = query.eq('category_id', options.categoryId);
        }

        const { data, error } = await query;
        if (!error && data) {
          if (data.length > 0) {
            const categories = await this.getCategories();
            const catMap = new Map(categories.map(c => [c.id, c.name]));
            return data.map((p: any) => ({
              ...p,
              category_name: catMap.get(p.category_id) || 'Machinery',
              images: p.product_images && p.product_images.length > 0
                ? p.product_images.sort((a: any, b: any) => a.sort_order - b.sort_order)
                : []
            }));
          } else {
            // If Supabase table exists but is currently empty, attempt seed once
            console.log('Supabase products table is empty. Triggering auto-seed...');
            await this.seedSupabase(false);
          }
        }
      } catch (err) {
        console.warn('Supabase product fetch fallback to local:', err);
      }
    }

    // Local DB fallback
    let list = getLocalProducts();
    const categories = getLocalCategories();

    if (options?.activeOnly !== false) {
      list = list.filter(p => p.is_active);
    }
    if (options?.featuredOnly) {
      list = list.filter(p => p.is_featured);
    }
    if (options?.categoryId) {
      list = list.filter(p => p.category_id === options.categoryId);
    }
    if (options?.categorySlug) {
      const targetCat = categories.find(c => c.slug === options.categorySlug);
      if (targetCat) {
        list = list.filter(p => p.category_id === targetCat.id);
      }
    }
    if (options?.searchQuery) {
      const q = options.searchQuery.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.short_description.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.category_name && p.category_name.toLowerCase().includes(q))
      );
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
          return {
            ...data,
            images: data.product_images || []
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
    const list = getLocalProducts();
    return list.find(p => p.id === id) || null;
  },

  async createProduct(productData: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    const newId = `prod-${Date.now()}`;
    const slug = productData.slug || slugify(productData.name);
    
    // Find category name
    const categories = getLocalCategories();
    const cat = categories.find(c => c.id === productData.category_id);

    const newProduct: Product = {
      ...productData,
      id: newId,
      slug,
      category_name: cat?.name || 'Machinery',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      images: productData.images || []
    };

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { id, images, category_name, ...dbPayload } = newProduct;
        await supabase.from('products').insert([{ id: newId, ...dbPayload }]);
        if (images && images.length > 0) {
          await supabase.from('product_images').insert(
            images.map((img, idx) => ({
              product_id: newId,
              image_url: img.image_url,
              sort_order: idx + 1,
              is_primary: idx === 0,
              caption: img.caption || ''
            }))
          );
        }
      } catch (err) {
        console.warn('Supabase createProduct fallback to local:', err);
      }
    }

    const current = getLocalProducts();
    saveLocalProducts([newProduct, ...current]);
    return newProduct;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const current = getLocalProducts();
    const index = current.findIndex(p => p.id === id);
    if (index === -1) return null;

    const categories = getLocalCategories();
    const catId = updates.category_id || current[index].category_id;
    const cat = categories.find(c => c.id === catId);

    const updated: Product = {
      ...current[index],
      ...updates,
      category_name: cat ? cat.name : current[index].category_name,
      updated_at: new Date().toISOString()
    };

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { images, category_name, ...dbPayload } = updated;
        await supabase.from('products').update(dbPayload).eq('id', id);
      } catch (err) {
        console.warn('Supabase updateProduct fallback:', err);
      }
    }

    current[index] = updated;
    saveLocalProducts([...current]);
    return updated;
  },

  async deleteProduct(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase delete fallback:', err);
      }
    }

    const current = getLocalProducts();
    const filtered = current.filter(p => p.id !== id);
    saveLocalProducts(filtered);
    return true;
  },

  async duplicateProduct(id: string): Promise<Product | null> {
    const original = await this.getProductById(id);
    if (!original) return null;

    const dupName = `${original.name} (Copy)`;
    const dupSku = `${original.sku}-COPY`;
    const dupSlug = slugify(dupName) + `-${Date.now().toString().slice(-4)}`;

    const { id: _, created_at: __, ...rest } = original;
    return this.createProduct({
      ...rest,
      name: dupName,
      sku: dupSku,
      slug: dupSlug,
    });
  },

  // CATEGORIES
  async getCategories(): Promise<Category[]> {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
        if (!error && data && data.length > 0) {
          const products = getLocalProducts();
          return data.map((c: Category) => ({
            ...c,
            product_count: products.filter(p => p.category_id === c.id).length
          }));
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
    return cats.find(c => c.slug === slug || c.id === slug) || null;
  },

  async createCategory(catData: Omit<Category, 'id'>): Promise<Category> {
    const newId = `cat-${Date.now()}`;
    const slug = catData.slug || slugify(catData.name);
    const newCat: Category = {
      ...catData,
      id: newId,
      slug,
      is_active: catData.is_active ?? true,
      sort_order: catData.sort_order || 99
    };

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('categories').insert([newCat]);
      } catch (err) {
        console.warn('Supabase createCategory error:', err);
      }
    }

    const current = getLocalCategories();
    saveLocalCategories([...current, newCat]);
    return newCat;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const current = getLocalCategories();
    const idx = current.findIndex(c => c.id === id);
    if (idx === -1) return null;

    const updated = { ...current[idx], ...updates, updated_at: new Date().toISOString() };
    
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('categories').update(updated).eq('id', id);
      } catch (err) {
        console.warn('Supabase updateCategory error:', err);
      }
    }

    current[idx] = updated;
    saveLocalCategories([...current]);
    return updated;
  },

  async deleteCategory(id: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.from('categories').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteCategory error:', err);
      }
    }

    const current = getLocalCategories();
    saveLocalCategories(current.filter(c => c.id !== id));
    return true;
  },

  // ENQUIRIES
  async getEnquiries(): Promise<Enquiry[]> {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('enquiries')
          .select('*, enquiry_items(*)')
          .order('created_at', { ascending: false });

        if (!error && data) {
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
    enquiryData: Omit<Enquiry, 'id' | 'created_at' | 'status'> | (Partial<Enquiry> & { items?: EnquiryItem[] }),
    itemsParam?: EnquiryItem[]
  ): Promise<Enquiry> {
    const newId = `enq-${Math.floor(1000 + Math.random() * 9000)}`;
    const itemsList = itemsParam || (enquiryData as any).items || [];
    const newEnquiry: Enquiry = {
      customer_name: enquiryData.customer_name || 'Enquirer',
      phone: enquiryData.phone || '',
      whatsapp: enquiryData.whatsapp || enquiryData.phone || '',
      email: enquiryData.email || '',
      company: enquiryData.company || '',
      location: enquiryData.location || '',
      message: enquiryData.message || '',
      ...enquiryData,
      id: newId,
      status: 'new',
      created_at: new Date().toISOString(),
      items: itemsList.map((it: any, idx: number) => ({
        ...it,
        id: `item-${Date.now()}-${idx}`
      }))
    };

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { items: _, ...enqPayload } = newEnquiry;
        await supabase.from('enquiries').insert([enqPayload]);
        if (itemsList && itemsList.length > 0) {
          await supabase.from('enquiry_items').insert(
            itemsList.map((it: any) => ({
              enquiry_id: newId,
              product_id: it.product_id,
              product_name: it.product_name,
              sku: it.sku,
              price: it.price || 0,
              quantity: it.quantity,
              image_url: it.image_url || '',
              category_name: it.category_name || ''
            }))
          );
        }
      } catch (err) {
        console.warn('Supabase createEnquiry error:', err);
      }
    }

    const current = getLocalEnquiries();
    saveLocalEnquiries([newEnquiry, ...current]);
    return newEnquiry;
  },

  async updateEnquiry(id: string, updates: Partial<Enquiry>): Promise<boolean> {
    const current = getLocalEnquiries();
    const idx = current.findIndex(e => e.id === id);
    if (idx === -1) return false;

    current[idx] = {
      ...current[idx],
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
    saveLocalEnquiries(current.filter(e => e.id !== id));
    return true;
  },

  // SITE SETTINGS
  async getSiteSettings(): Promise<SiteSettings> {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('site_settings').select('*').limit(1).single();
        if (!error && data) {
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
    return updated;
  },

  // IMAGE UPLOAD
  async uploadImage(file: File): Promise<string> {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file);

        if (!uploadError) {
          const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
          if (data?.publicUrl) {
            return data.publicUrl;
          }
        }
      } catch (err) {
        console.warn('Supabase image upload failed, falling back to base64:', err);
      }
    }

    // Fallback: Convert to Base64 Data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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
    notifyDataChanged('all');
  },

  resetToDefaultData(): void {
    this.resetToDemoData();
  }
};
