import React, { useEffect, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Save,
  Loader2,
  Trash2,
  Plus,
  X,
  Edit,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
} from '../../services/becomePartner/locationService';

// ─── Empty location form state ─────────────────────────────────────────────
const EMPTY_LOCATION_FORM = {
  officeName: '',
  title: '',
  address: '',
  phone: '',
  email: '',
  openingHours: '',
  aboutTitle: '',
  aboutDescription: '',
  directionsQuery: '',
  type: 'regional',
  displayOrder: 1,
  isActive: true,
  statsData: [
    { value: '', label: '' },
    { value: '', label: '' },
    { value: '', label: '' },
    { value: '', label: '' },
  ],
};

const EMPTY_HEAD_OFFICE = {
  officeName: 'UK Head Office',
  title: 'UK Head Office',
  address: 'Unit 2, 1204B Stratford Road, Hall Green, Birmingham, B28 8AS, UK',
  phone: '',
  email: '',
  openingHours: '',
  aboutTitle: '',
  aboutDescription: '',
  directionsQuery: '',
  type: 'headOffice',
  displayOrder: 0,
  isActive: true,
  statsData: [
    { value: '', label: '' },
    { value: '', label: '' },
    { value: '', label: '' },
    { value: '', label: '' },
  ],
};

// ─── Main Component ────────────────────────────────────────────────────────
export default function NetworkMapCard() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [locations, setLocations] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_LOCATION_FORM);
  const [errors, setErrors] = useState({});
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // ─── Load locations on mount ────────────────────────────────────────────
  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    setIsLoading(true);
    try {
      const response = await getAllLocations();
      const locationsData = Array.isArray(response?.data) ? response.data : [];
      setLocations(locationsData);

      // If no head office exists and not editing, load empty form
      if (!editingId && !locationsData.some(l => l.type === 'headOffice')) {
        resetForm();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load locations');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Form handlers ─────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleStatChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      statsData: prev.statsData.map((stat, i) =>
        i === index ? { ...stat, [field]: value } : stat
      ),
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(EMPTY_LOCATION_FORM);
    setErrors({});
    setConfirmDeleteId(null);
  };

  const startEdit = (location) => {
    setEditingId(location._id);
    setFormData({
      officeName: location.officeName || '',
      title: location.title || '',
      address: Array.isArray(location.address) ? location.address.join(', ') : (location.address || ''),
      phone: location.phone || '',
      email: location.email || '',
      openingHours: location.openingHours || '',
      aboutTitle: location.aboutTitle || '',
      aboutDescription: location.aboutDescription || '',
      directionsQuery: location.directionsQuery || '',
      type: location.type || 'regional',
      displayOrder: location.displayOrder ?? 1,
      isActive: location.isActive !== undefined ? location.isActive : true,
      statsData: normalizeStats(location.statsData || location.stats),
    });
    setErrors({});
  };

  const normalizeStats = (stats) => {
    if (!Array.isArray(stats) || stats.length === 0) {
      return [
        { value: '', label: '' },
        { value: '', label: '' },
        { value: '', label: '' },
        { value: '', label: '' },
      ];
    }
    return stats.slice(0, 4).map((s) => ({
      value: s?.value || '',
      label: s?.label || '',
    }));
  };

  // ─── Validation ───────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};

    if (!formData.officeName.trim()) newErrors.officeName = 'Office name is required';
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.openingHours.trim()) newErrors.openingHours = 'Opening hours are required';
    if (!formData.aboutTitle.trim()) newErrors.aboutTitle = 'About title is required';
    if (!formData.aboutDescription.trim()) newErrors.aboutDescription = 'About description is required';
    if (!formData.directionsQuery.trim()) newErrors.directionsQuery = 'Directions query is required';

    // Validate stats: all must have value and label
    const invalidStats = formData.statsData.some(
      (s) => !s.value.trim() || !s.label.trim()
    );
    if (invalidStats) {
      newErrors.statsData = 'All 4 statistics must have both value and label';
    }

    // Check regional location constraints
    if (formData.type === 'regional' && !editingId) {
      const regionalCount = locations.filter(l => l.type === 'regional').length;
      if (regionalCount >= 3) {
        newErrors.type = 'Maximum 3 regional locations allowed';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Save handler ──────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        officeName: formData.officeName.trim(),
        title: formData.title.trim(),
        address: formData.address
          .trim()
          .split(',')
          .map(a => a.trim())
          .filter(a => a.length > 0),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        openingHours: formData.openingHours.trim(),
        aboutTitle: formData.aboutTitle.trim(),
        aboutDescription: formData.aboutDescription.trim(),
        directionsQuery: formData.directionsQuery.trim(),
        type: formData.type,
        displayOrder: parseInt(formData.displayOrder, 10),
        isActive: formData.isActive,
        stats: formData.statsData.map((s) => ({
          value: s.value.trim(),
          label: s.label.trim(),
        })),
      };

      let response;
      if (editingId) {
        response = await updateLocation(editingId, payload);
        if (response?.success) {
          toast.success('Location updated successfully');
        }
      } else {
        response = await createLocation(payload);
        if (response?.success) {
          toast.success('Location created successfully');
        }
      }

      resetForm();
      await loadLocations();
    } catch (error) {
      toast.error(error.message || 'Failed to save location');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Delete handler ───────────────────────────────────────────────────
  const handleDelete = async (id) => {
    setIsDeleting(true);
    try {
      const response = await deleteLocation(id);
      if (response?.success) {
        toast.success('Location deleted successfully');
        setConfirmDeleteId(null);
        if (editingId === id) resetForm();
        await loadLocations();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete location');
    } finally {
      setIsDeleting(false);
    }
  };

  // ─── Calculate counts ──────────────────────────────────────────────────
  const headOffice = locations.find(l => l.type === 'headOffice');
  const regionalLocations = locations.filter(l => l.type === 'regional');
  const canAddRegional = regionalLocations.length < 3;

  // ─── Render ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-gray-500 gap-2">
        <Loader2 size={18} className="animate-spin text-orange-400" />
        Loading Network Map data...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      {/* Header */}
      <div
        className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">Network Map Locations</h2>
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            {locations.length}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp size={20} className="text-gray-500" />
        ) : (
          <ChevronDown size={20} className="text-gray-500" />
        )}
      </div>

      {isExpanded && (
        <>
          <div className="p-5 space-y-6">
            {/* Form Card Header */}
            
            {/* Location Form - 2 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column */}
              <div className="space-y-4">
                {/* Office Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Office Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="officeName"
                    value={formData.officeName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors ${
                      errors.officeName ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="e.g. UK Head Office"
                  />
                  {errors.officeName && (
                    <p className="text-red-500 text-xs mt-1">{errors.officeName}</p>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors ${
                      errors.title ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Display title"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors resize-none ${
                      errors.address ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Enter address (will be split by commas)"
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors ${
                      errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="+44 (0) 121 778 2400"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors ${
                      errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="info@e2ehrc.co.uk"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Opening Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opening Hours <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="openingHours"
                    value={formData.openingHours}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors ${
                      errors.openingHours ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Mon to Fri: 9AM to 6PM"
                  />
                  {errors.openingHours && (
                    <p className="text-red-500 text-xs mt-1">{errors.openingHours}</p>
                  )}
                </div>

                {/* About Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    About Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="aboutTitle"
                    value={formData.aboutTitle}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors ${
                      errors.aboutTitle ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="About this Office"
                  />
                  {errors.aboutTitle && (
                    <p className="text-red-500 text-xs mt-1">{errors.aboutTitle}</p>
                  )}
                </div>

                {/* About Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    About Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="aboutDescription"
                    value={formData.aboutDescription}
                    onChange={handleChange}
                    rows={3}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors resize-none ${
                      errors.aboutDescription ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Describe the office..."
                  />
                  {errors.aboutDescription && (
                    <p className="text-red-500 text-xs mt-1">{errors.aboutDescription}</p>
                  )}
                </div>

                {/* Directions Query */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Directions Query <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="directionsQuery"
                    value={formData.directionsQuery}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors ${
                      errors.directionsQuery ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Address for Google Maps query"
                  />
                  {errors.directionsQuery && (
                    <p className="text-red-500 text-xs mt-1">{errors.directionsQuery}</p>
                  )}
                </div>

                {/* Type & Display Order */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      disabled={editingId !== null}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors disabled:bg-gray-100"
                    >
                      <option value="headOffice">Head Office</option>
                      <option value="regional">Regional</option>
                    </select>
                  </div>

                  {formData.type === 'regional' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Display Order <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="displayOrder"
                        value={formData.displayOrder}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                      >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3 pt-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
                  </label>
                  <span className="text-sm text-gray-700">
                    {formData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Right column - Statistics */}
              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-2">
                  <h4 className="text-sm font-semibold text-orange-900 mb-1">Statistics</h4>
                  <p className="text-xs text-orange-700">
                    Exactly 4 statistics. Each requires a value and label.
                  </p>
                </div>

                {formData.statsData.map((stat, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      Statistic {index + 1}
                    </p>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Value <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={stat.value}
                          onChange={(e) =>
                            handleStatChange(index, 'value', e.target.value)
                          }
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors text-sm ${
                            errors.statsData ? 'border-red-400 bg-red-50' : 'border-gray-200'
                          }`}
                          placeholder='e.g. "18+"'
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Label <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={stat.label}
                          onChange={(e) =>
                            handleStatChange(index, 'label', e.target.value)
                          }
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors text-sm ${
                            errors.statsData ? 'border-red-400 bg-red-50' : 'border-gray-200'
                          }`}
                          placeholder='e.g. "Years Exp"'
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {errors.statsData && (
                  <p className="text-red-500 text-xs mt-2">{errors.statsData}</p>
                )}
              </div>
            </div>
          </div>

          {/* Form Footer */}
          <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              {editingId && (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(editingId)}
                  className="inline-flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors border border-gray-200 hover:bg-gray-100"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-sm text-sm"
              >
                {isSaving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {isSaving
                  ? 'Saving...'
                  : editingId
                  ? 'Update Location'
                  : 'Create Location'}
              </button>
            </div>
          </div>

          {/* Delete Confirmation Dialog */}
          {confirmDeleteId && (
            <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={22} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Location?</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to delete this location? This action cannot be undone.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(confirmDeleteId)}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors shadow-sm disabled:opacity-60"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Existing Locations List */}
          <div className="border-t border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Existing Locations</h3>

            {locations.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">No locations created yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {locations.map((location) => (
                  <div
                    key={location._id}
                    className={`rounded-xl border p-4 transition-colors ${
                      editingId === location._id
                        ? 'border-orange-300 bg-orange-50'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Type Badge */}
                      <div className="flex-shrink-0">
                        <span
                          className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                            location.type === 'headOffice'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {location.type === 'headOffice' ? 'Head Office' : `Regional #${location.displayOrder}`}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {location.officeName}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {Array.isArray(location.address)
                            ? location.address.join(', ')
                            : location.address}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                              location.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-200 text-gray-500'
                            }`}
                          >
                            {location.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(location)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        >
                          <Edit size={13} />
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Regional Location Button */}
            {formData.type === 'regional' && !editingId && !canAddRegional && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs font-medium text-yellow-800">
                  ⚠️ Maximum 3 regional locations allowed.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
