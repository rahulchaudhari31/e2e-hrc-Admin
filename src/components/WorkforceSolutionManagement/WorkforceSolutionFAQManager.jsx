import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  getAdminWorkforceSolutionFAQs,
  createWorkforceSolutionFAQ,
  updateWorkforceSolutionFAQ,
  deleteWorkforceSolutionFAQ,
} from "../../services/workforceSolution/workforceSolutionFAQService";

const EMPTY_FAQ = { question: "", answer: "", order: 0, isActive: true };

const Toggle = ({ checked, onChange, name }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
      className="sr-only peer"
    />
    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
  </label>
);

export default function WorkforceSolutionFAQManager() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [faqs, setFaqs] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FAQ);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setIsLoading(true);
      const res = await getAdminWorkforceSolutionFAQs();
      const items = Array.isArray(res.data) ? res.data : [];
      const sortedFAQs = items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setFaqs(sortedFAQs);
    } catch (error) {
      toast.error(error.message || "Failed to load FAQs.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.question?.trim()) errs.question = "Question is required.";
    if (!formData.answer?.trim()) errs.answer = "Answer is required.";
    if (formData.order === "" || isNaN(formData.order))
      errs.order = "Order must be numeric.";
    return errs;
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(EMPTY_FAQ);
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (faq) => {
    setEditingId(faq._id);
    setFormData({
      question: faq.question || "",
      answer: faq.answer || "",
      order: faq.order ?? 0,
      isActive: faq.isActive ?? true,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openDeleteModal = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const saveFAQ = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        order: Number(formData.order) || 0,
        isActive: formData.isActive === false ? false : true,
      };

      if (editingId) {
        await updateWorkforceSolutionFAQ(editingId, payload);
        toast.success("FAQ updated successfully!");
      } else {
        await createWorkforceSolutionFAQ(payload);
        toast.success("FAQ created successfully!");
      }
      setIsModalOpen(false);
      fetchFAQs();
    } catch (error) {
      toast.error(error.message || "Failed to save FAQ.");
    } finally {
      setIsSaving(false);
    }
  };

  const doDeleteFAQ = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteWorkforceSolutionFAQ(deletingId);
      toast.success("FAQ deleted successfully!");
      setIsDeleteModalOpen(false);
      fetchFAQs();
    } catch (error) {
      toast.error(error.message || "Failed to delete FAQ.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900">FAQs</h3>
        <p className="text-sm text-gray-500 mt-1">
          Manage the frequently asked questions displayed in the FAQ section.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer gap-4"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <h4 className="text-base font-semibold text-gray-800">All FAQs</h4>
            {!isLoading && (
              <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-md">
                {faqs.length} FAQs
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();

                if (faqs.length >= 6) {
                  toast.error("Maximum 6 FAQs are allowed.");
                  return;
                }

                openAddModal();
              }}
              disabled={faqs.length >= 6}
              className={`flex items-center gap-1 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                faqs.length >= 6
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              <Plus size={16} />
              {faqs.length >= 6 ? "Maximum 6 FAQs" : "Add FAQ"}
            </button>
            {isExpanded ? (
              <ChevronUp size={20} className="text-gray-500" />
            ) : (
              <ChevronDown size={20} className="text-gray-500" />
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="p-0 overflow-x-auto">
            {isLoading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="animate-spin text-orange-500" size={32} />
              </div>
            ) : faqs.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
                  <Plus size={32} className="text-orange-300" />
                </div>
                <p className="text-gray-600 font-semibold">No FAQs yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Create your first FAQ to get started.
                </p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                    <th className="p-4 font-medium">Question</th>
                    <th className="p-4 font-medium hidden lg:table-cell">
                      Answer
                    </th>
                    <th className="p-4 font-medium hidden md:table-cell">
                      Order
                    </th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {faqs.map((faq) => (
                    <tr
                      key={faq._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4">
                        <p className="font-semibold text-gray-800 text-sm max-w-md truncate">
                          {faq.question}
                        </p>
                      </td>
                      <td className="p-4 hidden lg:table-cell text-sm text-gray-500 max-w-sm truncate">
                        {faq.answer}
                      </td>
                      <td className="p-4 hidden md:table-cell text-sm text-gray-500">
                        {faq.order}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${
                            faq.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {faq.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(faq)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(faq._id)}
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
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">
                {editingId ? "Edit FAQ" : "Add New FAQ"}
              </h3>
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
                  Question <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="question"
                  value={formData.question}
                  onChange={handleFormChange}
                  rows={2}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors resize-none ${
                    errors.question ? "border-red-400" : "border-gray-200"
                  }`}
                  placeholder="Enter question..."
                />
                {errors.question && (
                  <p className="text-xs text-red-500 mt-1">{errors.question}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Answer <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="answer"
                  value={formData.answer}
                  onChange={handleFormChange}
                  rows={4}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors resize-none ${
                    errors.answer ? "border-red-400" : "border-gray-200"
                  }`}
                  placeholder="Enter answer..."
                />
                {errors.answer && (
                  <p className="text-xs text-red-500 mt-1">{errors.answer}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors ${
                      errors.order ? "border-red-400" : "border-gray-200"
                    }`}
                    placeholder="0"
                  />
                  {errors.order && (
                    <p className="text-xs text-red-500 mt-1">{errors.order}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <div className="mt-2 flex items-center gap-2">
                    <Toggle
                      checked={formData.isActive}
                      onChange={handleFormChange}
                      name="isActive"
                    />
                    <span className="text-sm text-gray-600">
                      {formData.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={saveFAQ}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-lg hover:bg-orange-600 transition-colors shadow-sm disabled:bg-orange-300"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Saving...
                  </>
                ) : (
                  `${editingId ? "Update" : "Create"} FAQ`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Delete FAQ?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeletingId(null);
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={doDeleteFAQ}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 border border-transparent rounded-lg hover:bg-red-600 transition-colors shadow-sm disabled:bg-red-300"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Deleting...
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
