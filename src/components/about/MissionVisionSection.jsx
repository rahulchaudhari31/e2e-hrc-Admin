import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Save, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAdminMissionVision,
  createMissionVision,
  updateMissionVision,
  deleteMissionVision,
} from '../../services/aboutUs/missionVisionService';

const EMPTY_FORM = {
  type: 'mission',
  icon: '',
  title: '',
  description: '',
  order: 1,
  isActive: true,
};

export default function MissionVisionSection() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminMissionVision();
      setItems(res.data || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load Mission & Vision items');
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ ...EMPTY_FORM, order: items.length + 1 });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item._id);
    setFormData({
      type: item.type || 'mission',
      icon: item.icon || '',
      title: item.title || '',
      description: item.description || '',
      order: item.order ?? 1,
      isActive: item.isActive !== undefined ? item.isActive : true,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const saveItem = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Title and description are required');
      return;
    }

    if (!['mission', 'vision'].includes(formData.type)) {
      toast.error('Type must be mission or vision');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        type: formData.type,
        icon: formData.icon,
        title: formData.title,
        description: formData.description,
        order: Number(formData.order),
        isActive: formData.isActive,
      };

      if (editingId) {
        await updateMissionVision(editingId, payload);
      } else {
        await createMissionVision(payload);
      }

      toast.success(editingId ? 'Item updated successfully' : 'Item created successfully');
      closeModal();
      await loadItems();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || error.message || 'Failed to save item');
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
      await deleteMissionVision(deletingId);
      toast.success('Item deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingId(null);
      await loadItems();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || error.message || 'Failed to delete item');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer select-none" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">Mission & Vision Section</h2>
          <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-md">{items.length} Items</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={(e) => { e.stopPropagation(); openAddModal(); }} className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
            <Plus size={16} /> Add Item
          </button>
          {isExpanded ? <X size={18} className="text-gray-500" /> : <Plus size={18} className="text-gray-500" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-sm text-gray-500">Loading...</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No mission or vision items added yet.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Title</th>
                  <th className="p-4 font-medium hidden md:table-cell">Order</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm font-medium text-gray-700 capitalize">{item.type}</td>
                    <td className="p-4 text-sm text-gray-700">{item.title}</td>
                    <td className="p-4 hidden md:table-cell text-sm text-gray-500">{item.order}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => openEditModal(item)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => openDeleteModal(item._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Delete">
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

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">{editingId ? 'Edit Item' : 'Add New Item'}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-colors">
                  <option value="mission">Mission</option>
                  <option value="vision">Vision</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <input type="text" name="icon" value={formData.icon} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-colors" placeholder="🚩" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-colors resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <input type="number" name="order" value={formData.order} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="mt-2 flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
                    </label>
                    <span className="text-sm text-gray-600">{formData.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
              <button onClick={closeModal} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">Cancel</button>
              <button onClick={saveItem} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-lg hover:bg-orange-600 transition-colors shadow-sm disabled:bg-orange-300">
                {isSaving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4"><Trash2 size={24} /></div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Item?</h3>
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
