import React, { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import { Quotation, QuotationItem, Product, Category } from '../../../types';
import { dataService, DATA_CHANGE_EVENT } from '../../../services/dataService';
import { useSettings } from '../../../context/SettingsContext';
import { formatPrice, numberToIndianWords, generateNextQuotationNo, formatDateIndian } from '../../../utils/helpers';
import { QuotationTemplate } from './QuotationTemplate';
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
  ArrowRight,
  Building2,
  Hash,
  RefreshCw,
  Sparkles,
  Info,
  Calendar,
  Layers,
  Database,
  Save,
  ZoomIn,
  ZoomOut,
  Clock,
  ShieldCheck,
  Send,
  Sliders,
  Edit3
} from 'lucide-react';

interface AdminQuotationProps {
  onNavigateToBilling?: (prefillBillData?: any) => void;
}

export const AdminQuotation: React.FC<AdminQuotationProps> = ({ onNavigateToBilling }) => {
  const { showToast } = useSettings();

  // Navigation & view states
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit' | 'preview'>('list');
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewScale, setPreviewScale] = useState(0.82);
  const [showLivePreviewInForm, setShowLivePreviewInForm] = useState(true);

  // Active Quotation being edited or previewed
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  // Form Fields
  const [quotationNumber, setQuotationNumber] = useState('');
  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().slice(0, 10));
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerGstin, setCustomerGstin] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [quotationStatus, setQuotationStatus] = useState<'draft' | 'sent' | 'accepted' | 'rejected' | 'converted'>('draft');

  // Items
  const [items, setItems] = useState<QuotationItem[]>([
    {
      id: `qtn-item-${Date.now()}-1`,
      product_description: 'VISWAKALA POWER PRESS (10 TON CAPACITY)',
      quantity: 1,
      rate: 120000,
      amount: 120000
    },
    {
      id: `qtn-item-${Date.now()}-2`,
      product_description: '3 PHASE 1 HP MOTOR, SWITCH AND BELT',
      quantity: 1,
      rate: 9000,
      amount: 9000
    }
  ]);

  // Tax & Totals
  const [taxType, setTaxType] = useState<'intra_state' | 'inter_state' | 'none'>('intra_state');
  const [cgstRate, setCgstRate] = useState<number>(9);
  const [sgstRate, setSgstRate] = useState<number>(9);
  const [igstRate, setIgstRate] = useState<number>(18);
  const [rupeesInWords, setRupeesInWords] = useState('');

  // Terms & Conditions
  const [terms, setTerms] = useState<string[]>([
    'Payment 50% Advance and balance before delivery.',
    'Machine Packing, Loading and Freight charges will be extra.'
  ]);
  const [newTermInput, setNewTermInput] = useState('');

  // Bank Defaults
  const [bankName, setBankName] = useState('STATE BANK OF INDIA');
  const [bankAccountName, setBankAccountName] = useState('Murthi Machin Works');
  const [bankAccountNo, setBankAccountNo] = useState('44117451637');
  const [bankIfsc, setBankIfsc] = useState('SBIN0021453');
  const [bankBranch, setBankBranch] = useState('Avarampalayam');

  const quotationPrintRef = useRef<HTMLDivElement>(null);

  // Load initial data
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [loadedQuotations, loadedProducts, loadedCategories] = await Promise.all([
        dataService.getQuotations(),
        dataService.getProducts(),
        dataService.getCategories()
      ]);
      setQuotations(loadedQuotations);
      setProducts(loadedProducts);
      setCategories(loadedCategories);
    } catch (err) {
      console.warn('Error loading quotation data:', err);
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

  // Initialize new quotation form
  const handleOpenCreateNew = () => {
    const nextQtn = generateNextQuotationNo(quotations);
    setSelectedQuotation(null);
    setQuotationNumber(nextQtn);
    setQuotationDate(new Date().toISOString().slice(0, 10));
    setCustomerName('');
    setCustomerAddress('');
    setCustomerGstin('');
    setCustomerPhone('');
    setQuotationStatus('draft');

    setItems([
      {
        id: `qtn-item-${Date.now()}-1`,
        product_description: '',
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
    setTerms([
      'Payment 50% Advance and balance before delivery.',
      'Machine Packing, Loading and Freight charges will be extra.'
    ]);
    setViewMode('create');
  };

  // Open existing quotation for editing
  const handleEditQuotation = (qtn: Quotation) => {
    setSelectedQuotation(qtn);
    setQuotationNumber(qtn.quotation_number);
    setQuotationDate(qtn.quotation_date || new Date().toISOString().slice(0, 10));
    setCustomerName(qtn.customer_name);
    setCustomerAddress(qtn.customer_address || '');
    setCustomerGstin(qtn.customer_gstin || '');
    setCustomerPhone(qtn.customer_phone || '');
    setQuotationStatus(qtn.status || 'draft');

    setItems(
      qtn.items && qtn.items.length > 0
        ? qtn.items.map(it => ({ ...it }))
        : [
            {
              id: `qtn-item-${Date.now()}-1`,
              product_description: '',
              quantity: 1,
              rate: 0,
              amount: 0
            }
          ]
    );

    setTaxType(qtn.tax_type || 'intra_state');
    setCgstRate(qtn.cgst_rate !== undefined ? qtn.cgst_rate : 9);
    setSgstRate(qtn.sgst_rate !== undefined ? qtn.sgst_rate : 9);
    setIgstRate(qtn.igst_rate !== undefined ? qtn.igst_rate : 18);
    setRupeesInWords(qtn.rupees_in_words || '');
    setTerms(
      qtn.terms_and_conditions && qtn.terms_and_conditions.length > 0
        ? [...qtn.terms_and_conditions]
        : [
            'Payment 50% Advance and balance before delivery.',
            'Machine Packing, Loading and Freight charges will be extra.'
          ]
    );

    setBankName(qtn.bank_name || 'STATE BANK OF INDIA');
    setBankAccountName(qtn.bank_account_name || 'Murthi Machin Works');
    setBankAccountNo(qtn.bank_account_no || '44117451637');
    setBankIfsc(qtn.bank_ifsc || 'SBIN0021453');
    setBankBranch(qtn.bank_branch || 'Avarampalayam');

    setViewMode('edit');
  };

  // Preview quotation
  const handlePreviewQuotation = (qtn: Quotation) => {
    setSelectedQuotation(qtn);
    setViewMode('preview');
  };

  // Duplicate quotation
  const handleDuplicateQuotation = (qtn: Quotation) => {
    const nextQtn = generateNextQuotationNo(quotations);
    setSelectedQuotation(null);
    setQuotationNumber(nextQtn);
    setQuotationDate(new Date().toISOString().slice(0, 10));
    setCustomerName(qtn.customer_name);
    setCustomerAddress(qtn.customer_address || '');
    setCustomerGstin(qtn.customer_gstin || '');
    setCustomerPhone(qtn.customer_phone || '');
    setQuotationStatus('draft');

    setItems(
      qtn.items.map(it => ({
        ...it,
        id: `qtn-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
      }))
    );

    setTaxType(qtn.tax_type || 'intra_state');
    setCgstRate(qtn.cgst_rate);
    setSgstRate(qtn.sgst_rate);
    setIgstRate(qtn.igst_rate);
    setRupeesInWords(qtn.rupees_in_words || '');
    setTerms([...(qtn.terms_and_conditions || [])]);
    setViewMode('create');
    showToast('Quotation Duplicated', `Created copy under ${nextQtn}`, 'info');
  };

  // Delete Quotation
  const handleDeleteQuotation = async (qtnId: string) => {
    if (!window.confirm('Are you sure you want to delete this quotation record?')) {
      return;
    }
    try {
      await dataService.deleteQuotation(qtnId);
      showToast('Quotation Deleted', 'Record deleted successfully', 'success');
      loadData();
      if (viewMode === 'preview' || (selectedQuotation && selectedQuotation.id === qtnId)) {
        setViewMode('list');
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to delete quotation', 'error');
    }
  };

  // Item handlers
  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      {
        id: `qtn-item-${Date.now()}-${prev.length + 1}`,
        product_description: '',
        quantity: 1,
        rate: 0,
        amount: 0
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      showToast('Notice', 'At least one machinery item is required on the quotation.', 'info');
      return;
    }
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof QuotationItem, value: any) => {
    setItems(prev => {
      const copy = [...prev];
      const target = { ...copy[index], [field]: value };

      if (field === 'quantity' || field === 'rate') {
        const q = field === 'quantity' ? Number(value) || 0 : target.quantity || 0;
        const r = field === 'rate' ? Number(value) || 0 : target.rate || 0;
        target.amount = Math.round(q * r * 100) / 100;
      }
      copy[index] = target;
      return copy;
    });
  };

  // Select catalog machine to fill description & rate
  const handleSelectProductForLineItem = (index: number, productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    setItems(prev => {
      const copy = [...prev];
      const target = {
        ...copy[index],
        product_description: `${prod.name.toUpperCase()}${prod.condition ? ` (${prod.condition.toUpperCase()})` : ''}`,
        rate: prod.price || 0,
        amount: (copy[index].quantity || 1) * (prod.price || 0)
      };
      copy[index] = target;
      return copy;
    });

    showToast('Machine Selected', `Loaded details for ${prod.name}`, 'info');
  };

  // Terms handlers
  const handleAddTerm = () => {
    if (!newTermInput.trim()) return;
    setTerms(prev => [...prev, newTermInput.trim()]);
    setNewTermInput('');
  };

  const handleRemoveTerm = (index: number) => {
    setTerms(prev => prev.filter((_, i) => i !== index));
  };

  // Calculations for subtotal, taxes, and overall total
  const subtotal = items.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (taxType === 'intra_state') {
    cgstAmount = Math.round(((subtotal * (cgstRate || 9)) / 100) * 100) / 100;
    sgstAmount = Math.round(((subtotal * (sgstRate || 9)) / 100) * 100) / 100;
  } else if (taxType === 'inter_state') {
    igstAmount = Math.round(((subtotal * (igstRate || 18)) / 100) * 100) / 100;
  }

  const overallTotal = Math.round((subtotal + cgstAmount + sgstAmount + igstAmount) * 100) / 100;

  // Real-time calculated quotation object for live preview
  const currentPreviewQuotation: Quotation = {
    id: selectedQuotation?.id || 'live-preview-quotation',
    quotation_number: quotationNumber || generateNextQuotationNo(quotations),
    quotation_date: quotationDate,
    customer_name: customerName || 'S. S ENGINEERING',
    customer_address:
      customerAddress ||
      'SF NO 12/13, New Street, Suriya Nagar,\nKamatchipuram, Ondipudur,\nCoimbatore - 641016',
    customer_gstin: customerGstin || '33ABVFS0964K1ZK',
    customer_phone: customerPhone,
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
    terms_and_conditions: terms,
    bank_name: bankName,
    bank_account_name: bankAccountName,
    bank_account_no: bankAccountNo,
    bank_ifsc: bankIfsc,
    bank_branch: bankBranch,
    status: quotationStatus,
    created_at: selectedQuotation?.created_at || new Date().toISOString()
  };

  // Reusable robust save function
  const handleSaveQuotationRecord = async (
    showNotification = true,
    changeView = true
  ): Promise<Quotation | null> => {
    const validCustomerName = customerName.trim() || 'Messers. Client';
    const validQuotationNumber = quotationNumber.trim() || generateNextQuotationNo(quotations);

    let validItems = items.filter(i => i.product_description && i.product_description.trim().length > 0);
    if (validItems.length === 0) {
      validItems = [
        {
          id: `qtn-item-${Date.now()}-1`,
          product_description: 'Industrial Machinery & Equipment',
          quantity: 1,
          rate: subtotal || 0,
          amount: subtotal || 0
        }
      ];
    }

    try {
      const payload: Omit<Quotation, 'id' | 'created_at' | 'updated_at'> = {
        quotation_number: validQuotationNumber,
        quotation_date: quotationDate || new Date().toISOString().slice(0, 10),
        customer_name: validCustomerName,
        customer_address: customerAddress.trim(),
        customer_gstin: customerGstin.trim() || undefined,
        customer_phone: customerPhone.trim() || undefined,
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
        terms_and_conditions: terms,
        bank_name: bankName,
        bank_account_name: bankAccountName,
        bank_account_no: bankAccountNo,
        bank_ifsc: bankIfsc,
        bank_branch: bankBranch,
        status: quotationStatus
      };

      let saved: Quotation;

      if (viewMode === 'edit' && selectedQuotation?.id) {
        saved = await dataService.updateQuotation(selectedQuotation.id, payload);
        if (showNotification) {
          showToast('Quotation Updated', `Quotation ${validQuotationNumber} saved successfully`, 'success');
        }
      } else {
        saved = await dataService.createQuotation(payload);
        if (showNotification) {
          showToast('Quotation Created', `Quotation ${validQuotationNumber} saved successfully`, 'success');
        }
      }

      setSelectedQuotation(saved);
      if (changeView) {
        setViewMode('preview');
      }
      await loadData();
      return saved;
    } catch (err: any) {
      console.error('Failed to save quotation:', err);
      if (showNotification) {
        showToast('Save Error', err.message || 'Could not save quotation', 'error');
      }
      return null;
    }
  };

  // Download Exact A4-sized Image using html-to-image with off-screen unscaled clone
  const handleDownloadA4Image = async (qtnToDownload?: Quotation) => {
    const targetQtn = qtnToDownload || selectedQuotation || currentPreviewQuotation;
    const elementId = viewMode === 'preview' ? 'a4-quotation-render-preview' : 'a4-quotation-render-live';
    const qtnEl = document.getElementById(elementId) || document.getElementById('a4-quotation-render');

    if (!qtnEl) {
      showToast('Notice', 'Unable to capture quotation layout. Please try again.', 'error');
      return;
    }

    try {
      setIsGeneratingImage(true);
      showToast('Generating Image', 'Rendering A4-sized high-resolution quotation image...', 'info');

      // Auto-save in background
      await handleSaveQuotationRecord(false, false);

      // Clone element into off-screen container without CSS transforms
      const cloneContainer = document.createElement('div');
      cloneContainer.style.position = 'fixed';
      cloneContainer.style.left = '-9999px';
      cloneContainer.style.top = '0px';
      cloneContainer.style.width = '794px';
      cloneContainer.style.height = '1123px';
      cloneContainer.style.zIndex = '-9999';
      cloneContainer.style.backgroundColor = '#ffffff';
      cloneContainer.style.overflow = 'hidden';

      const clone = qtnEl.cloneNode(true) as HTMLElement;
      clone.style.transform = 'none';
      clone.style.margin = '0';
      clone.style.boxShadow = 'none';
      clone.style.width = '794px';
      clone.style.height = '1123px';
      cloneContainer.appendChild(clone);
      document.body.appendChild(cloneContainer);

      await new Promise(r => setTimeout(r, 120));

      const dataUrl = await toPng(clone, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
        cacheBust: true
      });

      if (document.body.contains(cloneContainer)) {
        document.body.removeChild(cloneContainer);
      }

      const safeQtnNum = (targetQtn.quotation_number || 'Quotation').replace(/[\/\\]/g, '-');
      const safeCustomer = (targetQtn.customer_name || 'Customer').replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `${safeQtnNum}_${safeCustomer}.png`;

      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('Quotation Image Saved', `Successfully exported ${fileName}`, 'success');
    } catch (err: any) {
      console.error('Error generating A4 quotation image:', err);
      showToast('Generation Error', err.message || 'Could not export quotation image', 'error');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Convert Quotation to Tax Invoice / Bill
  const handleConvertToBill = (qtn: Quotation) => {
    if (onNavigateToBilling) {
      const billData = {
        customer_name: qtn.customer_name,
        customer_address: qtn.customer_address,
        customer_gstin: qtn.customer_gstin,
        items: qtn.items.map(it => ({
          product_name: it.product_description,
          serial_number: '',
          category: 'Machinery',
          hsn_code: '84621000',
          quantity: it.quantity,
          rate: it.rate,
          amount: it.amount
        })),
        tax_type: qtn.tax_type === 'none' ? 'intra_state' : qtn.tax_type,
        cgst_rate: qtn.cgst_rate,
        sgst_rate: qtn.sgst_rate,
        igst_rate: qtn.igst_rate
      };
      onNavigateToBilling(billData);
      showToast('Quotation Loaded in Billing', `Pre-filled invoice for ${qtn.customer_name}`, 'info');
    } else {
      showToast('Action', 'Please open Bill / Tax Invoice to generate bill', 'info');
    }
  };

  // Print quotation
  const handlePrint = () => {
    window.print();
  };

  // Filter quotations
  const filteredQuotations = quotations.filter(q => {
    const query = searchQuery.toLowerCase();
    return (
      q.quotation_number.toLowerCase().includes(query) ||
      q.customer_name.toLowerCase().includes(query) ||
      (q.customer_gstin && q.customer_gstin.toLowerCase().includes(query)) ||
      (q.items && q.items.some(it => it.product_description.toLowerCase().includes(query)))
    );
  });

  const totalValue = quotations.reduce((acc, q) => acc + (q.total_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* =======================================================================
          PRINT-ONLY OVERLAY (Standard browser print)
         ======================================================================= */}
      <div className="hidden print:block print:fixed print:inset-0 print:m-0 print:p-0 bg-white">
        <QuotationTemplate quotation={selectedQuotation || currentPreviewQuotation} />
      </div>

      {/* =======================================================================
          VIEW: LIST OF ALL QUOTATIONS
         ======================================================================= */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {/* Header & Stats Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-rose-50 text-rose-700 rounded-xl border border-rose-100">
                  <FileText className="w-5 h-5" />
                </span>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Quotation Management
                </h1>
              </div>
              <p className="text-sm text-slate-500 mt-1 pl-11">
                Create, print, and export high-resolution commercial quotations for machinery buyers with official letterhead styling.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={loadData}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                title="Refresh Quotations"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              <button
                type="button"
                onClick={handleOpenCreateNew}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.99] shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Quotation</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Total Quotations
                </p>
                <p className="text-xl font-black text-slate-900 mt-0.5">
                  {quotations.length}
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Cumulative Value
                </p>
                <p className="text-xl font-black text-emerald-700 mt-0.5">
                  ₹{totalValue.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Next Sequence
                </p>
                <p className="text-base font-mono font-bold text-blue-700 mt-0.5">
                  {generateNextQuotationNo(quotations)}
                </p>
              </div>
            </div>
          </div>

          {/* Search and Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by QTN#, Client, Machine..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-none transition-all"
                />
              </div>

              <div className="text-xs text-slate-500">
                Showing <strong className="text-slate-800">{filteredQuotations.length}</strong> of{' '}
                {quotations.length} quotation records
              </div>
            </div>

            {/* Quotations Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 border-collapse">
                <thead className="bg-slate-50/75 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="py-3 px-4">Quotation #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Machines / Items</th>
                    <th className="py-3 px-4 text-right">Grand Total (₹)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {filteredQuotations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-600">No Quotations Found</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Click &quot;Create Quotation&quot; above to generate your first professional machine quotation.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredQuotations.map(qtn => (
                      <tr
                        key={qtn.id}
                        onClick={() => handlePreviewQuotation(qtn)}
                        className="hover:bg-slate-100/90 transition-colors cursor-pointer group"
                        title="Click to view full A4 quotation preview"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-xs">
                          {qtn.quotation_number}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                          {formatDateIndian(qtn.quotation_date)}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900 leading-snug">{qtn.customer_name}</p>
                          {qtn.customer_gstin && (
                            <p className="text-[11px] font-mono text-slate-400">
                              GST: {qtn.customer_gstin}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          {qtn.items && qtn.items.length > 0 ? (
                            <div>
                              <p className="font-medium text-slate-800 line-clamp-1">
                                {qtn.items[0].product_description}
                              </p>
                              {qtn.items.length > 1 && (
                                <p className="text-[10.5px] text-slate-400">
                                  +{qtn.items.length - 1} more items
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-950 text-sm whitespace-nowrap">
                          ₹{qtn.total_amount?.toLocaleString('en-IN') || 0}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider ${
                              qtn.status === 'converted'
                                ? 'bg-purple-100 text-purple-800'
                                : qtn.status === 'accepted'
                                ? 'bg-emerald-100 text-emerald-800'
                                : qtn.status === 'sent'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {qtn.status || 'draft'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handlePreviewQuotation(qtn)}
                              className="p-1.5 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Preview A4 Quotation"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleEditQuotation(qtn)}
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Quotation"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDuplicateQuotation(qtn)}
                              className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Duplicate as New Quotation"
                            >
                              <Copy className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteQuotation(qtn.id)}
                              className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Quotation"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          VIEW: CREATE OR EDIT QUOTATION (WITH OPTIONAL LIVE PREVIEW SPLIT)
         ======================================================================= */}
      {(viewMode === 'create' || viewMode === 'edit') && (
        <div className="space-y-6">
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {viewMode === 'edit' ? 'Edit Quotation' : 'Create New Quotation'}
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  {quotationNumber || 'MMW/QTN/2026-27/001'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowLivePreviewInForm(!showLivePreviewInForm)}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showLivePreviewInForm ? 'Hide Live Preview' : 'Show Live Preview'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedQuotation(currentPreviewQuotation);
                  setViewMode('preview');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>Full Preview</span>
              </button>

              <button
                type="button"
                disabled={isGeneratingImage}
                onClick={() => handleDownloadA4Image()}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isGeneratingImage ? 'Rendering...' : 'Download Image'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveQuotationRecord(true, true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Quotation</span>
              </button>
            </div>
          </div>

          {/* Form & Live Preview Grid */}
          <div
            className={`grid grid-cols-1 ${
              showLivePreviewInForm ? 'lg:grid-cols-12' : 'max-w-4xl mx-auto'
            } gap-6 items-start`}
          >
            {/* Form Section */}
            <div className={showLivePreviewInForm ? 'lg:col-span-7 space-y-6' : 'w-full space-y-6'}>
              {/* Section 1: Quotation Details */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-rose-600" />
                    Quotation Header &amp; Reference
                  </h3>
                  <button
                    type="button"
                    onClick={() => setQuotationNumber(generateNextQuotationNo(quotations))}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold inline-flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Auto Next Sequence
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Quotation Number *
                    </label>
                    <input
                      type="text"
                      value={quotationNumber}
                      onChange={e => setQuotationNumber(e.target.value)}
                      placeholder="MMW/QTN/2026-27/001"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 outline-none font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Quotation Date *
                    </label>
                    <input
                      type="date"
                      value={quotationDate}
                      onChange={e => setQuotationDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Status
                    </label>
                    <select
                      value={quotationStatus}
                      onChange={e => setQuotationStatus(e.target.value as any)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 outline-none"
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                      <option value="converted">Converted to Bill</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Customer / Buyer Details */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-rose-600" />
                    Buyer / Customer Details (&quot;To,&quot;)
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Company / Buyer Name *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="e.g. S. S ENGINEERING"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 outline-none font-bold uppercase"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Factory / Office Address (Multi-line)
                    </label>
                    <textarea
                      rows={3}
                      value={customerAddress}
                      onChange={e => setCustomerAddress(e.target.value)}
                      placeholder="SF NO 12/13, New Street, Suriya Nagar,&#10;Kamatchipuram, Ondipudur,&#10;Coimbatore - 641016"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Buyer GSTIN
                      </label>
                      <input
                        type="text"
                        value={customerGstin}
                        onChange={e => setCustomerGstin(e.target.value.toUpperCase())}
                        placeholder="33ABVFS0964K1ZK"
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Contact Phone / Mobile
                      </label>
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={e => setCustomerPhone(e.target.value)}
                        placeholder="98422 66521"
                        className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Quotation Items (Machines) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-rose-600" />
                    Quotation Line Items (Machinery &amp; Equipment)
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 space-y-3 relative group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-700">Item #{idx + 1}</span>
                        <div className="flex items-center gap-2">
                          {/* Quick catalog dropdown */}
                          <select
                            onChange={e => {
                              if (e.target.value) handleSelectProductForLineItem(idx, e.target.value);
                            }}
                            defaultValue=""
                            className="text-[11px] px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 outline-none"
                          >
                            <option value="">Quick pick from Stock...</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.name} (₹{p.price?.toLocaleString('en-IN')})
                              </option>
                            ))}
                          </select>

                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                              title="Remove Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Product Description *
                        </label>
                        <input
                          type="text"
                          value={item.product_description}
                          onChange={e =>
                            handleItemChange(idx, 'product_description', e.target.value.toUpperCase())
                          }
                          placeholder="e.g. VISWAKALA POWER PRESS (10 TON CAPACITY)"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:border-rose-500 outline-none font-bold uppercase"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={e =>
                              handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)
                            }
                            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:border-rose-500 outline-none font-mono text-center"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Rate per Qty (₹)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="100"
                            value={item.rate}
                            onChange={e =>
                              handleItemChange(idx, 'rate', parseFloat(e.target.value) || 0)
                            }
                            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:border-rose-500 outline-none font-mono text-right"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Total (₹)
                          </label>
                          <div className="px-3 py-1.5 text-xs bg-slate-100/80 border border-slate-200 rounded-lg font-mono font-bold text-slate-900 text-right">
                            ₹{item.amount?.toLocaleString('en-IN') || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Tax and Calculations */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-rose-600" />
                    GST Tax &amp; Summary
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tax Category
                    </label>
                    <select
                      value={taxType}
                      onChange={e => setTaxType(e.target.value as any)}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 outline-none"
                    >
                      <option value="intra_state">Intra-State (CGST 9% + SGST 9%)</option>
                      <option value="inter_state">Inter-State (IGST 18%)</option>
                      <option value="none">No Tax / Zero GST (0%)</option>
                    </select>
                  </div>

                  <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 text-xs">
                    <div className="flex justify-between font-medium text-slate-600">
                      <span>Subtotal:</span>
                      <span className="font-mono font-bold text-slate-900">
                        ₹{subtotal.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {taxType === 'intra_state' && (
                      <>
                        <div className="flex justify-between text-slate-600">
                          <span>CGST (9%):</span>
                          <span className="font-mono font-bold text-slate-900">
                            ₹{cgstAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>SGST (9%):</span>
                          <span className="font-mono font-bold text-slate-900">
                            ₹{sgstAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </>
                    )}

                    {taxType === 'inter_state' && (
                      <div className="flex justify-between text-slate-600">
                        <span>IGST (18%):</span>
                        <span className="font-mono font-bold text-slate-900">
                          ₹{igstAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}

                    <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-950">
                      <span>Grand Total:</span>
                      <span className="font-mono text-rose-700">
                        ₹{overallTotal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 5: Terms & Conditions */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Info className="w-4 h-4 text-rose-600" />
                    Terms &amp; Conditions
                  </h3>
                </div>

                <div className="space-y-2">
                  {terms.map((term, i) => (
                    <div key={i} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl text-xs">
                      <span className="font-bold text-slate-700">{i + 1})</span>
                      <span className="flex-1 text-slate-800 font-medium">{term}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTerm(i)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      value={newTermInput}
                      onChange={e => setNewTermInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTerm();
                        }
                      }}
                      placeholder="Add custom term (e.g. Delivery within 10 days...)"
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-rose-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddTerm}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Preview Column */}
            {showLivePreviewInForm && (
              <div className="lg:col-span-5 sticky top-24 space-y-4">
                <div className="bg-slate-900 text-white px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs shadow-md">
                  <span className="font-semibold flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-rose-400" />
                    Live Quotation A4 Render
                  </span>
                  <span className="text-[11px] text-slate-400">Updates as you type</span>
                </div>

                <div
                  className="bg-slate-200/70 p-4 rounded-2xl border border-slate-300 flex items-center justify-center overflow-auto shadow-inner"
                  style={{ maxHeight: '760px' }}
                >
                  <div
                    style={{
                      transform: 'scale(0.56)',
                      transformOrigin: 'top center',
                      marginBottom: '-460px'
                    }}
                  >
                    <QuotationTemplate
                      id="a4-quotation-render-live"
                      quotation={currentPreviewQuotation}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =======================================================================
          VIEW: FULL A4 HIGH-RES PREVIEW & DOWNLOAD
         ======================================================================= */}
      {viewMode === 'preview' && selectedQuotation && (
        <div className="space-y-6">
          {/* Top Preview Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Quotation:</span>
                  <span className="font-mono text-rose-700">{selectedQuotation.quotation_number}</span>
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedQuotation.customer_name} • ₹
                  {selectedQuotation.total_amount?.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Zoom Controls */}
              <div className="hidden sm:flex items-center bg-slate-100 rounded-xl p-1 gap-1 border border-slate-200/70">
                <button
                  type="button"
                  onClick={() => setPreviewScale(prev => Math.max(0.4, prev - 0.1))}
                  className="p-1.5 text-slate-600 hover:text-slate-950 rounded-lg hover:bg-white"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono font-bold px-1.5 text-slate-700">
                  {Math.round(previewScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewScale(prev => Math.min(1.2, prev + 0.1))}
                  className="p-1.5 text-slate-600 hover:text-slate-950 rounded-lg hover:bg-white"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleEditQuotation(selectedQuotation)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>

              <button
                type="button"
                onClick={() => handleConvertToBill(selectedQuotation)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 transition-colors"
                title="Convert this quotation to a commercial tax invoice"
              >
                <ArrowRight className="w-4 h-4 text-emerald-700" />
                <span>Convert to Bill</span>
              </button>

              <button
                type="button"
                disabled={isGeneratingImage}
                onClick={() => handleDownloadA4Image(selectedQuotation)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isGeneratingImage ? 'Rendering...' : 'Download A4 Image'}</span>
              </button>
            </div>
          </div>

          {/* Centered A4 Canvas Display */}
          <div className="bg-slate-800/90 p-8 rounded-2xl shadow-inner overflow-auto flex justify-center items-start min-h-[700px]">
            <div
              style={{
                transform: `scale(${previewScale})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out'
              }}
            >
              <QuotationTemplate
                id="a4-quotation-render-preview"
                quotation={selectedQuotation}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
