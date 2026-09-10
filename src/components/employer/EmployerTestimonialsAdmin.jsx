import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  X,
  Save,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  createTestimonialSection,
  getAdminTestimonialSection,
  updateTestimonialSection,
  deleteTestimonialSection,
  createTestimonialCard,
  getAdminTestimonialCards,
  getAdminTestimonialCardById,
  updateTestimonialCard,
  updateTestimonialCardLogo,
  updateCompanyLogo,
  deleteTestimonialCard,
} from '../../services/employer/employerTestimonialService';

const SECTION_FORM = {
  badgeText: '',
  sectionTitle: '',
  sectionDescription: '',
  isActive: true,
};

const CARD_FORM = {
  title: '',
  reviewText: '',
  companyName: '',
  companyLogo: '',
  reviewerName: '',
  reviewerDesignation: '',
  order: 0,
  isActive: true,
};

// ═════════════════════════════════════════════════════════════════════════════
// SECTION SETTINGS COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

function TestimonialSectionSettings() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sectionData, setSectionData] = useState(SECTION_FORM);
  const [sectionId, setSectionId] = useState(null);
  const [sectionError, setSectionError] = useState('');

  useEffect(() => {
    loadSection();
  }, []);

  const loadSection = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminTestimonialSection();
      if (res && res.data) {
        setSectionId(res.data._id);
        setSectionData({
          badgeText: res.data.badgeText || 'Testimonials',
          sectionTitle: res.data.sectionTitle || '',
          sectionDescription: res.data.sectionDescription || '',
          isActive: res.data.isActive !== false,
        });
      } else {
        setSectionId(null);
        setSectionData(SECTION_FORM);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load testimonial section');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSectionData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (sectionError) setSectionError('');
  };

  const validateSection = () => {
    if (!sectionData.sectionTitle.trim()) {
      setSectionError('Section Title is required');
      return false;
    }
    return true;
  };

  const saveSection = async () => {
    if (!validateSection()) return;

    setIsSaving(true);
    try {
      const payload = {
        badgeText: sectionData.badgeText.trim(),
        sectionTitle: sectionData.sectionTitle.trim(),
        sectionDescription: sectionData.sectionDescription.trim(),
        isActive: Boolean(sectionData.isActive),
      };

      const res = sectionId
        ? await updateTestimonialSection(sectionId, payload)
        : await createTestimonialSection(payload);

      if (res && res.success) {
        if (!sectionId && res.data?._id) {
          setSectionId(res.data._id);
        }
        setSectionData({
          badgeText: res.data.badgeText || payload.badgeText,
          sectionTitle: res.data.sectionTitle || payload.sectionTitle,
          sectionDescription: res.data.sectionDescription || payload.sectionDescription,
          isActive: res.data.isActive !== false,
        });
        toast.success(sectionId ? 'Section updated successfully' : 'Section created successfully');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save section');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center justify-center min-h-64">
        <Loader2 className="animate-spin text-orange-500" size={24} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div
        className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-lg font-semibold text-gray-800">Section Settings</h2>
        {isExpanded ? (
          <ChevronUp size={20} className="text-gray-500" />
        ) : (
          <ChevronDown size={20} className="text-gray-500" />
        )}
      </div>

      {isExpanded && (
        <div className="p-5 space-y-4">
          {sectionError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5">
              {sectionError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Badge Text</label>
            <input
              type="text"
              name="badgeText"
              value={sectionData.badgeText}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
              placeholder="e.g. Testimonials"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="sectionTitle"
              value={sectionData.sectionTitle}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
              placeholder="e.g. Trusted by Businesses Worldwide"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="sectionDescription"
              value={sectionData.sectionDescription}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors resize-none"
              rows="3"
              placeholder="Section description..."
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={sectionData.isActive}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
            </label>
            <span className="text-sm text-gray-600">{sectionData.isActive ? 'Active' : 'Inactive'}</span>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={saveSection}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              {isSaving ? 'Saving...' : 'Save Section'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// CARD MODAL COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

function CardModal({ isOpen, onClose, card, onSave, isSaving }) {
  const [formData, setFormData] = useState(card || CARD_FORM);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(card?.companyLogo || '');
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef(null);
  const previewUrlRef = useRef(null);

  useEffect(() => {
    if (card) {
      setFormData(card);
      setLogoPreview(card.companyLogo || '');
      setLogoFile(null);
    } else {
      setFormData(CARD_FORM);
      setLogoPreview('');
      setLogoFile(null);
    }
    setFormError('');
  }, [card, isOpen]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (formError) setFormError('');
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate: must be an image
    if (!file.type.startsWith('image/')) {
      setFormError('Only image files are accepted (PNG, JPG, WEBP, etc.)');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image size must be less than 5MB');
      e.target.value = '';
      return;
    }

    setLogoFile(file);
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setLogoPreview(url);
    setFormError('');
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(card?.companyLogo || '');
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setFormError('Title is required');
      return false;
    }
    if (!formData.reviewText.trim()) {
      setFormError('Review text is required');
      return false;
    }
    if (formData.order < 0) {
      setFormError('Order must be a non-negative number');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const payload = {
      title: formData.title.trim(),
      reviewText: formData.reviewText.trim(),
      companyName: formData.companyName.trim(),
      reviewerName: formData.reviewerName.trim(),
      reviewerDesignation: formData.reviewerDesignation.trim(),
      order: Number(formData.order),
      isActive: Boolean(formData.isActive),
      logoFile,
    };

    onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h3 className="text-lg font-bold text-gray-800">
            {card ? 'Edit Testimonial Card' : 'Add New Testimonial Card'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {formError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                  placeholder="e.g. Efficient Hiring Process"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="reviewText"
                  value={formData.reviewText}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors resize-none"
                  rows="4"
                  placeholder="The review text..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                  placeholder="e.g. Ford"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reviewer Name</label>
                <input
                  type="text"
                  name="reviewerName"
                  value={formData.reviewerName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reviewer Designation</label>
                <input
                  type="text"
                  name="reviewerDesignation"
                  value={formData.reviewerDesignation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                  placeholder="e.g. HR Manager"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    min="0"
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
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
                    </label>
                    <span className="text-sm text-gray-600">{formData.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Logo</label>
              <div className="mt-1 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center relative overflow-hidden group h-64">
                {/* Hidden file input — always in DOM so the admin can always pick a new file */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleLogoChange}
                />

                {logoPreview ? (
                  <>
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain p-4" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {/* Change logo button — triggers hidden file input */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white text-orange-500 hover:text-orange-600 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 shadow-sm"
                      >
                        <ImageIcon size={14} /> Change
                      </button>
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="bg-white text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 shadow-sm"
                      >
                        <X size={14} /> Remove
                      </button>
                    </div>
                  </>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center cursor-pointer w-full h-full text-gray-400 hover:text-orange-500 transition-colors"
                  >
                    <ImageIcon size={32} className="mb-2 text-gray-300" />
                    <span className="text-sm font-medium">Click to upload</span>
                    <span className="text-xs text-gray-400 mt-0.5">PNG, JPG, WEBP (max 5MB)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 rounded-lg transition-colors shadow-sm"
          >
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {isSaving ? 'Saving...' : card ? 'Update Card' : 'Save Card'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// CARDS MANAGEMENT COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

function TestimonialCardsManagement() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [cards, setCards] = useState([]);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [deletingCardId, setDeletingCardId] = useState(null);
  const [cardSubmitting, setCardSubmitting] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    setCardsLoading(true);
    try {
      const res = await getAdminTestimonialCards();
      setCards(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      toast.error(error.message || 'Failed to load testimonial cards');
    } finally {
      setCardsLoading(false);
    }
  };

  const openCardModal = (card = null) => {
    setSelectedCard(card || null);
    setIsCardModalOpen(true);
  };

  const closeCardModal = () => {
    setIsCardModalOpen(false);
    setSelectedCard(null);
  };

  const handleSaveCard = async (payload) => {
    setCardSubmitting(true);
    try {
      let res;

      if (selectedCard) {
        // Update existing card: text fields via PUT
        const textPayload = {
          title: payload.title,
          reviewText: payload.reviewText,
          companyName: payload.companyName,
          reviewerName: payload.reviewerName,
          reviewerDesignation: payload.reviewerDesignation,
          order: payload.order,
          isActive: payload.isActive,
        };

        res = await updateTestimonialCard(selectedCard._id, textPayload);

        // If a new logo file was selected, upload it via PATCH
        if (payload.logoFile) {
          const logoFormData = new FormData();
          logoFormData.append('companyLogo', payload.logoFile);
          const logoRes = await updateCompanyLogo(selectedCard._id, logoFormData);
          // Use the updated card data (which contains the new logo URL) as the final result
          if (logoRes && logoRes.data) {
            res = logoRes;
          }
        }
        // If no new logo selected, the existing logo is untouched — no action needed
      } else {
        // Create new card
        const formData = new FormData();
        formData.append('title', payload.title);
        formData.append('reviewText', payload.reviewText);
        formData.append('companyName', payload.companyName);
        formData.append('reviewerName', payload.reviewerName);
        formData.append('reviewerDesignation', payload.reviewerDesignation);
        formData.append('order', payload.order);
        formData.append('isActive', String(payload.isActive));
        if (payload.logoFile) {
          formData.append('companyLogo', payload.logoFile);
        }

        res = await createTestimonialCard(formData);
      }

      if (res && res.success) {
        await loadCards();
        closeCardModal();
        toast.success(selectedCard ? 'Card updated successfully' : 'Card created successfully');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save card');
    } finally {
      setCardSubmitting(false);
    }
  };

  const openDeleteModal = (card) => {
    setSelectedCard(card);
    setDeletingCardId(card._id);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCard = async () => {
    if (!deletingCardId) return;

    setCardSubmitting(true);
    try {
      const res = await deleteTestimonialCard(deletingCardId);
      if (res && res.success) {
        await loadCards();
        setIsDeleteModalOpen(false);
        setDeletingCardId(null);
        setSelectedCard(null);
        toast.success('Card deleted successfully');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete card');
    } finally {
      setCardSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div
          className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer select-none"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-800">Testimonial Cards</h2>
            <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-md">
              {cards.length} {cards.length === 1 ? 'Card' : 'Cards'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openCardModal();
              }}
              className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus size={16} /> Add Card
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
            {cardsLoading ? (
              <div className="p-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-orange-500" size={24} />
              </div>
            ) : cards.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center text-gray-400 gap-3">
                <ImageIcon size={36} className="text-gray-200" />
                <p className="text-sm">No testimonial cards yet. Click "Add Card" to create one.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-white border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                    <th className="p-4 font-medium w-12">Order</th>
                    <th className="p-4 font-medium w-16">Logo</th>
                    <th className="p-4 font-medium">Title</th>
                    <th className="p-4 font-medium hidden md:table-cell">Company</th>
                    <th className="p-4 font-medium hidden lg:table-cell">Reviewer</th>
                    <th className="p-4 font-medium w-20">Status</th>
                    <th className="p-4 font-medium text-right w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cards.map((card) => (
                    <tr key={card._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-sm font-medium text-gray-700">{card.order}</td>
                      <td className="p-4">
                        {card.companyLogo ? (
                          <img
                            src={card.companyLogo}
                            alt={card.companyName}
                            className="w-10 h-10 rounded-lg object-contain border border-gray-200 bg-white p-1"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                            <ImageIcon size={14} />
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-gray-800 text-sm line-clamp-1">{card.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{card.reviewText?.substring(0, 40)}...</p>
                      </td>
                      <td className="p-4 hidden md:table-cell text-sm text-gray-600">{card.companyName || '-'}</td>
                      <td className="p-4 hidden lg:table-cell text-sm text-gray-600">
                        {card.reviewerName || '-'} {card.reviewerDesignation && `(${card.reviewerDesignation})`}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${
                            card.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {card.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1">
                        <button
                          onClick={() => openCardModal(card)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(card)}
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

      {/* Card Modal */}
      <CardModal
        isOpen={isCardModalOpen}
        onClose={closeCardModal}
        card={selectedCard}
        onSave={handleSaveCard}
        isSaving={cardSubmitting}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Card?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this testimonial card? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCard}
                disabled={cardSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:bg-gray-300 rounded-lg transition-colors shadow-sm"
              >
                {cardSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                {cardSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

export default function EmployerTestimonialsAdmin() {
  return (
    <div className="space-y-6">
      <TestimonialSectionSettings />
      <TestimonialCardsManagement />
    </div>
  );
}
