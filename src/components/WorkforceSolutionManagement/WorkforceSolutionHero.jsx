import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Image as ImageIcon, Save, Loader2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  createWorkforceSolutionHero,
  deleteWorkforceSolutionHero,
  getWorkforceSolutionHeroes,
  updateWorkforceSolutionHero,
  updateWorkforceSolutionHeroImage,
} from '../../services/workforceSolution/workforceSolutionService';

const defaultStats = [
  { value: '18+', label: 'Years Experience', order: 1 },
  { value: '450+', label: 'Clients Served', order: 2 },
  { value: '12K+', label: 'Placements', order: 3 },
  { value: '4', label: 'Global Offices', order: 4 },
];

const EMPTY_FORM = {
  badgeText: '',
  titleLine1: '',
  titleLine2: '',
  highlightedTitle: '',
  description: '',
  isActive: true,
};

export default function WorkforceSolutionHero() {
  const [isHeroExpanded, setIsHeroExpanded] = useState(true);
  const [isStatsExpanded, setIsStatsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingHero, setIsSavingHero] = useState(false);
  const [isSavingStats, setIsSavingStats] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [heroData, setHeroData] = useState(EMPTY_FORM);
  const [stats, setStats] = useState([...defaultStats]);
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
      const response = await getWorkforceSolutionHeroes();
      const items = Array.isArray(response?.data) ? response.data : [];
      const latestHero = items[0] || null;

      if (latestHero) {
        setHeroId(latestHero._id || null);
        setHeroData({
          badgeText: latestHero.badgeText || '',
          titleLine1: latestHero.titleLine1 || '',
          highlightedTitle: latestHero.highlightedTitle || '',
          description: latestHero.description || '',
          isActive: latestHero.isActive !== undefined ? latestHero.isActive : true,
        });
        setStats(Array.isArray(latestHero.stats) && latestHero.stats.length ? latestHero.stats : [...defaultStats]);
        setImagePreview(latestHero.heroImage || '');
      } else {
        setHeroId(null);
        setHeroData(EMPTY_FORM);
        setStats([...defaultStats]);
        setImagePreview('');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load workforce solution data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHeroChange = (event) => {
    const { name, value } = event.target;
    setHeroData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const validateHero = () => {
    if (!heroData.badgeText.trim()) {
      toast.error('Badge text is required');
      return false;
    }
    if (!heroData.titleLine1.trim()) {
      toast.error('Title line 1 is required');
      return false;
    }
    if (!heroData.highlightedTitle.trim()) {
      toast.error('Highlighted title is required');
      return false;
    }
    if (!heroData.description.trim()) {
      toast.error('Description is required');
      return false;
    }
    return true;
  };

  const validateStats = () => {
    if (!stats.length) {
      toast.error('At least one stat card is required');
      return false;
    }

    for (const stat of stats) {
      if (!stat.value?.trim()) {
        toast.error('Each stat card needs a value');
        return false;
      }
      if (!stat.label?.trim()) {
        toast.error('Each stat card needs a label');
        return false;
      }
    }

    return true;
  };

  const saveHeroSection = async () => {
    if (!validateHero()) return;

    setIsSavingHero(true);
    try {
      const formData = new FormData();
      formData.append('badgeText', heroData.badgeText);
      formData.append('titleLine1', heroData.titleLine1);
      formData.append('highlightedTitle', heroData.highlightedTitle);
      formData.append('description', heroData.description);
      formData.append('isActive', String(heroData.isActive));
      formData.append('stats', JSON.stringify(stats));
      if (imageFile) {
        formData.append('image', imageFile);
      }

      let response;
      if (heroId) {
        response = await updateWorkforceSolutionHero(heroId, {
          badgeText: heroData.badgeText,
          titleLine1: heroData.titleLine1,
          highlightedTitle: heroData.highlightedTitle,
          description: heroData.description,
          isActive: heroData.isActive,
          stats,
        });

        if (imageFile) {
          const imagePayload = new FormData();
          imagePayload.append('image', imageFile);
          await updateWorkforceSolutionHeroImage(heroId, imagePayload);
        }
      } else {
        response = await createWorkforceSolutionHero(formData);
      }

      if (response?.success) {
        toast.success(heroId ? 'Workforce Solution hero updated successfully' : 'Workforce Solution hero created successfully');
        setImageFile(null);
        await loadHero();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save workforce solution hero');
    } finally {
      setIsSavingHero(false);
    }
  };

  const saveStatsCards = async () => {
    if (!validateStats()) return;
    if (!heroId) {
      toast.error('Create the hero section first before saving stats');
      return;
    }

    setIsSavingStats(true);
    try {
      const response = await updateWorkforceSolutionHero(heroId, {
        badgeText: heroData.badgeText,
        titleLine1: heroData.titleLine1,
        titleLine2: heroData.titleLine2,
        highlightedTitle: heroData.highlightedTitle,
        description: heroData.description,
        isActive: heroData.isActive,
        stats,
      });

      if (response?.success) {
        toast.success('Stats cards saved successfully');
        await loadHero();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save stats cards');
    } finally {
      setIsSavingStats(false);
    }
  };

  const addStat = () => {
    setStats((prev) => [...prev, { value: '', label: '', order: prev.length + 1 }]);
  };

  const updateStat = (index, field, value) => {
    setStats((prev) => prev.map((stat, statIndex) => (statIndex === index ? { ...stat, [field]: value } : stat)));
  };

  const removeStat = (index) => {
    setStats((prev) => prev.filter((_, statIndex) => statIndex !== index));
  };

  const deleteHero = async () => {
    if (!heroId) return;
    setIsDeleting(true);
    try {
      const response = await deleteWorkforceSolutionHero(heroId);
      if (response?.success) {
        toast.success('Workforce Solution hero deleted successfully');
        setHeroId(null);
        setHeroData(EMPTY_FORM);
        setStats([...defaultStats]);
        setImageFile(null);
        setImagePreview('');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete workforce solution hero');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10 relative md:mt-15 mt-5">
      {isLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
          Loading workforce solution data...
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div
              className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer select-none"
              onClick={() => setIsHeroExpanded(!isHeroExpanded)}
            >
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-800">Workforce Solution Hero Section</h2>
                {heroId && (
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${heroData.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {heroData.isActive ? 'Active' : 'Inactive'}
                  </span>
                )}
              </div>
              {isHeroExpanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
            </div>

            {isHeroExpanded && (
              <>
                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Badge Text <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="badgeText"
                        value={heroData.badgeText}
                        onChange={handleHeroChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                        placeholder="Enter badge text"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title Line 1 <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="titleLine1"
                        value={heroData.titleLine1}
                        onChange={handleHeroChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                        placeholder="Enter title line 1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Highlighted Title <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="highlightedTitle"
                        value={heroData.highlightedTitle}
                        onChange={handleHeroChange}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                        placeholder="Enter highlighted title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                      <textarea
                        name="description"
                        value={heroData.description}
                        onChange={handleHeroChange}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors resize-none"
                        placeholder="Enter description"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={heroData.isActive}
                          onChange={(event) => setHeroData((prev) => ({ ...prev, isActive: event.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
                      </label>
                      <span className="text-sm text-gray-700">{heroData.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image</label>
                    <div className="mt-1 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:border-orange-300 transition-colors flex flex-col items-center justify-center relative overflow-hidden min-h-65">
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
                    onClick={saveHeroSection}
                    disabled={isSavingHero}
                    className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-sm text-sm"
                  >
                    {isSavingHero ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {isSavingHero ? 'Saving...' : 'Save Hero Section'}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div
              className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer select-none"
              onClick={() => setIsStatsExpanded(!isStatsExpanded)}
            >
              <h2 className="text-lg font-semibold text-gray-800">Stats Cards</h2>
              {isStatsExpanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
            </div>

            {isStatsExpanded && (
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Manage stats cards shown in the workforce solution hero section.</p>
                  <button
                    type="button"
                    onClick={addStat}
                    className="inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-medium text-orange-600 hover:bg-orange-100"
                  >
                    <Plus size={16} />
                    Add Stat Card
                  </button>
                </div>

                <div className="space-y-3">
                  {stats.map((stat, index) => (
                    <div key={`${stat.value || 'stat'}-${index}`} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-700">Stat #{index + 1}</span>
                        <button type="button" onClick={() => removeStat(index)} className="text-sm font-medium text-red-500 hover:text-red-600">
                          Remove
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                          <input
                            type="text"
                            value={stat.value || ''}
                            onChange={(event) => updateStat(index, 'value', event.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                            placeholder="e.g. 18+"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                          <input
                            type="text"
                            value={stat.label || ''}
                            onChange={(event) => updateStat(index, 'label', event.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                            placeholder="e.g. Years Experience"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                          <input
                            type="number"
                            value={stat.order ?? ''}
                            onChange={(event) => updateStat(index, 'order', Number(event.target.value))}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                            placeholder="1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={saveStatsCards}
                    disabled={isSavingStats}
                    className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-sm text-sm"
                  >
                    {isSavingStats ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {isSavingStats ? 'Saving...' : 'Save Stats Cards'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
