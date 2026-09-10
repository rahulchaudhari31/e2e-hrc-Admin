import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import {
  createEmployeeTestimonialSection,
  updateEmployeeTestimonialSection,
} from '../../../services/employee/employeeTestimonialService';

const Toggle = ({ checked, onChange, name }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" name={name} checked={checked} onChange={onChange} className="sr-only peer" />
    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
  </label>
);

export default function EmployeeTestimonialSectionForm({ section, onSectionSaved }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    badgeText: '',
    sectionTitle: '',
    sectionDescription: '',
    isActive: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (section) {
      setFormData({
        badgeText: section.badgeText || '',
        sectionTitle: section.sectionTitle || '',
        sectionDescription: section.sectionDescription || '',
        isActive: section.isActive ?? true,
      });
    }
  }, [section]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.sectionTitle?.trim()) errs.sectionTitle = 'Section title is required.';
    return errs;
  };

  const saveSectionForm = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        badgeText: formData.badgeText.trim(),
        sectionTitle: formData.sectionTitle.trim(),
        sectionDescription: formData.sectionDescription,
        isActive: formData.isActive,
      };

      if (section && section._id) {
        await updateEmployeeTestimonialSection(section._id, payload);
        toast.success('Section updated successfully!');
      } else {
        const res = await createEmployeeTestimonialSection(payload);
        toast.success('Section created successfully!');
        onSectionSaved(res.data);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save section.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer gap-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <h4 className="text-base font-semibold text-gray-800">Section Settings</h4>
          {section && (
            <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-1 rounded-md">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {isExpanded ? (
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-5">
          {/* Badge Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Badge Text</label>
            <input
              type="text"
              name="badgeText"
              value={formData.badgeText}
              onChange={handleFormChange}
              placeholder="e.g., Testimonials"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors ${
                errors.badgeText ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {errors.badgeText && <p className="text-xs text-red-500 mt-1">{errors.badgeText}</p>}
          </div>

          {/* Section Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="sectionTitle"
              value={formData.sectionTitle}
              onChange={handleFormChange}
              placeholder="e.g., What Our Employees Say"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors ${
                errors.sectionTitle ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {errors.sectionTitle && <p className="text-xs text-red-500 mt-1">{errors.sectionTitle}</p>}
          </div>

          {/* Section Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section Description</label>
            <textarea
              name="sectionDescription"
              value={formData.sectionDescription}
              onChange={handleFormChange}
              rows={3}
              placeholder="Enter section description..."
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors resize-none ${
                errors.sectionDescription ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {errors.sectionDescription && <p className="text-xs text-red-500 mt-1">{errors.sectionDescription}</p>}
          </div>

          {/* Active Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="flex items-center gap-2">
              <Toggle checked={formData.isActive} onChange={handleFormChange} name="isActive" />
              <span className="text-sm text-gray-600">{formData.isActive ? 'Active' : 'Inactive'}</span>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              onClick={saveSectionForm}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-lg hover:bg-orange-600 transition-colors shadow-sm disabled:bg-orange-300"
            >
              {isSaving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : `${section ? 'Update' : 'Create'} Section`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
