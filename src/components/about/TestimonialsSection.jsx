import React, { useEffect, useState, useRef } from 'react';
import { Plus, Edit2, Trash2, Save, Loader2, X, Upload, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getSection,
  createSection,
  updateSection,
  getCards,
  createCard,
  updateCard,
  deleteCard,
  uploadLogo
} from '../../services/aboutUs/testimonialService';

const EMPTY_SECTION = {
  badgeText: 'Testimonials',
  sectionTitle: 'What They Are Saying',
  sectionDescription: 'Discover the stories and experiences of our satisfied clients and candidates.',
  isActive: true,
};

const EMPTY_CARD = {
  companyName: '',
  title: '',
  description: '',
  order: 1,
  isActive: true,
};

export default function TestimonialsSection() {
  // Section State
  const [sectionData, setSectionData] = useState(EMPTY_SECTION);
  const [sectionId, setSectionId] = useState(null);
  const [isSectionLoading, setIsSectionLoading] = useState(true);
  const [isSectionSaving, setIsSectionSaving] = useState(false);
  const [isSectionExpanded, setIsSectionExpanded] = useState(true);

  // Cards State
  const [cards, setCards] = useState([]);
  const [isCardsLoading, setIsCardsLoading] = useState(true);
  const [isCardsExpanded, setIsCardsExpanded] = useState(true);
  
  // Card Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_CARD);
  
  // Image Upload State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadSection();
    loadCards();
  }, []);

  // --- SECTION MANAGEMENT ---
  const loadSection = async () => {
    setIsSectionLoading(true);
    try {
      const res = await getSection();
      if (res.data) {
        setSectionData({
          badgeText: res.data.badgeText || '',
          sectionTitle: res.data.sectionTitle || '',
          sectionDescription: res.data.sectionDescription || '',
          isActive: res.data.isActive !== undefined ? res.data.isActive : true,
        });
        if (res.data._id) setSectionId(res.data._id);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load Section details');
    } finally {
      setIsSectionLoading(false);
    }
  };

  const handleSectionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSectionData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const saveSection = async () => {
    if (!sectionData.sectionTitle.trim()) {
      toast.error('Section Title is required');
      return;
    }
    setIsSectionSaving(true);
    try {
      if (sectionId) {
        await updateSection(sectionId, sectionData);
        toast.success('Section updated successfully');
      } else {
        const res = await createSection(sectionData);
        if (res.data?._id) setSectionId(res.data._id);
        toast.success('Section created successfully');
      }
      await loadSection();
    } catch (error) {
      console.error(error);
      toast.error(error?.message || 'Failed to save section');
    } finally {
      setIsSectionSaving(false);
    }
  };

  // --- CARDS MANAGEMENT ---
  const loadCards = async () => {
    setIsCardsLoading(true);
    try {
      const res = await getCards();
      setCards(res.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load Cards');
    } finally {
      setIsCardsLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ ...EMPTY_CARD, order: cards.length + 1 });
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const openEditModal = (card) => {
    setEditingId(card._id);
    setFormData({
      companyName: card.companyName || '',
      title: card.title || '',
      description: card.description || '',
      order: card.order ?? 1,
      isActive: card.isActive !== undefined ? card.isActive : true,
    });
    setImageFile(null);
    setImagePreview(card.companyLogo || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(EMPTY_CARD);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCardChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const saveCard = async () => {
    if (!formData.companyName.trim() || !formData.title.trim() || !formData.description.trim()) {
      toast.error('Company Name, Title, and Description are required');
      return;
    }

    setIsSaving(true);
    try {
      let savedCardId = editingId;
      
      const payload = {
        companyName: formData.companyName,
        title: formData.title,
        description: formData.description,
        order: Number(formData.order),
        isActive: formData.isActive,
      };

      if (editingId) {
        await updateCard(editingId, payload);
        toast.success('Card updated successfully');
      } else {
        const res = await createCard(payload);
        savedCardId = res.data._id;
        toast.success('Card created successfully');
      }

      if (imageFile && savedCardId) {
        await uploadLogo(savedCardId, imageFile);
      }

      closeModal();
      await loadCards();
    } catch (error) {
      console.error(error);
      toast.error(error?.message || 'Failed to save card');
    } finally {
      setIsSaving(false);
    }
  };

  const openDeleteModal = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteCard(deletingId);
      toast.success('Card deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingId(null);
      await loadCards();
    } catch (error) {
      console.error(error);
      toast.error(error?.message || 'Failed to delete card');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SECTION DETAILS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer select-none" onClick={() => setIsSectionExpanded(!isSectionExpanded)}>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-800">Testimonials Section Details</h2>
          </div>
          <div className="flex items-center gap-4">
            {isSectionExpanded ? <X size={18} className="text-gray-500" /> : <Plus size={18} className="text-gray-500" />}
          </div>
        </div>

        {isSectionExpanded && (
          <div className="p-6 space-y-4">
            {isSectionLoading ? (
              <div className="text-sm text-gray-500">Loading section data...</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Badge Text</label>
                    <input type="text" name="badgeText" value={sectionData.badgeText} onChange={handleSectionChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-colors" placeholder="Testimonials" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                    <input type="text" name="sectionTitle" value={sectionData.sectionTitle} onChange={handleSectionChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-colors" placeholder="What They Are Saying" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section Description</label>
                  <textarea name="sectionDescription" value={sectionData.sectionDescription} onChange={handleSectionChange} rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-colors resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="mt-2 flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="isActive" checked={sectionData.isActive} onChange={handleSectionChange} className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
                    </label>
                    <span className="text-sm text-gray-600">{sectionData.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button onClick={saveSection} disabled={isSectionSaving} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-lg hover:bg-orange-600 transition-colors shadow-sm disabled:bg-orange-300">
                    {isSectionSaving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> {sectionId ? 'Update Section' : 'Save Section'}</>}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* CARDS LIST */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer select-none" onClick={() => setIsCardsExpanded(!isCardsExpanded)}>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-800">Testimonial Cards</h2>
            <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-md">{cards.length} Cards</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={(e) => { e.stopPropagation(); openAddModal(); }} className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
              <Plus size={16} /> Add Card
            </button>
            {isCardsExpanded ? <X size={18} className="text-gray-500" /> : <Plus size={18} className="text-gray-500" />}
          </div>
        </div>

        {isCardsExpanded && (
          <div className="p-0 overflow-x-auto">
            {isCardsLoading ? (
              <div className="p-8 text-sm text-gray-500">Loading cards...</div>
            ) : cards.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No testimonial cards added yet.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                    <th className="p-4 font-medium">Logo</th>
                    <th className="p-4 font-medium">Company Name</th>
                    <th className="p-4 font-medium">Title</th>
                    <th className="p-4 font-medium hidden md:table-cell">Order</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cards.map((card) => (
                    <tr key={card._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        {card.companyLogo ? (
                          <img src={card.companyLogo} alt={card.companyName} className="w-10 h-10 object-contain bg-white border border-gray-100 rounded" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                            <ImageIcon size={18} />
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-sm font-medium text-gray-700">{card.companyName}</td>
                      <td className="p-4 text-sm text-gray-700">{card.title}</td>
                      <td className="p-4 hidden md:table-cell text-sm text-gray-500">{card.order}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${card.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {card.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button onClick={() => openEditModal(card)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => openDeleteModal(card._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete">
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

      {/* CARD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-gray-800">{editingId ? 'Edit Card' : 'Add New Card'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              {/* Logo Upload Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo (Optional)</label>
                <div className="flex items-start gap-6">
                  <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden relative group">
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-2" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-white rounded-full text-gray-700 hover:text-blue-500 transition-colors">
                            <Upload size={16} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500 font-medium">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <p className="text-sm text-gray-500">Upload a logo for the company. Recommended format: PNG with transparent background. Max size: 5MB.</p>
                    <div className="flex items-center gap-3">
                      <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                      <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <Upload size={16} /> Choose Image
                      </button>
                      {imagePreview && (
                        <button onClick={() => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2">
                          <Trash2 size={16} /> Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                  <input type="text" name="companyName" value={formData.companyName} onChange={handleCardChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title (e.g. CEO) *</label>
                  <input type="text" name="title" value={formData.title} onChange={handleCardChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-colors" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea name="description" value={formData.description} onChange={handleCardChange} rows={4} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-colors resize-none" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order *</label>
                  <input type="number" name="order" value={formData.order} onChange={handleCardChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="mt-2 flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleCardChange} className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
                    </label>
                    <span className="text-sm text-gray-600">{formData.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3 shrink-0">
              <button onClick={closeModal} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">Cancel</button>
              <button onClick={saveCard} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-lg hover:bg-orange-600 transition-colors shadow-sm disabled:bg-orange-300">
                {isSaving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> {editingId ? 'Update Card' : 'Save Card'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4"><Trash2 size={24} /></div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Card?</h3>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => { setIsDeleteModalOpen(false); setDeletingId(null); }} disabled={isDeleting} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">Cancel</button>
              <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 border border-transparent rounded-lg hover:bg-red-600 transition-colors shadow-sm disabled:bg-red-300">
                {isDeleting ? <><Loader2 size={14} className="animate-spin" /> Deleting...</> : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
