import React, { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import { Bill, BillItem, Product, Category } from '../../../types';
import { dataService, DATA_CHANGE_EVENT } from '../../../services/dataService';
import { useSettings } from '../../../context/SettingsContext';
import { formatPrice, numberToIndianWords, generateNextInvoiceNo } from '../../../utils/helpers';
import { BillInvoiceTemplate } from './BillInvoiceTemplate';
import {
  FileText,
  Plus,
  Download,
  Printer,
  Trash2,
  Copy,
  Eye,
  Search,
  CheckCircle2,
  ArrowLeft,
  Building2,
  Truck,
  Hash,
  RefreshCw,
  Sparkles,
  Info,
  Calendar,
  Layers,
  Database,
  Save,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

export const AdminBilling: React.FC = () => {
  const { showToast } = useSettings();

  // Navigation & view states
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit' | 'preview'>('list');
  const [bills, setBills] = useState<Bill[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewScale, setPreviewScale] = useState(0.82);

  // Active Bill being edited or previewed
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  // Bill Form Fields
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerGstin, setCustomerGstin] = useState('');

  // Transport & Orders
  const [orderNumber, setOrderNumber] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [deliveryNoteNo, setDeliveryNoteNo] = useState('');
  const [deliveryNoteDate, setDeliveryNoteDate] = useState('');
  const [despatchedBy, setDespatchedBy] = useState('');
  const [documentThrough, setDocumentThrough] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [ewayBillNo, setEwayBillNo] = useState('');

  // Items
  const [items, setItems] = useState<BillItem[]>([
    {
      id: `item-${Date.now()}`,
      product_name: '',
      serial_number: '',
      category: '',
      hsn_code: '84581100',
      quantity: 1,
      rate: 0,
      amount: 0
    }
  ]);

  // Tax & Totals
  const [taxType, setTaxType] = useState<'intra_state' | 'inter_state'>('intra_state');
  const [cgstRate, setCgstRate] = useState<number>(9);
  const [sgstRate, setSgstRate] = useState<number>(9);
  const [igstRate, setIgstRate] = useState<number>(18);
  const [rupeesInWords, setRupeesInWords] = useState('');

  // Bank Defaults
  const [bankName, setBankName] = useState('STATE BANK OF INDIA');
  const [bankAccountName, setBankAccountName] = useState('Murthi Machin Works');
  const [bankAccountNo, setBankAccountNo] = useState('44117451637');
  const [bankIfsc, setBankIfsc] = useState('SBIN0021453');
  const [bankBranch, setBankBranch] = useState('Avarampalayam');

  const invoicePrintRef = useRef<HTMLDivElement>(null);

  // Load initial bills, products, and categories
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [loadedBills, loadedProducts, loadedCategories] = await Promise.all([
        dataService.getBills(),
        dataService.getProducts(),
        dataService.getCategories()
      ]);
      setBills(loadedBills);
      setProducts(loadedProducts);
      setCategories(loadedCategories);
    } catch (err) {
      console.warn('Error loading bills data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleDataChange = () => loadData();
    window.addEventListener(DATA_CHANGE_EVENT, handleDataChange);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, handleDataChange);
  }, []);

  // Open Form to Create New Bill
  const handleStartCreate = async () => {
    let currentBills = bills;
    try {
      const freshBills = await dataService.getBills();
      if (freshBills && freshBills.length > 0) {
        currentBills = freshBills;
        setBills(freshBills);
      }
    } catch {
      // safe fallback
    }
    const nextNo = generateNextInvoiceNo(currentBills);
    setInvoiceNumber(nextNo);
    setInvoiceDate(new Date().toISOString().slice(0, 10));
    setCustomerName('');
    setCustomerAddress('');
    setCustomerGstin('');
    setOrderNumber('');
    setOrderDate('');
    setDeliveryNoteNo('');
    setDeliveryNoteDate('');
    setDespatchedBy('KPN Roadways / Transport');
    setDocumentThrough('Direct');
    setVehicleNumber('');
    setEwayBillNo('');

    // Start with 1 empty machinery item
    setItems([
      {
        id: `item-${Date.now()}`,
        product_name: '',
        serial_number: '',
        category: '',
        hsn_code: '84581100',
        quantity: 1,
        rate: 0,
        amount: 0
      }
    ]);

    setTaxType('intra_state');
    setCgstRate(9);
    setSgstRate(9);
    setIgstRate(18);
    setRupeesInWords('');
    setSelectedBill(null);
    setViewMode('create');
  };

  // Open Form to Edit or Preview Existing Bill
  const handleEditBill = (bill: Bill) => {
    setSelectedBill(bill);
    setInvoiceNumber(bill.invoice_number);
    setInvoiceDate(bill.invoice_date);
    setCustomerName(bill.customer_name);
    setCustomerAddress(bill.customer_address);
    setCustomerGstin(bill.customer_gstin || '');
    setOrderNumber(bill.order_number || '');
    setOrderDate(bill.order_date || '');
    setDeliveryNoteNo(bill.delivery_note_no || '');
    setDeliveryNoteDate(bill.delivery_note_date || '');
    setDespatchedBy(bill.despatched_by || '');
    setDocumentThrough(bill.document_through || '');
    setVehicleNumber(bill.vehicle_number || '');
    setEwayBillNo(bill.eway_bill_no || '');
    setItems(bill.items && bill.items.length > 0 ? bill.items : []);
    setTaxType(bill.tax_type);
    setCgstRate(bill.cgst_rate);
    setSgstRate(bill.sgst_rate);
    setIgstRate(bill.igst_rate);
    setRupeesInWords(bill.rupees_in_words);
    setBankName(bill.bank_name || 'STATE BANK OF INDIA');
    setBankAccountName(bill.bank_account_name || 'Murthi Machin Works');
    setBankAccountNo(bill.bank_account_no || '44117451637');
    setBankIfsc(bill.bank_ifsc || 'SBIN0021453');
    setBankBranch(bill.bank_branch || 'Avarampalayam');
    setViewMode('edit');
  };

  // Preview Bill Directly
  const handlePreviewBill = (bill: Bill) => {
    setSelectedBill(bill);
    setViewMode('preview');
  };

  // Duplicate Existing Bill into New Bill
  const handleDuplicateBill = (bill: Bill) => {
    const nextNo = generateNextInvoiceNo(bills);
    setInvoiceNumber(nextNo);
    setInvoiceDate(new Date().toISOString().slice(0, 10));
    setCustomerName(bill.customer_name);
    setCustomerAddress(bill.customer_address);
    setCustomerGstin(bill.customer_gstin || '');
    setOrderNumber('');
    setOrderDate('');
    setDeliveryNoteNo('');
    setDeliveryNoteDate('');
    setDespatchedBy(bill.despatched_by || '');
    setDocumentThrough(bill.document_through || '');
    setVehicleNumber(bill.vehicle_number || '');
    setEwayBillNo('');
    setItems(
      (bill.items || []).map(item => ({
        ...item,
        id: `item-${Date.now()}-${Math.random()}`
      }))
    );
    setTaxType(bill.tax_type);
    setCgstRate(bill.cgst_rate);
    setSgstRate(bill.sgst_rate);
    setIgstRate(bill.igst_rate);
    setRupeesInWords(bill.rupees_in_words);
    setSelectedBill(null);
    setViewMode('create');
    showToast('Bill Duplicated', 'Duplicated bill as a new invoice template. Ready to generate.', 'info');
  };

  // Delete Bill
  const handleDeleteBill = async (billId: string) => {
    if (!window.confirm('Are you sure you want to delete this bill record from database?')) {
      return;
    }
    try {
      await dataService.deleteBill(billId);
      showToast('Bill Deleted', 'Invoice record deleted successfully', 'success');
      loadData();
      if (viewMode === 'preview' || (selectedBill && selectedBill.id === billId)) {
        setViewMode('list');
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to delete bill', 'error');
    }
  };

  // Machinery Item handlers
  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        product_name: '',
        serial_number: '',
        category: '',
        hsn_code: '84581100',
        quantity: 1,
        rate: 0,
        amount: 0
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      showToast('Notice', 'At least one machinery item is required on the invoice.', 'info');
      return;
    }
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof BillItem, value: any) => {
    setItems(prev => {
      const copy = [...prev];
      const target = { ...copy[index], [field]: value };

      // Auto recalculate amount if rate or quantity changes
      if (field === 'quantity' || field === 'rate') {
        const q = field === 'quantity' ? Number(value) || 0 : target.quantity || 0;
        const r = field === 'rate' ? Number(value) || 0 : target.rate || 0;
        target.amount = Math.round(q * r * 100) / 100;
      }
      copy[index] = target;
      return copy;
    });
  };

  // Auto-populate item from Machinery Catalog
  const handleSelectProductForLineItem = (index: number, productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const cat = categories.find(c => c.id === prod.category_id);
    const catName = cat ? cat.name : 'Industrial Machinery';

    // Guess HSN based on category or default
    let defaultHsn = '84581100'; // Lathes
    if (prod.name.toLowerCase().includes('milling')) defaultHsn = '84595100';
    if (prod.name.toLowerCase().includes('shaping') || prod.name.toLowerCase().includes('slotting')) defaultHsn = '84612000';
    if (prod.name.toLowerCase().includes('drilling')) defaultHsn = '84592900';
    if (prod.name.toLowerCase().includes('power press')) defaultHsn = '84621000';

    setItems(prev => {
      const copy = [...prev];
      const target = {
        ...copy[index],
        product_name: prod.name,
        serial_number: prod.sku || `MMW-${prod.id.slice(0, 6).toUpperCase()}`,
        category: catName,
        hsn_code: defaultHsn,
        rate: prod.price || 0,
        amount: (copy[index].quantity || 1) * (prod.price || 0)
      };
      copy[index] = target;
      return copy;
    });

    showToast('Machine Selected', `Loaded details for ${prod.name}`, 'info');
  };

  // Calculations for subtotal, taxes, and overall total
  const subtotal = items.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (taxType === 'intra_state') {
    cgstAmount = Math.round(((subtotal * (cgstRate || 9)) / 100) * 100) / 100;
    sgstAmount = Math.round(((subtotal * (sgstRate || 9)) / 100) * 100) / 100;
    igstAmount = 0;
  } else {
    cgstAmount = 0;
    sgstAmount = 0;
    igstAmount = Math.round(((subtotal * (igstRate || 18)) / 100) * 100) / 100;
  }

  const overallTotal = Math.round((subtotal + cgstAmount + sgstAmount + igstAmount) * 100) / 100;

  // Auto calculate rupees in words when total changes
  useEffect(() => {
    if (!rupeesInWords || rupeesInWords.startsWith('Rupees')) {
      const words = numberToIndianWords(overallTotal);
      setRupeesInWords(words);
    }
  }, [overallTotal]);

  // Construct active bill preview object in real time
  const currentPreviewBill: Bill = {
    id: selectedBill?.id || 'bill-temp',
    invoice_number: invoiceNumber || 'MMW/2026-27/001',
    invoice_date: invoiceDate || new Date().toISOString().slice(0, 10),
    customer_name: customerName || 'Customer / Buyer Name',
    customer_address: customerAddress || 'Address Line 1\nAddress Line 2, City, State - PIN',
    customer_gstin: customerGstin || '',
    order_number: orderNumber,
    order_date: orderDate,
    delivery_note_no: deliveryNoteNo,
    delivery_note_date: deliveryNoteDate,
    despatched_by: despatchedBy,
    document_through: documentThrough,
    vehicle_number: vehicleNumber,
    eway_bill_no: ewayBillNo,
    items,
    subtotal,
    tax_type: taxType,
    cgst_rate: cgstRate,
    cgst_amount: cgstAmount,
    sgst_rate: sgstRate,
    sgst_amount: sgstAmount,
    igst_rate: igstRate,
    igst_amount: igstAmount,
    total_amount: overallTotal,
    rupees_in_words: rupeesInWords || numberToIndianWords(overallTotal),
    bank_name: bankName,
    bank_account_name: bankAccountName,
    bank_account_no: bankAccountNo,
    bank_ifsc: bankIfsc,
    bank_branch: bankBranch,
    created_at: selectedBill?.created_at || new Date().toISOString()
  };

  // Reusable robust save function
  const handleSaveBillRecord = async (showNotification = true, changeView = true): Promise<Bill | null> => {
    const validCustomerName = customerName.trim() || 'Messers. Buyer';
    const validInvoiceNumber = invoiceNumber.trim() || generateNextInvoiceNo(bills);

    let validItems = items.filter(i => i.product_name && i.product_name.trim().length > 0);
    if (validItems.length === 0) {
      validItems = [
        {
          id: `item-${Date.now()}`,
          product_name: 'Industrial Machinery',
          serial_number: 'MMW-EQUIP',
          category: 'Machinery',
          hsn_code: '84581100',
          quantity: 1,
          rate: subtotal || 0,
          amount: subtotal || 0
        }
      ];
    }

    try {
      const billPayload: Omit<Bill, 'id' | 'created_at' | 'updated_at'> = {
        invoice_number: validInvoiceNumber,
        invoice_date: invoiceDate || new Date().toISOString().slice(0, 10),
        customer_name: validCustomerName,
        customer_address: customerAddress.trim(),
        customer_gstin: customerGstin.trim(),
        order_number: orderNumber.trim(),
        order_date: orderDate?.trim() || null,
        delivery_note_no: deliveryNoteNo.trim(),
        delivery_note_date: deliveryNoteDate?.trim() || null,
        despatched_by: despatchedBy.trim(),
        document_through: documentThrough.trim(),
        vehicle_number: vehicleNumber.trim(),
        eway_bill_no: ewayBillNo.trim(),
        items: validItems,
        subtotal,
        tax_type: taxType,
        cgst_rate: cgstRate,
        cgst_amount: cgstAmount,
        sgst_rate: sgstRate,
        sgst_amount: sgstAmount,
        igst_rate: igstRate,
        igst_amount: igstAmount,
        total_amount: overallTotal,
        rupees_in_words: rupeesInWords || numberToIndianWords(overallTotal),
        bank_name: bankName,
        bank_account_name: bankAccountName,
        bank_account_no: bankAccountNo,
        bank_ifsc: bankIfsc,
        bank_branch: bankBranch
      };

      let saved: Bill;
      if (selectedBill?.id) {
        saved = await dataService.updateBill(selectedBill.id, billPayload);
        if (showNotification) {
          showToast('Bill Saved', `Invoice #${saved.invoice_number} updated successfully`, 'success');
        }
      } else {
        saved = await dataService.createBill(billPayload);
        if (showNotification) {
          showToast('Bill Saved', `Invoice #${saved.invoice_number} saved to database!`, 'success');
        }
      }

      setInvoiceNumber(saved.invoice_number);
      setSelectedBill(saved);
      if (changeView) {
        setViewMode('preview');
      }
      await loadData();
      return saved;
    } catch (err: any) {
      console.error('Failed to save bill:', err);
      if (showNotification) {
        showToast('Save Error', err.message || 'Could not save bill to database', 'error');
      }
      return null;
    }
  };

  // Generate & Save Bill into Database and Local Storage
  const handleSaveAndGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSaveBillRecord(true, true);
  };

  // Download Exact A4-sized Image using html2canvas with off-screen unscaled clone
  const handleDownloadA4Image = async (billToDownload?: Bill) => {
    const targetBill = billToDownload || selectedBill || currentPreviewBill;
    const elementId = viewMode === 'preview' ? 'a4-invoice-render-preview' : 'a4-invoice-render-live';
    const invoiceEl = document.getElementById(elementId) || document.getElementById('a4-invoice-render');

    if (!invoiceEl) {
      showToast('Notice', 'Unable to capture bill layout. Please try again.', 'error');
      return;
    }

    try {
      setIsGeneratingImage(true);
      showToast('Generating Image', 'Rendering A4-sized high-resolution image...', 'info');

      // 1. Auto-save bill in background so user data is never lost
      await handleSaveBillRecord(false, false);

      // 2. Clone invoice element into an off-screen container without CSS transforms
      const cloneContainer = document.createElement('div');
      cloneContainer.style.position = 'fixed';
      cloneContainer.style.left = '-9999px';
      cloneContainer.style.top = '0px';
      cloneContainer.style.width = '794px';
      cloneContainer.style.height = '1123px';
      cloneContainer.style.zIndex = '-9999';
      cloneContainer.style.backgroundColor = '#ffffff';
      cloneContainer.style.overflow = 'hidden';

      const clone = invoiceEl.cloneNode(true) as HTMLElement;
      clone.style.transform = 'none';
      clone.style.margin = '0';
      clone.style.boxShadow = 'none';
      clone.style.width = '794px';
      clone.style.height = '1123px';
      cloneContainer.appendChild(clone);
      document.body.appendChild(cloneContainer);

      // Short pause to ensure fonts and layout settle
      await new Promise(r => setTimeout(r, 120));

      // Render crisp image using browser-native SVG rasterization (fully supports oklch, CSS grids, SVGs)
      const dataUrl = await toPng(clone, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
        cacheBust: true
      });

      // Cleanup offscreen clone
      if (document.body.contains(cloneContainer)) {
        document.body.removeChild(cloneContainer);
      }

      const cleanInvoiceNumber = (targetBill.invoice_number || 'MMW-INVOICE').replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `Murthi_Machin_Works_Invoice_${cleanInvoiceNumber}.png`;

      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      showToast('Download Ready', `Saved A4 Invoice Image: ${fileName}`, 'success');
    } catch (err: any) {
      console.error('Error rendering A4 image:', err);
      showToast('Export Error', 'Failed to generate A4 image. Please try again or use Print.', 'error');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Browser Print
  const handlePrint = () => {
    window.print();
  };

  // Filter bills in history list
  const filteredBills = bills.filter(b => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.invoice_number.toLowerCase().includes(q) ||
      b.customer_name.toLowerCase().includes(q) ||
      (b.customer_gstin && b.customer_gstin.toLowerCase().includes(q)) ||
      b.items?.some(i => i.product_name.toLowerCase().includes(q) || (i.serial_number && i.serial_number.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Header / Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[#082138] text-white">
              <FileText className="w-5 h-5 text-[#0088CC]" />
            </span>
            <div>
              <h2 className="font-heading font-extrabold text-xl text-slate-900 leading-tight">
                Bill Generator &amp; Tax Invoices
              </h2>
              <p className="text-xs text-slate-500">
                Generate official Murthi Machin Works commercial bills &amp; download in A4-sized image
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {viewMode !== 'list' ? (
            <div className="flex items-center gap-2">
              <button
                id="btn-back-to-bills-list"
                type="button"
                onClick={() => {
                  setViewMode('list');
                  setSelectedBill(null);
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Invoices List</span>
              </button>

              {(viewMode === 'create' || viewMode === 'edit') && (
                <>
                  <button
                    type="button"
                    onClick={() => handleSaveBillRecord(true, false)}
                    className="px-4 py-2.5 bg-[#082138] hover:bg-[#0b2f50] text-white text-xs font-bold rounded-lg shadow flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-emerald-400" />
                    <span>Save Bill</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadA4Image(currentPreviewBill)}
                    disabled={isGeneratingImage}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isGeneratingImage ? 'Exporting...' : 'Download Image'}</span>
                  </button>
                </>
              )}
            </div>
          ) : (
            <button
              id="btn-create-new-bill"
              type="button"
              onClick={handleStartCreate}
              className="px-5 py-2.5 bg-[#082138] hover:bg-[#0b2f50] text-white text-xs font-bold rounded-lg shadow flex items-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#0088CC]" />
              <span>Create New Bill</span>
            </button>
          )}

          {viewMode === 'preview' && selectedBill && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleEditBill(selectedBill)}
                className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Edit Details
              </button>
              <button
                id="btn-download-preview-a4"
                type="button"
                onClick={() => handleDownloadA4Image(selectedBill)}
                disabled={isGeneratingImage}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{isGeneratingImage ? 'Generating Image...' : 'Download A4 Image'}</span>
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg shadow transition cursor-pointer"
                title="Print Invoice"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: BILLS HISTORY LIST
         ========================================================================= */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {/* Metrics summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Bills Generated</p>
              <p className="text-2xl font-extrabold text-[#082138] mt-1 font-heading">{bills.length}</p>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Synced with Database</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Invoiced Value</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1 font-heading">
                {formatPrice(bills.reduce((acc, b) => acc + (Number(b.total_amount) || 0), 0))}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">GST Included</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Official Template</p>
                <p className="text-xs font-semibold text-slate-800 mt-1">A4 Machinery Tax Invoice Book</p>
              </div>
              <button
                type="button"
                onClick={handleStartCreate}
                className="w-full mt-2 py-1.5 bg-[#0088CC] hover:bg-[#0077B6] text-white text-xs font-bold rounded-lg transition text-center"
              >
                + Issue New Bill
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search previous bills by Invoice #, Customer Name, GSTIN, Machine Model, or Serial Number..."
              className="flex-1 text-xs text-slate-800 bg-transparent border-0 focus:outline-hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* Bills Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Customer (Messers)</th>
                    <th className="py-3 px-4">Machinery Items</th>
                    <th className="py-3 px-4 text-right">Subtotal</th>
                    <th className="py-3 px-4 text-right">Total Amount</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                        Loading bills from database...
                      </td>
                    </tr>
                  ) : filteredBills.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                        {searchQuery ? 'No invoices match your search query.' : 'No invoices generated yet. Click "Create New Bill" above.'}
                      </td>
                    </tr>
                  ) : (
                    filteredBills.map(bill => {
                      const itemCount = bill.items?.length || 0;
                      const summary = bill.items?.map(i => i.product_name).join(', ') || 'General Machinery';

                      return (
                        <tr key={bill.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#082138]">
                            {bill.invoice_number}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                            {bill.invoice_date}
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900">{bill.customer_name}</p>
                            {bill.customer_gstin && (
                              <p className="text-[10px] font-mono text-slate-500">
                                GST: {bill.customer_gstin}
                              </p>
                            )}
                          </td>
                          <td className="py-3.5 px-4 max-w-[280px]">
                            <p className="truncate text-slate-800 font-medium" title={summary}>
                              {summary}
                            </p>
                            <span className="text-[10px] text-slate-500 font-semibold">
                              {itemCount} {itemCount === 1 ? 'machine' : 'machines'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-700 text-right">
                            {formatPrice(bill.subtotal)}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-extrabold text-[#082138] text-right">
                            {formatPrice(bill.total_amount)}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handlePreviewBill(bill)}
                                className="p-1.5 text-slate-600 hover:text-white hover:bg-[#082138] rounded-lg transition"
                                title="View / Preview Invoice"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedBill(bill);
                                  setViewMode('preview');
                                  setTimeout(() => handleDownloadA4Image(bill), 250);
                                }}
                                className="p-1.5 text-emerald-600 hover:text-white hover:bg-emerald-600 rounded-lg transition"
                                title="Download A4 Image"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDuplicateBill(bill)}
                                className="p-1.5 text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg transition"
                                title="Duplicate to create new bill"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteBill(bill.id)}
                                className="p-1.5 text-rose-600 hover:text-white hover:bg-rose-600 rounded-lg transition"
                                title="Delete Invoice"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: CREATE / EDIT BILL FORM (With Real-Time Live Preview)
         ========================================================================= */}
      {(viewMode === 'create' || viewMode === 'edit') && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Column: Interactive Form Inputs */}
          <div className="xl:col-span-6 space-y-6">
            <form onSubmit={handleSaveAndGenerate} className="space-y-6">
              {/* Section 1: Customer & Invoice Reference */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-heading font-bold text-sm text-slate-800 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#0088CC]" />
                    <span>Invoice &amp; Customer Information</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setInvoiceNumber(generateNextInvoiceNo(bills))}
                    className="text-[11px] text-[#0088CC] hover:underline font-semibold flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Auto-Sequence</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Invoice No. <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={invoiceNumber}
                      onChange={e => setInvoiceNumber(e.target.value)}
                      placeholder="e.g. MMW/2026-27/001"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-[#0088CC] focus:border-[#0088CC]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Invoice Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={invoiceDate}
                      onChange={e => setInvoiceDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-[#0088CC] focus:border-[#0088CC]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Messers. (Customer / Buyer Company Name) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="e.g. TexTech Industrial Fabrications Ltd."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-semibold focus:ring-1 focus:ring-[#0088CC] focus:border-[#0088CC]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Customer Address (Factory / Office)
                    </label>
                    <textarea
                      rows={2}
                      value={customerAddress}
                      onChange={e => setCustomerAddress(e.target.value)}
                      placeholder="SF No. 42/1B, Avinashi Road, Coimbatore - 641 014"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#0088CC] focus:border-[#0088CC]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Customer / Party's GSTIN No.
                    </label>
                    <input
                      type="text"
                      value={customerGstin}
                      onChange={e => setCustomerGstin(e.target.value.toUpperCase())}
                      placeholder="e.g. 33AABCT9988G1Z5"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono uppercase focus:ring-1 focus:ring-[#0088CC] focus:border-[#0088CC]"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Displayed on right of Messers box &amp; at bottom of invoice.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Machinery Items Details (Requested Fields) */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-heading font-bold text-sm text-slate-800 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[#0088CC]" />
                      <span>Machinery Particulars &amp; Details</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Specify Product name, Serial number, Category, Price, and HSN code
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-3 py-1.5 bg-[#0088CC] hover:bg-[#0077B6] text-white text-xs font-bold rounded-lg flex items-center gap-1 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                {/* Items List */}
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#082138] text-white flex items-center justify-center text-[10px] font-bold">
                            {index + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            Line Item #{index + 1}
                          </span>
                        </div>

                        {/* Quick pick from catalog */}
                        {products.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                              Pick from Catalog:
                            </span>
                            <select
                              onChange={e => {
                                if (e.target.value) {
                                  handleSelectProductForLineItem(index, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                              className="text-[11px] py-1 px-2 border border-slate-300 rounded-md bg-white font-medium focus:ring-1 focus:ring-[#0088CC]"
                              defaultValue=""
                            >
                              <option value="" disabled>
                                Select Machine...
                              </option>
                              {products.map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.name} (₹{p.price.toLocaleString('en-IN')})
                                </option>
                              ))}
                            </select>

                            {items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Line Item Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        {/* Product Name */}
                        <div className="sm:col-span-7">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Product Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={item.product_name}
                            onChange={e => handleItemChange(index, 'product_name', e.target.value)}
                            placeholder="e.g. Heavy Duty Precision Lathe Machine 6.5ft Bed"
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#0088CC]"
                          />
                        </div>

                        {/* Serial Number */}
                        <div className="sm:col-span-5">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Serial Number / Machine ID
                          </label>
                          <input
                            type="text"
                            value={item.serial_number || ''}
                            onChange={e => handleItemChange(index, 'serial_number', e.target.value)}
                            placeholder="e.g. MMW-LTH-65-882"
                            className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#0088CC]"
                          />
                        </div>

                        {/* Category */}
                        <div className="sm:col-span-4">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Category
                          </label>
                          <input
                            type="text"
                            value={item.category || ''}
                            onChange={e => handleItemChange(index, 'category', e.target.value)}
                            placeholder="e.g. Lathe Machines"
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#0088CC]"
                          />
                        </div>

                        {/* HSN Code */}
                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            HSN Code
                          </label>
                          <input
                            type="text"
                            value={item.hsn_code || '84581100'}
                            onChange={e => handleItemChange(index, 'hsn_code', e.target.value)}
                            placeholder="84581100"
                            className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#0088CC]"
                          />
                        </div>

                        {/* Qty */}
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={e => handleItemChange(index, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full px-2.5 py-1.5 text-xs font-mono text-center border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#0088CC]"
                          />
                        </div>

                        {/* Unit Price */}
                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Unit Price (₹) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="number"
                            min={0}
                            step="any"
                            value={item.rate}
                            onChange={e => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                            className="w-full px-2.5 py-1.5 text-xs font-mono font-bold text-right border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#0088CC]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px] font-semibold text-slate-600 border-t border-slate-200">
                        <span>Calculated Line Amount:</span>
                        <span className="font-mono font-bold text-slate-900">
                          {formatPrice(item.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Transport & Dispatch Reference (Optional fields from image) */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-heading font-bold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Truck className="w-4 h-4 text-[#0088CC]" />
                  <span>Transport, Delivery Note &amp; Order Details</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Your Order No.
                    </label>
                    <input
                      type="text"
                      value={orderNumber}
                      onChange={e => setOrderNumber(e.target.value)}
                      placeholder="e.g. PO-TEX-8821"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#0088CC]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Order Dated
                    </label>
                    <input
                      type="date"
                      value={orderDate}
                      onChange={e => setOrderDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#0088CC]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Our Delivery Note No.
                    </label>
                    <input
                      type="text"
                      value={deliveryNoteNo}
                      onChange={e => setDeliveryNoteNo(e.target.value)}
                      placeholder="e.g. DN-2026-084"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#0088CC]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Delivery Note Dated
                    </label>
                    <input
                      type="date"
                      value={deliveryNoteDate}
                      onChange={e => setDeliveryNoteDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#0088CC]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Despatched by
                    </label>
                    <input
                      type="text"
                      value={despatchedBy}
                      onChange={e => setDespatchedBy(e.target.value)}
                      placeholder="e.g. KPN Roadways / Transport"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#0088CC]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Document Through
                    </label>
                    <input
                      type="text"
                      value={documentThrough}
                      onChange={e => setDocumentThrough(e.target.value)}
                      placeholder="e.g. Direct / Bank"
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#0088CC]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Vehicle No.
                    </label>
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={e => setVehicleNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. TN 38 BX 4419"
                      className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#0088CC]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Eway Bill No.
                    </label>
                    <input
                      type="text"
                      value={ewayBillNo}
                      onChange={e => setEwayBillNo(e.target.value)}
                      placeholder="e.g. EWB-882194721092"
                      className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#0088CC]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: GST Details & Overall Total */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-heading font-bold text-sm text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Building2 className="w-4 h-4 text-[#0088CC]" />
                  <span>GST Details &amp; Overall Total Calculation</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Tax Mode
                    </label>
                    <select
                      value={taxType}
                      onChange={e => setTaxType(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-[#0088CC]"
                    >
                      <option value="intra_state">Intra-State (CGST 9% + SGST 9%) - Tamil Nadu</option>
                      <option value="inter_state">Inter-State (IGST 18%) - Outside Tamil Nadu</option>
                    </select>
                  </div>

                  {taxType === 'intra_state' ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          CGST (%)
                        </label>
                        <input
                          type="number"
                          value={cgstRate}
                          onChange={e => setCgstRate(parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 text-xs font-mono text-center border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          SGST (%)
                        </label>
                        <input
                          type="number"
                          value={sgstRate}
                          onChange={e => setSgstRate(parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 text-xs font-mono text-center border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        IGST (%)
                      </label>
                      <input
                        type="number"
                        value={igstRate}
                        onChange={e => setIgstRate(parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 text-xs font-mono text-center border border-slate-300 rounded-lg"
                      />
                    </div>
                  )}
                </div>

                {/* Summary calculation card */}
                <div className="p-3 bg-[#F0F6FA] border border-[#CCE2F5] rounded-lg space-y-2 text-xs">
                  <div className="flex justify-between text-slate-700">
                    <span>Bill Amount Before Tax (Subtotal):</span>
                    <span className="font-mono font-bold text-slate-900">{formatPrice(subtotal)}</span>
                  </div>

                  {taxType === 'intra_state' ? (
                    <>
                      <div className="flex justify-between text-slate-600">
                        <span>CGST @ {cgstRate}%:</span>
                        <span className="font-mono font-medium text-slate-800">{formatPrice(cgstAmount)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>SGST @ {sgstRate}%:</span>
                        <span className="font-mono font-medium text-slate-800">{formatPrice(sgstAmount)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-slate-600">
                      <span>IGST @ {igstRate}%:</span>
                      <span className="font-mono font-medium text-slate-800">{formatPrice(igstAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm font-extrabold text-[#082138] border-t border-[#CCE2F5] pt-2">
                    <span>Bill Amount After Tax (Overall Total):</span>
                    <span className="font-mono text-base text-[#0088CC]">{formatPrice(overallTotal)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Rupees in Words (Auto-generated)
                  </label>
                  <input
                    type="text"
                    value={rupeesInWords}
                    onChange={e => setRupeesInWords(e.target.value)}
                    placeholder="Rupees in Words..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-medium italic focus:ring-1 focus:ring-[#0088CC]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#082138] hover:bg-[#0b2f50] text-white text-xs font-bold rounded-xl shadow-lg flex items-center gap-2 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#0088CC]" />
                  <span>Generate &amp; Save Bill</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadA4Image(currentPreviewBill)}
                  disabled={isGeneratingImage}
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>{isGeneratingImage ? 'Generating Image...' : 'Download A4 Image Now'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setViewMode('list');
                    setSelectedBill(null);
                  }}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Real-Time Live A4 Invoice Rendering Preview */}
          <div className="xl:col-span-6">
            <div className="sticky top-20 space-y-3">
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-extrabold text-[#082138] uppercase tracking-wider">
                    Live A4 Invoice Preview
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {/* Zoom Controls */}
                  <div className="flex items-center bg-slate-100 rounded-lg p-0.5 mr-1 text-slate-600">
                    <button
                      type="button"
                      onClick={() => setPreviewScale(prev => Math.max(0.6, Number((prev - 0.1).toFixed(2))))}
                      className="p-1 hover:bg-slate-200 rounded text-slate-700 transition"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono px-1 font-bold">
                      {Math.round(previewScale * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewScale(prev => Math.min(1.2, Number((prev + 0.1).toFixed(2))))}
                      className="p-1 hover:bg-slate-200 rounded text-slate-700 transition"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSaveBillRecord(true, false)}
                    className="px-3 py-1.5 bg-[#082138] hover:bg-[#0b2f50] text-white text-[11px] font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Save Bill</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadA4Image(currentPreviewBill)}
                    disabled={isGeneratingImage}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Image</span>
                  </button>
                </div>
              </div>

              {/* Scaled Preview Frame to fit column nicely */}
              <div className="bg-slate-200 p-4 rounded-xl border border-slate-300 overflow-x-auto flex justify-center shadow-inner max-h-[85vh] overflow-y-auto">
                <div
                  className="transform origin-top transition-transform"
                  style={{
                    transform: `scale(${previewScale})`,
                    marginBottom: `calc((1 - ${previewScale}) * -1123px)`
                  }}
                >
                  <BillInvoiceTemplate
                    bill={currentPreviewBill}
                    id="a4-invoice-render-live"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: PREVIEW MODE (Clean view of generated bill)
         ========================================================================= */}
      {viewMode === 'preview' && selectedBill && (
        <div className="space-y-4">
          <div className="bg-slate-200 p-6 rounded-2xl border border-slate-300 overflow-x-auto flex justify-center shadow-inner">
            <BillInvoiceTemplate
              bill={selectedBill}
              id="a4-invoice-render-preview"
            />
          </div>
        </div>
      )}
    </div>
  );
};
