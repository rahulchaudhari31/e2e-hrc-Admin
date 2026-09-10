import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Image as ImageIcon, X, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { createEmployerHero, deleteEmployerHero, updateEmployerHero, getEmployerHero } from '../../services/employer/employerHeroService';

const EMPTY_FORM = {
  title: '',
  subtitle: '',
  image: '',
  isActive: true,
};

export default function EmployerHeroSection() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [heroData, setHeroData] = useState(EMPTY_FORM);
  const [heroId, setHeroId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadHero();
  }, []);

  const loadHero = async () => {
    setIsLoading(true);
    try {
      const res = await getEmployerHero();
      if (res && res.success && res.data) {
        setHeroId(res.data._id || null);
        setHeroData({
          title: res.data.title || '',
          subtitle: res.data.subtitle || '',
          image: res.data.imageurl || '',
          isActive: res.data.isActive !== undefined ? res.data.isActive : true,
        });
        setImagePreview(res.data.imageurl || '');
      } else {
        setHeroId(null);
        setHeroData(EMPTY_FORM);
        setImagePreview('');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load Employer Hero data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setHeroData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setHeroData((prev) => ({ ...prev, image: previewUrl }));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setHeroData((prev) => ({ ...prev, image: '' }));
  };

  const saveHero = async () => {
    if (!heroData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', heroData.title);
      formData.append('subtitle', heroData.subtitle);
      formData.append('isActive', String(heroData.isActive));
      if (imageFile) {
        formData.append('heroImage', imageFile);
      }

      const res = heroId
        ? await updateEmployerHero(heroId, formData)
        : await createEmployerHero(formData);

      if (res && res.success) {
        toast.success(heroId ? 'Employer Hero updated successfully' : 'Employer Hero created successfully');
        setImageFile(null);
        await loadHero();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save Employer Hero');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteHero = async () => {
    if (!heroId) return;
    setIsDeleting(true);
    try {
      const res = await deleteEmployerHero(heroId);
      if (res && res.success) {
        toast.success('Employer Hero deleted successfully');
        setHeroId(null);
        setHeroData(EMPTY_FORM);
        setImageFile(null);
        setImagePreview('');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete Employer Hero');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div
        className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">Employer Hero Section</h2>
          {heroId && (
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${heroData.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {heroData.isActive ? 'Active' : 'Inactive'}
            </span>
          )}
        </div>
        {isExpanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
      </div>

      {isExpanded && (
        <>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={heroData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                  placeholder="Enter hero title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <textarea
                  name="subtitle"
                  value={heroData.subtitle}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors resize-none"
                  placeholder="Enter hero subtitle"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={heroData.isActive}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
                </label>
                <span className="text-sm text-gray-700">{heroData.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <div className="mt-1 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:border-orange-300 transition-colors flex flex-col items-center justify-center relative overflow-hidden min-h-[260px]">
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white text-blue-600 hover:text-blue-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="bg-white text-red-500 hover:text-red-600 px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full text-gray-400 hover:text-orange-500 transition-colors p-6">
                    <ImageIcon size={34} className="mb-3 text-gray-300" />
                    <span className="text-sm font-medium">Click to upload image</span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP — max 5MB</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              {heroId && (
                <button
                  type="button"
                  onClick={deleteHero}
                  disabled={isDeleting}
                  className="text-red-500 hover:text-red-600 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Hero'}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={saveHero}
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-sm text-sm"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSaving ? 'Saving...' : 'Save Hero Section'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
