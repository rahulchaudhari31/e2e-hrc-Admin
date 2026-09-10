import React, { useState, useEffect } from 'react';
import { Save, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAdminContactCard,
  createContactCard,
  updateContactCard,
  deleteContactCard,
} from '../../services/contactUs/contactCardService';

const EMPTY_FORM = {
  title: '',
  phone_title: '',
  phone_number: '',
  email_title: '',
  email_address: '',
  office_title: '',
  office_address: '',
  office_map_url: '',
  is_active: true,
};

export default function ContactCardSection() {
  const [contactCardData, setContactCardData] = useState(null);
  const [contactCardId, setContactCardId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadContactCard();
  }, []);

  const loadContactCard = async () => {
    setIsLoading(true);
    try {
      const response = await getAdminContactCard();
      if (response?.success && response.data) {
        setContactCardId(response.data._id);
        setContactCardData(response.data);
        setFormData({
          title: response.data.title || '',
          phone_title: response.data.phone_title || '',
          phone_number: response.data.phone_number || '',
          email_title: response.data.email_title || '',
          email_address: response.data.email_address || '',
          office_title: response.data.office_title || '',
          office_address: response.data.office_address || '',
          office_map_url: response.data.office_map_url || '',
          is_active: response.data.is_active ?? true,
        });
      } else {
        setContactCardData(null);
        setContactCardId(null);
        setFormData(EMPTY_FORM);
      }
    } catch (error) {
      setContactCardData(null);
      setContactCardId(null);
      setFormData(EMPTY_FORM);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUrl = (url) => {
    if (!url) return true; // URL is optional
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title?.trim()) newErrors.title = 'Title is required';
    if (!formData.phone_title?.trim()) newErrors.phone_title = 'Phone title is required';
    if (!formData.phone_number?.trim()) newErrors.phone_number = 'Phone number is required';
    if (!formData.email_title?.trim()) newErrors.email_title = 'Email title is required';
    if (!formData.email_address?.trim()) {
      newErrors.email_address = 'Email address is required';
    } else if (!validateEmail(formData.email_address)) {
      newErrors.email_address = 'Please enter a valid email address';
    }
    if (!formData.office_title?.trim()) newErrors.office_title = 'Office title is required';
    if (!formData.office_address?.trim()) newErrors.office_address = 'Office address is required';
    if (formData.office_map_url && !validateUrl(formData.office_map_url)) {
      newErrors.office_map_url = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        phone_title: formData.phone_title.trim(),
        phone_number: formData.phone_number.trim(),
        email_title: formData.email_title.trim(),
        email_address: formData.email_address.trim(),
        office_title: formData.office_title.trim(),
        office_address: formData.office_address.trim(),
        office_map_url: formData.office_map_url?.trim() || '',
        is_active: formData.is_active,
      };

      let response;
      if (contactCardId) {
        response = await updateContactCard(contactCardId, payload);
        if (response?.success) {
          toast.success('Contact Card updated successfully');
        }
      } else {
        response = await createContactCard(payload);
        if (response?.success) {
          toast.success('Contact Card created successfully');
        }
      }

      await loadContactCard();
    } catch (error) {
      toast.error(error.message || 'Failed to save Contact Card');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!contactCardId) return;

    if (!confirm('Are you sure you want to delete this Contact Card record?')) {
      return;
    }

    setIsSaving(true);
    try {
      await deleteContactCard(contactCardId);
      toast.success('Contact Card deleted successfully');
      await loadContactCard();
    } catch (error) {
      toast.error(error.message || 'Failed to delete Contact Card');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-orange-500" />
        <span className="ml-2 text-gray-600">Loading Contact Card...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mx-4 mb-6">
      <div className="px-6 py-5 bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Ready To Connect</h2>
        <p className="text-sm text-gray-500 mt-1">Manage contact card information with phone, email, and office details</p>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              placeholder="e.g., Ready to Connect"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1.5">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="phone_title"
              value={formData.phone_title}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors text-gray-900 ${
                errors.phone_title ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="e.g., Phone"
            />
            {errors.phone_title && <p className="text-red-500 text-xs mt-1.5">{errors.phone_title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors text-gray-900 ${
                errors.phone_number ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="+44 121 778 2400"
            />
            {errors.phone_number && <p className="text-red-500 text-xs mt-1.5">{errors.phone_number}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="email_title"
              value={formData.email_title}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors text-gray-900 ${
                errors.email_title ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="e.g., Email"
            />
            {errors.email_title && <p className="text-red-500 text-xs mt-1.5">{errors.email_title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email_address"
              value={formData.email_address}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors text-gray-900 ${
                errors.email_address ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="info@example.com"
            />
            {errors.email_address && <p className="text-red-500 text-xs mt-1.5">{errors.email_address}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Office Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="office_title"
              value={formData.office_title}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors text-gray-900 ${
                errors.office_title ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="e.g., Office"
            />
            {errors.office_title && <p className="text-red-500 text-xs mt-1.5">{errors.office_title}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Office Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="office_address"
              value={formData.office_address}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors text-gray-900 ${
                errors.office_address ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="Full office address"
            />
            {errors.office_address && <p className="text-red-500 text-xs mt-1.5">{errors.office_address}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Office Map URL</label>
            <input
              type="url"
              name="office_map_url"
              value={formData.office_map_url}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors text-gray-900 ${
                errors.office_map_url ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="https://maps.google.com/..."
            />
            {errors.office_map_url && <p className="text-red-500 text-xs mt-1.5">{errors.office_map_url}</p>}
          </div>
        </div>

        <div className="pt-2">
          <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-orange-500 transition-colors" />
            <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
            <span className="ml-3 text-sm font-medium text-gray-700">
              {formData.is_active ? 'Active' : 'Inactive'}
            </span>
          </label>
        </div>

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
                {contactCardId ? 'Update' : 'Save'}
              </>
            )}
          </button>

          {contactCardId && (
            <button
              onClick={handleDelete}
              disabled={isSaving}
              className="inline-flex items-center gap-2 text-red-600 hover:bg-red-50 disabled:text-gray-400 disabled:cursor-not-allowed font-semibold py-2.5 px-6 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
