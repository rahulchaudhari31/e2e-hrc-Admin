import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  deleteAboutCTA,
  getAdminAboutCTA,
  saveAboutCTA,
} from '../../services/aboutUs/aboutCallToActionService';

const EMPTY_FORM = {
  title: '',
  description: '',
  button1Text: '',
  button1Link: '/submit-vacancy',
  button2Text: '',
  button2Link: '/submit-cv',
  isActive: true,
};

export default function AboutCallToActionAdmin() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadCTA();
  }, []);

  const loadCTA = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminAboutCTA();
      if (res && res.success && res.data) {
        setFormData({
          title: res.data.title || '',
          description: res.data.description || '',
          button1Text: res.data.button1Text || '',
          button1Link: res.data.button1Link || '/submit-vacancy',
          button2Text: res.data.button2Text || '',
          button2Link: res.data.button2Link || '/submit-cv',
          isActive: res.data.isActive !== false,
        });
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load About CTA');
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
    if (formError) setFormError('');
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setFormError('Title is required');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        button1Text: formData.button1Text.trim(),
        button1Link: formData.button1Link.trim(),
        button2Text: formData.button2Text.trim(),
        button2Link: formData.button2Link.trim(),
        isActive: Boolean(formData.isActive),
      };
      const res = await saveAboutCTA(payload);
      if (res && res.success) {
        toast.success('About Call to Action saved successfully');
        setFormError('');
        await loadCTA();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save About CTA');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Reset this section back to defaults? This clears saved content and cannot be undone.')) return;
    setIsDeleting(true);
    try {
      const res = await deleteAboutCTA();
      if (res && res.success) {
        toast.success('About CTA deleted');
        await loadCTA();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete About CTA');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div
        className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">About Call to Action</h2>
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
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5">
                  {formError}
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Enter title"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none"
                  placeholder="Enter description"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Button 1 Text</label>
                  <input
                    name="button1Text"
                    value={formData.button1Text}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="e.g. Submit a Vacancy"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Button 1 Link</label>
                  <input
                    name="button1Link"
                    value={formData.button1Link}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="/submit-vacancy"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Button 2 Text</label>
                  <input
                    name="button2Text"
                    value={formData.button2Text}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="e.g. Upload CV"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Button 2 Link</label>
                  <input
                    name="button2Link"
                    value={formData.button2Link}
                    onChange={handleFormChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="/submit-cv"
                  />
                </div>
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
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-60"
                >
                  {isDeleting ? <Loader2 size={16} className="animate-spin" /> : null}
                  Reset to Defaults
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors disabled:opacity-60"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {isSaving ? 'Saving...' : 'Save CTA'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}