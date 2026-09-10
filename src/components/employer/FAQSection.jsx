import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Edit2, Trash2, X, HelpCircle } from 'lucide-react';

const emptyForm = {
  question: '',
  answer: '',
  order: 1,
  isActive: true,
};

export default function FAQSection({ data, onChange }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState(emptyForm);

  const faqs = data || [];

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (formError) setFormError('');
  };

  const openAddModal = () => {
    setEditingIndex(null);
    setFormData({ ...emptyForm, order: faqs.length + 1 });
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (index) => {
    setEditingIndex(index);
    setFormData({ ...faqs[index] });
    setFormError('');
    setIsModalOpen(true);
  };

  const openDeleteModal = (index) => {
    setEditingIndex(index);
    setIsDeleteModalOpen(true);
  };

  const saveFAQ = () => {
    if (!formData.question.trim()) {
      setFormError('Question is required.');
      return;
    }
    if (!formData.answer.trim()) {
      setFormError('Answer is required.');
      return;
    }
    const updated = [...faqs];
    if (editingIndex !== null) {
      updated[editingIndex] = formData;
    } else {
      updated.push(formData);
    }
    onChange('faqs', updated);
    setIsModalOpen(false);
  };

  const deleteFAQ = () => {
    if (editingIndex !== null) {
      onChange('faqs', faqs.filter((_, i) => i !== editingIndex));
    }
    setIsDeleteModalOpen(false);
  };

  // Truncate answer for table preview
  const truncate = (str, len = 60) =>
    str && str.length > len ? str.slice(0, len) + '…' : str;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* ── Card Header ────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">FAQ Section</h2>
          <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-md">
            {faqs.length} {faqs.length === 1 ? 'FAQ' : 'FAQs'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => { e.stopPropagation(); openAddModal(); }}
            className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={16} /> Add FAQ
          </button>
          {isExpanded
            ? <ChevronUp size={20} className="text-gray-500" />
            : <ChevronDown size={20} className="text-gray-500" />}
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────── */}
      {isExpanded && (
        <div className="overflow-x-auto">
          {faqs.length === 0 ? (
            <div className="p-10 flex flex-col items-center justify-center text-gray-400 gap-3">
              <HelpCircle size={36} className="text-gray-200" />
              <p className="text-sm">No FAQs added yet. Click <strong className="text-gray-600">"Add FAQ"</strong> to create one.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-white border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-medium w-16">Order</th>
                  <th className="p-4 font-medium">Question</th>
                  <th className="p-4 font-medium hidden md:table-cell">Answer Preview</th>
                  <th className="p-4 font-medium w-20">Status</th>
                  <th className="p-4 font-medium text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {faqs.map((faq, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm text-gray-500 font-medium">{faq.order}</td>
                    <td className="p-4">
                      <p className="font-semibold text-gray-800 text-sm leading-snug">{faq.question}</p>
                      <p className="text-xs text-gray-400 mt-0.5 md:hidden">{truncate(faq.answer, 50)}</p>
                    </td>
                    <td className="p-4 hidden md:table-cell text-sm text-gray-500 max-w-xs">
                      {truncate(faq.answer)}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${faq.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {faq.isActive ? 'Active' : 'Inactive'}
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-bold text-gray-800">
                {editingIndex !== null ? 'Edit FAQ' : 'Add New FAQ'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="question"
                  value={formData.question}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                  placeholder="e.g. What services do you offer for employers?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Answer <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="answer"
                  value={formData.answer}
                  onChange={handleFormChange}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors resize-none"
                  placeholder="Enter the answer here..."
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
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                    min={1}
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

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3 flex-shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveFAQ}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
              >
                {editingIndex !== null ? 'Update FAQ' : 'Save FAQ'}
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
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete FAQ?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this FAQ? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteFAQ}
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
