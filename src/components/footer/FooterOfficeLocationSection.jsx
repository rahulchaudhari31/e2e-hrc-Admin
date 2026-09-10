import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ImagePlus, Loader2, Pencil, Trash2 } from 'lucide-react';
import {
  createFooterOfficeLocation,
  deleteFooterOfficeLocation,
  getFooterOfficeLocations,
  updateFooterOfficeLocation,
} from '../../services/footer/officeLocationService';

export default function FooterOfficeLocationSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ title: '', isActive: true, imageFile: null });
  const [previewUrl, setPreviewUrl] = useState('');

  const resetForm = () => {
    setSelectedId('');
    setIsEditing(false);
    setForm({ title: '', isActive: true, imageFile: null });
    setPreviewUrl('');
  };

  const loadItems = async () => {
    setLoading(true);
    try {
      const response = await getFooterOfficeLocations();
      const records = response?.data || [];
      setItems(records);

      if (records.length > 0) {
        const firstRecord = records[0];
        setSelectedId(firstRecord._id);
        setIsEditing(true);
        setForm({ title: firstRecord.title || '', isActive: firstRecord.isActive !== false, imageFile: null });
        setPreviewUrl(firstRecord.image || '');
      } else {
        resetForm();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load footer office location entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setForm((prev) => ({ ...prev, imageFile: null }));
      return;
    }

    setForm((prev) => ({ ...prev, imageFile: file }));
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSelect = (item) => {
    setSelectedId(item._id);
    setIsEditing(true);
    setForm({ title: item.title || '', isActive: item.isActive !== false, imageFile: null });
    setPreviewUrl(item.image || '');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error('Section title is required');
      return;
    }

    if (!isEditing && !form.imageFile) {
      toast.error('An office location image is required for a new entry');
      return;
    }

    setSaving(true);
    try {
      if (isEditing && selectedId) {
        await updateFooterOfficeLocation(selectedId, form.title, form.isActive, form.imageFile);
        toast.success('Footer office location updated successfully');
      } else {
        await createFooterOfficeLocation(form.title, form.isActive, form.imageFile);
        toast.success('Footer office location created successfully');
      }
      await loadItems();
    } catch (error) {
      toast.error(error.message || 'Failed to save footer office location');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this footer office location entry?')) return;

    try {
      await deleteFooterOfficeLocation(id);
      toast.success('Footer office location deleted successfully');
      await loadItems();
    } catch (error) {
      toast.error(error.message || 'Failed to delete footer office location entry');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Footer Office Location</h2>
          <p className="text-sm text-gray-500">Manage the office location image shown in the footer.</p>
        </div>
        <button type="button" onClick={resetForm} className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-100">
          Add New
        </button>
      </div>

      <div className="p-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="overflow-hidden rounded-xl border border-gray-200">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-sm text-gray-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading entries...
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">No footer office location entries yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {items.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">{item.title}</td>
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

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Section Title</label>
            <input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-700 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100" placeholder="e.g. Our Office" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Office Location Image</label>
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-4">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600">
                <ImagePlus className="h-5 w-5" />
                <span>Upload office image</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
              </label>
              {(previewUrl || form.imageFile) && (
                <div className="mt-4 flex items-center justify-center">
                  <img src={previewUrl} alt="Preview" className="h-28 w-full rounded-xl object-cover border border-gray-200 bg-white p-2" />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Active Status</p>
              <p className="text-xs text-gray-500">Show this location block on the site</p>
            </div>
            <button type="button" onClick={() => setForm((prev) => ({ ...prev, isActive: !prev.isActive }))} className={`relative inline-flex h-7 w-14 items-center rounded-full transition ${form.isActive ? 'bg-orange-500' : 'bg-gray-300'}`}>
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition ${form.isActive ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>

          <button type="submit" disabled={saving} className="flex w-full items-center justify-center rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              isEditing ? 'Update Office Location' : 'Save Office Location'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
