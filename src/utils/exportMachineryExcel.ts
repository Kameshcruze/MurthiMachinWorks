import * as XLSX from 'xlsx';
import { Product, Category, Enquiry } from '../types';

/**
 * Excel cell character limit safety helper.
 * Microsoft Excel strictly enforces a maximum of 32,767 characters per cell.
 */
const safeCellValue = (val: any, maxLength = 32000): any => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'number' || typeof val === 'boolean') return val;
  if (val instanceof Date) return val.toLocaleString();

  let str = String(val);

  // Remove control characters that can corrupt Excel XML
  str = str.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '');

  // Guard against Excel's 32,767 characters per cell hard limit
  if (str.length > maxLength) {
    return str.substring(0, maxLength - 30) + '... [Excel Limit]';
  }

  return str;
};

/**
 * Generates and downloads a complete Excel (.xlsx) workbook for ALL available machinery.
 * Supports unlimited products (200+, 1000+) with no photo links or data strings,
 * including only the total Number of Photos as requested.
 */
export const exportMachineryToExcel = (
  products: Product[],
  categories: Category[],
  currencySymbol = '₹'
) => {
  if (!products || products.length === 0) {
    throw new Error('No machinery records found in database to export.');
  }

  // Category ID to Name mapping
  const categoryMap = new Map<string, string>();
  categories.forEach(c => categoryMap.set(c.id, c.name));

  // Human-readable stock status
  const formatStockStatus = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'In Stock (Ready to Dispatch)';
      case 'made_to_order':
        return 'Made to Order';
      case 'low_stock':
        return 'Low / Limited Stock';
      case 'out_of_stock':
        return 'Out of Stock';
      default:
        return status || 'In Stock';
    }
  };

  // 1. MASTER SHEET: Complete Machine Record with All Input Details (No Photo links/URLs, only Number of Photos)
  const masterRows = products.map((p, index) => {
    const categoryName =
      p.category_name || categoryMap.get(p.category_id) || 'General';

    // Format specifications: "Center Height: 250 mm | Spindle Bore: 52 mm"
    const specsFormatted = (p.specifications || [])
      .map(s => {
        const k = (s.key || s.spec_key || '').trim();
        const v = (s.value || s.spec_value || '').trim();
        const u = (s.unit || '').trim();
        const valWithUnit = u && !v.endsWith(u) ? `${v} ${u}` : v;
        return k && v ? `${k}: ${valWithUnit}` : '';
      })
      .filter(Boolean)
      .join(' | ');

    // Format engineering features: "1. Heavy Duty Bed | 2. Precision Spindle"
    const featuresFormatted = (p.features || [])
      .map((f, i) => `${i + 1}. ${f.trim()}`)
      .join(' | ');

    // Keywords / search tags
    const keywordsFormatted = (p.keywords || []).join(', ');

    // Technical Downloads / PDF Catalogs
    const downloadsFormatted = (p.downloads || [])
      .map((d, i) => `${i + 1}. ${d.title} (${d.file_type || 'PDF'}): ${d.file_url}`)
      .join(' | ');

    const rawRow = {
      'S.No': index + 1,
      'Machine ID': p.id,
      'Machine Name': p.name || '',
      'SKU / Model Code': p.sku || '',
      'Category': categoryName,
      'Brand / Manufacturer': p.brand || 'Murthi Machin Works',
      'Stock Availability': formatStockStatus(p.stock_status),
      'Base Catalog Price (₹)': p.price ?? 0,
      'Sale / Offer Price (₹)': p.sale_price !== undefined && p.sale_price !== null ? p.sale_price : '',
      'Price Display Setting': p.show_price === false ? 'Hidden on Storefront' : 'Visible (Logged-in Staff)',
      'Featured Flagship': p.is_featured ? 'Yes (Featured)' : 'No',
      'Publication Status': p.is_active ? 'Published (Active)' : 'Draft (Hidden)',
      'Short Highlights / Summary': p.short_description || '',
      'Full Engineering Description': p.description || '',
      'Search Keywords & Tags': keywordsFormatted,
      'Technical Specifications Summary': specsFormatted || 'Standard Industrial Grade',
      'Engineering Features Checklist': featuresFormatted || 'Heavy Duty Industrial Build',
      'Number of Photos': p.images?.length || 0,
      'Downloadable Brochures / PDFs': downloadsFormatted || 'None attached',
      'Web URL Slug': p.slug || '',
      'Record Created / Updated': p.created_at ? new Date(p.created_at).toLocaleString() : new Date().toLocaleString()
    };

    // Sanitize every cell in the master row to ensure 0 cell-length crashes
    const safeRow: Record<string, any> = {};
    for (const [key, value] of Object.entries(rawRow)) {
      safeRow[key] = safeCellValue(value);
    }
    return safeRow;
  });

  // 2. DETAILED TECHNICAL SPECIFICATIONS SHEET
  const specRows: Array<Record<string, any>> = [];
  let specCounter = 1;

  products.forEach(p => {
    const categoryName =
      p.category_name || categoryMap.get(p.category_id) || 'General';

    if (p.specifications && p.specifications.length > 0) {
      p.specifications.forEach(s => {
        const k = (s.key || s.spec_key || '').trim();
        const v = (s.value || s.spec_value || '').trim();
        const u = (s.unit || '').trim();
        if (k || v) {
          specRows.push({
            'S.No': specCounter++,
            'Machine ID': safeCellValue(p.id),
            'Machine Name': safeCellValue(p.name),
            'SKU / Model Code': safeCellValue(p.sku),
            'Category': safeCellValue(categoryName),
            'Specification Parameter': safeCellValue(k),
            'Specification Value': safeCellValue(v),
            'Unit of Measurement': safeCellValue(u || '-')
          });
        }
      });
    } else {
      specRows.push({
        'S.No': specCounter++,
        'Machine ID': safeCellValue(p.id),
        'Machine Name': safeCellValue(p.name),
        'SKU / Model Code': safeCellValue(p.sku),
        'Category': safeCellValue(categoryName),
        'Specification Parameter': 'General Configuration',
        'Specification Value': 'Standard Workshop Setup',
        'Unit of Measurement': '-'
      });
    }
  });

  // 3. DETAILED ENGINEERING FEATURES SHEET
  const featureRows: Array<Record<string, any>> = [];
  let featCounter = 1;

  products.forEach(p => {
    const categoryName =
      p.category_name || categoryMap.get(p.category_id) || 'General';

    if (p.features && p.features.length > 0) {
      p.features.forEach((feat, i) => {
        featureRows.push({
          'S.No': featCounter++,
          'Machine ID': safeCellValue(p.id),
          'Machine Name': safeCellValue(p.name),
          'SKU / Model Code': safeCellValue(p.sku),
          'Category': safeCellValue(categoryName),
          'Feature #': i + 1,
          'Engineering Feature Description': safeCellValue(feat)
        });
      });
    }
  });

  // 4. Create Workbook and Sheets
  const wb = XLSX.utils.book_new();

  // Master Sheet
  const wsMaster = XLSX.utils.json_to_sheet(masterRows);
  wsMaster['!cols'] = [
    { wch: 6 },  // S.No
    { wch: 20 }, // Machine ID
    { wch: 35 }, // Machine Name
    { wch: 18 }, // SKU
    { wch: 20 }, // Category
    { wch: 22 }, // Brand
    { wch: 24 }, // Stock Availability
    { wch: 20 }, // Base Catalog Price
    { wch: 20 }, // Sale Price
    { wch: 22 }, // Price Display Setting
    { wch: 16 }, // Featured
    { wch: 20 }, // Publication Status
    { wch: 45 }, // Short Highlights
    { wch: 60 }, // Full Engineering Description
    { wch: 35 }, // Search Keywords
    { wch: 55 }, // Tech Specs Summary
    { wch: 55 }, // Features Checklist
    { wch: 18 }, // Number of Photos
    { wch: 45 }, // Downloads
    { wch: 25 }, // Slug
    { wch: 22 }  // Date
  ];
  XLSX.utils.book_append_sheet(wb, wsMaster, 'Machinery Catalog');

  // Technical Specs Sheet
  if (specRows.length > 0) {
    const wsSpecs = XLSX.utils.json_to_sheet(specRows);
    wsSpecs['!cols'] = [
      { wch: 6 },  // S.No
      { wch: 20 }, // Machine ID
      { wch: 35 }, // Machine Name
      { wch: 18 }, // SKU
      { wch: 20 }, // Category
      { wch: 30 }, // Spec Parameter
      { wch: 30 }, // Spec Value
      { wch: 20 }  // Unit
    ];
    XLSX.utils.book_append_sheet(wb, wsSpecs, 'Technical Specifications');
  }

  // Features Sheet
  if (featureRows.length > 0) {
    const wsFeatures = XLSX.utils.json_to_sheet(featureRows);
    wsFeatures['!cols'] = [
      { wch: 6 },  // S.No
      { wch: 20 }, // Machine ID
      { wch: 35 }, // Machine Name
      { wch: 18 }, // SKU
      { wch: 20 }, // Category
      { wch: 12 }, // Feature #
      { wch: 70 }  // Feature Description
    ];
    XLSX.utils.book_append_sheet(wb, wsFeatures, 'Engineering Features');
  }

  // Generate filename with company name and timestamp
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `Murthi_Machin_Works_All_Machinery_Catalog_${dateStr}.xlsx`;

  // Write and trigger download in browser
  XLSX.writeFile(wb, fileName);
};

/**
 * Generates and downloads an Excel workbook for All Categories.
 * Strictly avoids any raw photo strings or links; keeps Number of Photos only.
 */
export const exportCategoriesToExcel = (categories: Category[]) => {
  if (!categories || categories.length === 0) {
    throw new Error('No categories found in database to export.');
  }

  const rows = categories.map((c, index) => {
    const keywordsFormatted = (c.keywords || []).join(', ');
    const hasPhoto = c.image_url && c.image_url.trim() ? 1 : 0;

    const rawRow = {
      'S.No': index + 1,
      'Category ID': c.id,
      'Category Name': c.name || '',
      'Web URL Slug': c.slug || '',
      'Description': c.description || '',
      'Status': c.is_active ? 'Active (Published)' : 'Inactive (Draft)',
      'Sort Order': c.sort_order ?? index + 1,
      'Product Count': c.product_count ?? 0,
      'Search Keywords & Tags': keywordsFormatted,
      'Number of Photos': hasPhoto,
      'Created / Updated': c.created_at ? new Date(c.created_at).toLocaleString() : new Date().toLocaleString()
    };

    const safeRow: Record<string, any> = {};
    for (const [key, value] of Object.entries(rawRow)) {
      safeRow[key] = safeCellValue(value);
    }
    return safeRow;
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 6 },  // S.No
    { wch: 22 }, // Category ID
    { wch: 30 }, // Category Name
    { wch: 25 }, // Web URL Slug
    { wch: 50 }, // Description
    { wch: 20 }, // Status
    { wch: 12 }, // Sort Order
    { wch: 16 }, // Product Count
    { wch: 40 }, // Search Keywords
    { wch: 18 }, // Number of Photos
    { wch: 22 }  // Date
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Machinery Categories');

  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `Murthi_Machin_Works_Categories_${dateStr}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

/**
 * Generates and downloads an Excel workbook for All Commercial Enquiries & RFQ Leads.
 * Strictly avoids any raw photo strings or links; keeps Number of Photos only.
 */
export const exportEnquiriesToExcel = (enquiries: Enquiry[]) => {
  if (!enquiries || enquiries.length === 0) {
    throw new Error('No enquiry records found to export.');
  }

  const formatStatus = (s: string) => {
    switch (s) {
      case 'new': return 'New Enquiry';
      case 'contacted': return 'Customer Contacted';
      case 'in_review': return 'In Review';
      case 'quotation_sent': return 'Quotation Sent';
      case 'quoted': return 'Quotation Sent';
      case 'converted': return 'Order Converted';
      case 'closed': return 'Closed / Archived';
      default: return s;
    }
  };

  const formatRole = (r?: string) => {
    switch (r) {
      case 'seller': return 'Machinery Seller';
      case 'mediator': return 'Agent / Mediator';
      case 'buyer': return 'Direct Machinery Buyer';
      default: return 'Machinery Buyer';
    }
  };

  // Sheet 1: Master Enquiries
  const masterRows = enquiries.map((enq, index) => {
    const itemsSummary = (enq.items || [])
      .map(item => `${item.product_name || 'Machine'} (Qty: ${item.quantity || 1}${item.sku ? `, SKU: ${item.sku}` : ''})`)
      .join(' | ');

    // Clean internal notes
    const cleanNotes = (enq.admin_notes || enq.notes || '')
      .replace(/\[MACHINE_PHOTOS(?:_JSON)?:\s*\[.*?\]\]/g, '')
      .trim();

    const photoCount = enq.machine_photos?.length || 0;

    const rawRow = {
      'S.No': index + 1,
      'Enquiry ID': enq.id,
      'Date Received': enq.created_at ? new Date(enq.created_at).toLocaleString() : '',
      'Customer Name': enq.customer_name || '',
      'Company Name': enq.company || '',
      'User Type / Role': formatRole(enq.user_type),
      'Phone Number': enq.phone || '',
      'WhatsApp Number': enq.whatsapp || '',
      'Email Address': enq.email || '',
      'Location / City': enq.location || '',
      'Address': enq.address || '',
      'Status': formatStatus(enq.status),
      'Customer Message / Requirement': enq.message || '',
      'Internal Notes': cleanNotes,
      'Number of Machinery Items': enq.items?.length || 0,
      'Machinery Items Summary': itemsSummary || 'General Consultation / Machine Sale',
      'Number of Photos': photoCount
    };

    const safeRow: Record<string, any> = {};
    for (const [key, value] of Object.entries(rawRow)) {
      safeRow[key] = safeCellValue(value);
    }
    return safeRow;
  });

  // Sheet 2: Itemized Machinery Details
  const itemRows: Array<Record<string, any>> = [];
  let itemCounter = 1;

  enquiries.forEach(enq => {
    if (enq.items && enq.items.length > 0) {
      enq.items.forEach(item => {
        itemRows.push({
          'S.No': itemCounter++,
          'Enquiry ID': safeCellValue(enq.id),
          'Customer Name': safeCellValue(enq.customer_name),
          'Company Name': safeCellValue(enq.company || '-'),
          'Machine Name': safeCellValue(item.product_name),
          'SKU / Model Code': safeCellValue(item.sku || '-'),
          'Quantity': safeCellValue(item.quantity || 1),
          'Catalog Unit Price (₹)': safeCellValue(item.price ?? 0),
          'Category': safeCellValue(item.category_name || '-')
        });
      });
    }
  });

  const wb = XLSX.utils.book_new();

  // Master Sheet
  const wsMaster = XLSX.utils.json_to_sheet(masterRows);
  wsMaster['!cols'] = [
    { wch: 6 },  // S.No
    { wch: 20 }, // Enquiry ID
    { wch: 22 }, // Date
    { wch: 25 }, // Customer Name
    { wch: 25 }, // Company
    { wch: 22 }, // Role
    { wch: 18 }, // Phone
    { wch: 18 }, // WhatsApp
    { wch: 25 }, // Email
    { wch: 20 }, // Location
    { wch: 30 }, // Address
    { wch: 20 }, // Status
    { wch: 45 }, // Message
    { wch: 40 }, // Notes
    { wch: 24 }, // Items Count
    { wch: 50 }, // Items Summary
    { wch: 18 }  // Number of Photos
  ];
  XLSX.utils.book_append_sheet(wb, wsMaster, 'Commercial Enquiries');

  // Items Sheet
  if (itemRows.length > 0) {
    const wsItems = XLSX.utils.json_to_sheet(itemRows);
    wsItems['!cols'] = [
      { wch: 6 },  // S.No
      { wch: 20 }, // Enquiry ID
      { wch: 25 }, // Customer Name
      { wch: 25 }, // Company
      { wch: 35 }, // Machine Name
      { wch: 20 }, // SKU
      { wch: 12 }, // Quantity
      { wch: 20 }, // Price
      { wch: 22 }  // Category
    ];
    XLSX.utils.book_append_sheet(wb, wsItems, 'Requested Machinery Items');
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `Murthi_Machin_Works_Enquiries_${dateStr}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

