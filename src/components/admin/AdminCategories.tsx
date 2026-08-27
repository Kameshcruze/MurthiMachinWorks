import React, { useState, useEffect } from 'react';
import { Category } from '../../types';
import { dataService, DATA_CHANGE_EVENT } from '../../services/dataService';
import { useSettings } from '../../context/SettingsContext';
import { generateSlug, formatImageUrl } from '../../utils/helpers';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Layers,
  Sparkles
} from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const { showToast } = useSettings();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    is_active: true
  });

  const loadData = async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const cats = await dataService.getCategories();
      setCategories(cats);
    } catch (e) {
      console.warn('Error loading categories:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
    const handleDataChange = (e: any) => {
      const entity = e.detail?.entity;
      if (!entity || entity === 'categories' || entity === 'products' || entity === 'all') {
        loadData(false);
      }
    };
    window.addEventListener(DATA_CHANGE_EVENT, handleDataChange);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, handleDataChange);
  }, []);

  const handleStartCreate = () => {
    setEditingCatId(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image_url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
      is_active: true
    });
    setIsEditing(true);
  };

  const handleStartEdit = (cat: Category) => {
    setEditingCatId(cat.id);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image_url: cat.image_url || 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
      is_active: cat.is_active
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Validation Error', 'Category name is required.', 'warning');
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || generateSlug(formData.name),
        description: formData.description.trim(),
        image_url: formData.image_url.trim(),
        is_active: formData.is_active,
        sort_order: categories.length + 1
      };

      if (editingCatId) {
        await dataService.updateCategory(editingCatId, payload);
        showToast('Category Updated', `${formData.name} updated.`, 'success');
      } else {
        await dataService.createCategory(payload);
        showToast('Category Created', `${formData.name} added.`, 'success');
      }
      setIsEditing(false);
    } catch (err) {
      showToast('Error', 'Failed to save category.', 'error');
    }
  };

  const handleDelete = async (catId: string, name: string) => {
    if (window.confirm(`Delete category "${name}"? Products in this category will become unassigned.`)) {
      try {
        await dataService.deleteCategory(catId);
        showToast('Category Deleted', `${name} deleted.`, 'success');
      } catch (err) {
        showToast('Error', 'Failed to delete category.', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-bold text-base text-slate-800">
          Machinery Categories ({categories.length})
        </h3>

        {!isEditing && (
          <button
            onClick={handleStartCreate}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Machinery Category</span>
          </button>
        )}
      </div>

      {/* Inline Create/Edit Form Modal/Card */}
      {isEditing && (
        <form onSubmit={handleSave} className="bg-white rounded-xl border-2 border-amber-500/50 p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="font-heading font-bold text-sm text-slate-900">
              {editingCatId ? 'Edit Machinery Category' : 'Create New Category'}
            </h4>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-800 block mb-1">Category Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })}
                placeholder="e.g. Surface & Cylindrical Grinding"
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-800 block mb-1">URL Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                placeholder="surface-cylindrical-grinding"
                className="w-full p-2.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-800 block mb-1">Category Image URL</label>
            <input
              type="url"
              value={formData.image_url}
              onChange={e => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://images.unsplash.com/photo-..."
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-800 block mb-1">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Precision hydraulic surface grinders, internal & external cylindrical grinders with digital readout DRO..."
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4"
              />
              <span>Active on Public Catalog</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow"
              >
                Save Category
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Categories Grid Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-white font-heading uppercase text-[11px] tracking-wider">
            <tr>
              <th className="py-3.5 px-4 font-bold">Category</th>
              <th className="py-3.5 px-4 font-bold">Description</th>
              <th className="py-3.5 px-4 font-bold text-center">Status</th>
              <th className="py-3.5 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500">
                  Loading categories...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500">
                  No categories found.
                </td>
              </tr>
            ) : (
              categories.map(cat => (
                <tr key={cat.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={formatImageUrl(cat.image_url)}
                        alt={cat.name}
                        className="w-12 h-10 rounded-md object-cover border border-slate-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <span className="font-heading font-bold text-slate-900 block">
                          {cat.name}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          slug: {cat.slug}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                    <p className="text-slate-600 line-clamp-2">{cat.description || '—'}</p>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cat.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                      {cat.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleStartEdit(cat)}
                        className="p-1.5 text-slate-700 hover:text-amber-600 rounded-md hover:bg-amber-50 transition"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 rounded-md hover:bg-rose-50 transition"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
  );
};
