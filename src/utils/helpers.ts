/**
 * Helper utility functions for Murthi Machin Works
 */

// Convert Google Drive share links to direct renderable image URLs
export function formatImageUrl(url: string | undefined | null): string {
  if (!url || typeof url !== 'string') {
    return 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80';
  }

  const trimmed = url.trim();

  // Handle Google Drive links
  if (trimmed.includes('drive.google.com')) {
    // Matches /file/d/{id}/view or /open?id={id} or /uc?id={id}
    const idMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      // Use direct googleusercontent link which works without auth blockers
      return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
    }
  }

  // Handle dropbox links if any
  if (trimmed.includes('dropbox.com')) {
    return trimmed.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
  }

  return trimmed;
}

export function formatPrice(price: number, currencySymbol: string = '₹'): string {
  if (typeof price !== 'number' || isNaN(price)) return `${currencySymbol}0`;
  return `${currencySymbol}${price.toLocaleString('en-IN')}`;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/&/g, '-and-')      // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-');     // Replace multiple - with single -
}

export const generateSlug = slugify;

export function generateWhatsAppProductLink(
  whatsappNumber: string,
  productName: string,
  sku: string,
  customBusinessName: string = 'Murthi Machin Works'
): string {
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
  const message = `Hello ${customBusinessName},

I am interested in:
Product: ${productName}
SKU: ${sku}

Please share the latest technical specifications, price quote, and delivery availability.

Thank you.`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

export function generateWhatsAppCartLink(
  whatsappNumber: string,
  items: { productName: string; sku: string; quantity: number }[],
  customerInfo?: { name?: string; company?: string; location?: string },
  customBusinessName: string = 'Murthi Machin Works'
): string {
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
  
  let message = `Hello ${customBusinessName},\n\nI would like to enquire about the following machinery & equipment:\n\n`;
  
  items.forEach((item, index) => {
    message += `${index + 1}. *${item.productName}* (SKU: ${item.sku}) - Qty: ${item.quantity}\n`;
  });

  if (customerInfo?.name || customerInfo?.company) {
    message += `\n*Enquirer Details:*`;
    if (customerInfo.name) message += `\nContact: ${customerInfo.name}`;
    if (customerInfo.company) message += `\nCompany: ${customerInfo.company}`;
    if (customerInfo.location) message += `\nLocation: ${customerInfo.location}`;
  }

  message += `\n\nPlease share the formal quotation, commercial terms, and dispatch timeline.\n\nThank you!`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function getStockStatusBadge(status: string): { label: string; bg: string; text: string; border: string } {
  switch (status) {
    case 'in_stock':
      return { label: 'In Stock', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'made_to_order':
      return { label: 'Made to Order', bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700', border: 'border-amber-200' };
    case 'low_stock':
      return { label: 'Limited Stock', bg: 'bg-orange-50 text-orange-700 border-orange-200', text: 'text-orange-700', border: 'border-orange-200' };
    case 'out_of_stock':
      return { label: 'Out of Stock', bg: 'bg-rose-50 text-rose-700 border-rose-200', text: 'text-rose-700', border: 'border-rose-200' };
    default:
      return { label: 'Available', bg: 'bg-slate-50 text-slate-700 border-slate-200', text: 'text-slate-700', border: 'border-slate-200' };
  }
}

export function getEnquiryStatusBadge(status: string): { label: string; bg: string; text: string } {
  switch (status) {
    case 'new':
      return { label: 'New Enquiry', bg: 'bg-blue-100 text-blue-800', text: 'text-blue-800' };
    case 'in_review':
    case 'contacted':
      return { label: 'In Review / Contacted', bg: 'bg-amber-100 text-amber-800', text: 'text-amber-800' };
    case 'quoted':
    case 'quotation_sent':
      return { label: 'Quote Sent', bg: 'bg-purple-100 text-purple-800', text: 'text-purple-800' };
    case 'converted':
      return { label: 'Order Converted', bg: 'bg-emerald-100 text-emerald-800', text: 'text-emerald-800' };
    case 'closed':
      return { label: 'Closed / Archived', bg: 'bg-slate-100 text-slate-700', text: 'text-slate-700' };
    default:
      return { label: status || 'New', bg: 'bg-slate-100 text-slate-700', text: 'text-slate-700' };
  }
}

/**
 * Splits a numerical amount into Rupees integer and Paise string (2 digits)
 */
export function splitRupeesPaise(val: number | undefined | null): { rs: string; ps: string } {
  if (val === undefined || val === null || isNaN(val)) {
    return { rs: '0', ps: '00' };
  }
  const rounded = Math.round((val + Number.EPSILON) * 100) / 100;
  const parts = rounded.toFixed(2).split('.');
  const rsInt = parseInt(parts[0], 10);
  return {
    rs: rsInt.toLocaleString('en-IN'),
    ps: parts[1] || '00'
  };
}

/**
 * Converts numbers into Indian Currency Words (e.g. Lakhs, Crores, Thousands)
 */
export function numberToIndianWords(num: number): string {
  if (num === 0 || isNaN(num) || !num) return 'Rupees Zero Only';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const twoDigits = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tensMultiple = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigit(n: number): string {
    if (n === 0) return '';
    if (n < 10) return singleDigits[n];
    if (n >= 10 && n < 20) return twoDigits[n - 10];
    const tens = Math.floor(n / 10);
    const unit = n % 10;
    return (tensMultiple[tens] + (unit ? ' ' + singleDigits[unit] : '')).trim();
  }

  function convertThreeDigit(n: number): string {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let res = '';
    if (hundred > 0) {
      res += singleDigits[hundred] + ' Hundred';
      if (rest > 0) res += ' and ';
    }
    if (rest > 0) {
      res += convertTwoDigit(rest);
    }
    return res.trim();
  }

  const rounded = Math.round((num + Number.EPSILON) * 100) / 100;
  const integerPart = Math.floor(rounded);
  const paisePart = Math.round((rounded - integerPart) * 100);

  if (integerPart === 0 && paisePart > 0) {
    return `${convertTwoDigit(paisePart)} Paise Only`;
  }

  let n = integerPart;
  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const hundredAndBelow = n;

  let words = '';
  if (crore > 0) {
    words += (convertTwoDigit(crore) || convertThreeDigit(crore)) + ' Crore ';
  }
  if (lakh > 0) {
    words += convertTwoDigit(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    words += convertTwoDigit(thousand) + ' Thousand ';
  }
  if (hundredAndBelow > 0) {
    words += convertThreeDigit(hundredAndBelow);
  }

  words = words.trim();
  let result = `Rupees ${words}`;
  if (paisePart > 0) {
    result += ` and ${convertTwoDigit(paisePart)} Paise`;
  }
  return `${result} Only`;
}

/**
 * Generates the next sequential invoice number (e.g. MMW/2026-27/005)
 * based on the highest existing invoice number in the system.
 */
export function generateNextInvoiceNo(existingBills: Array<{ invoice_number?: string }>): string {
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-indexed: 0 = Jan, 3 = Apr
  const fullYear = now.getFullYear();
  // Financial year starts in April in India
  const startYear = currentMonth < 3 ? fullYear - 1 : fullYear;
  const endYearShort = (startYear + 1).toString().slice(-2);
  const prefix = `MMW/${startYear}-${endYearShort}/`;

  let maxNum = 0;
  if (Array.isArray(existingBills)) {
    for (const b of existingBills) {
      if (b && typeof b.invoice_number === 'string') {
        const match = b.invoice_number.match(/(\d+)$/);
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
    }
  }

  const nextNum = maxNum + 1;
  return `${prefix}${nextNum.toString().padStart(3, '0')}`;
}

