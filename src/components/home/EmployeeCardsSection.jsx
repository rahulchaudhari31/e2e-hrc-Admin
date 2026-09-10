import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Edit2, Trash2, Save, Loader2, X, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAllEmployerSectionCards,
  createEmployerSectionCard,
  updateEmployerSectionCard,
  deleteEmployerSectionCard,
  uploadEmployerSectionCardImage,
} from '../../services/api';

const EMPTY_FORM = {
  badgeText: '',
  titleLine: '',
  highlightedText: '',
  description: '',
  buttonText: '',
  buttonLink: '',
  cardType: 'employer',
  displayOrder: 1,
  isActive: true,
};

export default function EmployeeCardsSection() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [cards, setCards] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    setIsLoading(true);
    try {
      const res = await getAllEmployerSectionCards();
      setCards(Array.isArray(res?.data) ? res.data : []);
    } catch (error) {
      console.error('Failed to load employee cards:', error);
      toast.error('Failed to load employee cards');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setImageFile(null);
    setImagePreview('');
    setIsModalOpen(true);
  };

  const openEditModal = (card) => {
    setEditingId(card._id);
    setFormData({
      badgeText: card.badgeText || '',
      titleLine: card.titleLine || '',
      highlightedText: card.highlightedText || '',
      description: card.description || '',
      buttonText: card.buttonText || '',
      buttonLink: card.buttonLink || '',
      cardType: card.cardType || 'employer',
      displayOrder: card.displayOrder ?? 1,
      isActive: card.isActive !== false,
    });
    setImageFile(null);
    setImagePreview(card.image || '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setImageFile(null);
    setImagePreview('');
  };

  const saveCard = async () => {
      if (!formData.badgeText.trim() || !formData.titleLine.trim() || !formData.highlightedText.trim() || !formData.description.trim() || !formData.buttonText.trim() || !formData.buttonLink.trim()) {
        toast.error('Badge text, title line, highlighted text, description, button text and button link are required');
        return;
      }

    setIsSaving(true);
    try {
      const payload = {
        badgeText: formData.badgeText,
        titleLine: formData.titleLine,
        highlightedText: formData.highlightedText,
        description: formData.description,
        buttonText: formData.buttonText,
        buttonLink: formData.buttonLink,
        cardType: formData.cardType,
        displayOrder: Number(formData.displayOrder),
        isActive: formData.isActive,
      };

      let savedCard;
      if (editingId) {
        const res = await updateEmployerSectionCard(editingId, payload);
        savedCard = res.data;
      } else {
        const res = await createEmployerSectionCard(payload);
        savedCard = res.data;
      }

      if (imageFile && savedCard?._id) {
        await uploadEmployerSectionCardImage(savedCard._id, imageFile);
      }

      toast.success(editingId ? 'Employee card updated successfully!' : 'Employee card created successfully!');
      closeModal();
      await loadCards();
    } catch (error) {
      console.error('Employee card save error:', error);
      toast.error(error.message || 'Failed to save employee card');
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
      await deleteEmployerSectionCard(deletingId);
      toast.success('Employee card deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingId(null);
      await loadCards();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete employee card');
    } finally {
      setIsDeleting(false);
    }
  };

  const sortedCards = useMemo(() => {
    return [...cards].sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0));
  }, [cards]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="flex items-center justify-between p-5 bg-orange-50 border-b border-orange-100 cursor-pointer select-none" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">Employee Cards</h2>
          {isLoading ? (
            <span className="bg-gray-100 text-gray-400 text-xs font-bold px-2 py-1 rounded-md animate-pulse">Loading...</span>
          ) : (
            <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-md">{cards.length} Cards</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button onClick={(e) => { e.stopPropagation(); openAddModal(); }} className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
            <Plus size={16} /> Add Card
          </button>
          {isExpanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-8 flex flex-col gap-4">
              {[1, 2].map((item) => (
                <div key={item} className="animate-pulse flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : sortedCards.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No employee cards added yet. Click “Add Card” to create one.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-medium">Badge</th>
                  <th className="p-4 font-medium">Title</th>
                  <th className="p-4 font-medium hidden md:table-cell">Order</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedCards.map((card) => (
                  <tr key={card._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm text-gray-700">{card.badgeText}</td>
                    <td className="p-4 text-sm text-gray-700">{card.titleLine}</td>
                    <td className="p-4 text-sm text-gray-700 hidden md:table-cell">{card.displayOrder}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${card.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {card.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditModal(card)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => openDeleteModal(card._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800">{editingId ? 'Edit Employee Card' : 'Add Employee Card'}</h3>
              <button onClick={closeModal} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Badge Text</label>
                <input name="badgeText" value={formData.badgeText} onChange={handleFormChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="For Employees" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Display Order</label>
                <input type="number" name="displayOrder" value={formData.displayOrder} onChange={handleFormChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Title Line</label>
                <input name="titleLine" value={formData.titleLine} onChange={handleFormChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="e.g. Grow Your Career" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Highlighted Text</label>
                <input name="highlightedText" value={formData.highlightedText} onChange={handleFormChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="e.g. Today" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" value={formData.description} onChange={handleFormChange} rows={4} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Describe this employee card" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Button Text</label>
                <input name="buttonText" value={formData.buttonText} onChange={handleFormChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Explore Opportunities" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Button Link</label>
                <input name="buttonLink" value={formData.buttonLink} onChange={handleFormChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="https://" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Card Type</label>
                <select name="cardType" value={formData.cardType} onChange={handleFormChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                  <option value="employer">Employer</option>
                  <option value="employee">Employee</option>
                </select>
              </div>
              <div className="md:col-span-2 rounded-xl border border-dashed border-gray-300 p-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">Image Upload</label>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                {imagePreview && (
                  <div className="mt-3 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <img src={imagePreview} alt="Preview" className="h-16 w-16 rounded-lg object-cover" />
                    <p className="text-sm text-gray-600">Image ready to upload</p>
                  </div>
                )}
              </div>
              <div className="md:col-span-2 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Active Status</p>
                  <p className="text-xs text-gray-500">Toggle to show or hide this card on the public homepage.</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleFormChange} className="peer sr-only" />
                  <div className="h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-orange-500 transition-colors" />
                  <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button onClick={closeModal} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={saveCard} disabled={isSaving} className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-70">
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {isSaving ? 'Saving...' : 'Save Card'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-800">Delete employee card?</h3>
            <p className="mt-2 text-sm text-gray-600">This action cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => { setIsDeleteModalOpen(false); setDeletingId(null); }} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={confirmDelete} disabled={isDeleting} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-70">
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
