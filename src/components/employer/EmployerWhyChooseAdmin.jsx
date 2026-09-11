import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Edit2, Trash2, Save, Loader2, X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  createWhyChooseCard,
  deleteWhyChooseCard,
  getAdminWhyChooseCards,
  getAdminWhyChooseSection,
  saveWhyChooseSection,
  updateWhyChooseCard,
  uploadWhyChooseCardImage,
} from '../../services/employer/employerWhyChooseService';

const ICON_OPTIONS = ['globe', 'shield', 'check', 'bolt', 'wrench'];

const EMPTY_CARD = {
  title: '',
  description: '',
  icon: 'globe',
  hasImage: false,
  imageUrl: '',
  order: 1,
  isActive: true,
};

export default function EmployerWhyChooseAdmin() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [sectionForm, setSectionForm] = useState({ sectionTitle: '', sectionDescription: '', isActive: true });
  const [isSavingSection, setIsSavingSection] = useState(false);
  const [cards, setCards] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [cardForm, setCardForm] = useState(EMPTY_CARD);
  const [isSavingCard, setIsSavingCard] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [sRes, cRes] = await Promise.all([getAdminWhyChooseSection(), getAdminWhyChooseCards()]);
      if (sRes && sRes.success && sRes.data) {
        setSectionForm({
          sectionTitle: sRes.data.sectionTitle || '',
          sectionDescription: sRes.data.sectionDescription || '',
          isActive: sRes.data.isActive !== false,
        });
      }
      if (cRes && cRes.success && Array.isArray(cRes.data)) {
        setCards(cRes.data);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load Why Choose data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSectionForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const saveSection = async () => {
    setIsSavingSection(true);
    try {
      const res = await saveWhyChooseSection({
        sectionTitle: sectionForm.sectionTitle.trim(),
        sectionDescription: sectionForm.sectionDescription.trim(),
        isActive: Boolean(sectionForm.isActive),
      });
      if (res && res.success) {
        toast.success('Why Choose section saved successfully');
        await loadAll();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save section');
    } finally {
      setIsSavingSection(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setCardForm({ ...EMPTY_CARD, order: cards.length + 1 });
    setIsModalOpen(true);
  };

  const openEditModal = (card) => {
    setEditingId(card._id);
    setCardForm({
      title: card.title || '',
      description: card.description || '',
      icon: card.icon || 'globe',
      hasImage: !!card.hasImage,
      imageUrl: card.imageUrl || '',
      order: card.order || 0,
      isActive: card.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleCardChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCardForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const saveCard = async () => {
    if (!cardForm.title.trim()) {
      toast.error('Title is required');
      return;
    }
    setIsSavingCard(true);
    try {
      const payload = {
        title: cardForm.title.trim(),
        description: cardForm.description.trim(),
        icon: cardForm.icon,
        hasImage: Boolean(cardForm.hasImage),
        order: Number(cardForm.order) || 0,
        isActive: Boolean(cardForm.isActive),
      };
      const res = editingId
        ? await updateWhyChooseCard(editingId, payload)
        : await createWhyChooseCard(payload);
      if (res && res.success) {
        toast.success(editingId ? 'Card updated successfully' : 'Card created successfully');
        setIsModalOpen(false);
        await loadAll();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save card');
    } finally {
      setIsSavingCard(false);
    }
  };

  const deleteCard = async (id) => {
    if (!window.confirm('Are you sure you want to delete this card?')) return;
    try {
      const res = await deleteWhyChooseCard(id);
      if (res && res.success) {
        toast.success('Card deleted successfully');
        await loadAll();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete card');
    }
  };

  const handleImageUpload = async (e, card) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingId(card._id);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await uploadWhyChooseCardImage(card._id, fd);
      if (res && res.success) {
        toast.success('Card image uploaded successfully');
        await loadAll();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploadingId(null);
      e.target.value = '';
    }
  };

  const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div
        className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">Why Choose E2E HRC</h2>
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            {cards.length} card{cards.length !== 1 ? 's' : ''}
          </span>
        </div>
        {isExpanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
      </div>

      {isExpanded && (
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-orange-500" />
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-gray-200 p-4 space-y-4">
                <p className="text-sm font-semibold text-gray-900">Section Header</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Section Title</label>
                    <input name="sectionTitle" value={sectionForm.sectionTitle} onChange={handleSectionChange} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Active</label>
                    <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-3 py-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="isActive" checked={sectionForm.isActive} onChange={handleSectionChange} className="sr-only peer" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
                      </label>
                      <span className="text-sm text-gray-700">{sectionForm.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">Section Description</label>
                    <textarea name="sectionDescription" value={sectionForm.sectionDescription} onChange={handleSectionChange} rows={2} className={`${inputCls} resize-none`} />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={saveSection}
                    disabled={isSavingSection}
                    className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors disabled:opacity-60"
                  >
                    {isSavingSection ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {isSavingSection ? 'Saving...' : 'Save Header'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900">Cards</p>
                <button
                  onClick={openAddModal}
                  className="inline-flex items-center gap-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-3 py-1.5 transition-colors"
                >
                  <Plus size={16} /> Add Card
                </button>
              </div>

              {cards.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No cards yet. Add one to display on the page.</p>
              ) : (
                <div className="space-y-2">
                  {cards.map((card) => (
                    <div key={card._id} className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{card.title}</p>
                        <p className="text-xs text-gray-500">{card.icon} · Order {card.order ?? 0} · {card.isActive ? 'Active' : 'Inactive'}</p>
                        {card.hasImage && card.imageUrl && (
                          <img src={card.imageUrl} alt={card.title} className="mt-2 h-16 w-24 object-cover rounded-md" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors" title="Upload image">
                          {uploadingId === card._id ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Upload size={15} />
                          )}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, card)} />
                        </label>
                        <button onClick={() => openEditModal(card)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => deleteCard(card._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">{editingId ? 'Edit Card' : 'Add Card'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Title <span className="text-red-500">*</span>
                </label>
                <input name="title" value={cardForm.title} onChange={handleCardChange} className={inputCls} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" value={cardForm.description} onChange={handleCardChange} rows={3} className={`${inputCls} resize-none`} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Icon</label>
                  <select name="icon" value={cardForm.icon} onChange={handleCardChange} className={inputCls}>
                    {ICON_OPTIONS.map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Order</label>
                  <input type="number" name="order" value={cardForm.order} onChange={handleCardChange} className={inputCls} />
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-3 py-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="hasImage" checked={cardForm.hasImage} onChange={handleCardChange} className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
                </label>
                <span className="text-sm text-gray-700">Show image instead of icon</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-3 py-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="isActive" checked={cardForm.isActive} onChange={handleCardChange} className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
                </label>
                <span className="text-sm text-gray-700">Active</span>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={saveCard} disabled={isSavingCard} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-60">
                {isSavingCard ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isSavingCard ? 'Saving...' : 'Save Card'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}