import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Upload, X, Loader2 } from 'lucide-react';
import {
  createEmployeeTestimonialCard,
  updateEmployeeTestimonialCard,
  updateEmployeeTestimonialCardLogo,
} from '../../../services/employee/employeeTestimonialService';

const Toggle = ({ checked, onChange, name }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" name={name} checked={checked} onChange={onChange} className="sr-only peer" />
    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
  </label>
);

const EMPTY_CARD = {
  title: '',
  reviewText: '',
  companyName: '',
  reviewerName: '',
  reviewerDesignation: '',
  order: 0,
  isActive: true,
};

export default function EmployeeTestimonialCardModal({ isOpen, editingCard, onClose, onCardSaved }) {
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLogoFile, setSelectedLogoFile] = useState(null);
  const [previewLogo, setPreviewLogo] = useState(null);
  const [formData, setFormData] = useState(EMPTY_CARD);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingCard) {
      setFormData({
        title: editingCard.title || '',
        reviewText: editingCard.reviewText || '',
        companyName: editingCard.companyName || '',
        reviewerName: editingCard.reviewerName || '',
        reviewerDesignation: editingCard.reviewerDesignation || '',
        order: editingCard.order ?? 0,
        isActive: editingCard.isActive ?? true,
      });
      if (editingCard.companyLogo) {
        setPreviewLogo(editingCard.companyLogo);
      }
    } else {
      setFormData(EMPTY_CARD);
      setPreviewLogo(null);
      setSelectedLogoFile(null);
    }
    setErrors({});
  }, [editingCard, isOpen]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'order' ? Number(value) : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, companyLogo: 'Please select a valid image file.' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, companyLogo: 'Image must be less than 5MB.' }));
      return;
    }

    setSelectedLogoFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewLogo(event.target?.result);
    };
    reader.readAsDataURL(file);
    setErrors((prev) => ({ ...prev, companyLogo: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.title?.trim()) errs.title = 'Title is required.';
    if (!formData.reviewText?.trim()) errs.reviewText = 'Review text is required.';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSaving(true);
    try {
      if (editingCard && editingCard._id) {
        // Update existing card
        const updatePayload = {
          title: formData.title.trim(),
          reviewText: formData.reviewText.trim(),
          companyName: formData.companyName.trim(),
          reviewerName: formData.reviewerName.trim(),
          reviewerDesignation: formData.reviewerDesignation.trim(),
          order: formData.order,
          isActive: formData.isActive,
        };
        await updateEmployeeTestimonialCard(editingCard._id, updatePayload);
        toast.success('Card updated successfully!');

        // If new logo selected, upload it
        if (selectedLogoFile) {
          const logoFormData = new FormData();
          logoFormData.append('companyLogo', selectedLogoFile);
          await updateEmployeeTestimonialCardLogo(editingCard._id, logoFormData);
          toast.success('Company logo updated!');
        }
      } else {
        // Create new card
        const createFormData = new FormData();
        createFormData.append('title', formData.title.trim());
        createFormData.append('reviewText', formData.reviewText.trim());
        createFormData.append('companyName', formData.companyName.trim());
        createFormData.append('reviewerName', formData.reviewerName.trim());
        createFormData.append('reviewerDesignation', formData.reviewerDesignation.trim());
        createFormData.append('order', formData.order);
        createFormData.append('isActive', formData.isActive);
        if (selectedLogoFile) {
          createFormData.append('companyLogo', selectedLogoFile);
        }

        await createEmployeeTestimonialCard(createFormData);
        toast.success('Card created successfully!');
      }

      setFormData(EMPTY_CARD);
      setPreviewLogo(null);
      setSelectedLogoFile(null);
      onCardSaved();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to save card.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">
            {editingCard ? 'Edit Testimonial Card' : 'Add Testimonial Card'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                placeholder="e.g., Great Experience"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors ${
                  errors.title ? 'border-red-400' : 'border-gray-200'
                }`}
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleFormChange}
                placeholder="e.g., TechCorp"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
              />
            </div>

            {/* Reviewer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reviewer Name</label>
              <input
                type="text"
                name="reviewerName"
                value={formData.reviewerName}
                onChange={handleFormChange}
                placeholder="e.g., John Doe"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
              />
            </div>

            {/* Reviewer Designation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
              <input
                type="text"
                name="reviewerDesignation"
                value={formData.reviewerDesignation}
                onChange={handleFormChange}
                placeholder="e.g., Senior Developer"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
              />
            </div>

            {/* Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleFormChange}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
              />
            </div>

            {/* Active Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="flex items-center gap-2">
                <Toggle checked={formData.isActive} onChange={handleFormChange} name="isActive" />
                <span className="text-sm text-gray-600">{formData.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Review Text <span className="text-red-500">*</span>
            </label>
            <textarea
              name="reviewText"
              value={formData.reviewText}
              onChange={handleFormChange}
              rows={4}
              placeholder="Enter the testimonial review..."
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors resize-none ${
                errors.reviewText ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {errors.reviewText && <p className="text-xs text-red-500 mt-1">{errors.reviewText}</p>}
          </div>

          {/* Company Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Company Logo</label>
            {previewLogo && (
              <div className="mb-3 relative inline-block">
                <img
                  src={previewLogo}
                  alt="Logo Preview"
                  className="w-20 h-20 object-contain rounded-lg border border-gray-200 bg-gray-50"
                />
                <button
                  onClick={() => {
                    setPreviewLogo(null);
                    setSelectedLogoFile(null);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 transition-colors bg-gray-50 hover:bg-orange-50">
              <div className="flex flex-col items-center gap-2">
                <Upload size={20} className="text-orange-500" />
                <span className="text-sm font-medium text-gray-700">Upload company logo</span>
                <span className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</span>
              </div>
              <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
            </label>
            {errors.companyLogo && <p className="text-xs text-red-500 mt-2">{errors.companyLogo}</p>}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-lg hover:bg-orange-600 transition-colors shadow-sm disabled:bg-orange-300"
          >
            {isSaving ? (
              <><Loader2 size={14} className="animate-spin" /> {editingCard ? 'Updating...' : 'Creating...'}</>
            ) : (
              editingCard ? 'Update Card' : 'Create Card'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
