import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  getAdminEmployeeTestimonialSections,
  getAdminEmployeeTestimonialCards,
} from '../../../services/employee/employeeTestimonialService';
import EmployeeTestimonialSectionForm from './EmployeeTestimonialSectionForm';
import EmployeeTestimonialCardList from './EmployeeTestimonialCardList';
import EmployeeTestimonialCardModal from './EmployeeTestimonialCardModal';

export default function EmployeeTestimonialManagement() {
  const [isLoading, setIsLoading] = useState(true);
  const [section, setSection] = useState(null);
  const [cards, setCards] = useState([]);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [sectionsRes, cardsRes] = await Promise.all([
        getAdminEmployeeTestimonialSections(),
        getAdminEmployeeTestimonialCards(),
      ]);

      const sections = Array.isArray(sectionsRes.data) ? sectionsRes.data : [];
      const allCards = Array.isArray(cardsRes.data) ? cardsRes.data : [];

      setSection(sections.length > 0 ? sections[0] : null);
      const sortedCards = allCards.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setCards(sortedCards);
    } catch (error) {
      toast.error(error.message || 'Failed to load testimonials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionSaved = (newSection) => {
    setSection(newSection);
    fetchData();
  };

  const handleOpenAddCardModal = () => {
    setEditingCard(null);
    setIsCardModalOpen(true);
  };

  const handleOpenEditCardModal = (card) => {
    setEditingCard(card);
    setIsCardModalOpen(true);
  };

  const handleCloseCardModal = () => {
    setIsCardModalOpen(false);
    setEditingCard(null);
  };

  const handleCardSaved = () => {
    fetchData();
  };

  const handleCardDeleted = () => {
    fetchData();
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900">Testimonials</h3>
        <p className="text-sm text-gray-500 mt-1">Manage employee testimonials and section settings.</p>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin">
              <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section Form */}
          <EmployeeTestimonialSectionForm section={section} onSectionSaved={handleSectionSaved} />

          {/* Cards List */}
          <EmployeeTestimonialCardList
            cards={cards}
            onAddCard={handleOpenAddCardModal}
            onEditCard={handleOpenEditCardModal}
            onCardDeleted={handleCardDeleted}
          />
        </div>
      )}

      {/* Card Modal */}
      <EmployeeTestimonialCardModal
        isOpen={isCardModalOpen}
        editingCard={editingCard}
        onClose={handleCloseCardModal}
        onCardSaved={handleCardSaved}
      />
    </div>
  );
}
