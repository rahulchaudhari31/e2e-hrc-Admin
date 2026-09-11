import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAdminHowWeWorkSection,
  saveHowWeWorkSection,
} from '../../services/employer/employerHowWeWorkSectionService';

const EMPTY_FORM = {
  badgeText: 'HOW WE WORK',
  sectionTitle: 'How We Work',
  sectionDescription: '',
  isActive: true,
};

export default function EmployerHowWeWorkHeaderAdmin() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    loadSection();
  }, []);

  const loadSection = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminHowWeWorkSection();
      if (res && res.success && res.data) {
        setFormData({
          badgeText: res.data.badgeText || '',
          sectionTitle: res.data.sectionTitle || '',
          sectionDescription: res.data.sectionDescription || '',
          isActive: res.data.isActive !== false,
        });
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load How We Work section');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        badgeText: formData.badgeText.trim(),
        sectionTitle: formData.sectionTitle.trim(),
        sectionDescription: formData.sectionDescription.trim(),
        isActive: Boolean(formData.isActive),
      };
      const res = await saveHowWeWorkSection(payload);
      if (res && res.success) {
        toast.success('How We Work section saved successfully');
        await loadSection();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save How We Work section');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div
        className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">How We Work Section Header</h2>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${formData.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            {formData.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        {isExpanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
      </div>

      {isExpanded && (
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-orange-500" />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Badge Text</label>
                <input
                  name="badgeText"
                  value={formData.badgeText}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="e.g. HOW WE WORK"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Section Title</label>
                <input
                  name="sectionTitle"
                  value={formData.sectionTitle}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="e.g. How We Work"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Section Description</label>
                <textarea
                  name="sectionDescription"
                  value={formData.sectionDescription}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none"
                  placeholder="Optional short description under the title"
                />
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-3 py-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleFormChange}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
                </label>
                <span className="text-sm text-gray-700">Active</span>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors disabled:opacity-60"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {isSaving ? 'Saving...' : 'Save Section'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}