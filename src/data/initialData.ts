import { Category, Product, SiteSettings, Enquiry } from '../types';

export const INITIAL_SETTINGS: SiteSettings = {
  id: 'site_settings_1',
  business_name: 'Murthi Machine Works',
  tagline: 'Precision Machinery. Built for Performance.',
  logo_url: '',
  phone: '+91 95852 62522',
  whatsapp: '+91 95852 62522',
  email: 'sales@murthimachineworks.com',
  address: 'Plot No. 42-45, SIDCO Industrial Estate, Pollachi Main Road, Coimbatore, Tamil Nadu - 641021, India',
  google_maps_url: 'https://maps.google.com/?q=Coimbatore+Industrial+Estate',
  hero_title: 'Precision Machinery. Built for Performance.',
  hero_description: 'Engineered for high-duty manufacturing, aerospace, automotive, and heavy fabrication workshops. Premium machine tools and custom industrial engineering solutions from Murthi Machine Works.',
  hero_image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1920&q=85',
  featured_heading: 'Industrial Grade Machine Tools',
  about_content: 'Established in 1985 in Coimbatore, Tamil Nadu, Murthi Machine Works is a premier manufacturer and supplier of heavy-duty machine tools, CNC machining centers, and precision industrial engineering equipment. With over 40 years of precision craftsmanship and ISO 9001:2015 certified production facilities, we empower over 3,500 workshops, automotive tiers, and aerospace vendors across India and globally.',
  currency_symbol: '₹',
  gstin: '33AABCM1234F1Z8',
  established_year: '1985',
  social_links: {
    linkedin: 'https://linkedin.com/company/murthi-machine-works',
    youtube: 'https://youtube.com/@murthimachineworks',
    facebook: 'https://facebook.com/murthimachineworks',
    instagram: 'https://instagram.com/murthimachineworks',
    twitter: 'https://twitter.com/murthimachines'
  }
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-lathe',
    name: 'Lathe Machines',
    slug: 'lathe-machines',
    description: 'Heavy duty all-geared, medium duty, and precision tool room lathe machines engineered for rigorous turning operations.',
    image_url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    sort_order: 1
  },
  {
    id: 'cat-milling',
    name: 'Milling Machines',
    slug: 'milling-machines',
    description: 'Universal, vertical, and horizontal knee-type milling machines for precision slotting, facing, and gear cutting.',
    image_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    sort_order: 2
  },
  {
    id: 'cat-cnc',
    name: 'CNC Machinery',
    slug: 'cnc-machinery',
    description: 'High-speed CNC vertical machining centers and precision turning centers with Siemens / Fanuc controllers.',
    image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    sort_order: 3
  },
  {
    id: 'cat-drilling',
    name: 'Drilling Machines',
    slug: 'drilling-machines',
    description: 'Heavy duty radial arm drills, pillar drilling machines, and multi-spindle drilling equipment for structural steel.',
    image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    sort_order: 4
  },
  {
    id: 'cat-grinding',
    name: 'Grinding Machines',
    slug: 'grinding-machines',
    description: 'Hydraulic surface grinders, universal cylindrical grinders, and tool & cutter grinders for micro-finish tolerances.',
    image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    sort_order: 5
  },
  {
    id: 'cat-cutting',
    name: 'Cutting & Sawing Machines',
    slug: 'cutting-and-sawing',
    description: 'Semi-automatic and double-column horizontal metal bandsaw cutting machines for structural steel and alloy billets.',
    image_url: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    sort_order: 6
  },
  {
    id: 'cat-hydraulic',
    name: 'Hydraulic Presses',
    slug: 'hydraulic-presses',
    description: 'C-frame, H-frame, and deep-throat hydraulic pressing machines for stamping, bending, and forging.',
    image_url: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    sort_order: 7
  },
  {
    id: 'cat-accessories',
    name: 'Tooling & Accessories',
    slug: 'tooling-and-accessories',
    description: 'Precision 3-jaw/4-jaw chucks, rotary tables, quick-change tool posts, DRO digital readout systems, and carbide tooling.',
    image_url: 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=800&q=80',
    is_active: true,
    sort_order: 8
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Heavy Duty All-Geared Precision Lathe Machine',
    slug: 'heavy-duty-all-geared-precision-lathe-machine',
    sku: 'MMW-LT-450G',
    category_id: 'cat-lathe',
    category_name: 'Lathe Machines',
    brand: 'Murthi Precision',
    short_description: 'Induction hardened bedways, flame-treated gears, and 450mm swing over bed for heavy industrial turning.',
    description: 'The Murthi MMW-LT-450G is an industrial workhorse built for rigorous high-tolerance turning, threading, and boring applications. Engineered with heavy-ribbed cast iron bed, hardened & ground alloy steel gears running in enclosed oil bath, and rapid cross-feed mechanism. Designed specifically for heavy machine shops, roll-turning, and precision jobbing workshops requiring vibration-free operation.',
    price: 485000,
    sale_price: 460000,
    show_price: true,
    stock_status: 'in_stock',
    features: [
      'Induction hardened & ground bedways (Hardness 450-500 BHN)',
      '12 Spindle Speeds from 35 to 1400 RPM with headstock oil pump lubrication',
      'Universal gearbox for Metric, Whitworth, Module, and Diametral threading',
      'Camlock D1-6 spindle nose with precision taper roller bearings',
      'Equipped with 3-Axis Digital Readout (DRO) mounting bracket',
      'Foot-operated mechanical emergency spindle brake'
    ],
    specifications: [
      { key: 'Center Height', value: '250 mm (10 inch)' },
      { key: 'Length of Bed', value: '2500 mm (8 Feet)' },
      { key: 'Admit Between Centers', value: '1500 mm' },
      { key: 'Swing Over Bed', value: '500 mm' },
      { key: 'Swing in Gap', value: '750 mm' },
      { key: 'Spindle Bore', value: '58 mm' },
      { key: 'Main Motor Power', value: '5.5 kW (7.5 HP) 3-Phase' },
      { key: 'Machine Weight', value: '2,400 kg' }
    ],
    is_featured: true,
    is_active: true,
    images: [
      {
        id: 'img-1-1',
        image_url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=85',
        sort_order: 1,
        is_primary: true,
        caption: 'Front perspective view'
      },
      {
        id: 'img-1-2',
        image_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=85',
        sort_order: 2,
        is_primary: false,
        caption: 'Headstock and carriage assembly'
      },
      {
        id: 'img-1-3',
        image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=85',
        sort_order: 3,
        is_primary: false,
        caption: 'Heavy ribbed casting bedways'
      }
    ],
    created_at: new Date(Date.now() - 15 * 86400000).toISOString()
  },
  {
    id: 'prod-2',
    name: 'Universal Heavy Duty Milling Machine with DRO',
    slug: 'universal-heavy-duty-milling-machine-dro',
    sku: 'MMW-ML-3U',
    category_id: 'cat-milling',
    category_name: 'Milling Machines',
    brand: 'Murthi Precision',
    short_description: '3-Axis motorized feed with swivel table ±45°, ISO 40/50 spindle, and precision optical DRO.',
    description: 'Engineered for high metal removal rates and exceptional surface finishes. The Murthi MMW-ML-3U features an ultra-rigid column, hardened slideways with turcite-B coating, and high-torque mechanical feeds on X, Y, and Z axes. Perfect for mold & die making, precision slot milling, helical gear generation, and face milling.',
    price: 675000,
    sale_price: null,
    show_price: true,
    stock_status: 'in_stock',
    features: [
      'Universal vertical milling head with 360-degree swiveling capability',
      'Automatic power feeds and rapid traverse on all 3 axes (X/Y/Z)',
      'Built-in coolant recirculating system and chip collection tray',
      'Centralized automated lubrication pump for all guideways',
      'Pre-installed 3-Axis high precision glass scale Digital Readout'
    ],
    specifications: [
      { key: 'Table Size', value: '1370 x 320 mm' },
      { key: 'Longitudinal Travel (X)', value: '800 mm' },
      { key: 'Cross Travel (Y)', value: '300 mm' },
      { key: 'Vertical Travel (Z)', value: '450 mm' },
      { key: 'Spindle Taper', value: 'ISO 50 / NT 50' },
      { key: 'Spindle Speed Range', value: '30 - 1500 RPM (12 Steps)' },
      { key: 'Table Swivel Angle', value: '± 45 Degrees' },
      { key: 'Motor Rating', value: '7.5 kW (10 HP)' }
    ],
    is_featured: true,
    is_active: true,
    images: [
      {
        id: 'img-2-1',
        image_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=85',
        sort_order: 1,
        is_primary: true
      },
      {
        id: 'img-2-2',
        image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=85',
        sort_order: 2,
        is_primary: false
      }
    ],
    created_at: new Date(Date.now() - 12 * 86400000).toISOString()
  },
  {
    id: 'prod-3',
    name: 'Precision CNC Vertical Machining Center VMC-850',
    slug: 'precision-cnc-vertical-machining-center-vmc-850',
    sku: 'MMW-CNC-VMC850',
    category_id: 'cat-cnc',
    category_name: 'CNC Machinery',
    brand: 'Murthi Titan CNC',
    short_description: 'BT-40 10,000 RPM spindle, 24-station arm type tool changer, Fanuc 0i-MF Plus controller.',
    description: 'High-rigidity C-frame structure with precision linear roller guideways on all axes for high-speed dynamic machining. Standard equipped with high-torque direct-drive spindle, telescopic way covers, and CTS (Coolant Through Spindle) preparation. Unrivaled stability for aerospace, automotive dies, and high-volume component manufacturing.',
    price: 2450000,
    sale_price: 2380000,
    show_price: true,
    stock_status: 'made_to_order',
    features: [
      'Fanuc 0i-MF Plus (Package B) / Siemens 828D CNC Controller',
      '24 Tools Twin-Arm Automatic Tool Changer (Tool change time 1.8s)',
      'High-grade Meehanite cast iron frame with heat-treatment stress relief',
      'High-speed 10,000 RPM belt/direct drive BT40 Spindle with chiller unit',
      'Automatic dual screw chip conveyors with rear bucket discharge'
    ],
    specifications: [
      { key: 'X/Y/Z Travel', value: '850 / 550 / 550 mm' },
      { key: 'Table Size', value: '1000 x 500 mm' },
      { key: 'Max Table Load', value: '650 kg' },
      { key: 'Spindle Nose to Table', value: '120 - 670 mm' },
      { key: 'Rapid Traverse (X/Y/Z)', value: '36 / 36 / 30 m/min' },
      { key: 'Positioning Accuracy', value: '±0.005 mm' },
      { key: 'Repeatability', value: '±0.003 mm' },
      { key: 'Spindle Motor Power', value: '11/15 kW' }
    ],
    is_featured: true,
    is_active: true,
    images: [
      {
        id: 'img-3-1',
        image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=85',
        sort_order: 1,
        is_primary: true
      },
      {
        id: 'img-3-2',
        image_url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=85',
        sort_order: 2,
        is_primary: false
      }
    ],
    created_at: new Date(Date.now() - 10 * 86400000).toISOString()
  },
  {
    id: 'prod-4',
    name: 'Heavy Duty 50mm Industrial Radial Drilling Machine',
    slug: 'heavy-duty-50mm-industrial-radial-drilling-machine',
    sku: 'MMW-RD-50/1600',
    category_id: 'cat-drilling',
    category_name: 'Drilling Machines',
    brand: 'Murthi Precision',
    short_description: 'Hydraulic clamping, 1600mm arm radius, 50mm solid drilling capacity in steel, MT-5 spindle.',
    description: 'Designed for heavy engineering fabrication, pressure vessel manufacturing, and structural steel drilling. Features centralized hydraulic clamping for the column, arm, and drill head with ergonomic front controls. Multi-disc mechanical clutch ensures overload protection while auto-feed gearbox delivers dependable feed rates.',
    price: 520000,
    sale_price: null,
    show_price: true,
    stock_status: 'in_stock',
    features: [
      'Hydraulic pre-selection for speed and feed changes',
      'Hardened and ground column sleeve and arm guide tracks',
      'Spindle micro-feed mechanism for precise depth tapping and counterboring',
      'Box table with precision T-slots included as standard equipment',
      'Motorized arm elevation with dual mechanical safety nuts'
    ],
    specifications: [
      { key: 'Drilling Capacity in Steel', value: '50 mm' },
      { key: 'Drilling Capacity in Cast Iron', value: '60 mm' },
      { key: 'Tapping Capacity in Steel', value: 'M42' },
      { key: 'Arm Radius (Drill Radius)', value: '1600 mm' },
      { key: 'Spindle Travel', value: '315 mm' },
      { key: 'Spindle Taper', value: 'MT-5' },
      { key: 'Spindle Speeds', value: '25 - 2000 RPM (16 Steps)' },
      { key: 'Drill Motor', value: '4.0 kW (5.5 HP)' }
    ],
    is_featured: true,
    is_active: true,
    images: [
      {
        id: 'img-4-1',
        image_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=85',
        sort_order: 1,
        is_primary: true
      },
      {
        id: 'img-4-2',
        image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=85',
        sort_order: 2,
        is_primary: false
      }
    ],
    created_at: new Date(Date.now() - 8 * 86400000).toISOString()
  },
  {
    id: 'prod-5',
    name: 'Precision Hydraulic Surface Grinding Machine',
    slug: 'precision-hydraulic-surface-grinding-machine-4080',
    sku: 'MMW-SG-4080H',
    category_id: 'cat-grinding',
    category_name: 'Grinding Machines',
    brand: 'Murthi Precision',
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
    category_id: 'cat-cutting',
    category_name: 'Cutting & Sawing Machines',
    brand: 'Murthi CutMaster',
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
    category_id: 'cat-hydraulic',
    category_name: 'Hydraulic Presses',
    brand: 'Murthi HydroTech',
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
    category_id: 'cat-cnc',
    category_name: 'CNC Machinery',
    brand: 'Murthi Titan CNC',
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
    category_id: 'cat-accessories',
    category_name: 'Tooling & Accessories',
    brand: 'Murthi Precision Tooling',
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
