import { Category, Product, SiteSettings, Enquiry } from '../types';

export const INITIAL_SETTINGS: SiteSettings = {
  id: 'site_settings_1',
  business_name: 'Murthi Machin Works',
  tagline: 'All New and Old Machinery Sales & Service',
  logo_url: '',
  phone: '98422 66521',
  whatsapp: '98422 66521',
  email: 'murthimachineworks@gmail.com',
  address: 'No. 45, South Street No. 1, Avarampalayam, Coimbatore - 641 006, Tamil Nadu, India.',
  google_maps_url: 'https://maps.google.com/?q=Avarampalayam+Coimbatore',
  hero_title: 'Leading Machinery Sales & Service Experts in Coimbatore',
  hero_description: 'New Machinery • Used Machinery • Repairs • Maintenance • Reconditioning',
  hero_image: '/hero-banner.webp',
  featured_heading: 'Our Best Selling Machines',
  about_content: "Murthi Machin Works is one of Coimbatore's trusted machinery sales and service providers, offering both new and used industrial machinery with complete maintenance and support. With over 15 years of experience, we have built a strong reputation for quality, reliability, and customer satisfaction. Our team of skilled technicians ensures the best service and support for all types of industrial machinery.",
  currency_symbol: '₹',
  gstin: '33AABCM1234F1Z8',
  established_year: '2008',
  social_links: {
    linkedin: 'https://linkedin.com/company/murthi-machin-works',
    youtube: 'https://youtube.com/@murthimachineworks',
    facebook: 'https://facebook.com/murthimachineworks',
    instagram: 'https://instagram.com/murthimachineworks',
    twitter: 'https://twitter.com/murthimachines'
  }
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'MMW-lathe',
    name: 'Lathe Machines',
    slug: 'lathe-machines',
    description: 'Heavy duty all-geared, medium duty, and precision tool room lathe machines engineered for rigorous turning operations.',
    image_url: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    sort_order: 1,
    keywords: ['lathe', 'lathe machine', 'turning machine', 'all geared lathe', 'tool room lathe', 'heavy duty lathe', 'kharad']
  },
  {
    id: 'MMW-drilling',
    name: 'Drilling Machines',
    slug: 'drilling-machines',
    description: 'Heavy duty radial arm drills, pillar type drilling machines, and multi-spindle drilling equipment.',
    image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    sort_order: 2,
    keywords: ['drilling machine', 'pillar drill', 'radial drill', 'pillar type', 'tapping machine', 'boring']
  },
  {
    id: 'MMW-hydraulic',
    name: 'Hydraulic Press Machines',
    slug: 'hydraulic-press-machines',
    description: 'H-frame, C-frame, and deep-throat hydraulic pressing and power press machines for stamping, bending, and pressing.',
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    sort_order: 3,
    keywords: ['hydraulic press', 'power press', 'h frame', 'c frame', 'stamping press', '100 ton', '60 ton']
  },
  {
    id: 'MMW-cutting',
    name: 'Cutting Machines',
    slug: 'cutting-machines',
    description: 'Horizontal metal bandsaw cutting machines, circular sawing, and profile cutting systems for alloy billets.',
    image_url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    sort_order: 4,
    keywords: ['cutting machine', 'bandsaw', 'metal cutting', 'sawing', 'billet cutting', 'pipe cutting']
  },
  {
    id: 'MMW-workshop',
    name: 'Industrial Workshop Equipment',
    slug: 'industrial-workshop-equipment',
    description: 'Surface grinders, shaping machines, universal milling, and precision maintenance workshop machinery.',
    image_url: 'https://images.unsplash.com/photo-1581092335878-2d9ff86ca2bf?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    sort_order: 5,
    keywords: ['workshop equipment', 'milling', 'grinding', 'shaper', 'maintenance machinery', 'industrial equipment']
  },
  {
    id: 'MMW-fabrication',
    name: 'Fabrication Machines',
    slug: 'fabrication-machines',
    description: 'Sheet metal shearing machines, hydraulic press brakes, rolling machines, and section bending tools.',
    image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    sort_order: 6,
    keywords: ['fabrication', 'shearing machine', 'press brake', 'bending machine', 'plate rolling', 'sheet metal']
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Lathe Machine - Heavy Duty',
    slug: 'lathe-machine-heavy-duty',
    sku: 'MMW-LT-500HD',
    category_id: 'MMW-lathe',
    category_name: 'Lathe Machines',
    brand: 'Murthi Machin Works',
    keywords: ['lathe', 'heavy duty', '500mm swing', '1500mm center', 'turning machine', 'all geared'],
    short_description: 'Swing Over Bed: 500 mm • Center Distance: 1500 mm • Condition: Excellent',
    description: 'High-rigidity all-geared heavy duty lathe machine built for industrial turning, facing, and precision threading. Features induction-hardened bedways, large spindle bore, and precision gearbox.',
    price: 485000,
    sale_price: 460000,
    show_price: true,
    stock_status: 'in_stock',
    features: [
      'Swing Over Bed: 500 mm',
      'Center Distance: 1500 mm',
      'Condition: Excellent',
      'Induction hardened & ground bedways',
      'Universal metric and inch threading gearbox',
      'Full oil bath lubrication system'
    ],
    specifications: [
      { key: 'Swing Over Bed', value: '500 mm' },
      { key: 'Center Distance', value: '1500 mm' },
      { key: 'Condition', value: 'Excellent' },
      { key: 'Spindle Bore', value: '58 mm' },
      { key: 'Motor Power', value: '7.5 HP 3-Phase' }
    ],
    is_featured: true,
    is_active: true,
    images: [
      {
        id: 'img-1-1',
        image_url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=85',
        sort_order: 1,
        is_primary: true,
        caption: 'Lathe Machine - Heavy Duty'
      }
    ],
    created_at: new Date(Date.now() - 15 * 86400000).toISOString()
  },
  {
    id: 'prod-2',
    name: 'Drilling Machine - Pillar Type',
    slug: 'drilling-machine-pillar-type',
    sku: 'MMW-DR-25P',
    category_id: 'MMW-drilling',
    category_name: 'Drilling Machines',
    brand: 'Murthi Machin Works',
    keywords: ['drilling machine', 'pillar type', '25mm drill', '1440 rpm', 'pillar drill'],
    short_description: 'Drill Capacity: 25 mm • Spindle Speed: 1440 RPM • Condition: Very Good',
    description: 'Robust pillar drilling machine designed for precision workshop drilling, reaming, and tapping. Features heavy ground column and multi-speed belt drive.',
    price: 95000,
    sale_price: null,
    show_price: true,
    stock_status: 'in_stock',
    features: [
      'Drill Capacity: 25 mm',
      'Spindle Speed: 1440 RPM',
      'Condition: Very Good',
      'Precision machined heavy ground column',
      'Rack and pinion table elevation mechanism',
      'Cast iron base with T-slots'
    ],
    specifications: [
      { key: 'Drill Capacity', value: '25 mm' },
      { key: 'Spindle Speed', value: '1440 RPM' },
      { key: 'Condition', value: 'Very Good' },
      { key: 'Spindle Travel', value: '130 mm' },
      { key: 'Motor Rating', value: '1.5 HP' }
    ],
    is_featured: true,
    is_active: true,
    images: [
      {
        id: 'img-2-1',
        image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=85',
        sort_order: 1,
        is_primary: true,
        caption: 'Drilling Machine - Pillar Type'
      }
    ],
    created_at: new Date(Date.now() - 12 * 86400000).toISOString()
  },
  {
    id: 'prod-3',
    name: 'Hydraulic Press Machine',
    slug: 'hydraulic-press-machine-100t',
    sku: 'MMW-HP-100H',
    category_id: 'MMW-hydraulic',
    category_name: 'Hydraulic Press Machines',
    brand: 'Murthi Machin Works',
    keywords: ['hydraulic press', '100 ton', 'h-frame', 'h frame press', 'pressing machine'],
    short_description: 'Capacity: 100 Ton • Type: H-Frame • Condition: Excellent',
    description: 'Heavy duty 100-Ton H-frame hydraulic press for industrial stamping, bearing pressing, straightening, and deep drawing operations. Engineered with high-grade steel fabrication.',
    price: 650000,
    sale_price: 620000,
    show_price: true,
    stock_status: 'in_stock',
    features: [
      'Capacity: 100 Ton',
      'Type: H-Frame',
      'Condition: Excellent',
      'Heavy duty welded steel frame with stress relief',
      'Precision hydraulic power pack with pressure relief valve',
      'Dual push button control for safety'
    ],
    specifications: [
      { key: 'Capacity', value: '100 Ton' },
      { key: 'Type', value: 'H-Frame' },
      { key: 'Condition', value: 'Excellent' },
      { key: 'Stroke', value: '300 mm' },
      { key: 'Working Table', value: '750 x 500 mm' }
    ],
    is_featured: true,
    is_active: true,
    images: [
      {
        id: 'img-3-1',
        image_url: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1200&q=85',
        sort_order: 1,
        is_primary: true,
        caption: 'Hydraulic Press Machine'
      }
    ],
    created_at: new Date(Date.now() - 10 * 86400000).toISOString()
  },
  {
    id: 'prod-4',
    name: 'Power Press Machine',
    slug: 'power-press-machine-60t',
    sku: 'MMW-PP-60T',
    category_id: 'MMW-hydraulic',
    category_name: 'Hydraulic Press Machines',
    brand: 'Murthi Machin Works',
    keywords: ['power press', '60 ton', 'sheet metal press', 'stamping press', 'power press machine'],
    short_description: 'Capacity: 60 Ton • Stroke: 110 mm • Condition: Excellent',
    description: 'Mechanical C-frame power press machine for rapid sheet metal punching, blanking, trimming, and forming operations in automotive and electrical fabrication.',
    price: 420000,
    sale_price: null,
    show_price: true,
    stock_status: 'in_stock',
    features: [
      'Capacity: 60 Ton',
      'Stroke: 110 mm',
      'Condition: Excellent',
      'High grade alloy steel crankshaft',
      'Rolling key clutch with foot pedal trigger',
      'Adjustable stroke mechanism'
    ],
    specifications: [
      { key: 'Capacity', value: '60 Ton' },
      { key: 'Stroke', value: '110 mm' },
      { key: 'Condition', value: 'Excellent' },
      { key: 'Shut Height', value: '280 mm' },
      { key: 'Strokes Per Minute', value: '55 SPM' }
    ],
    is_featured: true,
    is_active: true,
    images: [
      {
        id: 'img-4-1',
        image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=85',
        sort_order: 1,
        is_primary: true,
        caption: 'Power Press Machine'
      }
    ],
    created_at: new Date(Date.now() - 8 * 86400000).toISOString()
  },
  {
    id: 'prod-5',
    name: 'Precision Hydraulic Surface Grinding Machine',
    slug: 'precision-hydraulic-surface-grinding-machine-4080',
    sku: 'MMW-SG-4080H',
    category_id: 'MMW-grinding',
    category_name: 'Grinding Machines',
    brand: 'Murthi Precision',
    keywords: ['surface grinder', 'hydraulic grinding', 'grinder', 'magnetic chuck', 'precision grinding', 'die finishing', 'tool grinding', '400x800', 'micro finish'],
    short_description: 'Working area 400 x 800 mm, auto cross/longitudinal feeds, electro-magnetic chuck & demagnetizer.',
    description: 'High-accuracy surface grinder for die makers, punch tool manufacturers, and precision engineering. Features cartridge-type spindle with high-precision angular contact bearings, hydrostatic lubrication slideways, and stepless hydraulic longitudinal table speeds with smooth shockless stroke reversal.',
    price: 740000,
    sale_price: 710000,
    show_price: true,
    stock_status: 'in_stock',
    features: [
      'High-grade Meehanite double-walled column casting',
      'Ultra-precise dynamic balanced cartridge spindle (Runout < 0.002mm)',
      'Independent hydraulic power unit with oil cooler to prevent thermal expansion',
      'Electro-magnetic chuck 400 x 800 mm with automatic demagnetizer controller',
      'Auto-downfeed mechanism with fine micro-feed dial (0.001mm)'
    ],
    specifications: [
      { key: 'Table Working Surface', value: '400 x 800 mm' },
      { key: 'Max Grinding Length', value: '850 mm' },
      { key: 'Max Grinding Width', value: '430 mm' },
      { key: 'Distance Spindle Center to Table', value: '580 mm' },
      { key: 'Grinding Wheel Size', value: '350 x 40 x 127 mm' },
      { key: 'Table Speed (Stepless)', value: '5 - 25 m/min' },
      { key: 'Spindle Motor Power', value: '5.5 kW (7.5 HP)' },
      { key: 'Gross Weight', value: '3,200 kg' }
    ],
    is_featured: false,
    is_active: true,
    images: [
      {
        id: 'img-5-1',
        image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=85',
        sort_order: 1,
        is_primary: true
      }
    ],
    created_at: new Date(Date.now() - 6 * 86400000).toISOString()
  },
  {
    id: 'prod-6',
    name: 'Semi-Automatic Heavy Double Column Metal Bandsaw',
    slug: 'semi-automatic-double-column-metal-bandsaw-350',
    sku: 'MMW-BS-350DC',
    category_id: 'MMW-cutting',
    category_name: 'Cutting & Sawing Machines',
    brand: 'Murthi CutMaster',
    keywords: ['bandsaw', 'metal saw', 'double column bandsaw', 'horizontal bandsaw', 'billet cutting', 'pipe cutting', 'structural steel cutting', 'hydraulic bandsaw'],
    short_description: 'Dual column linear guides, hydraulic blade tensioning, and 350mm round bar cutting capacity.',
    description: 'Double column guided structure ensures maximum rigid beam stability for vibration-free cutting of high-tensile alloy steels, titanium, stainless steel pipes, and solid billets. Automatic hydraulic clamping vise, carbide blade guide pads, and electronic inverter for stepless blade speed regulation.',
    price: 360000,
    sale_price: null,
    show_price: true,
    stock_status: 'in_stock',
    features: [
      'Dual chrome-plated solid steel columns with recirculating ball bushings',
      'Hydraulic top clamping and main vise for bundle cutting',
      'Infinitely variable blade speed via frequency inverter (20 - 90 m/min)',
      'Tungsten carbide guide pads and roller bearings for straight precision cuts',
      'Automatic power cut-off on blade breakage or cut completion'
    ],
    specifications: [
      { key: 'Cutting Capacity (Round)', value: '350 mm' },
      { key: 'Cutting Capacity (Square)', value: '350 x 350 mm' },
      { key: 'Cutting Capacity (Rectangular)', value: '450 x 350 mm' },
      { key: 'Blade Dimensions', value: '4115 x 34 x 1.1 mm' },
      { key: 'Main Drive Motor', value: '3.7 kW (5.0 HP)' },
      { key: 'Hydraulic Motor', value: '0.75 kW' },
      { key: 'Machine Dimensions', value: '2100 x 1200 x 1650 mm' }
    ],
    is_featured: false,
    is_active: true,
    images: [
      {
        id: 'img-6-1',
        image_url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1200&q=85',
        sort_order: 1,
        is_primary: true
      }
    ],
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'prod-7',
    name: '100 Ton Heavy Duty C-Frame Hydraulic Power Press',
    slug: '100-ton-heavy-duty-c-frame-hydraulic-power-press',
    sku: 'MMW-HP-100T',
    category_id: 'MMW-hydraulic',
    category_name: 'Hydraulic Presses',
    brand: 'Murthi HydroTech',
    keywords: ['hydraulic press', 'power press', 'c frame', '100 ton', 'sheet metal pressing', 'punching machine', 'stamping press', 'deep drawing', 'forging press'],
    short_description: '1000 kN nominal force, PLC touch screen control, light curtain safety sensors, and micro-inching stroke.',
    description: 'Designed for metal punching, stamping, deep drawing, straightening, and bearing pressing. Constructed with ultrasound-tested high tensile steel plates, stress relieved by thermal vibration. Hydraulic power pack uses Rexroth/Yuken valves for smooth pressure holding and leak-free operation.',
    price: 890000,
    sale_price: null,
    show_price: false, // "Contact for Price"
    stock_status: 'made_to_order',
    features: [
      'Delta PLC control with 7-inch color touch HMI screen for pressure & dwell setup',
      'Dual optical safety light curtains for 100% operator protection',
      'Adjustable stroke limit switches and pressure transducer cutoff',
      'Hydraulic cushion cylinder underneath bed (Optional 30T)',
      'T-slotted upper ram and bottom bolsters for rapid die changeover'
    ],
    specifications: [
      { key: 'Nominal Force', value: '100 Metric Tons (1000 kN)' },
      { key: 'Max Working Pressure', value: '25 MPa' },
      { key: 'Stroke of Ram', value: '350 mm' },
      { key: 'Daylight Opening', value: '600 mm' },
      { key: 'Throat Depth', value: '350 mm' },
      { key: 'Bolster Table Size', value: '800 x 600 mm' },
      { key: 'Ram Fast Approach Speed', value: '120 mm/s' },
      { key: 'Motor Rating', value: '11 kW (15 HP)' }
    ],
    is_featured: false,
    is_active: true,
    images: [
      {
        id: 'img-7-1',
        image_url: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1200&q=85',
        sort_order: 1,
        is_primary: true
      }
    ],
    created_at: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 'prod-8',
    name: 'High Precision CNC Slant Bed Turning Center',
    slug: 'high-precision-cnc-slant-bed-turning-center-tc200',
    sku: 'MMW-CNC-TC200',
    category_id: 'MMW-cnc',
    category_name: 'CNC Machinery',
    brand: 'Murthi Titan CNC',
    keywords: ['cnc lathe', 'turning center', 'slant bed', 'fanuc cnc', '8 station turret', 'cnc turning', 'auto component turning', 'hydraulic chuck', 'high speed turning'],
    short_description: '30° true slant bed, 8-station hydraulic turret, 8-inch chuck, 4500 RPM spindle speed.',
    description: 'A rigid, high-productivity CNC slant bed lathe designed for rapid cycle times on automotive components, flanges, shafts, and precision fittings. Monoblock casting with 30-degree incline maximizes chip disposal and operator ergonomics.',
    price: 1850000,
    sale_price: 1780000,
    show_price: true,
    stock_status: 'in_stock',
    features: [
      'Fanuc 0i-TF Plus CNC system with Manual Guide i conversation software',
      'High-speed 8-station BTP hydraulic indexing turret (Index time 0.25s)',
      'Hydraulic 8-inch 3-jaw chuck with hollow cylinder for bar work',
      'Full enclosure guarding with interlock door safety switches',
      'Automatic programmable hydraulic tailstock with live center'
    ],
    specifications: [
      { key: 'Max Swing Over Bed', value: '500 mm' },
      { key: 'Max Turning Diameter', value: '320 mm' },
      { key: 'Max Turning Length', value: '450 mm' },
      { key: 'Spindle Nose', value: 'A2-6' },
      { key: 'Bar Capacity', value: '52 mm' },
      { key: 'Spindle Speed', value: '45 - 4500 RPM' },
      { key: 'Rapid Traverse (X/Z)', value: '24 / 30 m/min' },
      { key: 'Main Spindle Motor', value: '11/15 kW' }
    ],
    is_featured: true,
    is_active: true,
    images: [
      {
        id: 'img-8-1',
        image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=85',
        sort_order: 1,
        is_primary: true
      },
      {
        id: 'img-8-2',
        image_url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=85',
        sort_order: 2,
        is_primary: false
      }
    ],
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'prod-9',
    name: 'Heavy Duty Industrial 3-Jaw Self-Centering Scroll Chuck 315mm',
    slug: 'heavy-duty-industrial-3-jaw-scroll-chuck-315mm',
    sku: 'MMW-ACC-CK315',
    category_id: 'MMW-accessories',
    category_name: 'Tooling & Accessories',
    brand: 'Murthi Precision Tooling',
    keywords: ['lathe chuck', '3 jaw chuck', 'scroll chuck', '315mm chuck', 'forged chuck', 'reversible jaws', 'machinery tooling', 'turning accessory'],
    short_description: 'Forged steel body, hardened reversible two-piece jaws, A2-8 direct mount or flat back.',
    description: 'Premium lathe chuck for high-clamping force turning on conventional lathes and CNC lathes. High tensile forged steel body guarantees maximum grip rigidity and low centrifugal force loss at high RPMs.',
    price: 34500,
    sale_price: null,
    show_price: true,
    stock_status: 'in_stock',
    features: [
      'Drop forged alloy steel body for extreme toughness',
      'Hardened and ground scroll plate and pinions for smooth tightening',
      'Supplied with 1 set of hard master jaws and 1 set of hard top reversible jaws',
      'Precision ground matching serial-numbered jaws for high runout accuracy'
    ],
    specifications: [
      { key: 'Chuck Diameter', value: '315 mm (12.5 inch)' },
      { key: 'Center Bore', value: '100 mm' },
      { key: 'Clamping Range (Internal)', value: '15 - 130 mm' },
      { key: 'Clamping Range (External)', value: '90 - 290 mm' },
      { key: 'Max Speed', value: '2200 RPM' },
      { key: 'Max Gripping Force', value: '55 kN' }
    ],
    is_featured: false,
    is_active: true,
    images: [
      {
        id: 'img-9-1',
        image_url: 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=1200&q=85',
        sort_order: 1,
        is_primary: true
      }
    ],
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

export const INITIAL_ENQUIRIES: Enquiry[] = [
  {
    id: 'enq-1001',
    customer_name: 'Rajesh Sundaram',
    company: 'Apex Auto Forgings Pvt Ltd',
    phone: '+91 98401 23456',
    whatsapp: '+91 98401 23456',
    email: 'purchase@apexautoforgings.com',
    location: 'Chennai, Tamil Nadu',
    message: 'We are expanding our tier-1 automotive line and require a formal quotation and CIF pricing for the 50mm Radial Drill and Lathe machine. Please share delivery lead time.',
    status: 'new',
    notes: 'Called customer; they need delivery within 4 weeks for their new batch of shafts.',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    items: [
      {
        product_id: 'prod-4',
        product_name: 'Heavy Duty 50mm Industrial Radial Drilling Machine',
        sku: 'MMW-RD-50/1600',
        price: 520000,
        quantity: 2,
        image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
        category_name: 'Drilling Machines'
      },
      {
        product_id: 'prod-1',
        product_name: 'Heavy Duty All-Geared Precision Lathe Machine',
        sku: 'MMW-LT-450G',
        price: 460000,
        quantity: 1,
        image_url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
        category_name: 'Lathe Machines'
      }
    ]
  },
  {
    id: 'enq-1002',
    customer_name: 'Anand Kulkarni',
    company: 'Kulkarni Precision Toolings',
    phone: '+91 94220 87654',
    whatsapp: '+91 94220 87654',
    email: 'anand@kulkarnitools.in',
    location: 'Pune, Maharashtra',
    message: 'Please send complete technical catalog and layout foundation drawing for the VMC-850 vertical machining center.',
    status: 'quotation_sent',
    notes: 'Sent PDF quote on WhatsApp and email. Follow up scheduled for Friday.',
    created_at: new Date(Date.now() - 3600000 * 28).toISOString(),
    items: [
      {
        product_id: 'prod-3',
        product_name: 'Precision CNC Vertical Machining Center VMC-850',
        sku: 'MMW-CNC-VMC850',
        price: 2380000,
        quantity: 1,
        image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        category_name: 'CNC Machinery'
      }
    ]
  },
  {
    id: 'enq-1003',
    customer_name: 'M. Senthil Kumar',
    company: 'Sri Murugan Engineering Works',
    phone: '+91 97890 11223',
    whatsapp: '+91 97890 11223',
    email: 'senthil@srimuruganeng.com',
    location: 'Coimbatore, Tamil Nadu',
    message: 'Looking for 100 Ton Hydraulic Press for stamping sheet metal panels. Need demonstration.',
    status: 'contacted',
    notes: 'Customer invited to Coimbatore factory on Wednesday 11 AM.',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    items: [
      {
        product_id: 'prod-7',
        product_name: '100 Ton Heavy Duty C-Frame Hydraulic Power Press',
        sku: 'MMW-HP-100T',
        price: 890000,
        quantity: 1,
        image_url: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=800&q=80',
        category_name: 'Hydraulic Presses'
      }
    ]
  }
];

export const INITIAL_EMPLOYEES: any[] = [
  {
    id: 'emp-101',
    name: 'Murthi Admin (Master)',
    email: 'admin@murthimachineworks.com',
    password: 'admin123',
    role: 'super_admin',
    role_label: 'Super Administrator',
    department: 'Executive Management',
    phone: '+91 95852 62522',
    is_active: true,
    last_login: new Date(Date.now() - 3600000 * 2).toISOString(),
    last_ip: '157.48.21.14',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 'emp-102',
    name: 'Kamesh R (Production Head)',
    email: 'kamesh@murthimachineworks.com',
    password: 'kamesh123',
    role: 'manager',
    role_label: 'Production Lead',
    department: 'Machine Shop & Quality',
    phone: '+91 95852 62522',
    is_active: true,
    last_login: new Date(Date.now() - 3600000 * 5).toISOString(),
    last_ip: '49.207.202.91',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString()
  },
  {
    id: 'emp-103',
    name: 'Praveen Kumar',
    email: 'editor@murthimachineworks.com',
    password: 'editor123',
    role: 'editor',
    role_label: 'Catalog Specialist',
    department: 'Digital Catalog & Technical Specs',
    phone: '+91 95852 62522',
    is_active: true,
    last_login: new Date(Date.now() - 3600000 * 12).toISOString(),
    last_ip: '117.203.14.88',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString()
  },
  {
    id: 'emp-104',
    name: 'Suresh Rajan',
    email: 'sales@murthimachineworks.com',
    password: 'sales123',
    role: 'sales',
    role_label: 'Senior Sales Engineer',
    department: 'Domestic & Export Quotations',
    phone: '+91 98433 77665',
    is_active: true,
    last_login: new Date(Date.now() - 3600000 * 24).toISOString(),
    last_ip: '106.51.72.33',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString()
  }
];

export const INITIAL_AUDIT_LOGS: any[] = [
  {
    id: 'log-101',
    action: 'CREATE',
    target_type: 'PRODUCT',
    target_id: 'prod-3',
    target_name: 'Precision CNC Vertical Machining Center VMC-850',
    user_id: 'emp-102',
    user_email: 'kamesh@murthimachineworks.com',
    user_name: 'Kamesh R (Production Head)',
    user_role: 'Production Lead',
    ip_address: '49.207.202.91',
    details: 'Added new VMC machine model with BT-40 10,000 RPM spindle specifications and technical datasheet.',
    changes: [
      { field: 'sku', old_value: null, new_value: 'MMW-CNC-VMC850', field_label: 'Model SKU' },
      { field: 'price', old_value: null, new_value: 2380000, field_label: 'Unit Price' },
      { field: 'category_id', old_value: null, new_value: 'MMW-cnc', field_label: 'Category ID' },
      { field: 'stock_status', old_value: null, new_value: 'in_stock', field_label: 'Inventory Status' }
    ],
    created_at: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'log-102',
    action: 'UPDATE',
    target_type: 'PRODUCT',
    target_id: 'prod-1',
    target_name: 'Heavy Duty All-Geared Precision Lathe Machine',
    user_id: 'emp-101',
    user_email: 'admin@murthimachineworks.com',
    user_name: 'Murthi Admin (Master)',
    user_role: 'Super Administrator',
    ip_address: '157.48.21.14',
    details: 'Updated base quotation price and adjusted lead-time delivery schedule.',
    changes: [
      { field: 'price', old_value: 420000, new_value: 450000, field_label: 'Unit Price (₹)' },
      { field: 'stock_status', old_value: 'in_stock', new_value: 'in_stock', field_label: 'Stock Status' }
    ],
    created_at: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: 'log-103',
    action: 'UPDATE',
    target_type: 'PRODUCT',
    target_id: 'prod-4',
    target_name: 'Heavy Duty 50mm Industrial Radial Drilling Machine',
    user_id: 'emp-103',
    user_email: 'editor@murthimachineworks.com',
    user_name: 'Praveen Kumar',
    user_role: 'Catalog Specialist',
    ip_address: '117.203.14.88',
    details: 'Updated ISO 9001:2015 test report specifications and spindle diameter parameters.',
    changes: [
      { field: 'specifications', old_value: '3 specs', new_value: '5 specs added', field_label: 'Technical Specs' }
    ],
    created_at: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: 'log-104',
    action: 'CREATE',
    target_type: 'CATEGORY',
    target_id: 'MMW-accessories',
    target_name: 'Tooling & Accessories',
    user_id: 'emp-101',
    user_email: 'admin@murthimachineworks.com',
    user_name: 'Murthi Admin (Master)',
    user_role: 'Super Administrator',
    ip_address: '157.48.21.14',
    details: 'Configured new equipment category with prefix MMW-accessories.',
    changes: [
      { field: 'id', old_value: null, new_value: 'MMW-accessories', field_label: 'Category ID' }
    ],
    created_at: new Date(Date.now() - 3600000 * 36).toISOString()
  }
];

