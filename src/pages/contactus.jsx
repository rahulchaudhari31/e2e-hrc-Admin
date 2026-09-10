import React, { useState, useEffect, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import {
  Image as ImageIcon,
  Save,
  Loader2,
  X,
} from 'lucide-react';
import {
  getContactUsSections,
  createContactUsSection,
  updateContactUsSection,
} from '../services/contactUs/contactUsService';
import HeadOfficeSection from '../components/Contactus/HeadOfficeSection';
import ContactCardSection from '../components/Contactus/ContactCardSection';

const EMPTY_FORM = {
  title: '',
  highlightedText: '',
  backgroundImage: null,
  imagePreview: '',
  isActive: true,
};

export default function ContactUs() {
  const [section, setSection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [sectionId, setSectionId] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadSection();
  }, []);

  const loadSection = async () => {
    setIsLoading(true);
    try {
      const response = await getContactUsSections();
      if (response?.success && response.data && response.data.length > 0) {
        const existingSection = response.data[0];
        setSectionId(existingSection._id);
        setSection(existingSection);
        setFormData({
          title: existingSection.title || '',
          highlightedText: existingSection.highlightedText || '',
          backgroundImage: null,
          imagePreview: existingSection.backgroundImage || '',
          isActive: existingSection.isActive ?? true,
        });
      } else {
        setSection(null);
        setSectionId(null);
        setFormData(EMPTY_FORM);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load section');
      setSection(null);
      setSectionId(null);
      setFormData(EMPTY_FORM);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNew = () => {
    setFormData(EMPTY_FORM);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    setFormData(prev => ({
      ...prev,
      backgroundImage: file,
      imagePreview: URL.createObjectURL(file),
    }));
    if (errors.backgroundImage) {
      setErrors(prev => ({ ...prev, backgroundImage: '' }));
    }
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      backgroundImage: null,
      imagePreview: '',
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title?.trim()) newErrors.title = 'Title is required';
    if (!formData.highlightedText?.trim()) newErrors.highlightedText = 'Highlighted text is required';
    if (!formData.imagePreview && !formData.backgroundImage) newErrors.backgroundImage = 'Background image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      payload.append('highlightedText', formData.highlightedText.trim());
      payload.append('isActive', formData.isActive);

      if (formData.backgroundImage) {
        payload.append('backgroundImage', formData.backgroundImage);
      }

      let response;
      if (sectionId) {
        response = await updateContactUsSection(sectionId, payload);
        if (response?.success) {
          toast.success('Contact Us section updated successfully!');
        }
      } else {
        response = await createContactUsSection(payload);
        if (response?.success) {
          toast.success('Contact Us section created successfully!');
        }
      }

      await loadSection();
    } catch (error) {
      toast.error(error.message || 'Failed to save section');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-orange-500" />
        <span className="ml-2 text-gray-600">Loading Contact Us section...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 relative md:mt-15 mt-5">
      <Toaster position="top-right" />

      {/* Page Header */}
      <div className="mb-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900">Contact Us Management</h1>
        <p className="text-sm text-gray-500 mt-2">Manage the "Connect With E2E HRC" section displayed on your website</p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mx-4">
        {/* Form Header */}
        <div className="px-6 py-5 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {sectionId ? 'Contact Us Section' : 'Create Contact Us Section'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {sectionId ? 'Update the existing section or toggle its visibility' : 'Create a new Contact Us section'}
          </p>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* Title Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors text-gray-900 ${
                errors.title ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="e.g., Connect With"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1.5">{errors.title}</p>}
          </div>

          {/* Highlighted Text Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Highlighted Text <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="highlightedText"
              value={formData.highlightedText}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors text-gray-900 ${
                errors.highlightedText ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="e.g., E2E HRC"
            />
            {errors.highlightedText && <p className="text-red-500 text-xs mt-1.5">{errors.highlightedText}</p>}
          </div>

          {/* Background Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background Image <span className="text-red-500">*</span>
            </label>

            <div
              onClick={handleImageUploadClick}
              className={`mt-1 border-2 border-dashed rounded-xl bg-gray-50 hover:border-orange-300 hover:bg-orange-50 transition-colors flex flex-col items-center justify-center relative overflow-hidden min-h-64 cursor-pointer ${
                errors.backgroundImage ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
            >
              {formData.imagePreview ? (
                <>
                  <img
                    src={formData.imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="bg-white text-blue-600 hover:text-blue-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
                    >
                      Change
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                      className="bg-white text-red-500 hover:text-red-600 px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
                    >
                      Remove
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-orange-500 transition-colors p-6">
                  <ImageIcon size={48} className="mb-3 text-gray-300" />
                  <span className="text-sm font-medium">Click to upload image</span>
                  <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP — max 5MB</span>
                </div>
              )}

              <input
                id="section-image-upload"
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {errors.backgroundImage && (
              <p className="text-red-500 text-xs mt-1.5">{errors.backgroundImage}</p>
            )}
          </div>

          {/* Active Toggle - Using the standard Admin Panel toggle style */}
          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">Section Status</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-orange-500 transition-colors" />
              <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
              <span className="ml-3 text-sm font-medium text-gray-700">
                {formData.isActive ? 'Active' : 'Inactive (Hidden)'}
              </span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-6 rounded-lg transition-colors"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  {sectionId ? 'Save Changes' : 'Create Section'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Head Office Section - NEW INDEPENDENT COMPONENT */}
      <div className="mt-12">
        <HeadOfficeSection />
      </div>

      {/* Contact Card Section - NEW INDEPENDENT COMPONENT */}
      <div className="mt-12">
        <ContactCardSection />
      </div>
    </div>
  );
}
