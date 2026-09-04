/**
 * Helper utility functions for Murthi Machine Works
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
  customBusinessName: string = 'Murthi Machine Works'
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
  customBusinessName: string = 'Murthi Machine Works'
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
