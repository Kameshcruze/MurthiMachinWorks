/**
 * Complete SQL Schema & RLS Policies for Supabase with Initial Machinery Seed Data
 * Can be copied directly and executed in Supabase SQL Editor.
 */

export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- MURTHI MACHINE WORKS - SUPABASE DATABASE SCHEMA, POLICIES & SEED DATA
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
    phone TEXT DEFAULT '+91 95852 62522',
    whatsapp TEXT DEFAULT '+91 95852 62522',
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

-- 9. Drop previous restrictive policies if they exist
DROP POLICY IF EXISTS "Allow public read active categories" ON public.categories;
DROP POLICY IF EXISTS "Allow public read active products" ON public.products;
DROP POLICY IF EXISTS "Allow public read product images" ON public.product_images;
DROP POLICY IF EXISTS "Allow public read site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow public insert enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Allow public insert enquiry items" ON public.enquiry_items;
DROP POLICY IF EXISTS "Allow authenticated full access to categories" ON public.categories;
DROP POLICY IF EXISTS "Allow authenticated full access to products" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated full access to product images" ON public.product_images;
DROP POLICY IF EXISTS "Allow authenticated full access to enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Allow authenticated full access to enquiry items" ON public.enquiry_items;
DROP POLICY IF EXISTS "Allow authenticated full access to site settings" ON public.site_settings;

-- 10. Create Permissive Policies for Web & Admin
CREATE POLICY "Public full access categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access product_images" ON public.product_images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access enquiries" ON public.enquiries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access enquiry_items" ON public.enquiry_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access site_settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

-- 11. Initial Data Seeding (Categories)
INSERT INTO public.categories (id, name, slug, description, image_url, is_active, sort_order)
VALUES 
('cat-lathe', 'Lathe Machines', 'lathe-machines', 'Heavy duty all-geared, medium duty, and precision tool room lathe machines.', 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80', true, 1),
('cat-milling', 'Milling Machines', 'milling-machines', 'Universal, vertical, and horizontal knee-type milling machines.', 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80', true, 2),
('cat-cnc', 'CNC Machinery', 'cnc-machinery', 'High-speed CNC vertical machining centers and precision turning centers.', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80', true, 3),
('cat-drilling', 'Drilling Machines', 'drilling-machines', 'Heavy duty radial arm drills, pillar drilling machines, and multi-spindle drilling.', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80', true, 4),
('cat-grinding', 'Grinding Machines', 'grinding-machines', 'Hydraulic surface grinders, universal cylindrical grinders, and tool & cutter grinders.', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80', true, 5),
('cat-cutting', 'Cutting & Sawing Machines', 'cutting-and-sawing', 'Semi-automatic and double-column horizontal metal bandsaw cutting machines.', 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80', true, 6),
('cat-hydraulic', 'Hydraulic Presses', 'hydraulic-presses', 'C-frame, H-frame, and deep-throat hydraulic pressing machines for stamping & bending.', 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=800&q=80', true, 7),
('cat-accessories', 'Tooling & Accessories', 'tooling-and-accessories', 'Precision 3-jaw/4-jaw chucks, rotary tables, quick-change tool posts, and DRO systems.', 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=800&q=80', true, 8)
ON CONFLICT (id) DO NOTHING;

-- 12. Initial Site Settings
INSERT INTO public.site_settings (id, business_name, tagline, phone, whatsapp, email, address, gstin, established_year)
VALUES (
    'site_settings_1',
    'Murthi Machine Works',
    'Precision Machinery. Built for Performance.',
    '+91 95852 62522',
    '+91 95852 62522',
    'sales@murthimachineworks.com',
    'Plot No. 42-45, SIDCO Industrial Estate, Pollachi Main Road, Coimbatore, Tamil Nadu - 641021, India',
    '33AABCM1234F1Z8',
    '1985'
)
ON CONFLICT (id) DO NOTHING;

-- 13. Initial Products Seeding
INSERT INTO public.products (id, name, slug, sku, category_id, brand, short_description, description, price, sale_price, show_price, stock_status, is_featured, is_active, features, specifications)
VALUES
(
    'prod-1',
    'Heavy Duty All-Geared Precision Lathe Machine',
    'heavy-duty-all-geared-precision-lathe-machine',
    'MMW-LT-450G',
    'cat-lathe',
    'Murthi Precision',
    'Induction hardened bedways, flame-treated gears, and 450mm swing over bed for heavy industrial turning.',
    'The Murthi MMW-LT-450G is an industrial workhorse built for rigorous high-tolerance turning, threading, and boring applications.',
    485000,
    460000,
    true,
    'in_stock',
    true,
    true,
    '["Induction hardened & ground bedways (Hardness 450-500 BHN)", "12 Spindle Speeds from 35 to 1400 RPM with oil pump", "Universal gearbox for Metric, Whitworth, Module, and Diametral threading", "Camlock D1-6 spindle nose with precision taper roller bearings"]'::jsonb,
    '[{"key": "Center Height", "value": "250 mm (10 inch)"}, {"key": "Length of Bed", "value": "2500 mm (8 Feet)"}, {"key": "Swing Over Bed", "value": "500 mm"}, {"key": "Main Motor Power", "value": "5.5 kW (7.5 HP) 3-Phase"}]'::jsonb
),
(
    'prod-2',
    'Universal Heavy Duty Milling Machine with DRO',
    'universal-heavy-duty-milling-machine-dro',
    'MMW-ML-3U',
    'cat-milling',
    'Murthi Precision',
    '3-Axis motorized feed with swivel table ±45°, ISO 40/50 spindle, and precision optical DRO.',
    'Engineered for high metal removal rates and exceptional surface finishes in die making and precision milling.',
    675000,
    null,
    true,
    'in_stock',
    true,
    true,
    '["Universal vertical milling head with 360-degree swiveling", "Automatic power feeds on all 3 axes", "Built-in coolant recirculating system", "Pre-installed 3-Axis precision glass scale DRO"]'::jsonb,
    '[{"key": "Table Size", "value": "1370 x 320 mm"}, {"key": "Longitudinal Travel (X)", "value": "800 mm"}, {"key": "Spindle Taper", "value": "ISO 50 / NT 50"}, {"key": "Motor Rating", "value": "7.5 kW (10 HP)"}]'::jsonb
),
(
    'prod-3',
    'Precision CNC Vertical Machining Center VMC-850',
    'precision-cnc-vertical-machining-center-vmc-850',
    'MMW-CNC-VMC850',
    'cat-cnc',
    'Murthi Titan CNC',
    'BT-40 10,000 RPM spindle, 24-station arm type tool changer, Fanuc 0i-MF Plus controller.',
    'High-rigidity C-frame structure with precision linear roller guideways on all axes for high-speed dynamic machining.',
    2450000,
    2380000,
    true,
    'made_to_order',
    true,
    true,
    '["Fanuc 0i-MF Plus / Siemens 828D CNC Controller", "24 Tools Twin-Arm Automatic Tool Changer", "High-speed 10,000 RPM BT40 Spindle with chiller", "Automatic dual screw chip conveyors"]'::jsonb,
    '[{"key": "X/Y/Z Travel", "value": "850 / 550 / 550 mm"}, {"key": "Table Size", "value": "1000 x 500 mm"}, {"key": "Positioning Accuracy", "value": "±0.005 mm"}, {"key": "Spindle Motor Power", "value": "11/15 kW"}]'::jsonb
),
(
    'prod-4',
    'Heavy Duty 50mm Industrial Radial Drilling Machine',
    'heavy-duty-50mm-industrial-radial-drilling-machine',
    'MMW-RD-50/1600',
    'cat-drilling',
    'Murthi Precision',
    'Hydraulic clamping, 1600mm arm radius, 50mm solid drilling capacity in steel, MT-5 spindle.',
    'Designed for heavy engineering fabrication, pressure vessel manufacturing, and structural steel drilling.',
    520000,
    null,
    true,
    'in_stock',
    true,
    true,
    '["Hydraulic pre-selection for speed and feed changes", "Hardened and ground column sleeve", "Box table with precision T-slots included", "Motorized arm elevation with dual safety nuts"]'::jsonb,
    '[{"key": "Drilling Capacity in Steel", "value": "50 mm"}, {"key": "Arm Radius", "value": "1600 mm"}, {"key": "Spindle Taper", "value": "MT-5"}, {"key": "Drill Motor", "value": "4.0 kW (5.5 HP)"}]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 14. Initial Product Images Seeding
INSERT INTO public.product_images (id, product_id, image_url, sort_order, is_primary, caption)
VALUES
('img-1-1', 'prod-1', 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=85', 1, true, 'Front view'),
('img-2-1', 'prod-2', 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=85', 1, true, 'Universal milling machine'),
('img-3-1', 'prod-3', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=85', 1, true, 'VMC-850 center'),
('img-4-1', 'prod-4', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=85', 1, true, 'Radial arm drill')
ON CONFLICT (id) DO NOTHING;
`;

export const SUPABASE_SCHEMA_SQL = SUPABASE_SQL_SCHEMA;

