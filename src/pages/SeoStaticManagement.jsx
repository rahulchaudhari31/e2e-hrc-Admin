import { useEffect, useMemo, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Loader2, Plus, Pencil, Trash2, Save, Image as ImageIcon, X } from 'lucide-react';
import {
  getSEO,
  getSEOById,
  createSEO,
  updateSEO,
  deleteSEO,
} from '../services/seo/seoPageManagementApi';

const PAGE_OPTIONS = [
  { value: 'home', label: 'Home', page_url: '/' },
  { value: 'about-us', label: 'About Us', page_url: '/about-us' },
  { value: 'employer', label: 'Employer', page_url: '/employer' },
  { value: 'employee', label: 'Employee', page_url: '/employee' },
  { value: 'workforce-solutions', label: 'Workforce Solutions', page_url: '/workforce-solutions' },
  { value: 'become-a-partner', label: 'Become a Partner', page_url: '/become-a-partner' },
  { value: 'blog', label: 'Blog', page_url: '/blog' },
  { value: 'contact-us', label: 'Contact Us', page_url: '/contact-us' },
];

const ROBOT_OPTIONS = [
  'index, follow',
  'noindex, follow',
  'index, nofollow',
  'noindex, nofollow',
];

const emptyForm = {
  page_key: 'home',
  page_name: 'Home',
  page_url: '/',
  meta_title: '',
  meta_description: '',
  canonical_url: '',
  robots: 'index, follow',
  og_title: '',
  og_description: '',
  og_image: '',
};

const getPageDefaults = (pageKey) => {
  const page = PAGE_OPTIONS.find((item) => item.value === pageKey);
  return page
    ? { page_name: page.label, page_url: page.page_url }
    : { page_name: '', page_url: '' };
};

export default function SeoStaticManagement() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const pageValue = useMemo(
    () => PAGE_OPTIONS.find((option) => option.value === form.page_key)?.value || 'home',
    [form.page_key]
  );

  useEffect(() => {
    loadSEO();
  }, []);

  const loadSEO = async () => {
    setLoading(true);
    try {
      const response = await getSEO();
      const list = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      setRecords(list);
    } catch (error) {
      toast.error(error.message || 'Failed to load SEO records');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setSubmittingId(null);
  };

  const openCreateForm = () => {
    resetForm();
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSelect = (event) => {
    const value = event.target.value;
    const defaults = getPageDefaults(value);
    setForm((prev) => ({
      ...prev,
      page_key: value,
      page_name: defaults.page_name,
      page_url: defaults.page_url,
    }));
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = async (record) => {
    try {
      const response = await getSEOById(record.id || record._id);
      const item = response?.data || response;
      if (!item) {
        toast.error('SEO record not found');
        return;
      }

      setForm({
        page_key: item.page_key || 'home',
        page_name: item.page_name || '',
        page_url: item.page_url || '',
        meta_title: item.meta_title || '',
        meta_description: item.meta_description || '',
        canonical_url: item.canonical_url || '',
        robots: item.robots || 'index, follow',
        og_title: item.og_title || '',
        og_description: item.og_description || '',
        og_image: item.og_image || '',
      });
      setEditingId(item.id || item._id);
      setIsFormOpen(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      toast.error(error.message || 'Failed to load SEO details');
    }
  };

  const handleImagePick = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, og_image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (record) => {
    const id = record.id || record._id;
    if (!window.confirm('Delete this SEO record?')) return;

    try {
      await deleteSEO(id);
      toast.success('SEO record deleted successfully');
      if (editingId === id) {
        resetForm();
      }
      loadSEO();
    } catch (error) {
      toast.error(error.message || 'Failed to delete SEO record');
    }
  };

  const handleSave = async () => {
    const payload = {
      page_key: form.page_key,
      page_name: form.page_name,
      page_url: form.page_url,
      meta_title: form.meta_title,
      meta_description: form.meta_description,
      canonical_url: form.canonical_url,
      robots: form.robots,
      og_title: form.og_title,
      og_description: form.og_description,
      og_image: form.og_image,
    };

    if (!payload.page_key || !payload.page_name || !payload.page_url || !payload.meta_title || !payload.meta_description) {
      toast.error('Page, page name, page URL, meta title, and meta description are required.');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateSEO(editingId, payload);
        toast.success('SEO record updated successfully');
      } else {
        await createSEO(payload);
        toast.success('SEO record created successfully');
      }

      resetForm();
      loadSEO();
    } catch (error) {
      toast.error(error.message || 'Failed to save SEO record');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-10 relative md:mt-15 mt-5">
      <Toaster position="top-right" />

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SEO Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage static page metadata for the main public pages.</p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
        >
          <Plus size={16} />
          Add SEO
        </button>
      </div>

      {isFormOpen && (
        <div className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-4">
            <h2 className="text-lg font-semibold text-gray-800">{editingId ? 'Edit SEO Record' : 'Add SEO Record'}</h2>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
            >
              Close
            </button>
          </div>

          <div className="grid gap-6 p-5 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Page</label>
                <select
                  value={pageValue}
                  onChange={handlePageSelect}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                >
                  {PAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Page Name</label>
                <input
                  type="text"
                  name="page_name"
                  value={form.page_name}
                  onChange={handleFieldChange}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  placeholder="Page name"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Page URL</label>
                <input
                  type="text"
                  name="page_url"
                  value={form.page_url}
                  onChange={handleFieldChange}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  placeholder="/about-us"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Meta Title</label>
                <input
                  type="text"
                  name="meta_title"
                  value={form.meta_title}
                  onChange={handleFieldChange}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  placeholder="Page title"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Meta Description</label>
                <textarea
                  name="meta_description"
                  value={form.meta_description}
                  onChange={handleFieldChange}
                  rows={4}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  placeholder="Page description"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Canonical URL</label>
                <input
                  type="text"
                  name="canonical_url"
                  value={form.canonical_url}
                  onChange={handleFieldChange}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  placeholder="https://example.com/about-us"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Robots</label>
                <select
                  name="robots"
                  value={form.robots}
                  onChange={handleFieldChange}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                >
                  {ROBOT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">OG Title</label>
                <input
                  type="text"
                  name="og_title"
                  value={form.og_title}
                  onChange={handleFieldChange}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  placeholder="Open Graph title"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">OG Description</label>
                <textarea
                  name="og_description"
                  value={form.og_description}
                  onChange={handleFieldChange}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  placeholder="Open Graph description"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">OG Image</label>
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3">
                  {form.og_image ? (
                    <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-white">
                      <img src={form.og_image} alt="OG preview" className="h-36 w-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/30 opacity-0 transition hover:opacity-100">
                        <label className="cursor-pointer rounded-md bg-white px-3 py-1.5 text-xs font-medium text-gray-700">
                          Change
                          <input type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
                        </label>
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, og_image: '' }))}
                          className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex h-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white text-gray-500">
                      <ImageIcon size={28} className="mb-2 text-gray-400" />
                      <span className="text-sm font-medium">Upload OG image</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-5 py-4">
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
              disabled={saving}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Saving...' : editingId ? 'Update SEO' : 'Save SEO'}
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-800">SEO Pages</h2>
          {!isFormOpen && (
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
            >
              New SEO
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-orange-500" size={28} />
          </div>
        ) : records.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-gray-500">No SEO records found.</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {records.map((record) => (
              <div key={record.id || record._id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-base font-semibold text-gray-900">{record.page_name || record.page_key}</span>
                    <span className="text-xs text-gray-500">{record.page_url || '/'}</span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium text-gray-700">Meta Title:</span> {record.meta_title || '—'}</p>
                    <p><span className="font-medium text-gray-700">Meta Description:</span> {record.meta_description || '—'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(record)}
                    className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                  >
                    <Pencil size={15} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(record)}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
