import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X, MoveVertical } from "lucide-react";
import toast from "react-hot-toast";
import {
  getEmployeeJourneyCards,
  createEmployeeJourneyCard,
  updateEmployeeJourneyCard,
  deleteEmployeeJourneyCard,
} from "../../services/employee/employeeJourneyCardService";

export default function EmployeeJourneyCardsManager() {
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [editingCard, setEditingCard] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    setIsLoading(true);
    try {
      const response = await getEmployeeJourneyCards();
      setCards(Array.isArray(response?.data) ? response.data : []);
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Failed to load cards",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      order: cards.length + 1,
      isActive: true,
    });
    setEditingCard(null);
  };

  const handleOpenModal = (card = null) => {
    if (card) {
      setEditingCard(card);
      setFormData({
        title: card.title,
        description: card.description || "",
        order: card.order,
        isActive: card.isActive !== undefined ? card.isActive : true,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setIsSaving(true);
    try {
      if (editingCard) {
        const response = await updateEmployeeJourneyCard(
          editingCard._id,
          formData,
        );
        if (response?.success) {
          toast.success("Employee Journey card updated successfully");
          await loadCards();
          handleCloseModal();
        }
      } else {
        const response = await createEmployeeJourneyCard(formData);
        if (response?.success) {
          toast.success("Employee Journey card created successfully");
          await loadCards();
          handleCloseModal();
        }
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Failed to save card",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const response = await deleteEmployeeJourneyCard(deletingId);
      if (response?.success) {
        toast.success("Employee Journey card deleted successfully");
        await loadCards();
        setIsDeleteModalOpen(false);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Failed to delete card",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-sm text-gray-500">
        Loading cards...
      </div>
    );
  }

  return (
    <div className="p-0">
      <div className="p-5 flex items-center justify-between bg-white border-b border-gray-100">
        <h3 className="text-md font-semibold text-gray-800">
          Cards Management
        </h3>
        <button
          onClick={() => {
            if (cards.length >= 6) {
              toast.error("Maximum 6 cards are allowed.");
              return;
            }

            handleOpenModal();
          }}
          disabled={cards.length >= 6}
          className={`flex items-center gap-2 text-sm font-medium text-white px-3 py-1.5 rounded-lg transition-colors ${
            cards.length >= 6
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-orange-500 hover:bg-orange-600"
          }`}
          title={cards.length >= 6 ? "Maximum 6 cards are allowed" : "Add Card"}
        >
          <Plus size={16} />
          {cards.length >= 6 ? "Maximum 6 Cards" : "Add Card"}
        </button>
      </div>

      <div className="overflow-x-auto">
        {cards.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-white">
            <p>No cards added yet.</p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-2 text-orange-500 font-medium hover:underline"
            >
              Create your first card
            </button>
          </div>
        ) : (
          <table className="w-full text-left border-collapse bg-white">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-medium w-20 text-center">Order</th>
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium hidden md:table-cell">
                  Created Date
                </th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cards.map((card) => (
                <tr
                  key={card._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-gray-500">
                      <MoveVertical size={14} className="opacity-50" />
                      <span className="font-medium text-sm">{card.order}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-gray-800 text-sm">
                      {card.title}
                    </p>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${card.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                    >
                      {card.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4 hidden md:table-cell text-xs text-gray-500">
                    {new Date(card.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenModal(card)}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => confirmDelete(card._id)}
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">
                {editingCard ? "Edit Card" : "Create Card"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form id="cardForm" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                    placeholder="e.g. Register"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors resize-y min-h-[90px]"
                    placeholder="Enter card description (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleFormChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                  />
                </div>

                <div className="pt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Active Status
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleFormChange}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                    <span className="ml-3 text-sm font-medium text-gray-600">
                      {formData.isActive ? "Active" : "Inactive"}
                    </span>
                  </label>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="cardForm"
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors shadow-sm disabled:bg-orange-300"
              >
                {isSaving
                  ? "Saving..."
                  : editingCard
                    ? "Update Card"
                    : "Create Card"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Delete Card?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to remove this card? This action cannot be
              undone.
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
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors shadow-sm disabled:bg-red-300"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
