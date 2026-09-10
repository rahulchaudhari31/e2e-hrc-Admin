import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  createEmployerFAQ,
  deleteEmployerFAQ,
  getEmployerFAQs,
  updateEmployerFAQ,
} from "../../services/employer/employerFAQService";

const EMPTY_FORM = {
  question: "",
  answer: "",
  order: 1,
  isActive: true,
};

export default function EmployerFAQSection() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    loadFaqs();
  }, []);

  const loadFaqs = async () => {
    setIsLoading(true);
    try {
      const res = await getEmployerFAQs();
      setFaqs(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error(error.message || "Failed to load employer FAQs");
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingFAQ(null);
    setFormData({ ...EMPTY_FORM, order: faqs.length + 1 });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (faq) => {
    setEditingFAQ(faq);
    setFormData({
      question: faq.question || "",
      answer: faq.answer || "",
      order: faq.order || 1,
      isActive: faq.isActive !== false,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const openDeleteModal = (faqId) => {
    setDeleteId(faqId);
    setIsDeleteModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (formError) setFormError("");
  };

  const validateForm = () => {
    if (!formData.question.trim()) {
      setFormError("Question is required");
      return false;
    }
    if (!formData.answer.trim()) {
      setFormError("Answer is required");
      return false;
    }
    return true;
  };

  const saveFAQ = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      const payload = {
        question: formData.question.trim(),
        answer: formData.answer.trim(),
        order: Number(formData.order) || 0,
        isActive: Boolean(formData.isActive),
      };

      const res = editingFAQ
        ? await updateEmployerFAQ(editingFAQ._id, payload)
        : await createEmployerFAQ(payload);

      if (res && res.success) {
        toast.success("FAQ saved successfully");
        setIsModalOpen(false);
        await loadFaqs();
      }
    } catch (error) {
      toast.error(error.message || "Failed to save FAQ");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteFAQ = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await deleteEmployerFAQ(deleteId);
      if (res && res.success) {
        toast.success("FAQ deleted successfully");
        setIsDeleteModalOpen(false);
        setDeleteId(null);
        await loadFaqs();
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete FAQ");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleActiveStatus = async (faq) => {
    setIsSaving(true);
    try {
      const payload = {
        question: faq.question,
        answer: faq.answer,
        order: faq.order,
        isActive: !faq.isActive,
      };
      const res = await updateEmployerFAQ(faq._id, payload);
      if (res && res.success) {
        toast.success("FAQ status updated");
        await loadFaqs();
      }
    } catch (error) {
      toast.error(error.message || "Failed to update status");
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
          <h2 className="text-lg font-semibold text-gray-800">
            Employer FAQ Section
          </h2>
          <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-md">
            {faqs.length} {faqs.length === 1 ? "FAQ" : "FAQs"}
          </span>
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
            title={faqs.length >= 6 ? "Maximum 6 FAQs are allowed" : "Add FAQ"}
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
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-sm text-gray-500">Loading FAQs...</div>
          ) : faqs.length === 0 ? (
            <div className="p-10 flex flex-col items-center justify-center text-gray-400 gap-3">
              <p className="text-sm">
                No employer FAQs added yet. Click{" "}
                <strong className="text-gray-600">"Add FAQ"</strong> to create
                one.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-white border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-medium w-16">Order</th>
                  <th className="p-4 font-medium">Question</th>
                  <th className="p-4 font-medium hidden md:table-cell">
                    Answer Preview
                  </th>
                  <th className="p-4 font-medium w-24">Status</th>
                  <th className="p-4 font-medium text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {faqs.map((faq) => (
                  <tr
                    key={faq._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 text-sm text-gray-500 font-medium">
                      {faq.order}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-gray-800 text-sm leading-snug">
                        {faq.question}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 md:hidden">
                        {faq.answer?.slice(0, 60)}
                        {faq.answer?.length > 60 ? "…" : ""}
                      </p>
                    </td>
                    <td className="p-4 hidden md:table-cell text-sm text-gray-500 max-w-xs">
                      {faq.answer?.slice(0, 120)}
                      {faq.answer?.length > 120 ? "…" : ""}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => toggleActiveStatus(faq)}
                        className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full transition-colors ${faq.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                      >
                        {faq.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-1">
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

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">
                {editingFAQ ? "Edit FAQ" : "Add FAQ"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
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
                  Question <span className="text-red-500">*</span>
                </label>
                <input
                  name="question"
                  value={formData.question}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                  placeholder="Enter FAQ question"
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
                  placeholder="Enter FAQ answer"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Active Status
                  </label>
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
                    <span className="text-sm text-gray-700">
                      {formData.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
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
                onClick={saveFAQ}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-60"
              >
                {isSaving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                <span>{isSaving ? "Saving..." : "Save FAQ"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Delete FAQ</h3>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete this FAQ? This action cannot be
                undone.
              </p>
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
                onClick={deleteFAQ}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
