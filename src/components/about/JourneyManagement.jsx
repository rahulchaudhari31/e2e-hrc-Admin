import { useState, useEffect } from 'react';
import {
  ChevronDown, ChevronUp, Plus, Edit2, Trash2, Save, Loader2, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAdminJourneySection,
  createOrUpdateJourneySection,
  updateJourneySection,
} from '../../services/aboutUs/journeySectionService.js';
import {
  getAdminJourneyCards,
  createJourneyCard,
  updateJourneyCard,
  deleteJourneyCard,
} from '../../services/aboutUs/journeyTimelineService.js';

const MAX_CARDS = 12;

const EMPTY_SECTION = {
  badgeText: '',
  badgeSubText: '',
  sectionTitle: '',
  sectionDescription: '',
  introText: '',
  statYears: '',
  statCountries: '',
  statMilestones: '',
  statYearsLabel: 'Years',
  statCountriesLabel: 'Countries',
  statMilestonesLabel: 'Milestones',
  isActive: true,
};

const EMPTY_CARD = {
  title: '',
  description: '',
  year: '',
  side: 'left',
  order: 0,
  isActive: true,
};

export default function JourneyManagement() {
  const [isSectionExpanded, setIsSectionExpanded] = useState(true);
  const [isSectionLoading, setIsSectionLoading] = useState(true);
  const [isSectionSaving, setIsSectionSaving] = useState(false);
  const [sectionData, setSectionData] = useState(EMPTY_SECTION);
  const [isCardsExpanded, setIsCardsExpanded] = useState(true);
  const [isCardsLoading, setIsCardsLoading] = useState(true);
  const [cards, setCards] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavingCard, setIsSavingCard] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [cardForm, setCardForm] = useState(EMPTY_CARD);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCardId, setDeletingCardId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadSection();
    loadCards();
  }, []);

  const loadSection = async () => {
    setIsSectionLoading(true);
    try {
      const res = await getAdminJourneySection();
      if (res && res.data) {
        setSectionData({ ...EMPTY_SECTION, ...res.data });
      } else {
        setSectionData(EMPTY_SECTION);
      }
    } catch (error) {
      if (!error.message?.includes('404')) {
        toast.error('Failed to load Journey Section data');
      }
    } finally {
      setIsSectionLoading(false);
    }
  };

  const handleSectionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSectionData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSaveSection = async () => {
    if (!sectionData.sectionTitle?.trim()) {
      toast.error('Section title is required');
      return;
    }
    setIsSectionSaving(true);
    try {
      const payload = {
        badgeText: sectionData.badgeText || '',
        badgeSubText: sectionData.badgeSubText || '',
        sectionTitle: sectionData.sectionTitle.trim(),
        sectionDescription: sectionData.sectionDescription || '',
        introText: sectionData.introText || '',
        statYears: Number(sectionData.statYears) || 0,
        statCountries: Number(sectionData.statCountries) || 0,
        statMilestones: Number(sectionData.statMilestones) || 0,
        statYearsLabel: sectionData.statYearsLabel || 'Years',
        statCountriesLabel: sectionData.statCountriesLabel || 'Countries',
        statMilestonesLabel: sectionData.statMilestonesLabel || 'Milestones',
        isActive: sectionData.isActive === false ? false : true,
      };
      let res;
      if (sectionData._id) {
        res = await updateJourneySection(sectionData._id, payload);
      } else {
        res = await createOrUpdateJourneySection(payload);
      }
      if (res && res.data) {
        setSectionData({ ...EMPTY_SECTION, ...res.data });
      }
      toast.success('Journey section saved successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to save journey section');
    } finally {
      setIsSectionSaving(false);
    }
  };
  const loadCards = async () => {
    setIsCardsLoading(true);
    try {
      const res = await getAdminJourneyCards();
      const data = Array.isArray(res.data) ? res.data : [];
      setCards([...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    } catch (error) {
      console.error('Failed to load journey cards:', error);
      toast.error('Failed to load timeline cards');
    } finally {
      setIsCardsLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingCardId(null);
    setCardForm({ ...EMPTY_CARD, order: cards.length });
    setIsModalOpen(true);
  };

  const openEditModal = (card) => {
    setEditingCardId(card._id);
    setCardForm({
      title: card.title || '',
      description: card.description || '',
      year: card.year || '',
      side: card.side || 'left',
      order: card.order ?? 0,
      isActive: card.isActive !== undefined ? card.isActive : true,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCardId(null);
    setCardForm(EMPTY_CARD);
  };

  const handleCardFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCardForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSaveCard = async () => {
    if (!cardForm.title.trim()) { toast.error('Title is required'); return; }
    if (!cardForm.year.trim()) { toast.error('Year is required'); return; }
    setIsSavingCard(true);
    try {
      const payload = {
        title: cardForm.title.trim(),
        description: cardForm.description || '',
        year: cardForm.year.trim(),
        side: cardForm.side || 'left',
        order: Number(cardForm.order) || 0,
        isActive: cardForm.isActive === false ? false : true,
      };
      if (editingCardId) {
        await updateJourneyCard(editingCardId, payload);
        toast.success('Card updated successfully!');
      } else {
        await createJourneyCard(payload);
        toast.success('Card created successfully!');
      }
      closeModal();
      await loadCards();
    } catch (error) {
      toast.error(error.message || 'Failed to save card');
    } finally {
      setIsSavingCard(false);
    }
  };

  const openDeleteModal = (id) => { setDeletingCardId(id); setIsDeleteModalOpen(true); };

  const confirmDelete = async () => {
    if (!deletingCardId) return;
    setIsDeleting(true);
    try {
      await deleteJourneyCard(deletingCardId);
      toast.success('Card deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingCardId(null);
      await loadCards();
    } catch (error) {
      toast.error(error.message || 'Failed to delete card');
    } finally {
      setIsDeleting(false);
    }
  };

  const atCardLimit = cards.length >= MAX_CARDS;
  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div
          className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer select-none"
          onClick={() => setIsSectionExpanded(!isSectionExpanded)}
        >
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-800">Our Journey - Section Settings</h2>
            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm text-gray-500">Status:</span>
              <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
                <input type="checkbox" name="isActive" checked={sectionData.isActive} onChange={handleSectionChange} className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
          </div>
          {isSectionExpanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
        </div>
        {isSectionExpanded && (
          <>
            <div className="p-5">
              {isSectionLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-orange-500" size={32} /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Badge Text</label>
                      <input type="text" name="badgeText" value={sectionData.badgeText} onChange={handleSectionChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors" placeholder="e.g. Our Story" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Badge Subtitle</label>
                      <input type="text" name="badgeSubText" value={sectionData.badgeSubText} onChange={handleSectionChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors" placeholder="e.g. Since 2015" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Section Title <span className="text-red-500">*</span></label>
                      <input type="text" name="sectionTitle" value={sectionData.sectionTitle} onChange={handleSectionChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors" placeholder="e.g. Our Journey" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Section Description</label>
                      <textarea name="sectionDescription" value={sectionData.sectionDescription} onChange={handleSectionChange} rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors resize-none" placeholder="A short description..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Intro Text</label>
                      <textarea name="introText" value={sectionData.introText} onChange={handleSectionChange} rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors resize-none" placeholder="Introductory paragraph text..." />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">Statistics</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Years</label>
                        <input type="number" name="statYears" value={sectionData.statYears} onChange={handleSectionChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors" placeholder="0" min="0" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Years Label</label>
                        <input type="text" name="statYearsLabel" value={sectionData.statYearsLabel} onChange={handleSectionChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors" placeholder="Years" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Countries</label>
                        <input type="number" name="statCountries" value={sectionData.statCountries} onChange={handleSectionChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors" placeholder="0" min="0" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Countries Label</label>
                        <input type="text" name="statCountriesLabel" value={sectionData.statCountriesLabel} onChange={handleSectionChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors" placeholder="Countries" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Milestones</label>
                        <input type="number" name="statMilestones" value={sectionData.statMilestones} onChange={handleSectionChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors" placeholder="0" min="0" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Milestones Label</label>
                        <input type="text" name="statMilestonesLabel" value={sectionData.statMilestonesLabel} onChange={handleSectionChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors" placeholder="Milestones" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
              <button onClick={handleSaveSection} disabled={isSectionSaving || isSectionLoading} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-sm text-sm">
                {isSectionSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isSectionSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </>
        )}
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div
          className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer select-none"
          onClick={() => setIsCardsExpanded(!isCardsExpanded)}
        >
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-800">Journey Timeline</h2>
            {isCardsLoading ? (
              <span className="bg-gray-100 text-gray-400 text-xs font-bold px-2 py-1 rounded-md animate-pulse">Loading...</span>
            ) : (
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${atCardLimit ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                {cards.length} / {MAX_CARDS} Cards
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => { e.stopPropagation(); openAddModal(); }}
              disabled={atCardLimit}
              title={atCardLimit ? 'Maximum 12 cards allowed.' : 'Add a new timeline card'}
              className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus size={16} /> Add Card
            </button>
            {isCardsExpanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
          </div>
        </div>

        {isCardsExpanded && (
          <div>
            {atCardLimit && (
              <div className="mx-5 mt-4 px-4 py-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
                Maximum {MAX_CARDS} cards allowed. Delete a card to add a new one.
              </div>
            )}
            {isCardsLoading ? (
              <div className="p-8 flex flex-col gap-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="animate-pulse flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3" />
                      <div className="h-3 bg-gray-100 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : cards.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No timeline cards added yet. Click Add Card to create one.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                      <th className="p-4 font-medium">Title</th>
                      <th className="p-4 font-medium hidden sm:table-cell">Description</th>
                      <th className="p-4 font-medium">Year</th>
                      <th className="p-4 font-medium">Side</th>
                      <th className="p-4 font-medium hidden md:table-cell">Order</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cards.map((card) => (
                      <tr key={card._id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4"><p className="font-semibold text-gray-800 text-sm">{card.title}</p></td>
                        <td className="p-4 hidden sm:table-cell text-sm text-gray-500 max-w-[200px] truncate">{card.description}</td>
                        <td className="p-4 text-sm text-gray-700 font-medium">{card.year}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${card.side === 'right' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{card.side}</span>
                        </td>
                        <td className="p-4 hidden md:table-cell text-sm text-gray-500">{card.order}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${card.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {card.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2 whitespace-nowrap">
                          <button onClick={() => openEditModal(card)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors" title="Edit"><Edit2 size={16} /></button>
                          <button onClick={() => openDeleteModal(card._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">{editingCardId ? 'Edit Timeline Card' : 'Add Timeline Card'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input type="text" name="title" value={cardForm.title} onChange={handleCardFormChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors" placeholder="Card title..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" value={cardForm.description} onChange={handleCardFormChange} rows={3} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors resize-none" placeholder="Card description..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year <span className="text-red-500">*</span></label>
                  <input type="text" name="year" value={cardForm.year} onChange={handleCardFormChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors" placeholder="e.g. 2020" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Side</label>
                  <select name="side" value={cardForm.side} onChange={handleCardFormChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors bg-white">
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <input type="number" name="order" value={cardForm.order} onChange={handleCardFormChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors" min="0" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="block text-sm font-medium text-gray-700">Active</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="isActive" checked={cardForm.isActive} onChange={handleCardFormChange} className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
                </label>
                <span className="text-sm text-gray-600">{cardForm.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
              <button onClick={closeModal} disabled={isSavingCard} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">Cancel</button>
              <button onClick={handleSaveCard} disabled={isSavingCard} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-lg hover:bg-orange-600 transition-colors shadow-sm disabled:bg-orange-300">
                {isSavingCard ? (<><Loader2 size={14} className="animate-spin" /> Saving...</>) : (<><Save size={14} /> {editingCardId ? 'Update Card' : 'Create Card'}</>)}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4"><Trash2 size={24} /></div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Card?</h3>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => { setIsDeleteModalOpen(false); setDeletingCardId(null); }} disabled={isDeleting} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">Cancel</button>
              <button onClick={confirmDelete} disabled={isDeleting} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 border border-transparent rounded-lg hover:bg-red-600 transition-colors shadow-sm disabled:bg-red-300">
                {isDeleting ? <><Loader2 size={14} className="animate-spin" /> Deleting...</> : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
