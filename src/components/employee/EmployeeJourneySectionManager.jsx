import React, { useEffect, useState } from 'react';
import { Save, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getEmployeeJourneySections,
  createEmployeeJourneySection,
  updateEmployeeJourneySection,
  deleteEmployeeJourneySection
} from '../../services/employee/employeeJourneySectionService';

const EMPTY_FORM = {
  badgeText: '',
  sectionTitle: '',
  isActive: true,
};

export default function EmployeeJourneySectionManager() {
  const [sectionLoading, setSectionLoading] = useState(true);
  const [sectionSaving, setSectionSaving] = useState(false);
  const [sectionDeleting, setSectionDeleting] = useState(false);
  
  const [currentSectionId, setCurrentSectionId] = useState(null);
  const [sectionForm, setSectionForm] = useState(EMPTY_FORM);
  const [sectionError, setSectionError] = useState({});

  useEffect(() => {
    loadSection();
  }, []);

  const loadSection = async () => {
    setSectionLoading(true);
    try {
      const response = await getEmployeeJourneySections();
      const items = Array.isArray(response?.data) ? response.data : [];
      // Use active record if exists, else latest
      const activeItem = items.find(item => item.isActive);
      const targetItem = activeItem || items[0] || null;

      if (targetItem) {
        setCurrentSectionId(targetItem._id);
        setSectionForm({
          badgeText: targetItem.badgeText || '',
          sectionTitle: targetItem.sectionTitle || '',
          isActive: targetItem.isActive !== undefined ? targetItem.isActive : true,
        });
      } else {
        resetForm();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to load section data');
    } finally {
      setSectionLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentSectionId(null);
    setSectionForm(EMPTY_FORM);
    setSectionError({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSectionForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (sectionError[name]) setSectionError((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!sectionForm.sectionTitle.trim()) newErrors.sectionTitle = 'Section Title is required.';
    setSectionError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (sectionSaving) return;
    setSectionSaving(true);
    try {
      if (currentSectionId) {
        const response = await updateEmployeeJourneySection(currentSectionId, sectionForm);
        if (response?.success) {
          toast.success('Employee Journey section updated successfully');
          await loadSection();
        }
      } else {
        const response = await createEmployeeJourneySection(sectionForm);
        if (response?.success) {
          toast.success('Employee Journey section created successfully');
          await loadSection();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save section');
    } finally {
      setSectionSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentSectionId) return;
    if (!window.confirm('Are you sure you want to delete this section?')) return;
    setSectionDeleting(true);
    try {
      const response = await deleteEmployeeJourneySection(currentSectionId);
      if (response?.success) {
        toast.success('Employee Journey section deleted successfully');
        resetForm();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete section');
    } finally {
      setSectionDeleting(false);
    }
  };

  if (sectionLoading) {
    return (
      <div className="p-8 text-center text-sm text-gray-500">
        Loading Employee Journey Section...
      </div>
    );
  }

  return (
    <div className="p-5 border-b border-gray-100">
      <h3 className="text-md font-semibold text-gray-800 mb-4">Section Header</h3>
      <div className="space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Badge Text
          </label>
          <input
            type="text"
            name="badgeText"
            value={sectionForm.badgeText}
            onChange={handleChange}
            placeholder="e.g. TRUSTED DIGITAL SOLUTIONS"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Section Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="sectionTitle"
            value={sectionForm.sectionTitle}
            onChange={handleChange}
            placeholder="e.g. Why Choose Our Employee Journey Services?"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors ${
              sectionError.sectionTitle ? 'border-red-400' : 'border-gray-200'
            }`}
          />
          {sectionError.sectionTitle && (
            <p className="text-xs text-red-500 mt-1">{sectionError.sectionTitle}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              checked={sectionForm.isActive}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
          </label>
          <span className="text-sm text-gray-700">
            {sectionForm.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
        <button
          type="button"
          onClick={handleSave}
          disabled={sectionSaving}
          className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-sm text-sm"
        >
          {sectionSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {sectionSaving
            ? 'Saving...'
            : currentSectionId
            ? 'Update Section'
            : 'Create Section'}
        </button>

        {currentSectionId && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={sectionDeleting}
            className="inline-flex items-center justify-center gap-1.5 text-red-500 hover:text-red-600 text-sm font-medium px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 size={15} />
            {sectionDeleting ? 'Deleting...' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  );
}
