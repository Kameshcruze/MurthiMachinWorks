import React, { useState, useEffect } from 'react';
import { Product, Category, ProductSpecification, ProductImage } from '../../types';
import { dataService, DATA_CHANGE_EVENT } from '../../services/dataService';
import { useSettings } from '../../context/SettingsContext';
import { formatImageUrl, formatPrice, slugify, getStockStatusBadge } from '../../utils/helpers';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Upload,
  Check,
  Package,
  Layers,
  Image as ImageIcon,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const { settings, showToast } = useSettings();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    slug: '',
    sku: '',
    category_id: '',
    brand: 'Murthi Precision',
    price: 0,
    sale_price: undefined,
    show_price: true,
    stock_status: 'in_stock',
    short_description: '',
    description: '',
    is_active: true,
    is_featured: false,
    specifications: [
      { key: 'Center Height', value: '250 mm' },
      { key: 'Length of Bed', value: '1800 mm' }
    ],
    features: [
      'Heavy-duty ribbed Meehanite casting',
      'Induction hardened bed guideways'
    ],
    images: []
  });

  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecVal, setNewSpecVal] = useState('');
  const [newFeatureText, setNewFeatureText] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  const loadData = async () => {
    try {
      const [prods, cats] = await Promise.all([
        dataService.getProducts(),
        dataService.getCategories()
      ]);
      setProducts(prods);
      setCategories(cats);
    } catch (e) {
      console.warn('Admin products load error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener(DATA_CHANGE_EVENT, loadData);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, loadData);
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      sku: `MMW-${Math.floor(1000 + Math.random() * 9000)}`,
      category_id: categories[0]?.id || '',
      brand: 'Murthi Precision',
      price: 350000,
      sale_price: undefined,
      show_price: true,
      stock_status: 'in_stock',
      short_description: '',
      description: '',
      is_active: true,
      is_featured: false,
      specifications: [
        { key: 'Center Height', value: '250 mm' },
        { key: 'Length of Bed', value: '1800 mm' },
        { key: 'Spindle Bore', value: '52 mm' }
      ],
      features: [
        'Induction hardened and ground bedways',
        'Headstock gears made of EN-353 steel',
        'ISO 9001:2015 tested spindle runout < 0.005mm'
      ],
      images: [
        {
          id: 'img-1',
          image_url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80',
          sort_order: 1,
          is_primary: true
        }
      ]
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      ...p,
      specifications: p.specifications || [],
      features: p.features || [],
      images: p.images || []
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: slugify(name)
    }));
  };

  const handleAddSpec = () => {
    if (!newSpecKey.trim() || !newSpecVal.trim()) return;
    setFormData(prev => ({
      ...prev,
      specifications: [...(prev.specifications || []), { key: newSpecKey.trim(), value: newSpecVal.trim() }]
    }));
    setNewSpecKey('');
    setNewSpecVal('');
  };

  const handleRemoveSpec = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications?.filter((_, i) => i !== idx)
    }));
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFormData(prev => ({
      ...prev,
      features: [...(prev.features || []), newFeatureText.trim()]
    }));
    setNewFeatureText('');
  };

  const handleRemoveFeature = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== idx)
    }));
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    const isFirst = (formData.images?.length || 0) === 0;
    setFormData(prev => ({
      ...prev,
      images: [
        ...(prev.images || []),
        {
          id: `img-${Date.now()}`,
          image_url: newImageUrl.trim(),
          sort_order: (prev.images?.length || 0) + 1,
          is_primary: isFirst
        }
      ]
    }));
    setNewImageUrl('');
  };

  const handleSetPrimaryImage = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.map((img, i) => ({
        ...img,
        is_primary: i === idx
      }))
    }));
  };

  const handleRemoveImage = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== idx)
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.category_id) {
      showToast('Validation Error', 'Machine name and category are required.', 'error');
      return;
    }

    try {
      if (editingProduct) {
        await dataService.updateProduct(editingProduct.id, formData);
        showToast('Product Updated', `${formData.name} has been updated.`, 'success');
      } else {
        await dataService.createProduct(formData as any);
        showToast('Product Created', `${formData.name} added to catalog.`, 'success');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      showToast('Save Failed', 'Failed to save product changes.', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}" from the machinery catalog?`)) {
      return;
    }
    try {
      await dataService.deleteProduct(id);
      showToast('Product Deleted', `${name} was removed.`, 'info');
      loadData();
    } catch (e) {
      showToast('Error', 'Failed to delete product', 'error');
    }
  };

  const handleToggleActive = async (p: Product) => {
    try {
      await dataService.updateProduct(p.id, { is_active: !p.is_active });
      showToast('Status Toggled', `${p.name} visibility updated.`, 'info');
      loadData();
    } catch (e) {
      showToast('Error', 'Failed to toggle status', 'error');
    }
  };

  const filtered = products.filter(p => {
    if (selectedCatFilter && p.category_id !== selectedCatFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading font-bold text-xl text-slate-900">
            Machinery & Equipment Catalog
          </h2>
          <p className="text-xs text-slate-500">
            Total {products.length} machine tool models in database
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow flex items-center justify-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Machine</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by model, SKU, or brand..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCatFilter}
            onChange={e => setSelectedCatFilter(e.target.value)}
            className="w-full sm:w-auto py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Machine Name & SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price / Term</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4">Visibility</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(p => {
                const primaryImg = p.images?.find(i => i.is_primary)?.image_url || p.images?.[0]?.image_url;
                const stockBadge = getStockStatusBadge(p.stock_status);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={formatImageUrl(primaryImg)}
                          alt={p.name}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 line-clamp-1">{p.name}</p>
                          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                            <span>SKU: {p.sku}</span>
                            {p.is_featured && (
                              <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded">
                                FEATURED
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {p.category_name || categories.find(c => c.id === p.category_id)?.name || 'General'}
                    </td>
                    <td className="py-3 px-4">
                      {p.show_price && p.price > 0 ? (
                        <div>
                          <p className="font-bold text-slate-900">
                            {formatPrice(p.sale_price || p.price, settings.currency_symbol)}
                          </p>
                          {p.sale_price && (
                            <p className="text-[10px] text-slate-400 line-through">
                              {formatPrice(p.price, settings.currency_symbol)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Price on RFQ</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${stockBadge.bg}`}>
                        {stockBadge.label}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(p)}
                        className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          p.is_active
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${p.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        <span>{p.is_active ? 'Published' : 'Draft'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition"
                        title="Edit Machine"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete Machine"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col justify-between overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-400" />
                <h3 className="font-heading font-bold text-base">
                  {editingProduct ? `Edit Machine: ${editingProduct.name}` : 'Add New Machine Tool to Catalog'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Scroll Area */}
            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Basic Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-800 block mb-1">Machine Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => handleNameChange(e.target.value)}
                    placeholder="e.g. Heavy Duty All Geared Lathe Machine 6.5ft"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">SKU / Model Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="e.g. MMW-LT-65"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:bg-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Category *</label>
                  <select
                    value={formData.category_id}
                    onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Brand / Series</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Murthi Precision"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Stock Availability</label>
                  <select
                    value={formData.stock_status}
                    onChange={e => setFormData({ ...formData, stock_status: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="in_stock">In Stock (Ready to Dispatch)</option>
                    <option value="made_to_order">Made to Order</option>
                    <option value="low_stock">Limited Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Sale / Offer Price (₹)</label>
                  <input
                    type="number"
                    value={formData.sale_price || ''}
                    onChange={e => setFormData({ ...formData, sale_price: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="Optional discounted price"
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex flex-col justify-end space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.show_price}
                      onChange={e => setFormData({ ...formData, show_price: e.target.checked })}
                      className="rounded text-amber-500 focus:ring-amber-500"
                    />
                    <span className="font-semibold text-slate-800">Display price publicly</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="rounded text-amber-500 focus:ring-amber-500"
                    />
                    <span className="font-semibold text-slate-800">Mark as Featured flagship</span>
                  </label>
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">Short Description *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.short_description}
                  onChange={e => setFormData({ ...formData, short_description: e.target.value })}
                  placeholder="Key summary displayed in cards and search..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Full Engineering & Build Description</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed specifications of bed casting, spindle assembly, gear train materials, lubrication system..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Image Manager */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label className="font-bold text-slate-800 block">Machinery Images & Gallery</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={e => setNewImageUrl(e.target.value)}
                    placeholder="Paste image URL (Unsplash, CDN, or Cloud Storage)..."
                    className="flex-1 p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800"
                  >
                    Add Image
                  </button>
                </div>

                {/* Images List */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {formData.images?.map((img, idx) => (
                    <div key={idx} className="relative aspect-4/3 rounded-lg overflow-hidden border-2 border-slate-200 group bg-slate-100">
                      <img
                        src={formatImageUrl(img.image_url)}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(idx)}
                          className={`text-[10px] font-bold px-2 py-1 rounded ${
                            img.is_primary ? 'bg-amber-500 text-slate-950' : 'bg-white text-slate-900'
                          }`}
                        >
                          {img.is_primary ? 'Primary' : 'Set Primary'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="p-1 bg-rose-600 text-white rounded hover:bg-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Technical Specifications Table Builder */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label className="font-bold text-slate-800 block">
                  Technical Specifications Table ({formData.specifications?.length || 0} items)
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSpecKey}
                    onChange={e => setNewSpecKey(e.target.value)}
                    placeholder="Parameter (e.g. Swing Over Bed)"
                    className="flex-1 p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                  <input
                    type="text"
                    value={newSpecVal}
                    onChange={e => setNewSpecVal(e.target.value)}
                    placeholder="Value (e.g. 500 mm)"
                    className="flex-1 p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800"
                  >
                    Add Row
                  </button>
                </div>

                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {formData.specifications?.map((spec, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-md">
                      <span className="font-semibold text-slate-800 w-1/2">{spec.key}</span>
                      <span className="font-mono text-slate-600 w-1/2">{spec.value}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Features List */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label className="font-bold text-slate-800 block">
                  Key Engineering Features Checklist
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeatureText}
                    onChange={e => setNewFeatureText(e.target.value)}
                    placeholder="e.g. Laser hardened guideways with Turcite-B coating"
                    className="flex-1 p-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800"
                  >
                    Add Feature
                  </button>
                </div>

                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {formData.features?.map((feat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-md">
                      <span className="text-slate-800">{feat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow"
                >
                  {editingProduct ? 'Update Machinery Specifications' : 'Publish Machine to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
