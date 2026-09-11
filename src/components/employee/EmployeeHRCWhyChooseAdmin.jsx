import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Edit2, Trash2, Save, Loader2, X, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  createHRCCard,
  deleteHRCCard,
  getAdminHRCCards,
  getAdminHRCSection,
  saveHRCSection,
  updateHRCCard,
  uploadHRCCardImage,
} from '../../services/employee/employeeHRCWhyChooseService';

const EMPTY_CARD = {
  letter: '',
  eyebrow: '',
  eyebrowColor: '#004CA5',
  title: '',
  description: '',
  stats: [],
  statColor: '#004CA5',
  letterColor: 'rgba(0,76,165,0.1)',
  letterPosLeft: '',
  letterPosRight: '0',
  letterPosTop: '0',
  gradient: false,
  imageOnRight: false,
  order: 1,
  isActive: true,
};

const statsToText = (stats) =>
  Array.isArray(stats) ? stats.map((s) => `${s.value || ''}|${s.label || ''}`).join('\n') : '';

const textToStats = (text) =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [value, label] = line.split('|').map((part) => (part || '').trim());
      return { value, label };
    });

export default function EmployeeHRCWhyChooseAdmin() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [sectionForm, setSectionForm] = useState({ badgeText: 'Why Choose E2E HRC', sectionTitle: '', isActive: true });
  const [isSavingSection, setIsSavingSection] = useState(false);
  const [cards, setCards] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [cardForm, setCardForm] = useState(EMPTY_CARD);
  const [statsText, setStatsText] = useState('');
  const [isSavingCard, setIsSavingCard] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const [sRes, cRes] = await Promise.all([getAdminHRCSection(), getAdminHRCCards()]);
      if (sRes && sRes.success && sRes.data) {
        setSectionForm({
          badgeText: sRes.data.badgeText || '',
          sectionTitle: sRes.data.sectionTitle || '',
          isActive: sRes.data.isActive !== false,
        });
      }
      if (cRes && cRes.success && Array.isArray(cRes.data)) {
        setCards(cRes.data);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load HRC Why Choose data');
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
      const res = await saveHRCSection({
        badgeText: sectionForm.badgeText.trim(),
        sectionTitle: sectionForm.sectionTitle.trim(),
        isActive: Boolean(sectionForm.isActive),
      });
      if (res && res.success) {
        toast.success('HRC Why Choose section saved successfully');
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
    setStatsText('');
    setIsModalOpen(true);
  };

  const openEditModal = (card) => {
    setEditingId(card._id);
    setCardForm({
      letter: card.letter || '',
      eyebrow: card.eyebrow || '',
      eyebrowColor: card.eyebrowColor || '#004CA5',
      title: card.title || '',
      description: card.description || '',
      stats: Array.isArray(card.stats) ? card.stats : [],
      statColor: card.statColor || '#004CA5',
      letterColor: card.letterColor || 'rgba(0,76,165,0.1)',
      letterPosLeft: card.letterPosLeft || '',
      letterPosRight: card.letterPosRight || '0',
      letterPosTop: card.letterPosTop || '0',
      gradient: !!card.gradient,
      imageOnRight: !!card.imageOnRight,
      order: card.order || 0,
      isActive: card.isActive !== false,
    });
    setStatsText(statsToText(card.stats));
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
        letter: cardForm.letter.trim(),
        eyebrow: cardForm.eyebrow.trim(),
        eyebrowColor: cardForm.eyebrowColor.trim(),
        title: cardForm.title.trim(),
        description: cardForm.description.trim(),
        stats: textToStats(statsText),
        statColor: cardForm.statColor.trim(),
        letterColor: cardForm.letterColor.trim(),
        letterPosLeft: cardForm.letterPosLeft.trim(),
        letterPosRight: cardForm.letterPosRight.trim(),
        letterPosTop: cardForm.letterPosTop.trim(),
        gradient: Boolean(cardForm.gradient),
        imageOnRight: Boolean(cardForm.imageOnRight),
        order: Number(cardForm.order) || 0,
        isActive: Boolean(cardForm.isActive),
      };
      const res = editingId
        ? await updateHRCCard(editingId, payload)
        : await createHRCCard(payload);
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
      const res = await deleteHRCCard(id);
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
      const res = await uploadHRCCardImage(card._id, fd);
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
          <h2 className="text-lg font-semibold text-gray-800">Why Choose (HRC Rows)</h2>
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
                    <label className="mb-1 block text-sm font-medium text-gray-700">Badge Text</label>
                    <input name="badgeText" value={sectionForm.badgeText} onChange={handleSectionChange} className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Section Title</label>
                    <input name="sectionTitle" value={sectionForm.sectionTitle} onChange={handleSectionChange} className={inputCls} />
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-3 py-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="isActive" checked={sectionForm.isActive} onChange={handleSectionChange} className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
                  </label>
                  <span className="text-sm text-gray-700">Active</span>
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
                      <div className="min-w-0 flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-orange-100 text-orange-700 text-sm font-bold shrink-0">
                          {card.letter || '?'}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{card.title}</p>
                          <p className="text-xs text-gray-500">Order {card.order ?? 0} · {card.isActive ? 'Active' : 'Inactive'} · {card.image ? 'Has image' : 'No image'}</p>
                        </div>
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">{editingId ? 'Edit Card' : 'Add Card'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Letter</label>
                  <input name="letter" value={cardForm.letter} onChange={handleCardChange} className={inputCls} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Eyebrow Color</label>
                  <input name="eyebrowColor" value={cardForm.eyebrowColor} onChange={handleCardChange} className={inputCls} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Stat Color</label>
                  <input name="statColor" value={cardForm.statColor} onChange={handleCardChange} className={inputCls} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Eyebrow</label>
                <input name="eyebrow" value={cardForm.eyebrow} onChange={handleCardChange} className={inputCls} />
              </div>
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
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Stats (one per line, "value|label")</label>
                <textarea value={statsText} onChange={(e) => setStatsText(e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder={'500+|Active Clients\n98%|Satisfaction Rate'} />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Letter Color</label>
                  <input name="letterColor" value={cardForm.letterColor} onChange={handleCardChange} className={inputCls} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Order</label>
                  <input type="number" name="order" value={cardForm.order} onChange={handleCardChange} className={inputCls} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Letter Pos Left</label>
                  <input name="letterPosLeft" value={cardForm.letterPosLeft} onChange={handleCardChange} className={inputCls} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Letter Pos Right</label>
                  <input name="letterPosRight" value={cardForm.letterPosRight} onChange={handleCardChange} className={inputCls} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Letter Pos Top</label>
                  <input name="letterPosTop" value={cardForm.letterPosTop} onChange={handleCardChange} className={inputCls} />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-3 py-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="gradient" checked={cardForm.gradient} onChange={handleCardChange} className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
                  </label>
                  <span className="text-sm text-gray-700">Gradient</span>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-3 py-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="imageOnRight" checked={cardForm.imageOnRight} onChange={handleCardChange} className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
                  </label>
                  <span className="text-sm text-gray-700">Image on right</span>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-3 py-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="isActive" checked={cardForm.isActive} onChange={handleCardChange} className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
                  </label>
                  <span className="text-sm text-gray-700">Active</span>
                </div>
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