import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Save,
  Loader2,
  Trash2,
  Plus,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAllPartnerTrust,
  createPartnerTrust,
  updatePartnerTrust,
  deletePartnerTrust,
} from '../../services/becomePartner/partnerTrustService';

const EMPTY_FORM = {
  title: '',
  description: '',
  features: [{ title: '', description: '' }],
  isActive: true,
};

const normalizeFeatures = (value) => {
  if (!Array.isArray(value) || value.length === 0) {
    return [{ title: '', description: '' }];
  }

  return value.map((feature) => ({
    title: feature?.title || '',
    description: feature?.description || '',
  }));
};

export default function TrustTransparency() {
  const [isExpanded, setIsExpanded] = useState(true);
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

  const resetForm = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setImageFile(null);
    setImagePreview('');
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const hydrateFormFromRecord = (record) => {
    const safeRecord = record || {};

    setEditingId(safeRecord._id || null);
    setFormData({
      title: safeRecord.title || '',
      description: safeRecord.description || '',
      features: normalizeFeatures(safeRecord.features),
      isActive: safeRecord.isActive !== undefined ? Boolean(safeRecord.isActive) : true,
    });
    setImageFile(null);
    setImagePreview(safeRecord.image || '');
    setErrors({});

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const loadRecord = async () => {
    setIsLoading(true);
    try {
      const response = await getAllPartnerTrust();
      const records = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];

      if (records.length > 0) {
        hydrateFormFromRecord(records[0]);
      } else {
        resetForm();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load Trust & Transparency data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecord();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFeatureChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.map((feature, featureIndex) =>
        featureIndex === index ? { ...feature, [field]: value } : feature
      ),
    }));
  };

  const handleAddFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, { title: '', description: '' }],
    }));
  };

  const handleRemoveFeature = (index) => {
    if (formData.features.length <= 1) {
      setFormData((prev) => ({
        ...prev,
        features: [{ title: '', description: '' }],
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, featureIndex) => featureIndex !== index),
    }));
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
    if (errors.image) setErrors((prev) => ({ ...prev, image: '' }));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.title.trim()) nextErrors.title = 'Title is required';
    if (!formData.description.trim()) nextErrors.description = 'Description is required';
    if (!imagePreview && !imageFile) nextErrors.image = 'Image is required';

    const invalidFeatures = formData.features.some(
      (feature) => !feature.title.trim() || !feature.description.trim()
    );

    if (invalidFeatures) {
      nextErrors.features = 'Each feature must include a title and description';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const payload = new FormData();
      payload.append('title', formData.title.trim());
      payload.append('description', formData.description.trim());
      payload.append('isActive', String(formData.isActive));
      payload.append('features', JSON.stringify(formData.features.map((feature) => ({
        title: feature.title.trim(),
        description: feature.description.trim(),
      }))));

      if (imageFile) {
        payload.append('image', imageFile);
      }

      console.log('Partner Trust Payload:', {
        title: formData.title.trim(),
        description: formData.description.trim(),
        image: imageFile ? imageFile.name : imagePreview || null,
        features: formData.features.map((feature) => ({
          title: feature.title.trim(),
          description: feature.description.trim(),
        })),
        isActive: formData.isActive,
      });

      let response;

      if (editingId) {
        response = await updatePartnerTrust(editingId, payload);
        if (response?.success) {
          toast.success('Trust & Transparency updated successfully.');
        }
      } else {
        response = await createPartnerTrust(payload);
        if (response?.success) {
          toast.success('Trust & Transparency created successfully.');
        }
      }

      const savedRecord = response?.data ?? response ?? null;

      if (savedRecord && (savedRecord._id || savedRecord.title || savedRecord.description || savedRecord.features)) {
        hydrateFormFromRecord(savedRecord);
      } else {
        await loadRecord();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save Trust & Transparency.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingId) return;

    setDeletingId(editingId);
    try {
      const response = await deletePartnerTrust(editingId);
      if (response?.success) {
        toast.success('Trust & Transparency deleted successfully.');
        setConfirmDelete(false);
        resetForm();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete Trust & Transparency.');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-gray-500 gap-2">
        <Loader2 size={18} className="animate-spin text-orange-400" />
        Loading Trust & Transparency...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div
        className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">Trust & Transparency</h2>
          {editingId && (
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
              Update Mode
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
        </div>
      </div>

      {isExpanded && (
        <>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
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
                  placeholder='e.g. "Built on Trust and Transparency Since 2007"'
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors resize-none ${errors.description ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                  placeholder="Enter the trust description..."
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>

              <div className="flex items-center gap-3 mt-2">
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

              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
                    <p className="text-xs text-gray-500">Add the trust and transparency highlights.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border border-orange-500 text-orange-600 hover:bg-orange-50 transition-colors"
                  >
                    <Plus size={14} />
                    Add Feature
                  </button>
                </div>

                {errors.features && <p className="text-red-500 text-xs mt-1">{errors.features}</p>}

                {formData.features.map((feature, index) => (
                  <div key={`feature-${index}`} className="space-y-3 border border-gray-200 rounded-xl p-3 bg-gray-50">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-gray-700">Feature {index + 1}</span>
                      {formData.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(index)}
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <X size={12} />
                          Remove
                        </button>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Feature Title</label>
                      <input
                        type="text"
                        value={feature.title}
                        onChange={(e) => handleFeatureChange(index, 'title', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                        placeholder="Feature title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Feature Description</label>
                      <textarea
                        value={feature.description}
                        onChange={(e) => handleFeatureChange(index, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors resize-none"
                        placeholder="Feature description"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image <span className="text-red-500">*</span></label>
              <div className={`mt-1 border-2 border-dashed rounded-xl bg-gray-50 hover:border-orange-300 transition-colors flex flex-col items-center justify-center relative overflow-hidden min-h-[240px] ${errors.image ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="bg-white text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full text-gray-400 hover:text-orange-500 transition-colors p-6">
                    <ImageIcon size={36} className="mb-3 text-gray-300" />
                    <span className="text-sm font-medium">Click to upload image</span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP — max 5MB</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
              {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
            </div>
          </div>

          <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
            <div>
              {editingId && (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
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
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isSaving ? 'Saving...' : editingId ? 'Update Trust & Transparency' : 'Save Trust & Transparency'}
              </button>
            </div>
          </div>
        </>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Trust & Transparency?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this section? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors shadow-sm"
              >
                {deletingId ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
