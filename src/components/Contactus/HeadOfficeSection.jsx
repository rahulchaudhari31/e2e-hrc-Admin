import React, { useState, useEffect } from 'react';
import { Save, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAdminHeadOffice,
  createHeadOffice,
  updateHeadOffice,
  deleteHeadOffice,
} from '../../services/contactUs/headOfficeService';

const EMPTY_FORM = {
  title: '',
  address_line: '',
  city: '',
  state: '',
  postal_code: '',
  country: '',
  opening_hours_title: '',
  opening_hours: '',
  global_inquiries_title: '',
  global_inquiries_description: '',
  is_active: true,
};

export default function HeadOfficeSection() {
  const [headOfficeData, setHeadOfficeData] = useState(null);
  const [headOfficeId, setHeadOfficeId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadHeadOffice();
  }, []);

  const loadHeadOffice = async () => {
    setIsLoading(true);
    try {
      const response = await getAdminHeadOffice();
      if (response?.success && response.data) {
        setHeadOfficeId(response.data._id);
        setHeadOfficeData(response.data);
        setFormData({
          title: response.data.title || '',
          address_line: response.data.address_line || '',
          city: response.data.city || '',
          state: response.data.state || '',
          postal_code: response.data.postal_code || '',
          country: response.data.country || '',
          opening_hours_title: response.data.opening_hours_title || '',
          opening_hours: response.data.opening_hours || '',
          global_inquiries_title: response.data.global_inquiries_title || '',
          global_inquiries_description: response.data.global_inquiries_description || '',
          is_active: response.data.is_active ?? true,
        });
      } else {
        setHeadOfficeData(null);
        setHeadOfficeId(null);
        setFormData(EMPTY_FORM);
      }
    } catch (error) {
      setHeadOfficeData(null);
      setHeadOfficeId(null);
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

  const validate = () => {
    const newErrors = {};
    if (!formData.title?.trim()) newErrors.title = 'Title is required';
    if (!formData.address_line?.trim()) newErrors.address_line = 'Address line is required';
    if (!formData.city?.trim()) newErrors.city = 'City is required';
    if (!formData.postal_code?.trim()) newErrors.postal_code = 'Postal code is required';
    if (!formData.country?.trim()) newErrors.country = 'Country is required';
    if (!formData.opening_hours_title?.trim()) newErrors.opening_hours_title = 'Opening hours title is required';
    if (!formData.opening_hours?.trim()) newErrors.opening_hours = 'Opening hours is required';
    if (!formData.global_inquiries_title?.trim()) newErrors.global_inquiries_title = 'Global inquiries title is required';
    if (!formData.global_inquiries_description?.trim())
      newErrors.global_inquiries_description = 'Global inquiries description is required';

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
      const payload = {
        title: formData.title.trim(),
        address_line: formData.address_line.trim(),
        city: formData.city.trim(),
        state: formData.state?.trim() || '',
        postal_code: formData.postal_code.trim(),
        country: formData.country.trim(),
        opening_hours_title: formData.opening_hours_title.trim(),
        opening_hours: formData.opening_hours.trim(),
        global_inquiries_title: formData.global_inquiries_title.trim(),
        global_inquiries_description: formData.global_inquiries_description.trim(),
        is_active: formData.is_active,
      };

      let response;
      if (headOfficeId) {
        response = await updateHeadOffice(headOfficeId, payload);
        if (response?.success) {
          toast.success('Head Office updated successfully');
        }
      } else {
        response = await createHeadOffice(payload);
        if (response?.success) {
          toast.success('Head Office created successfully');
        }
      }

      await loadHeadOffice();
    } catch (error) {
      toast.error(error.message || 'Failed to save Head Office');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!headOfficeId) return;

    if (!confirm('Are you sure you want to delete this Head Office record?')) {
      return;
    }

    setIsSaving(true);
    try {
      await deleteHeadOffice(headOfficeId);
      toast.success('Head Office deleted successfully');
      await loadHeadOffice();
    } catch (error) {
      toast.error(error.message || 'Failed to delete Head Office');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-orange-500" />
        <span className="ml-2 text-gray-600">Loading Head Office...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mx-4 mb-6">
      <div className="px-6 py-5 bg-gray-50 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Head Office</h2>
        <p className="text-sm text-gray-500 mt-1">Manage head office location and contact information</p>
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
              placeholder="e.g., Head Office Birmingham"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1.5">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address Line <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address_line"
              value={formData.address_line}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors text-gray-900 ${
                errors.address_line ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="Street address"
            />
            {errors.address_line && <p className="text-red-500 text-xs mt-1.5">{errors.address_line}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors text-gray-900 ${
                errors.city ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="City"
            />
            {errors.city && <p className="text-red-500 text-xs mt-1.5">{errors.city}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors text-gray-900"
              placeholder="State/Province"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Postal Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors text-gray-900 ${
                errors.postal_code ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="Postal code"
            />
            {errors.postal_code && <p className="text-red-500 text-xs mt-1.5">{errors.postal_code}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors text-gray-900 ${
                errors.country ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="Country"
            />
            {errors.country && <p className="text-red-500 text-xs mt-1.5">{errors.country}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opening Hours Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="opening_hours_title"
              value={formData.opening_hours_title}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors text-gray-900 ${
                errors.opening_hours_title ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="Opening Hours"
            />
            {errors.opening_hours_title && <p className="text-red-500 text-xs mt-1.5">{errors.opening_hours_title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Global Inquiries Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="global_inquiries_title"
              value={formData.global_inquiries_title}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors text-gray-900 ${
                errors.global_inquiries_title ? 'border-red-400 bg-red-50' : 'border-gray-200'
              }`}
              placeholder="Global Inquiries"
            />
            {errors.global_inquiries_title && <p className="text-red-500 text-xs mt-1.5">{errors.global_inquiries_title}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Opening Hours <span className="text-red-500">*</span>
          </label>
          <textarea
            name="opening_hours"
            value={formData.opening_hours}
            onChange={handleChange}
            rows={3}
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors text-gray-900 resize-none ${
              errors.opening_hours ? 'border-red-400 bg-red-50' : 'border-gray-200'
            }`}
            placeholder="e.g., Monday – Friday: 09:00 – 18:00&#10;Saturday – Sunday: Closed"
          />
          {errors.opening_hours && <p className="text-red-500 text-xs mt-1.5">{errors.opening_hours}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Global Inquiries Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="global_inquiries_description"
            value={formData.global_inquiries_description}
            onChange={handleChange}
            rows={3}
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors text-gray-900 resize-none ${
              errors.global_inquiries_description ? 'border-red-400 bg-red-50' : 'border-gray-200'
            }`}
            placeholder="e.g., Available via virtual consultation in GMT, GST and IST time zones"
          />
          {errors.global_inquiries_description && (
            <p className="text-red-500 text-xs mt-1.5">{errors.global_inquiries_description}</p>
          )}
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
                {headOfficeId ? 'Update' : 'Save'}
              </>
            )}
          </button>

          {headOfficeId && (
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
