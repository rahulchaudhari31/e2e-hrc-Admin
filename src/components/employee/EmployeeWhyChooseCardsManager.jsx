import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, X, Loader2, Star, Image as ImageIcon } from 'lucide-react';
import {
  getEmployeeWhyChooseCards,
  createEmployeeWhyChooseCard,
  updateEmployeeWhyChooseCard,
  updateEmployeeWhyChooseCardImage,
  deleteEmployeeWhyChooseCard,
} from '../../services/employee/employeeWhyChooseService';

const EMPTY_CARD = {
  eyebrowText: '',
  title: '',
  description: '',
  stat1Value: '',
  stat1Label: '',
  stat2Value: '',
  stat2Label: '',
  order: 0,
  isActive: true,
};

const Toggle = ({ checked, onChange, name }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" name={name} checked={checked} onChange={onChange} className="sr-only peer" />
    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
  </label>
);

export default function EmployeeWhyChooseCardsManager() {
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState(EMPTY_CARD);
  const [errors, setErrors] = useState({});
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setIsLoading(true);
      const res = await getEmployeeWhyChooseCards();
      const items = Array.isArray(res.data) ? res.data : [];
      const sortedCards = items.sort((a, b) => (a.order || 0) - (b.order || 0));
      setCards(sortedCards);
    } catch (error) {
      toast.error(error.message || 'Failed to load cards.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, or WEBP)');
        return;
      }
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.title?.trim()) errs.title = 'Title is required.';
    if (!formData.description?.trim()) errs.description = 'Description is required.';
    if (formData.order === '' || isNaN(formData.order) || formData.order < 0) errs.order = 'Order must be a non-negative number.';
    return errs;
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(EMPTY_CARD);
    setSelectedImageFile(null);
    setImagePreview('');
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (card) => {
    setEditingId(card._id);
    setFormData({
      eyebrowText: card.eyebrowText || '',
      title: card.title || '',
      description: card.description || '',
      stat1Value: card.stat1Value || '',
      stat1Label: card.stat1Label || '',
      stat2Value: card.stat2Value || '',
      stat2Label: card.stat2Label || '',
      order: card.order ?? 0,
      isActive: card.isActive ?? true,
    });
    setSelectedImageFile(null);
    setImagePreview(card.image || '');
    setErrors({});
    setIsModalOpen(true);
  };

  const openDeleteModal = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const saveCard = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setIsSaving(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('eyebrowText', formData.eyebrowText.trim());
      formDataObj.append('title', formData.title.trim());
      formDataObj.append('description', formData.description.trim());
      formDataObj.append('stat1Value', formData.stat1Value.trim());
      formDataObj.append('stat1Label', formData.stat1Label.trim());
      formDataObj.append('stat2Value', formData.stat2Value.trim());
      formDataObj.append('stat2Label', formData.stat2Label.trim());
      formDataObj.append('order', String(formData.order || 0));
      formDataObj.append('isActive', String(formData.isActive));

      if (selectedImageFile) {
        formDataObj.append('image', selectedImageFile);
      }

      if (editingId) {
        await updateEmployeeWhyChooseCard(editingId, formDataObj);
        toast.success('Card updated successfully!');
      } else {
        await createEmployeeWhyChooseCard(formDataObj);
        toast.success('Card created successfully!');
      }
      setIsModalOpen(false);
      fetchCards();
    } catch (error) {
      toast.error(error.message || 'Failed to save card.');
    } finally {
      setIsSaving(false);
    }
  };

  const doDeleteCard = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteEmployeeWhyChooseCard(deletingId);
      toast.success('Card deleted successfully!');
      setIsDeleteModalOpen(false);
      fetchCards();
    } catch (error) {
      toast.error(error.message || 'Failed to delete card.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900">Employee Why Choose Cards</h3>
        <p className="text-sm text-gray-500 mt-1">Manage the individual cards displayed in the Why Choose section.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-gray-50 border-b border-gray-200 gap-4">
          <div className="flex items-center gap-3">
            <h4 className="text-base font-semibold text-gray-800">All Cards</h4>
            {!isLoading && (
              <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-md">
                {cards.length} Cards
              </span>
            )}
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Plus size={16} /> Add Card
          </button>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-16 flex justify-center">
              <Loader2 size={32} className="animate-spin text-orange-500" />
            </div>
          ) : cards.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-4">
                <Star size={28} className="text-orange-300" />
              </div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">No Cards Found</h4>
              <p className="text-sm text-gray-400 mb-5">Click below to create your first Employee Why Choose card.</p>
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
                  <th className="p-4 font-medium">Title</th>
                  <th className="p-4 font-medium">Description</th>
                  <th className="p-4 font-medium text-center">Order</th>
                  <th className="p-4 font-medium text-center">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cards.map((card, idx) => (
                  <tr key={card._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm text-gray-600">{idx + 1}</td>
                    <td className="p-4 text-sm font-semibold text-gray-800">{card.title}</td>
                    <td className="p-4 text-sm text-gray-500 max-w-[220px] truncate" title={card.description}>
                      {card.description?.length > 50 ? card.description.substring(0, 50) + '...' : card.description}
                    </td>
                    <td className="p-4 text-sm text-gray-600 text-center">{card.order}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${card.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {card.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1">
                      <button
                        onClick={() => openEditModal(card)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(card._id)}
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[92vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-bold text-gray-800">{editingId ? 'Edit Card' : 'Add Card'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Eyebrow Text</label>
                <input
                  type="text"
                  name="eyebrowText"
                  value={formData.eyebrowText}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                  placeholder="e.g. CAREER FIRST, ALWAYS"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors ${errors.title ? 'border-red-400' : 'border-gray-200'}`}
                  placeholder="e.g. Candidate-Centric Approach"
                />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows="3"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors resize-none ${errors.description ? 'border-red-400' : 'border-gray-200'}`}
                  placeholder="Enter card description..."
                />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                {imagePreview && (
                  <div className="mb-3 relative">
                    <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg border border-gray-200" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stat 1 Value</label>
                  <input
                    type="text"
                    name="stat1Value"
                    value={formData.stat1Value}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                    placeholder="e.g. 500+"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stat 1 Label</label>
                  <input
                    type="text"
                    name="stat1Label"
                    value={formData.stat1Label}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                    placeholder="e.g. ACTIVE CLIENTS"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stat 2 Value</label>
                  <input
                    type="text"
                    name="stat2Value"
                    value={formData.stat2Value}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                    placeholder="e.g. 98%"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stat 2 Label</label>
                  <input
                    type="text"
                    name="stat2Label"
                    value={formData.stat2Label}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                    placeholder="e.g. SATISFACTION RATE"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleFormChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors ${errors.order ? 'border-red-400' : 'border-gray-200'}`}
                    min="0"
                  />
                  {errors.order && <p className="text-xs text-red-500 mt-1">{errors.order}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Toggle checked={formData.isActive} onChange={handleFormChange} name="isActive" />
                    <span className="text-sm text-gray-600">{formData.isActive ? 'Active' : 'Inactive'}</span>
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
                onClick={saveCard}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-lg hover:bg-orange-600 disabled:bg-orange-300 transition-colors shadow-sm"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                {isSaving ? 'Saving...' : editingId ? 'Update Card' : 'Save Card'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Card?</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this Employee Why Choose card? This action cannot be undone.</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={doDeleteCard}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:bg-red-300 transition-colors shadow-sm"
              >
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : null}
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
