import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Save,
  Loader2,
  Trash2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getRecruitmentPartners,
  createRecruitmentPartner,
  updateRecruitmentPartner,
  deleteRecruitmentPartner,
} from '../../services/becomePartner/recruitmentPartnersService';

// ─── Empty form state ──────────────────────────────────────────────────────────
const EMPTY_FORM = {
  title: '',
  highlightText: '',
  isActive: true,
};

// ─── Main Component ────────────────────────────────────────────────────────────
export default function RecruitmentPartners() {
  const [isFormExpanded, setIsFormExpanded] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});

  const fileInputRef = useRef(null);

  // ─── Load record ────────────────────────────────────────────────────────────
  useEffect(() => {
    loadRecord();
  }, []);

  const loadRecord = async () => {
    setIsLoading(true);
    try {
      const response = await getRecruitmentPartners();
      const records = Array.isArray(response?.data) ? response.data : [];
      if (records.length > 0) {
        const record = records[0]; // Assuming a single record system
        setEditingId(record._id);
        setFormData({
          title: record.title || '',
          highlightText: record.highlightText || '',
          isActive: record.isActive !== undefined ? record.isActive : true,
        });
        setImagePreview(record.backgroundImage || '');
      } else {
        resetForm();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load record');
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

  // ─── Validation ───────────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.highlightText.trim()) newErrors.highlightText = 'Highlight text is required';
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
      payload.append('isActive', String(formData.isActive));
      if (imageFile) {
        payload.append('image', imageFile);
      }

      let response;
      if (editingId) {
        response = await updateRecruitmentPartner(editingId, payload);
        if (response?.success) {
          toast.success('Recruitment Partner updated successfully!');
        }
      } else {
        response = await createRecruitmentPartner(payload);
        if (response?.success) {
          toast.success('Recruitment Partner created successfully!');
          if (response.data && response.data._id) {
            setEditingId(response.data._id);
          }
        }
      }

      setImageFile(null); // Clear pending upload state, imagePreview remains URL
      await loadRecord(); // Reload from backend to get fresh URLs and dates
    } catch (error) {
      const msg = error?.message || (editingId ? 'Failed to update recruitment partner.' : 'Failed to create recruitment partner.');
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!editingId) return;
    setDeletingId(editingId);
    try {
      const response = await deleteRecruitmentPartner(editingId);
      if (response?.success) {
        toast.success('Recruitment Partner deleted successfully!');
        setConfirmDelete(false);
        resetForm();
      }
    } catch (error) {
      toast.error(error?.message || 'Failed to delete recruitment partner.');
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-gray-500 gap-2">
        <Loader2 size={18} className="animate-spin text-orange-400" />
        Loading Recruitment Partners...
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-10 mt-5">
      {/* ── Form Card ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Card header */}
        <div
          className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer select-none"
          onClick={() => setIsFormExpanded(!isFormExpanded)}
        >
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-800">
              Recruitment Partners
            </h2>
            {editingId ? (
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                Update Mode
              </span>
            ) : (
              ''
            )}
          </div>
          <div className="flex items-center gap-2">
            {isFormExpanded ? (
              <ChevronUp size={20} className="text-gray-500" />
            ) : (
              <ChevronDown size={20} className="text-gray-500" />
            )}
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
                      placeholder='e.g. "Connecting Recruitment Partners"'
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
                      placeholder='e.g. "Worldwide"'
                    />
                    {errors.highlightText && <p className="text-red-500 text-xs mt-1">{errors.highlightText}</p>}
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center gap-3 mt-4">
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
                  confirmDelete ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-gray-500">Confirm deletion?</span>
                      <button
                        type="button"
                        onClick={handleDelete}
                        disabled={deletingId !== null}
                        className="inline-flex items-center gap-1 text-xs font-medium px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-60"
                      >
                        {deletingId ? <Loader2 size={12} className="animate-spin" /> : null}
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(false)}
                        className="inline-flex items-center gap-1 text-xs font-medium px-2 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={13} />
                      Delete Section
                    </button>
                  )
                )}
              </div>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-sm text-sm"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isSaving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
