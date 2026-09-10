import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Plus, Edit2, Trash2, Image as ImageIcon, X, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAllServices,
  createService,
  updateService,
  deleteService,
  uploadServiceImage,
} from '../../services/api';

const EMPTY_FORM = {
  title: '',
  shortDescription: '',
  image: '',
  order: 0,
  isActive: true,
};

export default function ServicesSection() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [services, setServices] = useState([]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = create mode
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Load all services on mount ─────────────────────────────────────────────
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setIsLoading(true);
    try {
      const res = await getAllServices();
      setServices(res.data || []);
      console.log('Loaded services:', res.data);
    } catch (error) {
      console.error('Failed to load services:', error);
      toast.error('Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };


  // ── Form handlers ──────────────────────────────────────────────────────────
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    setImageFile(file);
    setFormData(prev => ({ ...prev, image: URL.createObjectURL(file) }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = () => {
    setImageFile(null);
    setFormData(prev => ({ ...prev, image: '' }));
  };

  // ── Open add/edit modal ────────────────────────────────────────────────────
  const openAddModal = () => {
    setEditingId(null);
    setImageFile(null);
    setFormData({ ...EMPTY_FORM, order: services.length + 1 });
    setIsModalOpen(true);
  };

  const openEditModal = (svc) => {
    setEditingId(svc._id);
    setImageFile(null);
    setFormData({
      title: svc.title || '',
      shortDescription: svc.shortDescription || '',
      image: svc.image || '',
      order: svc.order ?? 0,
      isActive: svc.isActive !== undefined ? svc.isActive : true,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setImageFile(null);
    setFormData(EMPTY_FORM);
  };

  // ── Save service (create or update) ───────────────────────────────────────
  const saveService = async () => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsSaving(true);
    try {
      let savedService;

      if (editingId) {
        // UPDATE
        const res = await updateService(editingId, {
          title: formData.title,
          shortDescription: formData.shortDescription,
          order: Number(formData.order),
          isActive: formData.isActive,
        });
        savedService = res.data;
      } else {
        // CREATE
        const res = await createService({
          title: formData.title,
          shortDescription: formData.shortDescription,
          order: Number(formData.order),
          isActive: formData.isActive,
        });
        savedService = res.data;
        console.log('Created service:', savedService);
      }

      // Upload image if one was selected
      if (imageFile && savedService._id) {
        try {
          const imgRes = await uploadServiceImage(savedService._id, imageFile);
          savedService = imgRes.data;
          console.log('Uploaded image for service:', savedService);
        } catch (imgErr) {
          toast.error('Service saved but image upload failed: ' + imgErr.message);
        }
      }

      toast.success(editingId ? 'Service updated successfully!' : 'Service created successfully!');
      closeModal();
      await loadServices(); // Refresh list from server
    } catch (error) {
      console.error('Service save error:', error);
      toast.error(error.message || 'Failed to save service');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete service ─────────────────────────────────────────────────────────
  const openDeleteModal = (id) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteService(deletingId);
      toast.success('Service deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingId(null);
      await loadServices();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete service');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      {/* Header / Toggle */}
      <div
        className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">Services Section</h2>
          {isLoading ? (
            <span className="bg-gray-100 text-gray-400 text-xs font-bold px-2 py-1 rounded-md animate-pulse">Loading...</span>
          ) : (
            <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-md">
              {services.length} Services
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => { e.stopPropagation(); openAddModal(); }}
            className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={16} /> Add Service
          </button>
          {isExpanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-8 flex flex-col gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No services added yet. Click "Add Service" to create one.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-medium">Image</th>
                  <th className="p-4 font-medium">Title</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {services.map((svc) => (
                  <tr key={svc._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      {svc.image ? (
                        <img src={svc.image} alt={svc.title} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                          <ImageIcon size={16} />
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-gray-800 text-sm">{svc.title}</p>
                      <p className="text-xs text-gray-500 truncate max-w-37.5 sm:hidden">{svc.shortDescription || 'No description'}</p>
                    </td>
                    <td className="p-4 hidden sm:table-cell text-sm text-gray-500">{svc.shortDescription || 'No description'}</td>
                    <td className="p-4 hidden md:table-cell text-sm text-gray-500">{svc.order ?? 0}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${svc.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {svc.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2 flex items-center justify-end lg:mt-5 md:mt-8">
                      <button
                        onClick={() => openEditModal(svc)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(svc._id)}
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">
                {editingId ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Col */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                    <input type="text" name="title" value={formData.title} onChange={handleFormChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                      placeholder="e.g. Talent Acquisition" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                    <textarea name="shortDescription" value={formData.shortDescription} onChange={handleFormChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors resize-none"
                      placeholder="Brief summary of service..." />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                      <input type="number" name="order" value={formData.order} onChange={handleFormChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <div className="mt-2 flex items-center gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleFormChange} className="sr-only peer" />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
                        </label>
                        <span className="text-sm text-gray-600">{formData.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Col */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Image</label>
                    <div className="mt-1 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center relative overflow-hidden group h-32">
                      {formData.image ? (
                        <>
                          <img src={formData.image} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button type="button" onClick={() => fileInputRef.current?.click()}
                              className="bg-white text-blue-600 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm">
                              Change
                            </button>
                            <button type="button" onClick={removeImage}
                              className="bg-white text-red-500 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm flex items-center gap-1">
                              <X size={12} /> Remove
                            </button>
                          </div>
                          <input ref={fileInputRef} type="file" className="hidden" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} />
                        </>
                      ) : (
                        <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full text-gray-400 hover:text-orange-500 transition-colors">
                          <ImageIcon size={24} className="mb-2" />
                          <span className="text-xs font-medium">Upload Image</span>
                          <input ref={fileInputRef} type="file" className="hidden" accept="image/png,image/jpeg,image/webp" onChange={handleImageChange} />
                        </label>
                      )}
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
              <button onClick={closeModal} disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button onClick={saveService} disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-lg hover:bg-orange-600 transition-colors shadow-sm disabled:bg-orange-300">
                {isSaving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save Service</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-70 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Service?</h3>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => { setIsDeleteModalOpen(false); setDeletingId(null); }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 border border-transparent rounded-lg hover:bg-red-600 transition-colors shadow-sm disabled:bg-red-300">
                {isDeleting ? <><Loader2 size={14} className="animate-spin" /> Deleting...</> : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
