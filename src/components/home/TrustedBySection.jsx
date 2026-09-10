import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Plus, Edit2, Trash2, Image as ImageIcon, X, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getTrustedBySection,
  createTrustedBySection,
  updateTrustedBySection,
  deleteTrustedBySection,
} from '../../services/trustedBySectionService';
import {
  getAllTrustedByLogos,
  createTrustedByLogoWithImage,
  updateTrustedByLogo,
  deleteTrustedByLogo,
  uploadTrustedByLogoImage,
} from '../../services/trustedByLogoService';

const EMPTY_SECTION = {
  badgeText: '',
  title: '',
  isActive: true,
};

const EMPTY_LOGO = {
  companyName: '',
  websiteUrl: '',
  order: 0,
  isActive: true,
  logo: '',
};

export default function TrustedBySection() {
  // Section state
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [section, setSection] = useState(null);
  const [logos, setLogos] = useState([]);

  // Section modal state
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [isSectionSaving, setIsSectionSaving] = useState(false);
  const [sectionFormData, setSectionFormData] = useState(EMPTY_SECTION);

  // Logo modal state
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const [isLogoSaving, setIsLogoSaving] = useState(false);
  const [editingLogoId, setEditingLogoId] = useState(null);
  const [logoFormData, setLogoFormData] = useState(EMPTY_LOGO);
  const [logoImageFile, setLogoImageFile] = useState(null);
  const logoFileInputRef = useRef(null);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingLogoId, setDeletingLogoId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sectionRes, logosRes] = await Promise.all([
        getTrustedBySection().catch(() => null),
        getAllTrustedByLogos().catch(() => ({ data: [] })),
      ]);

      if (sectionRes?.data) {
        setSection(sectionRes.data);
      }
      setLogos(logosRes?.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load Trusted By section');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Section Handlers ─────────────────────────────────────────────────────
  const handleSectionFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSectionFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const openSectionModal = () => {
    if (section) {
      setSectionFormData({
        badgeText: section.badgeText || '',
        title: section.title || '',
        isActive: section.isActive !== undefined ? section.isActive : true,
      });
    } else {
      setSectionFormData(EMPTY_SECTION);
    }
    setIsSectionModalOpen(true);
  };

  const closeSectionModal = () => {
    setIsSectionModalOpen(false);
    setSectionFormData(EMPTY_SECTION);
  };

  const saveSection = async () => {
    if (!sectionFormData.badgeText.trim() || !sectionFormData.title.trim()) {
      toast.error('Badge text and title are required');
      return;
    }

    setIsSectionSaving(true);
    try {
      if (section) {
        // UPDATE
        const res = await updateTrustedBySection(section._id, {
          badgeText: sectionFormData.badgeText,
          title: sectionFormData.title,
          isActive: sectionFormData.isActive,
        });
        setSection(res.data);
        toast.success('Section updated successfully!');
      } else {
        // CREATE
        const res = await createTrustedBySection({
          badgeText: sectionFormData.badgeText,
          title: sectionFormData.title,
          isActive: sectionFormData.isActive,
        });
        setSection(res.data);
        toast.success('Section created successfully!');
      }
      closeSectionModal();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save section');
    } finally {
      setIsSectionSaving(false);
    }
  };

  // ─── Logo Handlers ────────────────────────────────────────────────────────
  const handleLogoFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLogoFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogoImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    setLogoImageFile(file);
    setLogoFormData(prev => ({ ...prev, logo: URL.createObjectURL(file) }));
    if (logoFileInputRef.current) logoFileInputRef.current.value = '';
  };

  const removeLogoImage = () => {
    setLogoImageFile(null);
    setLogoFormData(prev => ({ ...prev, logo: '' }));
  };

  const openAddLogoModal = () => {
    setEditingLogoId(null);
    setLogoImageFile(null);
    setLogoFormData({ ...EMPTY_LOGO, order: logos.length + 1 });
    setIsLogoModalOpen(true);
  };

  const openEditLogoModal = (logo) => {
    setEditingLogoId(logo._id);
    setLogoImageFile(null);
    setLogoFormData({
      companyName: logo.companyName || '',
      websiteUrl: logo.websiteUrl || '',
      logo: logo.logo || '',
      order: logo.order ?? 0,
      isActive: logo.isActive !== undefined ? logo.isActive : true,
    });
    setIsLogoModalOpen(true);
  };

  const closeLogoModal = () => {
    setIsLogoModalOpen(false);
    setEditingLogoId(null);
    setLogoImageFile(null);
    setLogoFormData(EMPTY_LOGO);
  };

  const saveLogo = async () => {

    setIsLogoSaving(true);
    try {
      let savedLogo;

      if (editingLogoId) {
        // UPDATE
        const res = await updateTrustedByLogo(editingLogoId, {
          companyName: logoFormData.companyName,
          websiteUrl: logoFormData.websiteUrl,
          order: Number(logoFormData.order),
          isActive: logoFormData.isActive,
        });
        savedLogo = res.data;
      } else {
        // CREATE
        if (!logoImageFile) {
          toast.error('Logo image is required');
          setIsLogoSaving(false);
          return;
        }

        // Check max 10 logos
        if (logos.length >= 10) {
          toast.error('Maximum 10 logos allowed');
          setIsLogoSaving(false);
          return;
        }

        const formData = new FormData();
        formData.append('companyName', logoFormData.companyName);
        formData.append('websiteUrl', logoFormData.websiteUrl || '');
        formData.append('order', Number(logoFormData.order));
        formData.append('isActive', logoFormData.isActive);
        formData.append('logo', logoImageFile);

        const res = await createTrustedByLogoWithImage(formData);
        savedLogo = res.data;
      }

      // Upload image if one was selected
      if (logoImageFile && savedLogo._id && editingLogoId) {
        try {
          const imgRes = await uploadTrustedByLogoImage(savedLogo._id, logoImageFile);
          savedLogo = imgRes.data;
        } catch (imgErr) {
          toast.error('Logo saved but image upload failed: ' + imgErr.message);
        }
      }

      toast.success(editingLogoId ? 'Logo updated successfully!' : 'Logo created successfully!');
      closeLogoModal();
      await loadData();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save logo');
    } finally {
      setIsLogoSaving(false);
    }
  };

  const openDeleteModal = (id) => {
    setDeletingLogoId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingLogoId) return;
    setIsDeleting(true);
    try {
      await deleteTrustedByLogo(deletingLogoId);
      toast.success('Logo deleted successfully');
      setIsDeleteModalOpen(false);
      setDeletingLogoId(null);
      await loadData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete logo');
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
          <h2 className="text-lg font-semibold text-gray-800">Trusted By Section</h2>
          {isLoading ? (
            <span className="bg-gray-100 text-gray-400 text-xs font-bold px-2 py-1 rounded-md animate-pulse">Loading...</span>
          ) : (
            <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-md">
              {logos.length} Logos
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {section && (
            <button
              onClick={(e) => { e.stopPropagation(); openSectionModal(); }}
              className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              <Edit2 size={16} /> Edit Section
            </button>
          )}
          {!section && (
            <button
              onClick={(e) => { e.stopPropagation(); openSectionModal(); }}
              className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus size={16} /> Create Section
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); openAddLogoModal(); }}
            className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            disabled={!section || logos.length >= 10}
            title={!section ? 'Create section first' : logos.length >= 10 ? 'Maximum 10 logos' : 'Add Logo'}
          >
            <Plus size={16} /> Add Logo
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
          ) : !section ? (
            <div className="p-8 text-center text-gray-500">
              No section configured. Click "Create Section" to get started.
            </div>
          ) : logos.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No logos added yet. Click "Add Logo" to create one.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-medium">Logo</th>
                  <th className="p-4 font-medium">Company</th>
                  <th className="p-4 font-medium">Website</th>
                  <th className="p-4 font-medium">Order</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logos.map((logo) => (
                  <tr key={logo._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      {logo.logo ? (
                        <img src={logo.logo} alt={logo.companyName} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                          <ImageIcon size={16} />
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-gray-800 text-sm">{logo.companyName}</p>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{logo.order ?? 0}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${logo.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {logo.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2 flex items-center justify-end">
                      <button
                        onClick={() => openEditLogoModal(logo)}
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(logo._id)}
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

      {/* Section Modal */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">
                {section ? 'Edit Trusted By Section' : 'Create Trusted By Section'}
              </h3>
              <button onClick={closeSectionModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Badge Text <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="badgeText"
                    value={sectionFormData.badgeText}
                    onChange={handleSectionFormChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                    placeholder="e.g. Trusted By Leading Companies"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="title"
                    value={sectionFormData.title}
                    onChange={handleSectionFormChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                    placeholder="e.g. Trusted By 500+ Companies Worldwide"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="mt-2 flex items-center gap-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={sectionFormData.isActive}
                        onChange={handleSectionFormChange}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
                    </label>
                    <span className="text-sm text-gray-600">{sectionFormData.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={closeSectionModal}
                disabled={isSectionSaving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={saveSection}
                disabled={isSectionSaving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-lg hover:bg-orange-600 transition-colors shadow-sm disabled:bg-orange-300"
              >
                {isSectionSaving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save Section</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logo Modal */}
      {isLogoModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">
                {editingLogoId ? 'Edit Logo' : 'Add New Logo'}
              </h3>
              <button onClick={closeLogoModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Col */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name <span className="text-red-500"></span></label>
                    <input
                      type="text"
                      name="companyName"
                      value={logoFormData.companyName}
                      onChange={handleLogoFormChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                      placeholder="e.g. Google"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                    <input
                      type="url"
                      name="websiteUrl"
                      value={logoFormData.websiteUrl}
                      onChange={handleLogoFormChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                      placeholder="e.g. https://example.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                      <input
                        type="number"
                        name="order"
                        value={logoFormData.order}
                        onChange={handleLogoFormChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <div className="mt-2 flex items-center gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="isActive"
                            checked={logoFormData.isActive}
                            onChange={handleLogoFormChange}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
                        </label>
                        <span className="text-xs text-gray-600">{logoFormData.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Col */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo Image {!editingLogoId && <span className="text-red-500">*</span>}</label>
                    <div className="mt-1 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center relative overflow-hidden group h-32">
                      {logoFormData.logo ? (
                        <>
                          <img src={logoFormData.logo} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => logoFileInputRef.current?.click()}
                              className="bg-white text-blue-600 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm"
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={removeLogoImage}
                              className="bg-white text-red-500 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm flex items-center gap-1"
                            >
                              <X size={12} /> Remove
                            </button>
                          </div>
                          <input
                            ref={logoFileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleLogoImageChange}
                          />
                        </>
                      ) : (
                        <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full text-gray-400 hover:text-orange-500 transition-colors">
                          <ImageIcon size={24} className="mb-2" />
                          <span className="text-xs font-medium">Upload Image</span>
                          <input
                            ref={logoFileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleLogoImageChange}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={closeLogoModal}
                disabled={isLogoSaving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={saveLogo}
                disabled={isLogoSaving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-lg hover:bg-orange-600 transition-colors shadow-sm disabled:bg-orange-300"
              >
                {isLogoSaving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save Logo</>}
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
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Logo?</h3>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => { setIsDeleteModalOpen(false); setDeletingLogoId(null); }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 border border-transparent rounded-lg hover:bg-red-600 transition-colors shadow-sm disabled:bg-red-300"
              >
                {isDeleting ? <><Loader2 size={14} className="animate-spin" /> Deleting...</> : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
