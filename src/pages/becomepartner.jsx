import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Save,
  Loader2,
  Trash2,
  Pencil,
  Plus,
  X,
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import {
  getRecruitmentPartners,
  createRecruitmentPartner,
  updateRecruitmentPartner,
  deleteRecruitmentPartner,
} from '../services/becomePartner/becomePartnerService';
import RecruitmentPartners from "../components/becomePartner/RecruitmentPartners";
import TrustTransparency from "../components/becomePartner/TrustTransparency";
import NetworkMapCard from "../components/becomePartner/NetworkMapCard";

// ─── Empty form state ──────────────────────────────────────────────────────────
const EMPTY_FORM = {
  title: '',
  highlightText: '',
  subtitle: '',
  description: '',
  isActive: true,
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function BecomePartnerManagement() {
  const [isFormExpanded, setIsFormExpanded] = useState(true);
  const [isListExpanded, setIsListExpanded] = useState(true);

  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});

  const fileInputRef = useRef(null);

  // ─── Load records ────────────────────────────────────────────────────────────
  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const response = await getRecruitmentPartners();
      setRecords(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      toast.error(error.message || 'Failed to load records');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Form helpers ─────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    if (errors.backgroundImage) setErrors((prev) => ({ ...prev, backgroundImage: '' }));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setImageFile(null);
    setImagePreview('');
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startEdit = (record) => {
    setEditingId(record._id);
    setFormData({
      title: record.title || '',
      highlightText: record.highlightText || '',
      subtitle: record.subtitle || '',
      description: record.description || '',
      isActive: record.isActive !== undefined ? record.isActive : true,
    });
    setImageFile(null);
    setImagePreview(record.backgroundImage || '');
    setErrors({});
    setIsFormExpanded(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── Validation ───────────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.highlightText.trim()) newErrors.highlightText = 'Highlight text is required';
    if (!formData.subtitle.trim()) newErrors.subtitle = 'Subtitle is required';
    if (!imagePreview && !imageFile) newErrors.backgroundImage = 'Background image is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Save (Create / Update) ───────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const payload = new FormData();
      payload.append('title', formData.title.trim());
      payload.append('highlightText', formData.highlightText.trim());
      payload.append('subtitle', formData.subtitle.trim());
      if (formData.description !== undefined) {
        payload.append('description', formData.description.trim());
      }
      payload.append('isActive', String(formData.isActive));
      if (imageFile) {
        payload.append('image', imageFile);
      }

      let response;
      if (editingId) {
        response = await updateRecruitmentPartner(editingId, payload);
        if (response?.success) {
          toast.success('Record updated successfully');
        }
      } else {
        response = await createRecruitmentPartner(payload);
        if (response?.success) {
          toast.success('Record created successfully');
        }
      }

      resetForm();
      await loadRecords();
    } catch (error) {
      toast.error(error.message || 'Failed to save record');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const response = await deleteRecruitmentPartner(id);
      if (response?.success) {
        toast.success('Record deleted successfully');
        setConfirmDeleteId(null);
        if (editingId === id) resetForm();
        await loadRecords();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete record');
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Hero Preview ─────────────────────────────────────────────────────────────
  const HeroPreview = () => (
    <div
      className="relative w-full rounded-xl overflow-hidden min-h-48"
      style={{
        background: imagePreview
          ? `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${imagePreview}) center/cover no-repeat`
          : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      }}
    >
      <div className="flex flex-col items-center justify-center h-full min-h-48 p-8 text-center">
        <p className="text-white/50 text-xs uppercase tracking-widest mb-3 font-medium">Hero Preview</p>
        <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
          {formData.title || 'Become Our'}{' '}
          <span className="text-orange-400">{formData.highlightText || 'Trusted'}</span>{' '}
          {formData.subtitle || 'Recruitment Partner'}
        </h2>
      </div>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (

    <div className="max-w-6xl mx-auto pb-10 relative md:mt-15 mt-5">
      <Toaster position="top-right" />

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Become a Partner Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage the "Become a Partner" hero banner displayed on the website.
        </p>
      </div>
      <div>


        {/* Right Side Section: Form Card */}
        <div>
          {/* ── Form Card ─────────────────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Card header */}
            <div
              className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer select-none"
              onClick={() => setIsFormExpanded(!isFormExpanded)}
            >
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-800">
                  {editingId ? 'Edit Hero Section' : 'Hero Section'}
                </h2>
                {editingId && (
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                    Editing
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); resetForm(); }}
                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
                {isFormExpanded
                  ? <ChevronUp size={20} className="text-gray-500" />
                  : <ChevronDown size={20} className="text-gray-500" />
                }
              </div>
            </div>

            {isFormExpanded && (
              <>
                <div className="p-5 space-y-6">
                  {/* Text fields + Image upload grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: fields */}
                    <div className="space-y-4">
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
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors ${errors.title ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                          placeholder='e.g. "Become Our"'
                        />
                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                      </div>

                      {/* Highlight Text */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Highlight Text <span className="text-red-500">*</span>{' '}
                          <span className="text-orange-500 font-normal text-xs">(shown in orange)</span>
                        </label>
                        <input
                          type="text"
                          name="highlightText"
                          value={formData.highlightText}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors ${errors.highlightText ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                          placeholder='e.g. "Trusted"'
                        />
                        {errors.highlightText && <p className="text-red-500 text-xs mt-1">{errors.highlightText}</p>}
                      </div>

                      {/* Subtitle */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subtitle <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="subtitle"
                          value={formData.subtitle}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors ${errors.subtitle ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                          placeholder='e.g. "Recruitment Partner"'
                        />
                        {errors.subtitle && <p className="text-red-500 text-xs mt-1">{errors.subtitle}</p>}
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows="4"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors border-gray-200"
                          placeholder='e.g. "Partner with e2e HRC to build a stronger and more capable workforce."'
                        />
                      </div>

                      {/* Active Toggle */}
                      <div className="flex items-center gap-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
                        </label>
                        <span className="text-sm text-gray-700">{formData.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>

                    {/* Right: image uploader */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Background Image <span className="text-red-500">*</span>
                      </label>
                      <div className={`mt-1 border-2 border-dashed rounded-xl bg-gray-50 hover:border-orange-300 transition-colors flex flex-col items-center justify-center relative overflow-hidden min-h-65 ${errors.backgroundImage ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
                        {imagePreview ? (
                          <>
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-white text-blue-600 hover:text-blue-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
                              >
                                Change
                              </button>
                              <button
                                type="button"
                                onClick={removeImage}
                                className="bg-white text-red-500 hover:text-red-600 px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
                              >
                                Remove
                              </button>
                            </div>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              className="hidden"
                              onChange={handleImageChange}
                            />
                          </>
                        ) : (
                          <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full text-gray-400 hover:text-orange-500 transition-colors p-6">
                            <ImageIcon size={34} className="mb-3 text-gray-300" />
                            <span className="text-sm font-medium">Click to upload image</span>
                            <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP — max 5MB</span>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              className="hidden"
                              onChange={handleImageChange}
                            />
                          </label>
                        )}
                      </div>
                      {errors.backgroundImage && (
                        <p className="text-red-500 text-xs mt-1">{errors.backgroundImage}</p>
                      )}
                    </div>
                  </div>

                </div>

                {/* Card Footer */}
                <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    {editingId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="text-gray-500 hover:text-gray-700 text-sm font-medium px-3 py-2 rounded-lg transition-colors border border-gray-200 hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-sm text-sm"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {isSaving ? 'Saving...' : editingId ? 'Update Record' : 'Create Hero Section'}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ── Records List Card ──────────────────────────────────────────────────── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div
              className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer select-none"
              onClick={() => setIsListExpanded(!isListExpanded)}
            >
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-800">All Records</h2>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                  {records.length}
                </span>
              </div>
              {isListExpanded
                ? <ChevronUp size={20} className="text-gray-500" />
                : <ChevronDown size={20} className="text-gray-500" />
              }
            </div>

            {isListExpanded && (
              <div className="p-5">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12 text-sm text-gray-500 gap-2">
                    <Loader2 size={18} className="animate-spin text-orange-400" />
                    Loading records...
                  </div>
                ) : records.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <ImageIcon size={40} className="mb-3 text-gray-200" />
                    <p className="text-sm font-medium">No records yet</p>
                    <p className="text-xs text-gray-400 mt-1">Use the form above to create your first record.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {records.map((record) => (
                      <div
                        key={record._id}
                        className={`rounded-xl border p-4 transition-colors ${editingId === record._id
                          ? 'border-orange-300 bg-orange-50'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                          }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          {/* Image thumb */}
                          {record.backgroundImage ? (
                            <img
                              src={record.backgroundImage}
                              alt="bg"
                              className="w-full sm:w-24 h-16 object-cover rounded-lg flex-shrink-0 border border-gray-200"
                            />
                          ) : (
                            <div className="w-full sm:w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                              <ImageIcon size={20} className="text-gray-400" />
                            </div>
                          )}

                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                              {record.title}{' '}
                              <span className="text-orange-500">{record.highlightText}</span>{' '}
                              {record.subtitle}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${record.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
                                  }`}
                              >
                                {record.isActive ? 'Active' : 'Inactive'}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(record.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => startEdit(record)}
                              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            >
                              <Pencil size={13} />
                              Edit
                            </button>

                            {confirmDeleteId === record._id ? (
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-gray-500">Are you sure?</span>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(record._id)}
                                  disabled={deletingId === record._id}
                                  className="inline-flex items-center gap-1 text-xs font-medium px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-60"
                                >
                                  {deletingId === record._id ? <Loader2 size={12} className="animate-spin" /> : null}
                                  Delete
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="inline-flex items-center gap-1 text-xs font-medium px-2 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors"
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(record._id)}
                                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                              >
                                <Trash2 size={13} />
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div>
        <RecruitmentPartners />
        <TrustTransparency />
        <NetworkMapCard />
      </div>
    </div>

  );
}

