import React, { useState, useEffect } from 'react';
import { Product, Category, ProductSpecification, ProductImage, ProductDownload } from '../../types';
import { dataService } from '../../services/dataService';
import { useSettings } from '../../context/SettingsContext';
import { slugify, formatImageUrl } from '../../utils/helpers';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  Layers,
  FileText,
  CheckCircle2,
  Upload,
  AlertCircle
} from 'lucide-react';

interface AdminProductFormProps {
  productToEdit: Product | null;
  onCancel: () => void;
  onSaved: () => void;
}

export const AdminProductForm: React.FC<AdminProductFormProps> = ({
  productToEdit,
  onCancel,
  onSaved
}) => {
  const { showToast } = useSettings();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: productToEdit?.name || '',
    slug: productToEdit?.slug || '',
    sku: productToEdit?.sku || '',
    category_id: productToEdit?.category_id || '',
    brand: productToEdit?.brand || 'Murthi Machine Works',
    short_description: productToEdit?.short_description || '',
    description: productToEdit?.description || '',
    price: productToEdit?.price || 0,
    sale_price: productToEdit?.sale_price || undefined,
    show_price: productToEdit?.show_price ?? true,
    stock_status: productToEdit?.stock_status || 'in_stock',
    is_featured: productToEdit?.is_featured || false,
    is_active: productToEdit?.is_active ?? true,
  });

  // Specifications
  const [specifications, setSpecifications] = useState<Array<{ spec_key: string; spec_value: string; unit: string }>>(
    productToEdit?.specifications?.map(s => ({
      spec_key: s.key || s.spec_key || '',
      spec_value: s.value || s.spec_value || '',
      unit: s.unit || ''
    })) || [
      { spec_key: 'Center Height', spec_value: '250 mm', unit: 'mm' },
      { spec_key: 'Distance Between Centers', spec_value: '1000 mm', unit: 'mm' },
      { spec_key: 'Spindle Bore', spec_value: '52 mm', unit: 'mm' },
      { spec_key: 'Main Motor Power', spec_value: '5 HP (3.7 kW)', unit: 'HP' },
      { spec_key: 'Bed Width', spec_value: '300 mm', unit: 'mm' }
    ]
  );

  // Features list
  const [features, setFeatures] = useState<string[]>(
    productToEdit?.features || [
      'Heavy-duty hardened & ground bedways with hardness 450-500 BHN',
      'Universal gearbox providing wide metric and inch threading options',
      'Dynamically balanced spindle supported on precision taper roller bearings',
      'Centralized apron lubrication system for smooth continuous running'
    ]
  );
  const [newFeatureText, setNewFeatureText] = useState('');

  // Image URLs
  const [images, setImages] = useState<string[]>(
    productToEdit?.images?.map(i => i.image_url) || [
      'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=85'
    ]
  );
  const [newImageUrl, setNewImageUrl] = useState('');

  // Downloads
  const [downloads, setDownloads] = useState<Array<{ title: string; file_url: string; file_type: string }>>(
    productToEdit?.downloads?.map(d => ({
      title: d.title,
      file_url: d.file_url,
      file_type: d.file_type || 'PDF'
    })) || [
      {
        title: 'Technical Catalog & Dimensional Footprint',
        file_url: 'https://murthimachineworks.com/docs/technical-catalog.pdf',
        file_type: 'PDF'
      }
    ]
  );

  useEffect(() => {
    const fetchCategories = async () => {
      const cats = await dataService.getCategories();
      setCategories(cats);
      if (!formData.category_id && cats.length > 0) {
        setFormData(prev => ({ ...prev, category_id: cats[0].id }));
      }
    };
    fetchCategories();
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormData(prev => ({
      ...prev,
      name: newName,
      slug: !productToEdit ? slugify(newName) : prev.slug
    }));
  };

  // Spec handlers
  const handleAddSpec = () => {
    setSpecifications([...specifications, { spec_key: '', spec_value: '', unit: '' }]);
  };

  const handleUpdateSpec = (idx: number, field: 'spec_key' | 'spec_value' | 'unit', val: string) => {
    const next = [...specifications];
    next[idx][field] = val;
    setSpecifications(next);
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecifications(specifications.filter((_, i) => i !== idx));
  };

  // Feature handlers
  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFeatures([...features, newFeatureText.trim()]);
    setNewFeatureText('');
  };

  const handleRemoveFeature = (idx: number) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  // Image handlers
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImages([...images, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const handleRemoveImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Validation Error', 'Machine model name is required.', 'warning');
      return;
    }
    if (!formData.sku.trim()) {
      showToast('Validation Error', 'Model SKU code is required.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedCategoryObj = categories.find(c => c.id === formData.category_id);

      const productPayload: Omit<Product, 'id' | 'created_at'> = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || slugify(formData.name),
        sku: formData.sku.trim().toUpperCase(),
        category_id: formData.category_id,
        category_name: selectedCategoryObj?.name || '',
        brand: formData.brand.trim() || 'Murthi Precision',
        short_description: formData.short_description.trim(),
        description: formData.description.trim(),
        price: Number(formData.price) || 0,
        sale_price: formData.sale_price ? Number(formData.sale_price) : undefined,
        show_price: formData.show_price,
        stock_status: formData.stock_status as any,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
        images: images.map((url, idx) => ({
          id: `img-${Date.now()}-${idx}`,
          image_url: url,
          sort_order: idx + 1,
          is_primary: idx === 0
        })),
        specifications: specifications
          .filter(s => s.spec_key.trim())
          .map((s, idx) => ({
            id: `spec-${Date.now()}-${idx}`,
            key: s.spec_key.trim(),
            value: s.spec_value.trim(),
            spec_key: s.spec_key.trim(),
            spec_value: s.spec_value.trim(),
            unit: s.unit.trim(),
            sort_order: idx + 1
          })),
        features: features.filter(f => f.trim()),
        downloads: downloads
          .filter(d => d.title.trim())
          .map((d, idx) => ({
            id: `dl-${Date.now()}-${idx}`,
            title: d.title.trim(),
            file_url: d.file_url.trim(),
            file_type: d.file_type.trim()
          }))
      };

      if (productToEdit) {
        await dataService.updateProduct(productToEdit.id, productPayload);
        showToast('Product Updated', `${formData.name} was successfully updated.`, 'success');
      } else {
        await dataService.createProduct(productPayload);
        showToast('Product Created', `${formData.name} was added to the machinery catalog.`, 'success');
      }

      onSaved();
    } catch (err) {
      console.error('Error saving product:', err);
      showToast('Save Failed', 'Could not save machinery details.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12">
      {/* Top Header Actions */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Product List</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow flex items-center gap-1.5 transition"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : productToEdit ? 'Update Machine Model' : 'Save New Machine'}</span>
          </button>
        </div>
      </div>

      {/* 1. Core Identification Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="font-heading font-bold text-base text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-500" />
          General Information & Identifiers
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-800 block mb-1">
              Machine Model Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="e.g. Extra Heavy Duty All Geared Lathe (Model ML-450)"
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-800 block mb-1">
              Model SKU / Code *
            </label>
            <input
              type="text"
              value={formData.sku}
              onChange={e => setFormData({ ...formData, sku: e.target.value })}
              placeholder="e.g. MMW-LT-450"
              className="w-full p-2.5 text-xs font-mono uppercase bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-800 block mb-1">
              Machinery Category *
            </label>
            <select
              value={formData.category_id}
              onChange={e => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-800 block mb-1">
              Brand / Series Name
            </label>
            <input
              type="text"
              value={formData.brand}
              onChange={e => setFormData({ ...formData, brand: e.target.value })}
              placeholder="Murthi Machine Works"
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-800 block mb-1">
              URL Slug
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={e => setFormData({ ...formData, slug: e.target.value })}
              placeholder="extra-heavy-duty-all-geared-lathe-ml-450"
              className="w-full p-2.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-800 block mb-1">
            Short Summary (Appears in catalog listings)
          </label>
          <input
            type="text"
            value={formData.short_description}
            onChange={e => setFormData({ ...formData, short_description: e.target.value })}
            placeholder="Brief summary of bed length, swing over bed, and high-precision motor performance..."
            className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-800 block mb-1">
            Detailed Engineering & Construction Description
          </label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Comprehensive description of the casting quality, metallurgical hardness, headstock gear train, apron mechanism, lubrication, and metrology standards..."
            className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* 2. Pricing & Stock Configuration */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="font-heading font-bold text-base text-slate-900 pb-2 border-b border-slate-100">
          Commercial Pricing & Stock Visibility
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-800 block mb-1">
              Indicative Base Price (INR)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
              placeholder="485000"
              className="w-full p-2.5 text-xs font-mono font-bold bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-800 block mb-1">
              Special / Sale Price (INR Optional)
            </label>
            <input
              type="number"
              value={formData.sale_price || ''}
              onChange={e => setFormData({ ...formData, sale_price: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="450000"
              className="w-full p-2.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-800 block mb-1">
              Stock Availability Status
            </label>
            <select
              value={formData.stock_status}
              onChange={e => setFormData({ ...formData, stock_status: e.target.value as any })}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="in_stock">In Stock (Immediate Dispatch)</option>
              <option value="made_to_order">Made to Order (10-15 Days)</option>
              <option value="low_stock">Limited Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
            <input
              type="checkbox"
              checked={formData.show_price}
              onChange={e => setFormData({ ...formData, show_price: e.target.checked })}
              className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4"
            />
            <span>Show Price on Public Website (Uncheck for "Price on Request")</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={e => setFormData({ ...formData, is_featured: e.target.checked })}
              className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-4 h-4"
            />
            <span>Feature on Homepage Showcase</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <span>Publish in Active Catalog</span>
          </label>
        </div>
      </div>

      {/* 3. Product Images Gallery */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="font-heading font-bold text-base text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-amber-500" />
          High-Resolution Machine Photos
        </h3>

        <div className="flex items-center gap-2">
          <input
            type="url"
            value={newImageUrl}
            onChange={e => setNewImageUrl(e.target.value)}
            placeholder="Paste image URL (Unsplash or direct image URL)..."
            className="flex-1 p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="button"
            onClick={handleAddImage}
            className="px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition"
          >
            Add Image
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {images.map((url, idx) => (
            <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-4/3 bg-slate-100">
              <img src={formatImageUrl(url)} alt={`Product ${idx}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="p-1.5 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition"
                  title="Remove Image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {idx === 0 && (
                <span className="absolute bottom-1 left-1 bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded">
                  Primary
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Technical Specifications Table Builder */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900">
              Technical Specifications Table
            </h3>
            <p className="text-xs text-slate-500">
              Add specific dimensional, power, and capacity metrics for this machine tool.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddSpec}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Row</span>
          </button>
        </div>

        <div className="space-y-2">
          {specifications.map((spec, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="text"
                value={spec.spec_key}
                onChange={e => handleUpdateSpec(idx, 'spec_key', e.target.value)}
                placeholder="Parameter (e.g. Center Height)"
                className="w-1/3 p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
              <input
                type="text"
                value={spec.spec_value}
                onChange={e => handleUpdateSpec(idx, 'spec_value', e.target.value)}
                placeholder="Value (e.g. 250 mm)"
                className="w-1/3 p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-mono"
              />
              <input
                type="text"
                value={spec.unit}
                onChange={e => handleUpdateSpec(idx, 'unit', e.target.value)}
                placeholder="Unit (e.g. mm / kW)"
                className="w-1/4 p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
              <button
                type="button"
                onClick={() => handleRemoveSpec(idx)}
                className="p-2 text-slate-400 hover:text-rose-600 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Features & Construction Highlights */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="font-heading font-bold text-base text-slate-900 pb-2 border-b border-slate-100">
          Mechanical Features & Design Highlights
        </h3>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newFeatureText}
            onChange={e => setNewFeatureText(e.target.value)}
            placeholder="Add key feature (e.g. Induction flame hardened bedways)..."
            className="flex-1 p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddFeature();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddFeature}
            className="px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition"
          >
            Add Bullet
          </button>
        </div>

        <div className="space-y-2 pt-2">
          {features.map((feat, idx) => (
            <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-800">{feat}</span>
              <button
                type="button"
                onClick={() => handleRemoveFeature(idx)}
                className="p-1 text-slate-400 hover:text-rose-600 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Save Trigger */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow-md flex items-center gap-1.5 transition"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Saving...' : productToEdit ? 'Update Machine Model' : 'Save New Machine'}</span>
        </button>
      </div>
    </form>
  );
};
