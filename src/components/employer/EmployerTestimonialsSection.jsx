import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Edit2, Trash2, Image as ImageIcon, X, Star } from 'lucide-react';

const emptyForm = {
  companyName: '',
  industry: '',
  reviewerName: '',
  reviewerDesignation: '',
  companyLogo: '',
  reviewerImage: '',
  order: 1,
  isActive: true,
};

// Reusable image upload slot used twice in the modal
function ImageUploadSlot({ label, value, onFileChange, onRemove, aspectClass = 'h-32' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div
        className={`mt-1 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center relative overflow-hidden group ${aspectClass}`}
      >
        {value ? (
          <>
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={onRemove}
                className="bg-white text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 shadow-sm"
              >
                <X size={14} /> Remove
              </button>
            </div>
          </>
        ) : (
          <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full text-gray-400 hover:text-orange-500 transition-colors">
            <ImageIcon size={24} className="mb-2 text-gray-300" />
            <span className="text-xs font-medium">Click to upload</span>
            <span className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, WEBP</span>
            <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
          </label>
        )}
      </div>
    </div>
  );
}

export default function EmployerTestimonialsSection({ data, onChange }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState(emptyForm);

  const testimonials = data || [];

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (formError) setFormError('');
  };

  const handleImageChange = (field) => (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, [field]: URL.createObjectURL(file) }));
    }
  };

  const removeImage = (field) => () => {
    setFormData(prev => ({ ...prev, [field]: '' }));
  };

  const openAddModal = () => {
    setEditingIndex(null);
    setFormData({ ...emptyForm, order: testimonials.length + 1 });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (index) => {
    setEditingIndex(index);
    setFormData({ ...testimonials[index] });
    setFormError('');
    setIsModalOpen(true);
  };

  const openDeleteModal = (index) => {
    setEditingIndex(index);
    setIsDeleteModalOpen(true);
  };

  const saveTestimonial = () => {
    if (!formData.companyName.trim()) {
      setFormError('Company Name is required.');
      return;
    }
    if (!formData.reviewerName.trim()) {
      setFormError('Reviewer Name is required.');
      return;
    }
    const updated = [...testimonials];
    if (editingIndex !== null) {
      updated[editingIndex] = formData;
    } else {
      updated.push(formData);
    }
    onChange('testimonials', updated);
    setIsModalOpen(false);
  };

  const deleteTestimonial = () => {
    if (editingIndex !== null) {
      onChange('testimonials', testimonials.filter((_, i) => i !== editingIndex));
    }
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* ── Card Header ────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">Testimonials Section</h2>
          <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-md">
            {testimonials.length} {testimonials.length === 1 ? 'Review' : 'Reviews'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => { e.stopPropagation(); openAddModal(); }}
            className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={16} /> Add Testimonial
          </button>
          {isExpanded
            ? <ChevronUp size={20} className="text-gray-500" />
            : <ChevronDown size={20} className="text-gray-500" />}
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────── */}
      {isExpanded && (
        <div className="overflow-x-auto">
          {testimonials.length === 0 ? (
            <div className="p-10 flex flex-col items-center justify-center text-gray-400 gap-3">
              <Star size={36} className="text-gray-200" />
              <p className="text-sm">
                No testimonials added yet. Click <strong className="text-gray-600">"Add Testimonial"</strong> to create one.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-white border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-medium w-14">Order</th>
                  <th className="p-4 font-medium w-16">Logo</th>
                  <th className="p-4 font-medium">Company</th>
                  <th className="p-4 font-medium hidden lg:table-cell">Industry</th>
                  <th className="p-4 font-medium hidden sm:table-cell">Reviewer</th>
                  <th className="p-4 font-medium hidden md:table-cell">Designation</th>
                  <th className="p-4 font-medium w-20">Status</th>
                  <th className="p-4 font-medium text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {testimonials.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm text-gray-500 font-medium">{item.order}</td>
                    <td className="p-4">
                      {item.companyLogo ? (
                        <img
                          src={item.companyLogo}
                          alt={item.companyName}
                          className="w-10 h-10 rounded-lg object-contain border border-gray-200 bg-white p-1"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                          <ImageIcon size={14} />
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-gray-800 text-sm">{item.companyName}</p>
                      <p className="text-xs text-gray-400 lg:hidden">{item.industry}</p>
                    </td>
                    <td className="p-4 hidden lg:table-cell text-sm text-gray-500">{item.industry}</td>
                    <td className="p-4 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        {item.reviewerImage ? (
                          <img src={item.reviewerImage} alt={item.reviewerName} className="w-7 h-7 rounded-full object-cover border border-gray-200 flex-shrink-0" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                            <ImageIcon size={12} className="text-gray-400" />
                          </div>
                        )}
                        <span className="text-sm text-gray-700 font-medium">{item.reviewerName}</span>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell text-sm text-gray-500">{item.reviewerDesignation}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(idx)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(idx)}
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

      {/* ── Add / Edit Modal ───────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-bold text-gray-800">
                {editingIndex !== null ? 'Edit Testimonial' : 'Add New Testimonial'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {formError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* ── Left Column ── */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                      placeholder="e.g. Acme Corp"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                    <input
                      type="text"
                      name="industry"
                      value={formData.industry}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                      placeholder="e.g. Information Technology"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reviewer Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="reviewerName"
                      value={formData.reviewerName}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                      placeholder="e.g. Jane Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reviewer Designation</label>
                    <input
                      type="text"
                      name="reviewerDesignation"
                      value={formData.reviewerDesignation}
                      onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                      placeholder="e.g. HR Director"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                      <input
                        type="number"
                        name="order"
                        value={formData.order}
                        onChange={handleFormChange}
                        min={1}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <div className="mt-2.5 flex items-center gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleFormChange}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
                        </label>
                        <span className="text-sm text-gray-600">{formData.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Right Column ── */}
                <div className="space-y-4">
                  <ImageUploadSlot
                    label="Company Logo"
                    value={formData.companyLogo}
                    onFileChange={handleImageChange('companyLogo')}
                    onRemove={removeImage('companyLogo')}
                    aspectClass="h-36"
                  />
                  <ImageUploadSlot
                    label="Reviewer Photo"
                    value={formData.reviewerImage}
                    onFileChange={handleImageChange('reviewerImage')}
                    onRemove={removeImage('reviewerImage')}
                    aspectClass="h-36"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveTestimonial}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
              >
                {editingIndex !== null ? 'Update Testimonial' : 'Save Testimonial'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ──────────────────────────────── */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Testimonial?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this testimonial? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteTestimonial}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 border border-transparent rounded-lg hover:bg-red-600 transition-colors shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
