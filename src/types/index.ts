export type StockStatus = 'in_stock' | 'made_to_order' | 'low_stock' | 'out_of_stock';
export type EnquiryStatus = 'new' | 'contacted' | 'quotation_sent' | 'converted' | 'closed';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  is_active: boolean;
  sort_order?: number;
  product_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductImage {
  id: string;
  product_id?: string;
  image_url: string;
  sort_order: number;
  is_primary: boolean;
  caption?: string;
}

export interface ProductSpecification {
  id?: string;
  key?: string;
  value?: string;
  spec_key?: string;
  spec_value?: string;
  unit?: string;
  sort_order?: number;
}

export interface ProductDownload {
  id?: string;
  title: string;
  file_url: string;
  file_type?: string;
  file_size?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category_id: string;
  category_name?: string;
  brand: string;
  short_description: string;
  description: string;
  price: number;
  sale_price?: number | null;
  show_price: boolean;
  stock_status: StockStatus;
  features: string[];
  specifications: ProductSpecification[];
  downloads?: ProductDownload[];
  is_featured: boolean;
  is_active: boolean;
  images: ProductImage[];
  created_at: string;
  updated_at?: string;
}

export interface EnquiryItem {
  id?: string;
  product_id: string;
  product_name: string;
  sku: string;
  price?: number;
  quantity: number;
  image_url?: string;
  category_name?: string;
}

export interface ProductDownload {
  id?: string;
  title: string;
  file_url: string;
  file_size?: string;
}

export interface Enquiry {
  id: string;
  customer_name: string;
  phone: string;
  whatsapp: string;
  email: string;
  company: string;
  location: string;
  message: string;
  status: EnquiryStatus;
  notes?: string;
  admin_notes?: string;
  created_at: string;
  updated_at?: string;
  items: EnquiryItem[];
  total_items?: number;
}

export interface SocialLinks {
  linkedin?: string;
  youtube?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
}

export interface SiteSettings {
  id: string;
  business_name: string;
  tagline: string;
  logo_url: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  google_maps_url: string;
  hero_title: string;
  hero_description: string;
  hero_image: string;
  featured_heading: string;
  about_content: string;
  currency_symbol: string;
  gstin?: string;
  established_year?: string;
  social_links: SocialLinks;
}

export type WebsiteSettings = SiteSettings;

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'manager';
  user_metadata?: any;
  created_at?: string;
}

export interface FilterState {
  category: string;
  brand: string;
  stockStatus: string;
  priceMin: number;
  priceMax: number;
  searchQuery: string;
  sortBy: 'featured' | 'newest' | 'price_asc' | 'price_desc' | 'name_asc';
}
