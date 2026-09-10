import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { ChevronDown, ChevronUp, Save, Loader2 } from 'lucide-react';
import {
  getHowWeWorkSections,
  createHowWeWorkSection,
  updateHowWeWorkSection,
  deleteHowWeWorkSection,
} from '../../services/workforceSolution/howWeWorkSectionService';

const EMPTY_SECTION = { badgeText: '', sectionTitle: '', isActive: true };

const Toggle = ({ checked, onChange, name }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" name={name} checked={checked} onChange={onChange} className="sr-only peer" />
    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
  </label>
);

export default function HowWeWorkSectionManager() {
  const [isSectionExpanded, setIsSectionExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sectionId, setSectionId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_SECTION);

  useEffect(() => {
    fetchSection();
  }, []);

  const fetchSection = async () => {
    try {
      setIsLoading(true);
      const res = await getHowWeWorkSections();
      const items = Array.isArray(res.data) ? res.data : [];
      const latestSection = items[0] || null;
      if (latestSection) {
        setSectionId(latestSection._id);
        setFormData({
          badgeText: latestSection.badgeText || '',
          sectionTitle: latestSection.sectionTitle || '',
          isActive: latestSection.isActive ?? true,
        });
      } else {
        setSectionId(null);
        setFormData(EMPTY_SECTION);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load section data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validate = () => {
    if (!formData.badgeText?.trim()) {
      toast.error('Badge Text is required.');
      return false;
    }
    if (!formData.sectionTitle?.trim()) {
      toast.error('Section Title is required.');
      return false;
    }
    return true;
  };

  const saveSection = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      if (sectionId) {
        await updateHowWeWorkSection(sectionId, formData);
        toast.success('Section updated successfully!');
      } else {
        await createHowWeWorkSection(formData);
        toast.success('Section created successfully!');
      }
      fetchSection();
    } catch (error) {
      toast.error(error.message || 'Failed to save section.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
      {/* Header / Toggle */}
      <div
        className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer"
        onClick={() => setIsSectionExpanded(!isSectionExpanded)}
      >
        <div>
          <h3 className="text-lg font-bold text-gray-800">How We Work Section</h3>
          <p className="text-sm text-gray-500 mt-1">Manage the section header details</p>
        </div>
        <button className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
          {isSectionExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Form Content */}
      {isSectionExpanded && (
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 size={32} className="animate-spin text-orange-500" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Badge Text <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="badgeText"
                    value={formData.badgeText}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                    placeholder="e.g. OUR PROCESS"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="sectionTitle"
                    value={formData.sectionTitle}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                    placeholder="e.g. How We Work"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <label className="text-sm font-medium text-gray-700">Status:</label>
                <Toggle checked={formData.isActive} onChange={handleFormChange} name="isActive" />
                <span className="text-sm text-gray-600">{formData.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      {isSectionExpanded && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={saveSection}
            disabled={isLoading || isSaving}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-lg hover:bg-orange-600 disabled:bg-orange-300 transition-colors shadow-sm"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isSaving ? 'Saving...' : sectionId ? 'Update Section' : 'Create Section'}
          </button>
        </div>
      )}
    </div>
  );
}
