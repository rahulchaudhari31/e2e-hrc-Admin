import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, Save, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  deleteGlobalFootprint,
  getAdminGlobalFootprint,
  saveGlobalFootprint,
} from '../../services/aboutUs/globalFootprintService';

const EMPTY_OFFICE = {
  key: '',
  name: '',
  address: '',
  phone: '',
  email: '',
  hours: '',
  about: '',
  query: '',
  markerLeft: '50%',
  markerTop: '50%',
  markerColor: '#FFB952',
  markerShadow: 'rgba(255,185,82,0.2)',
  markerFocus: '#004CA5',
  primary: false,
  order: 0,
};

export default function AboutGlobalFootprintAdmin() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [offices, setOffices] = useState([]);
  const [showOfficeForm, setShowOfficeForm] = useState(false);
  const [officeForm, setOfficeForm] = useState(EMPTY_OFFICE);
  const [editingOfficeIndex, setEditingOfficeIndex] = useState(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadDoc();
  }, []);

  const loadDoc = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminGlobalFootprint();
      if (res && res.success && res.data) {
        const d = res.data;
        setTitle(d.title || '');
        setDescription(d.description || '');
        setIsActive(d.isActive !== false);
        setOffices(Array.isArray(d.offices) ? d.offices : []);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load Global Footprint');
    } finally {
      setIsLoading(false);
    }
  };

  const openAddOffice = () => {
    setOfficeForm({ ...EMPTY_OFFICE, order: offices.length + 1 });
    setEditingOfficeIndex(null);
    setFormError('');
    setShowOfficeForm(true);
  };

  const openEditOffice = (index) => {
    setOfficeForm({ ...EMPTY_OFFICE, ...offices[index] });
    setEditingOfficeIndex(index);
    setFormError('');
    setShowOfficeForm(true);
  };

  const handleOfficeChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOfficeForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const saveOffice = () => {
    if (!officeForm.name.trim()) {
      setFormError('Office name is required');
      return;
    }
    if (editingOfficeIndex === null && !officeForm.key.trim()) {
      setFormError('Office key is required');
      return;
    }
    if (editingOfficeIndex === null) {
      setOffices((prev) => [...prev, { ...officeForm }].sort((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0)));
    } else {
      setOffices((prev) => prev.map((o, i) => (i === editingOfficeIndex ? { ...officeForm } : o)));
    }
    setShowOfficeForm(false);
    setOfficeForm(EMPTY_OFFICE);
    setEditingOfficeIndex(null);
    setFormError('');
  };

  const removeOffice = (index) => {
    setOffices((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        isActive: Boolean(isActive),
        offices: offices.map((o) => ({
          ...o,
          name: (o.name || '').trim(),
          key: (o.key || '').trim(),
          order: Number(o.order ?? 0),
          primary: Boolean(o.primary),
        })),
      };
      const res = await saveGlobalFootprint(payload);
      if (res && res.success) {
        toast.success('Global Footprint saved successfully');
        await loadDoc();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save Global Footprint');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Reset this section back to defaults? This clears saved content and cannot be undone.')) return;
    setIsDeleting(true);
    try {
      const res = await deleteGlobalFootprint();
      if (res && res.success) {
        toast.success('Global Footprint deleted');
        await loadDoc();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete Global Footprint');
    } finally {
      setIsDeleting(false);
    }
  };

  const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div
        className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">Global Footprint</h2>
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            {offices.length} office{offices.length !== 1 ? 's' : ''}
          </span>
        </div>
        {isExpanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
      </div>

      {isExpanded && (
        <div className="p-6 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-orange-500" />
            </div>
          ) : (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Title <span className="text-red-500">*</span>
                </label>
                <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Our Global Footprint" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea className={`${inputCls} resize-none`} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-900">Offices & Map Markers</p>
                  {!showOfficeForm && (
                    <button
                      onClick={openAddOffice}
                      className="inline-flex items-center gap-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-3 py-1.5 transition-colors"
                    >
                      <Plus size={16} /> Add Office
                    </button>
                  )}
                </div>

                {showOfficeForm && (
                  <div className="rounded-2xl border-2 border-orange-200 bg-orange-50/50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">{editingOfficeIndex === null ? 'New Office' : 'Edit Office'}</p>
                      <button onClick={() => { setShowOfficeForm(false); setFormError(''); }} className="text-gray-400 hover:text-gray-600">
                        <X size={18} />
                      </button>
                    </div>
                    {formError && <p className="text-sm text-red-600">{formError}</p>}
                    <div className="grid gap-3 md:grid-cols-2">
                      {editingOfficeIndex === null && (
                        <div>
                          <label className="mb-1 block text-sm font-medium text-gray-700">Key (unique id, e.g. "uk")</label>
                          <input className={inputCls} name="key" value={officeForm.key} onChange={handleOfficeChange} />
                        </div>
                      )}
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Name *</label>
                        <input className={inputCls} name="name" value={officeForm.name} onChange={handleOfficeChange} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
                        <input className={inputCls} name="address" value={officeForm.address} onChange={handleOfficeChange} />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
                        <input className={inputCls} name="phone" value={officeForm.phone} onChange={handleOfficeChange} />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                        <input className={inputCls} name="email" value={officeForm.email} onChange={handleOfficeChange} />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Hours</label>
                        <input className={inputCls} name="hours" value={officeForm.hours} onChange={handleOfficeChange} />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Query (map search)</label>
                        <input className={inputCls} name="query" value={officeForm.query} onChange={handleOfficeChange} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-medium text-gray-700">About</label>
                        <textarea className={`${inputCls} resize-none`} rows={2} name="about" value={officeForm.about} onChange={handleOfficeChange} />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Marker Left (e.g. 45.01%)</label>
                        <input className={inputCls} name="markerLeft" value={officeForm.markerLeft} onChange={handleOfficeChange} />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Marker Top (e.g. 30.06%)</label>
                        <input className={inputCls} name="markerTop" value={officeForm.markerTop} onChange={handleOfficeChange} />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Marker Color</label>
                        <input className={inputCls} name="markerColor" value={officeForm.markerColor} onChange={handleOfficeChange} />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Marker Focus</label>
                        <input className={inputCls} name="markerFocus" value={officeForm.markerFocus} onChange={handleOfficeChange} />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Marker Shadow</label>
                        <input className={inputCls} name="markerShadow" value={officeForm.markerShadow} onChange={handleOfficeChange} />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Order</label>
                        <input className={inputCls} type="number" name="order" value={officeForm.order} onChange={handleOfficeChange} />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="primary" checked={officeForm.primary} onChange={handleOfficeChange} className="sr-only peer" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
                      </label>
                      <span className="text-sm text-gray-700">Primary office</span>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={saveOffice}
                        className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
                      >
                        <Save size={16} /> {editingOfficeIndex === null ? 'Add Office' : 'Update Office'}
                      </button>
                    </div>
                  </div>
                )}

                {offices.length === 0 ? (
                  <p className="text-sm text-gray-400 py-4 text-center">No offices yet. Add one to show markers on the map.</p>
                ) : (
                  <div className="space-y-2">
                    {offices.map((office, index) => (
                      <div key={`${office.key || office.name}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{office.name}</p>
                          <p className="text-xs text-gray-500">{office.key} · {office.address}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditOffice(index)}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit"
                          >
                            <Save size={15} />
                          </button>
                          <button
                            onClick={() => removeOffice(index)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            title="Remove"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-3 py-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
                </label>
                <span className="text-sm text-gray-700">Active</span>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-60"
                >
                  {isDeleting ? <Loader2 size={16} className="animate-spin" /> : null}
                  Reset to Defaults
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors disabled:opacity-60"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {isSaving ? 'Saving...' : 'Save Section'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}