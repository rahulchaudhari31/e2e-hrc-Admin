import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ChevronDown, ChevronUp, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  createFooterNavigation,
  deleteFooterNavigation,
  getFooterNavigations,
  updateFooterNavigation,
} from '../../services/footer/navigationService';

export default function FooterNavigationSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ title: '', isActive: true, menuItems: [] });

  const resetForm = () => {
    setSelectedId('');
    setIsEditing(false);
    setForm({ title: '', isActive: true, menuItems: [] });
  };

  const loadItems = async () => {
    setLoading(true);
    try {
      const response = await getFooterNavigations();
      const records = response?.data || [];
      setItems(records);

      if (records.length > 0) {
        const firstRecord = records[0];
        setSelectedId(firstRecord._id);
        setIsEditing(true);
        setForm({
          title: firstRecord.title || '',
          isActive: firstRecord.isActive !== false,
          menuItems: (firstRecord.menuItems || []).map((item) => ({ ...item })),
        });
      } else {
        resetForm();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load footer navigation entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleSelect = (item) => {
    setSelectedId(item._id);
    setIsEditing(true);
    setForm({
      title: item.title || '',
      isActive: item.isActive !== false,
      menuItems: (item.menuItems || []).map((menuItem) => ({ ...menuItem })),
    });
  };

  const addMenuItem = () => {
    setForm((prev) => ({
      ...prev,
      menuItems: [
        ...prev.menuItems,
        { label: '', url: '', order: prev.menuItems.length + 1, isActive: true },
      ],
    }));
  };

  const updateMenuItem = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      menuItems: prev.menuItems.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
    }));
  };

  const removeMenuItem = (index) => {
    setForm((prev) => ({
      ...prev,
      menuItems: prev.menuItems.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const moveMenuItem = (index, direction) => {
    setForm((prev) => {
      const items = [...prev.menuItems];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= items.length) return prev;
      const [moved] = items.splice(index, 1);
      items.splice(targetIndex, 0, moved);
      return { ...prev, menuItems: items.map((item, itemIndex) => ({ ...item, order: itemIndex + 1 })) };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error('Navigation title is required');
      return;
    }

    const hasInvalidItem = form.menuItems.some((item) => !item.label.trim() || !item.url.trim());
    if (hasInvalidItem) {
      toast.error('Each menu item needs a label and URL');
      return;
    }

    setSaving(true);
    try {
      if (isEditing && selectedId) {
        await updateFooterNavigation(selectedId, form);
        toast.success('Footer navigation updated successfully');
      } else {
        await createFooterNavigation(form);
        toast.success('Footer navigation created successfully');
      }
      await loadItems();
    } catch (error) {
      toast.error(error.message || 'Failed to save footer navigation');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this footer navigation entry?')) return;

    try {
      await deleteFooterNavigation(id);
      toast.success('Footer navigation deleted successfully');
      await loadItems();
    } catch (error) {
      toast.error(error.message || 'Failed to delete footer navigation entry');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Footer Navigation</h2>
          <p className="text-sm text-gray-500">Manage the navigation links shown in the footer menu.</p>
        </div>
        <button type="button" onClick={resetForm} className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-100">
          Add New
        </button>
      </div>

      <div className="p-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="overflow-hidden rounded-xl border border-gray-200">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-sm text-gray-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading entries...
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">No footer navigation entries yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {items.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">{item.title}</td>
                      <td className="px-4 py-3 text-gray-700">{item.menuItems?.length || 0}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${item.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                          {item.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => handleSelect(item)} className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-orange-50 hover:text-orange-600">
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => handleDelete(item._id)} className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Navigation Title</label>
            <input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-700 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100" placeholder="e.g. Quick Links" />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Active Status</p>
              <p className="text-xs text-gray-500">Show this navigation section on the site</p>
            </div>
            <button type="button" onClick={() => setForm((prev) => ({ ...prev, isActive: !prev.isActive }))} className={`relative inline-flex h-7 w-14 items-center rounded-full transition ${form.isActive ? 'bg-orange-500' : 'bg-gray-300'}`}>
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${form.isActive ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">Menu Items</p>
              <button type="button" onClick={addMenuItem} className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-medium text-orange-600 hover:bg-orange-100">
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>

            {form.menuItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-6 text-center text-sm text-gray-500">No menu items yet. Add one to create a footer link.</div>
            ) : (
              <div className="space-y-3">
                {form.menuItems.map((item, index) => (
                  <div key={`${item.label}-${index}`} className="rounded-xl border border-gray-200 bg-white p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-gray-700">Menu Item {index + 1}</p>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => moveMenuItem(index, 'up')} className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100">
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => moveMenuItem(index, 'down')} className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100">
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => removeMenuItem(index)} className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <input value={item.label} onChange={(event) => updateMenuItem(index, 'label', event.target.value)} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-700 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100" placeholder="Label" />
                      <input value={item.url} onChange={(event) => updateMenuItem(index, 'url', event.target.value)} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-700 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100" placeholder="URL" />
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <input type="number" value={item.order} onChange={(event) => updateMenuItem(index, 'order', Number(event.target.value))} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-700 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100" placeholder="Order" />
                      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
                        <span className="text-sm text-gray-700">Item Active</span>
                        <button type="button" onClick={() => updateMenuItem(index, 'isActive', !item.isActive)} className={`relative inline-flex h-6 w-12 items-center rounded-full transition ${item.isActive ? 'bg-orange-500' : 'bg-gray-300'}`}>
                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${item.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={saving} className="flex w-full items-center justify-center rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              isEditing ? 'Update Navigation' : 'Save Navigation'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
