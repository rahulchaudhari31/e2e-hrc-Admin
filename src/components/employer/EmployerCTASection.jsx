import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Edit2, Trash2, X, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  createEmployerCTA,
  deleteEmployerCTA,
  getEmployerCTAs,
  updateEmployerCTA,
} from '../../services/employer/employerCTAService';

const EMPTY_FORM = {
  ctaTitle: '',
  ctaDescription: '',
  buttonText: '',
  buttonLink: '',
  isActive: true,
};

export default function EmployerCTASection() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [ctas, setCtas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCTA, setEditingCTA] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    loadCTAs();
  }, []);

  const loadCTAs = async () => {
    setIsLoading(true);
    try {
      const res = await getEmployerCTAs();
      setCtas(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error(error.message || 'Failed to load employer CTAs');
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingCTA(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (cta) => {
    setEditingCTA(cta);
    setFormData({
      ctaTitle: cta.ctaTitle || '',
      ctaDescription: cta.ctaDescription || '',
      buttonText: cta.buttonText || '',
      buttonLink: cta.buttonLink || '',
      isActive: cta.isActive !== false,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const openDeleteModal = (ctaId) => {
    setDeleteId(ctaId);
    setIsDeleteModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (formError) setFormError('');
  };

  const validateForm = () => {
    if (!formData.ctaTitle.trim()) {
      setFormError('CTA Title is required');
      return false;
    }
    if (!formData.buttonText.trim()) {
      setFormError('Button Text is required');
      return false;
    }
    return true;
  };

  const saveCTA = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      const payload = {
        ctaTitle: formData.ctaTitle.trim(),
        ctaDescription: formData.ctaDescription.trim(),
        buttonText: formData.buttonText.trim(),
        buttonLink: formData.buttonLink.trim(),
        isActive: Boolean(formData.isActive),
      };

      const res = editingCTA
        ? await updateEmployerCTA(editingCTA._id, payload)
        : await createEmployerCTA(payload);

      if (res && res.success) {
        toast.success('CTA saved successfully');
        setIsModalOpen(false);
        await loadCTAs();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save CTA');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCTA = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await deleteEmployerCTA(deleteId);
      if (res && res.success) {
        toast.success('CTA deleted successfully');
        setIsDeleteModalOpen(false);
        setDeleteId(null);
        await loadCTAs();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete CTA');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleActiveStatus = async (cta) => {
    setIsSaving(true);
    try {
      const payload = {
        ctaTitle: cta.ctaTitle,
        ctaDescription: cta.ctaDescription,
        buttonText: cta.buttonText,
        buttonLink: cta.buttonLink,
        isActive: !cta.isActive,
      };
      const res = await updateEmployerCTA(cta._id, payload);
      if (res && res.success) {
        toast.success('CTA status updated');
        await loadCTAs();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
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
          <h2 className="text-lg font-semibold text-gray-800">Employer CTA Section</h2>
          <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-md">
            {ctas.length} {ctas.length === 1 ? 'Card' : 'Cards'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openAddModal();
            }}
            className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={16} /> Add CTA
          </button>
          {isExpanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
        </div>
      </div>

      {isExpanded && (
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-sm text-gray-500">Loading CTA cards...</div>
          ) : ctas.length === 0 ? (
            <div className="p-10 flex flex-col items-center justify-center text-gray-400 gap-3">
              <p className="text-sm">No CTA cards added yet. Click <strong className="text-gray-600">"Add CTA"</strong> to create one.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-175">
              <thead>
                <tr className="bg-white border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-medium">Title</th>
                  <th className="p-4 font-medium hidden lg:table-cell">Description</th>
                  <th className="p-4 font-medium">Button Text</th>
                  <th className="p-4 font-medium hidden md:table-cell">Button Link</th>
                  <th className="p-4 font-medium w-24">Status</th>
                  <th className="p-4 font-medium text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ctas.map((cta) => (
                  <tr key={cta._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-gray-800 text-sm leading-snug">{cta.ctaTitle}</p>
                    </td>
                    <td className="p-4 hidden lg:table-cell text-sm text-gray-500 max-w-xs truncate">{cta.ctaDescription || 'No description'}</td>
                    <td className="p-4 text-sm text-gray-700">{cta.buttonText}</td>
                    <td className="p-4 hidden md:table-cell text-sm text-blue-600 break-all">{cta.buttonLink || '—'}</td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleActiveStatus(cta)}
                        className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full transition-colors ${cta.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        {cta.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(cta)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(cta._id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">{editingCTA ? 'Edit CTA' : 'Add CTA'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CTA Title <span className="text-red-500">*</span>
                </label>
                <input
                  name="ctaTitle"
                  value={formData.ctaTitle}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                  placeholder="Enter CTA title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CTA Description</label>
                <textarea
                  name="ctaDescription"
                  value={formData.ctaDescription}
                  onChange={handleFormChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors resize-none"
                  placeholder="Enter CTA description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Button Text <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="buttonText"
                    value={formData.buttonText}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                    placeholder="Enter button text"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                  <input
                    name="buttonLink"
                    value={formData.buttonLink}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                    placeholder="Enter button URL or text"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Active Status</label>
                <div className="mt-2 flex items-center gap-2">
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
                  <span className="text-sm text-gray-700">{formData.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveCTA}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-60"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>{isSaving ? 'Saving...' : 'Save CTA'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Delete CTA</h3>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">Are you sure you want to delete this CTA card? This action cannot be undone.</p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteCTA}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
