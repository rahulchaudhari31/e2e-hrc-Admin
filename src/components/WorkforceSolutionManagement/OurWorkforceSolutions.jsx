import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Loader2,
  Star,
  Layout,
  ChevronDown,
  ChevronUp,
  Save,
} from "lucide-react";
import {
  getAllWorkforceSolutionsAdmin,
  createWorkforceSolution,
  updateWorkforceSolution,
  deleteWorkforceSolution,
} from "../../services/workforceSolution/workforceSolutionsCardsService";
import {
  getAllSectionsAdmin,
  createSection,
  updateSection,
  deleteSection,
} from "../../services/workforceSolution/workforceSolutionSectionService";

// ─── Shared Toggle ────────────────────────────────────────────────────────────
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

// ─── Section Panel ────────────────────────────────────────────────────────────
const EMPTY_SECTION = {
  badgeText: "WHAT WE OFFER",
  titleLine1: "",
  highlightedTitle: "",
  description: "",
  isActive: true,
};

function SectionPanel() {
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
      const res = await getAllSectionsAdmin();
      const items = Array.isArray(res.data) ? res.data : [];
      const latestSection = items[0] || null;
      if (latestSection) {
        setSectionId(latestSection._id);
        setFormData({
          badgeText: latestSection.badgeText || "",
          titleLine1: latestSection.titleLine1 || "",
          highlightedTitle: latestSection.highlightedTitle || "",
          description: latestSection.description || "",
          isActive: latestSection.isActive ?? true,
        });
      } else {
        setSectionId(null);
        setFormData(EMPTY_SECTION);
      }
    } catch {
      toast.error("Failed to load section data.");
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
  };

  const validate = () => {
    if (!formData.titleLine1?.trim()) {
      toast.error("Title Line 1 is required.");
      return false;
    }
    if (!formData.highlightedTitle?.trim()) {
      toast.error("Highlighted Title is required.");
      return false;
    }
    if (!formData.description?.trim()) {
      toast.error("Description is required.");
      return false;
    }
    return true;
  };

  const saveSection = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      if (sectionId) {
        await updateSection(sectionId, formData);
        toast.success("Section updated successfully!");
      } else {
        await createSection(formData);
        toast.success("Section created successfully!");
      }
      fetchSection();
    } catch (error) {
      toast.error(error.message || "Failed to save section.");
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
          <h3 className="text-lg font-bold text-gray-800">
            Our Workforce Solutions Section
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage the section header details
          </p>
        </div>
        <button className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
          {isSectionExpanded ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
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
                    Badge Text
                  </label>
                  <input
                    type="text"
                    name="badgeText"
                    value={formData.badgeText}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                    placeholder="e.g. WHAT WE OFFER"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title Line 1 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="titleLine1"
                    value={formData.titleLine1}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                    placeholder="e.g. Need highly"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Highlighted Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="highlightedTitle"
                    value={formData.highlightedTitle}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                    placeholder="e.g. Skilled staff?"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors resize-none"
                  placeholder="e.g. Connect with us..."
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <label className="text-sm font-medium text-gray-700">
                  Status:
                </label>
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
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {isSaving
              ? "Saving..."
              : sectionId
                ? "Update Section"
                : "Create Section"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Cards Panel ──────────────────────────────────────────────────────────────
const EMPTY_CARD = {
  cardTitle: "",
  cardDescription: "",
  order: 0,
  isActive: true,
};

function CardsPanel() {
  const [solutions, setSolutions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState(EMPTY_CARD);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchSolutions();
  }, []);

  const fetchSolutions = async () => {
    try {
      setIsLoading(true);
      const res = await getAllWorkforceSolutionsAdmin();
      setSolutions(res.data || []);
    } catch {
      toast.error("Failed to load workforce solution cards.");
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
    if (!formData.cardTitle?.trim()) errs.cardTitle = "Card title is required.";
    if (!formData.cardDescription?.trim())
      errs.cardDescription = "Card description is required.";
    if (formData.order === "" || isNaN(formData.order))
      errs.order = "Display order must be numeric.";
    return errs;
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(EMPTY_CARD);
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (solution) => {
    setEditingId(solution._id);
    setFormData({
      cardTitle: solution.cardTitle || "",
      cardDescription: solution.cardDescription || "",
      order: solution.order ?? 0,
      isActive: solution.isActive ?? true,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openDeleteModal = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const saveSolution = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setIsSaving(true);
    try {
      if (editingId) {
        await updateWorkforceSolution(editingId, formData);
        toast.success("Card updated successfully!");
      } else {
        await createWorkforceSolution(formData);
        toast.success("Card created successfully!");
      }
      setIsModalOpen(false);
      fetchSolutions();
    } catch (error) {
      toast.error(error.message || "Failed to save card.");
    } finally {
      setIsSaving(false);
    }
  };

  const doDeleteSolution = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteWorkforceSolution(deletingId);
      toast.success("Card deleted successfully!");
      setIsDeleteModalOpen(false);
      fetchSolutions();
    } catch (error) {
      toast.error(error.message || "Failed to delete card.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900">Solution Cards</h3>
        <p className="text-sm text-gray-500 mt-1">
          Manage the individual workforce solution cards displayed on the
          website.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-gray-50 border-b border-gray-200 gap-4">
          <div className="flex items-center gap-3">
            <h4 className="text-base font-semibold text-gray-800">All Cards</h4>
            {!isLoading && (
              <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-md">
                {solutions.length} Cards
              </span>
            )}
          </div>
          <button
            onClick={() => {
              if (solutions.length >= 6) {
                toast.error("Maximum 6 cards are allowed.");
                return;
              }

              openAddModal();
            }}
            disabled={solutions.length >= 6}
            className={`flex items-center gap-2 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm ${
              solutions.length >= 6
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            <Plus size={16} />
            {solutions.length >= 6 ? "Maximum 6 Cards" : "Add Card"}
          </button>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-16 flex justify-center">
              <Loader2 size={32} className="animate-spin text-orange-500" />
            </div>
          ) : solutions.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
                <Star size={28} className="text-orange-300" />
              </div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">
                No Cards Found
              </h4>
              <p className="text-sm text-gray-400 mb-5">
                Click below to create your first workforce solution card.
              </p>
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Plus size={16} /> Create First Card
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-medium">Sr. No.</th>
                  <th className="p-4 font-medium">Card Title</th>
                  <th className="p-4 font-medium">Description</th>
                  <th className="p-4 font-medium text-center">Display Order</th>
                  <th className="p-4 font-medium text-center">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {solutions.map((item, idx) => (
                  <tr
                    key={item._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 text-sm text-gray-600">{idx + 1}</td>
                    <td className="p-4 text-sm font-semibold text-gray-800">
                      {item.cardTitle}
                    </td>
                    <td
                      className="p-4 text-sm text-gray-500 max-w-[220px] truncate"
                      title={item.cardDescription}
                    >
                      {item.cardDescription?.length > 80
                        ? item.cardDescription.substring(0, 80) + "..."
                        : item.cardDescription}
                    </td>
                    <td className="p-4 text-sm text-gray-600 text-center">
                      {item.order}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(item._id)}
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

      {/* Card Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-bold text-gray-800">
                {editingId ? "Edit Card" : "Add Card"}
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
                  Card Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="cardTitle"
                  value={formData.cardTitle}
                  onChange={handleFormChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors ${errors.cardTitle ? "border-red-400" : "border-gray-200"}`}
                />
                {errors.cardTitle && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.cardTitle}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="cardDescription"
                  value={formData.cardDescription}
                  onChange={handleFormChange}
                  rows={3}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors resize-none ${errors.cardDescription ? "border-red-400" : "border-gray-200"}`}
                />
                {errors.cardDescription && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.cardDescription}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors ${errors.order ? "border-red-400" : "border-gray-200"}`}
                  />
                  {errors.order && (
                    <p className="text-xs text-red-500 mt-1">{errors.order}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex items-center gap-2 mt-1">
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
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3 rounded-b-xl flex-shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveSolution}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-lg hover:bg-orange-600 disabled:bg-orange-300 transition-colors shadow-sm"
              >
                {isSaving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : null}
                {isSaving
                  ? "Saving..."
                  : editingId
                    ? "Update Card"
                    : "Save Card"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Delete Card?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this workforce solution card? This
              action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={doDeleteSolution}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:bg-red-300 transition-colors shadow-sm"
              >
                {isDeleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : null}
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function OurWorkforceSolutions() {
  return (
    <div className="mt-12 relative">
      <Toaster position="top-right" />

      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Our Workforce Solutions
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage the section header and solution cards displayed on the website.
        </p>
      </div>

      <SectionPanel />
      <CardsPanel />
    </div>
  );
}
