import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Loader2, Star } from 'lucide-react';
import {
  getHowWeWorkSteps,
  createHowWeWorkStep,
  updateHowWeWorkStep,
  deleteHowWeWorkStep,
} from '../../services/workforceSolution/howWeWorkStepService';

const EMPTY_STEP = { stepNumber: '', title: '', description: '', order: 0, isActive: true };

const Toggle = ({ checked, onChange, name }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" name={name} checked={checked} onChange={onChange} className="sr-only peer" />
    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
  </label>
);

export default function HowWeWorkStepsManager() {
  const [steps, setSteps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState(EMPTY_STEP);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchSteps();
  }, []);

  const fetchSteps = async () => {
    try {
      setIsLoading(true);
      const res = await getHowWeWorkSteps();
      const items = Array.isArray(res.data) ? res.data : [];
      // Sort steps by order
      const sortedSteps = items.sort((a, b) => (a.order || 0) - (b.order || 0));
      setSteps(sortedSteps);
    } catch (error) {
      toast.error(error.message || 'Failed to load steps.');
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
    if (!formData.stepNumber?.toString().trim()) errs.stepNumber = 'Step Number is required.';
    if (!formData.title?.trim()) errs.title = 'Title is required.';
    if (formData.order === '' || isNaN(formData.order)) errs.order = 'Order must be numeric.';
    return errs;
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(EMPTY_STEP);
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (step) => {
    setEditingId(step._id);
    setFormData({
      stepNumber: step.stepNumber || '',
      title: step.title || '',
      description: step.description || '',
      order: step.order ?? 0,
      isActive: step.isActive ?? true,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openDeleteModal = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const saveStep = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setIsSaving(true);
    try {
      if (editingId) {
        await updateHowWeWorkStep(editingId, formData);
        toast.success('Step updated successfully!');
      } else {
        await createHowWeWorkStep(formData);
        toast.success('Step created successfully!');
      }
      setIsModalOpen(false);
      fetchSteps();
    } catch (error) {
      toast.error(error.message || 'Failed to save step.');
    } finally {
      setIsSaving(false);
    }
  };

  const doDeleteStep = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteHowWeWorkStep(deletingId);
      toast.success('Step deleted successfully!');
      setIsDeleteModalOpen(false);
      fetchSteps();
    } catch (error) {
      toast.error(error.message || 'Failed to delete step.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900">How We Work Steps</h3>
        <p className="text-sm text-gray-500 mt-1">Manage the individual steps displayed in the How We Work section.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-gray-50 border-b border-gray-200 gap-4">
          <div className="flex items-center gap-3">
            <h4 className="text-base font-semibold text-gray-800">All Steps</h4>
            {!isLoading && (
              <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-md">
                {steps.length} Steps
              </span>
            )}
          </div>
          <button
            onClick={steps.length >= 6 ? () => toast.error("Maximum 6 steps are allowed") : openAddModal}
            disabled={steps.length >= 6}
            className={`flex items-center gap-2 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm ${steps.length >= 6
              ? "bg-gray-300 cursor-not-allowed opacity-50"
              : "bg-orange-500 hover:bg-orange-600"
              }`}
          >
            <Plus size={16} />
            Add Step
          </button>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-16 flex justify-center">
              <Loader2 size={32} className="animate-spin text-orange-500" />
            </div>
          ) : steps.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
                <Star size={28} className="text-orange-300" />
              </div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">No Steps Found</h4>
              <p className="text-sm text-gray-400 mb-5">Click below to create your first How We Work step.</p>
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={16} /> Create First Step
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-medium">Sr. No.</th>
                  <th className="p-4 font-medium">Step Number</th>
                  <th className="p-4 font-medium">Title</th>
                  <th className="p-4 font-medium text-center">Order</th>
                  <th className="p-4 font-medium text-center">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {steps.map((step, idx) => (
                  <tr key={step._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm text-gray-600">{idx + 1}</td>
                    <td className="p-4 text-sm font-semibold text-gray-800">{step.stepNumber}</td>
                    <td className="p-4 text-sm text-gray-500 max-w-[220px] truncate" title={step.title}>
                      {step.title?.length > 80 ? step.title.substring(0, 80) + '...' : step.title}
                    </td>
                    <td className="p-4 text-sm text-gray-600 text-center">{step.order}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${step.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {step.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(step)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(step._id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Step Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-bold text-gray-800">{editingId ? 'Edit Step' : 'Add Step'}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Step Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="stepNumber"
                  value={formData.stepNumber}
                  onChange={handleFormChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors ${errors.stepNumber ? 'border-red-400' : 'border-gray-200'}`}
                  placeholder="e.g. 01"
                />
                {errors.stepNumber && <p className="text-xs text-red-500 mt-1">{errors.stepNumber}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors ${errors.title ? 'border-red-400' : 'border-gray-200'}`}
                  placeholder="e.g. Register Your Profile"
                />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows="3"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors border-gray-200 resize-none`}
                  placeholder="e.g. We begin by understanding your business..."
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors ${errors.order ? 'border-red-400' : 'border-gray-200'}`}
                  />
                  {errors.order && <p className="text-xs text-red-500 mt-1">{errors.order}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Toggle checked={formData.isActive} onChange={handleFormChange} name="isActive" />
                    <span className="text-sm text-gray-600">{formData.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3 rounded-b-xl flex-shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveStep}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-lg hover:bg-orange-600 disabled:bg-orange-300 transition-colors shadow-sm"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                {isSaving ? 'Saving...' : editingId ? 'Update Step' : 'Save Step'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Step?</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this How We Work step? This action cannot be undone.</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={doDeleteStep}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:bg-red-300 transition-colors shadow-sm"
              >
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : null}
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
