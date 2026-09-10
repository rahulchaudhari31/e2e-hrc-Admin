import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Save, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import {
  getAdminEmployeeCTA,
  createEmployeeCTA,
  updateEmployeeCTA,
} from '../../services/employee/employeeCTAService';

const EMPTY_CTA = { ctaTitle: '', ctaDescription: '', buttonText: '', buttonLink: '', isActive: true };

const Toggle = ({ checked, onChange, name }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" name={name} checked={checked} onChange={onChange} className="sr-only peer" />
    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
  </label>
);

export default function EmployeeCTAManager() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [ctaId, setCtaId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_CTA);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCTA();
  }, []);

  const fetchCTA = async () => {
    try {
      setIsLoading(true);
      const res = await getAdminEmployeeCTA();
      const items = Array.isArray(res.data) ? res.data : [];
      const cta = items[0] || null;

      if (cta) {
        setCtaId(cta._id);
        setFormData({
          ctaTitle: cta.ctaTitle || '',
          ctaDescription: cta.ctaDescription || '',
          buttonText: cta.buttonText || '',
          buttonLink: cta.buttonLink || '',
          isActive: cta.isActive ?? true,
        });
      } else {
        setCtaId(null);
        setFormData(EMPTY_CTA);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load CTA.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.ctaTitle?.trim()) errs.ctaTitle = 'CTA Title is required.';
    if (!formData.buttonText?.trim()) errs.buttonText = 'Button Text is required.';
    return errs;
  };

  const saveCTA = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ctaTitle: formData.ctaTitle.trim(),
        ctaDescription: formData.ctaDescription?.trim() || '',
        buttonText: formData.buttonText.trim(),
        buttonLink: formData.buttonLink?.trim() || '',
        isActive: formData.isActive === false ? false : true,
      };

      if (ctaId) {
        await updateEmployeeCTA(ctaId, payload);
        toast.success('CTA updated successfully!');
      } else {
        const response = await createEmployeeCTA(payload);
        const newCta = response.data || response;
        setCtaId(newCta._id);
        toast.success('CTA created successfully!');
      }
      fetchCTA();
    } catch (error) {
      toast.error(error.message || 'Failed to save CTA.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900">Call-to-Action (CTA)</h3>
        <p className="text-sm text-gray-500 mt-1">Manage the call-to-action displayed in the FAQ section.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer gap-4"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <h4 className="text-base font-semibold text-gray-800">CTA Settings</h4>
            {!isLoading && ctaId && (
              <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded-md">Active</span>
            )}
          </div>
          <div className="flex items-center gap-4">
            {isExpanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
          </div>
        </div>

        {isExpanded && (
          <div className="p-6 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-orange-500" size={32} />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CTA Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="ctaTitle"
                    value={formData.ctaTitle}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors ${
                      errors.ctaTitle ? 'border-red-400' : 'border-gray-200'
                    }`}
                    placeholder="e.g. Let's Build Your Workforce Together"
                  />
                  {errors.ctaTitle && <p className="text-xs text-red-500 mt-1">{errors.ctaTitle}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CTA Description</label>
                  <textarea
                    name="ctaDescription"
                    value={formData.ctaDescription}
                    onChange={handleFormChange}
                    rows={3}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors resize-none ${
                      errors.ctaDescription ? 'border-red-400' : 'border-gray-200'
                    }`}
                    placeholder="Enter CTA description..."
                  />
                  {errors.ctaDescription && <p className="text-xs text-red-500 mt-1">{errors.ctaDescription}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Button Text <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="buttonText"
                      value={formData.buttonText}
                      onChange={handleFormChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors ${
                        errors.buttonText ? 'border-red-400' : 'border-gray-200'
                      }`}
                      placeholder="e.g. Submit a Vacancy"
                    />
                    {errors.buttonText && <p className="text-xs text-red-500 mt-1">{errors.buttonText}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                    <input
                      type="text"
                      name="buttonLink"
                      value={formData.buttonLink}
                      onChange={handleFormChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors ${
                        errors.buttonLink ? 'border-red-400' : 'border-gray-200'
                      }`}
                      placeholder="e.g. /submit-vacancy or https://example.com"
                    />
                    {errors.buttonLink && <p className="text-xs text-red-500 mt-1">{errors.buttonLink}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className="flex items-center gap-2">
                    <Toggle
                      checked={formData.isActive}
                      onChange={handleFormChange}
                      name="isActive"
                    />
                    <span className="text-sm text-gray-600">{formData.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end">
          <button
            onClick={saveCTA}
            disabled={isSaving || isLoading}
            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-lg hover:bg-orange-600 transition-colors shadow-sm disabled:bg-orange-300"
          >
            {isSaving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save CTA</>}
          </button>
        </div>
      </div>
    </div>
  );
}
