import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import {
  createFooterContact,
  deleteFooterContact,
  getFooterContacts,
  updateFooterContact,
} from '../../services/footer/contactService';

export default function FooterContactSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    sectionTitle: '',
    address: '',
    phone: '',
    email: '',
    isActive: true,
  });

  const resetForm = () => {
    setSelectedId('');
    setIsEditing(false);
    setForm({ sectionTitle: '', address: '', phone: '', email: '', isActive: true });
  };

  const loadItems = async () => {
    setLoading(true);
    try {
      const response = await getFooterContacts();
      const records = response?.data || [];
      setItems(records);

      if (records.length > 0) {
        const firstRecord = records[0];
        setSelectedId(firstRecord._id);
        setIsEditing(true);
        setForm({
          sectionTitle: firstRecord.sectionTitle || '',
          address: firstRecord.address || '',
          phone: firstRecord.phone || '',
          email: firstRecord.email || '',
          isActive: firstRecord.isActive !== false,
        });
      } else {
        resetForm();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load footer contact entries');
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
      sectionTitle: item.sectionTitle || '',
      address: item.address || '',
      phone: item.phone || '',
      email: item.email || '',
      isActive: item.isActive !== false,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.sectionTitle.trim() || !form.address.trim() || !form.phone.trim() || !form.email.trim()) {
      toast.error('All contact fields are required');
      return;
    }

    setSaving(true);
    try {
      if (isEditing && selectedId) {
        await updateFooterContact(selectedId, form);
        toast.success('Footer contact updated successfully');
      } else {
        await createFooterContact(form);
        toast.success('Footer contact created successfully');
      }
      await loadItems();
    } catch (error) {
      toast.error(error.message || 'Failed to save footer contact');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this footer contact entry?')) return;

    try {
      await deleteFooterContact(id);
      toast.success('Footer contact deleted successfully');
      await loadItems();
    } catch (error) {
      toast.error(error.message || 'Failed to delete footer contact entry');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Footer Contact</h2>
          <p className="text-sm text-gray-500">Manage the visible contact block shown in the footer.</p>
        </div>
        <button
          type="button"
          onClick={resetForm}
          className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-100"
        >
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
            <div className="py-12 text-center text-sm text-gray-500">No footer contact entries yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {items.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">{item.sectionTitle}</td>
                      <td className="px-4 py-3 text-gray-700">{item.email}</td>
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
            <label className="text-sm font-medium text-gray-700">Section Title</label>
            <input value={form.sectionTitle} onChange={(event) => setForm((prev) => ({ ...prev, sectionTitle: event.target.value }))} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-700 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100" placeholder="e.g. Get In Touch" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Address</label>
            <input value={form.address} onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-700 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100" placeholder="Enter address" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <input value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-700 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100" placeholder="Phone number" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input type="email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm text-gray-700 shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100" placeholder="Email address" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Active Status</p>
              <p className="text-xs text-gray-500">Show this contact block on the site</p>
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
              isEditing ? 'Update Contact' : 'Save Contact'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
