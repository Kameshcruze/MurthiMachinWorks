/**
 * Complete SQL Schema & RLS Policies for Supabase
 * Can be copied directly and executed in Supabase SQL Editor.
 */

export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- MURTHI MACHINE WORKS - SUPABASE DATABASE SCHEMA & RLS POLICIES
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY DEFAULT ('cat-' || uuid_generate_v4()::text),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT ('prod-' || uuid_generate_v4()::text),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    sku TEXT NOT NULL UNIQUE,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    brand TEXT DEFAULT 'Murthi Precision',
    short_description TEXT,
    description TEXT,
    price NUMERIC(12,2) DEFAULT 0,
    sale_price NUMERIC(12,2),
    show_price BOOLEAN DEFAULT true,
    stock_status TEXT DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock', 'made_to_order', 'low_stock', 'out_of_stock')),
    features JSONB DEFAULT '[]'::jsonb,
    specifications JSONB DEFAULT '[]'::jsonb,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Product Images Table
CREATE TABLE IF NOT EXISTS public.product_images (
    id TEXT PRIMARY KEY DEFAULT ('img-' || uuid_generate_v4()::text),
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    sort_order INT DEFAULT 1,
    is_primary BOOLEAN DEFAULT false,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Enquiries Table
CREATE TABLE IF NOT EXISTS public.enquiries (
    id TEXT PRIMARY KEY DEFAULT ('enq-' || uuid_generate_v4()::text),
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT,
    company TEXT,
    location TEXT,
    message TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quotation_sent', 'converted', 'closed')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Enquiry Items Table
CREATE TABLE IF NOT EXISTS public.enquiry_items (
    id TEXT PRIMARY KEY DEFAULT ('item-' || uuid_generate_v4()::text),
    enquiry_id TEXT NOT NULL REFERENCES public.enquiries(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    sku TEXT NOT NULL,
    price NUMERIC(12,2),
    quantity INT DEFAULT 1,
    image_url TEXT,
    category_name TEXT
);

-- 7. Create Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'site_settings_1',
    business_name TEXT DEFAULT 'Murthi Machine Works',
    tagline TEXT DEFAULT 'Precision Machinery. Built for Performance.',
    logo_url TEXT,
    phone TEXT DEFAULT '+91 98422 54321',
    whatsapp TEXT DEFAULT '+91 98422 54321',
    email TEXT DEFAULT 'sales@murthimachineworks.com',
    address TEXT,
    google_maps_url TEXT,
    hero_title TEXT DEFAULT 'Precision Machinery. Built for Performance.',
    hero_description TEXT,
    hero_image TEXT,
    featured_heading TEXT DEFAULT 'Industrial Grade Machine Tools',
    about_content TEXT,
    currency_symbol TEXT DEFAULT '₹',
    gstin TEXT DEFAULT '33AABCM1234F1Z8',
    established_year TEXT DEFAULT '1985',
    social_links JSONB DEFAULT '{"linkedin":"","youtube":"","facebook":"","instagram":"","twitter":""}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS Policies
-- Public Read for Active Categories, Products, Images, Site Settings
CREATE POLICY "Allow public read active categories" ON public.categories FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');
CREATE POLICY "Allow public read active products" ON public.products FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');
CREATE POLICY "Allow public read product images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Allow public read site settings" ON public.site_settings FOR SELECT USING (true);

-- Public Enquiry Submission
CREATE POLICY "Allow public insert enquiries" ON public.enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert enquiry items" ON public.enquiry_items FOR INSERT WITH CHECK (true);

-- Authenticated Admin Full CRUD Policies
CREATE POLICY "Allow authenticated full access to categories" ON public.categories FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access to products" ON public.products FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access to product images" ON public.product_images FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access to enquiries" ON public.enquiries FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access to enquiry items" ON public.enquiry_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access to site settings" ON public.site_settings FOR ALL USING (auth.role() = 'authenticated');

-- 10. Storage Bucket Setup (Run in Storage SQL if required)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access product images" ON storage.objects 
FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users upload product images" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
`;

export const SUPABASE_SCHEMA_SQL = SUPABASE_SQL_SCHEMA;
