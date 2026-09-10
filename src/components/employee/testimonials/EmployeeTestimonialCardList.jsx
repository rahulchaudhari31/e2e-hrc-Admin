import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Edit2, Trash2, ChevronUp, ChevronDown, Loader2, Plus } from 'lucide-react';
import { deleteEmployeeTestimonialCard } from '../../../services/employee/employeeTestimonialService';
import ImageViewer from '../ImageViewer';

const MAX_CARDS = 6;

export default function EmployeeTestimonialCardList({ cards, onAddCard, onEditCard, onCardDeleted }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [viewingImage, setViewingImage] = useState(null);

  const cardLabel = cards.length === 1 ? 'Card' : 'Cards';
  const isAtMaxCards = cards.length >= MAX_CARDS;

  const handleAddClick = () => {
    if (isAtMaxCards) {
      toast.error('Maximum 6 testimonial cards are allowed.');
      return;
    }
    onAddCard();
  };

  const openDeleteModal = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const doDeleteCard = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteEmployeeTestimonialCard(deletingId);
      toast.success('Card deleted successfully!');
      setIsDeleteModalOpen(false);
      setDeletingId(null);
      onCardDeleted();
    } catch (error) {
      toast.error(error.message || 'Failed to delete card.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-gray-50 border-b border-gray-200 gap-4">
        <div className="flex items-center gap-3">
          <h4 className="text-base font-semibold text-gray-800">Testimonial Cards</h4>
          <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2.5 py-1 rounded-full">
            {cards.length} {cardLabel}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddClick}
            disabled={isAtMaxCards}
            title={isAtMaxCards ? 'Maximum 6 testimonial cards are allowed.' : 'Add a new testimonial card'}
            className={`flex items-center gap-1.5 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
              isAtMaxCards
                ? 'bg-orange-300 cursor-not-allowed opacity-60'
                : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            <Plus size={16} /> Add Card
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {/* Body */}
      {isExpanded && (
        <div className="p-0 overflow-x-auto">
          {cards.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center min-h-64">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 font-semibold mb-1">No testimonial cards yet</p>
              <p className="text-sm text-gray-500">Click "Add Card" to create one</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              {cards.map((card) => (
                <div
                  key={card._id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {/* Logo */}
                  {card.companyLogo && (
                    <div className="mb-3">
                      <img
                        src={card.companyLogo}
                        alt="Company logo"
                        className="w-16 h-16 object-contain rounded-lg border border-gray-200 bg-white cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setViewingImage(card.companyLogo)}
                      />
                    </div>
                  )}

                  {/* Title */}
                  <h5 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">{card.title}</h5>

                  {/* Review Preview */}
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{card.reviewText}</p>

                  {/* Company & Reviewer */}
                  <div className="mb-3 space-y-1 text-xs">
                    {card.companyName && (
                      <p className="text-gray-600">
                        <span className="font-medium text-gray-700">Company:</span> {card.companyName}
                      </p>
                    )}
                    {card.reviewerName && (
                      <p className="text-gray-600">
                        <span className="font-medium text-gray-700">Reviewer:</span> {card.reviewerName}
                      </p>
                    )}
                    {card.reviewerDesignation && (
                      <p className="text-gray-600">
                        <span className="font-medium text-gray-700">Designation:</span> {card.reviewerDesignation}
                      </p>
                    )}
                  </div>

                  {/* Order & Status */}
                  <div className="mb-3 flex items-center gap-2 flex-wrap">
                    <span className="bg-blue-100 text-blue-600 text-[10px] font-bold px-2 py-1 rounded">
                      Order: {card.order}
                    </span>
                    <span
                      className={`px-2 py-1 text-[10px] font-bold rounded-full ${
                        card.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {card.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
                    <button
                      onClick={() => onEditCard(card)}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(card._id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Testimonial Card?</h3>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
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
                onClick={doDeleteCard}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 border border-transparent rounded-lg hover:bg-red-600 transition-colors shadow-sm disabled:bg-red-300"
              >
                {isDeleting ? <><Loader2 size={14} className="animate-spin" /> Deleting...</> : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewingImage && (
        <ImageViewer imageUrl={viewingImage} onClose={() => setViewingImage(null)} />
      )}
    </div>
  );
}
