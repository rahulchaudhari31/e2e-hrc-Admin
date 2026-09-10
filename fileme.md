/* import React, { useState, useRef } from 'react';
import { ChevronDown, ChevronUp, Image as ImageIcon, X, Upload, Save, Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { uploadHeroImage } from '../../services/heroImageService';

export default function HeroSection({ data, onChange, onSave, isSaving, isLoading }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingIndex, setEditingIndex] = useState(null);
  const [statDraft, setStatDraft] = useState({ label: '', value: '' });
  const [statError, setStatError] = useState('');
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    onChange('hero', {
      ...data,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error
    setImageUploadError('');

    // Create local preview immediately
    const previewUrl = URL.createObjectURL(file);
    onChange('hero', {
      ...data,
      heroImage: previewUrl,
      heroImageFile: file,
    });

    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Upload to backend
    try {
      setImageUploadLoading(true);
      const uploadResult = await uploadHeroImage(file);

      // Update with the processed transparent PNG URL from backend
      onChange('hero', {
        ...data,
        heroImage: uploadResult.heroImage,
        heroImageFile: null, // Clear file reference after upload
      });

      // Show success message (you may want to add a toast here)
      console.log('Image uploaded successfully:', uploadResult.heroImage);
    } catch (error) {
      console.error('Image upload failed:', error);
      setImageUploadError(error.message || 'Failed to upload image');
      
      // Reset to previous state on error
      onChange('hero', {
        ...data,
        heroImage: data.heroImage, // Keep previous image
        heroImageFile: null,
      });
    } finally {
      setImageUploadLoading(false);
    }
  };

  const removeImage = () => {
    onChange('hero', { ...data, heroImage: '', heroImageFile: null });
    setImageUploadError('');
  };

  const isActive = data.isActive !== undefined ? data.isActive : true;
  const stats = Array.isArray(data.stats) ? data.stats : [];

  const updateStats = (nextStats) => onChange('hero', { ...data, stats: nextStats });

  const saveStat = () => {
    const label = statDraft.label.trim();
    const value = statDraft.value.trim();
    if (!label || !value) {
      setStatError('Label and value are both required.');
      return;
    }

    const nextStats = [...stats];
    if (editingIndex === null && nextStats.length >= 4) {
      setStatError('Maximum of 4 label + value pairs reached.');
      return;
    }
    if (editingIndex === null) nextStats.push({ label, value });
    else nextStats[editingIndex] = { label, value };
    updateStats(nextStats);
    setStatError('');
    setStatDraft({ label: '', value: '' });
    setEditingIndex(null);
  };

  const editStat = (index) => {
    setStatDraft({ ...stats[index] });
    setStatError('');
    setEditingIndex(index);
  };

  const removeStat = (index) => {
    updateStats(stats.filter((_, itemIndex) => itemIndex !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setStatDraft({ label: '', value: '' });
      setStatError('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      {/* Header / Toggle */}
      <div
        className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-lg font-semibold text-gray-800">Hero Section</h2>

          {/* Active Status Toggle */}
          <div className="flex items-center gap-2 ml-2" onClick={e => e.stopPropagation()}>
            <label className="relative inline-flex items-center cursor-pointer gap-2">
              <input
                type="checkbox"
                name="isActive"
                className="sr-only peer"
                checked={isActive}
                onChange={handleChange}
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </label>
          </div>
        </div>
        {isExpanded ? <ChevronUp size={20} className="text-gray-500 shrink-0" /> : <ChevronDown size={20} className="text-gray-500 shrink-0" />}
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column — Text Fields */}
          <div className="space-y-4">
            {isLoading ? (
              // Skeleton loader
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-10 bg-gray-100 rounded-lg w-full"></div>
                </div>
              ))
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={data.title || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                    placeholder="Enter main heading"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Highlighted Text
                    <span className="text-gray-400 text-xs font-normal ml-1">(text from title to highlight)</span>
                  </label>
                  <input
                    type="text"
                    name="highlightedText"
                    value={data.highlightedText || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                    placeholder="e.g. Futures. (must exist in title)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter the text from the title that should be highlighted in orange. Leave empty to highlight nothing.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                  <input
                    type="text"
                    name="subtitle"
                    value={data.subtitle || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                    placeholder="e.g. Trusted Recruitment Partner Across the UK"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={data.description || ''}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors resize-none"
                    placeholder="Enter hero description..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
                    <input
                      type="text"
                      name="buttonText"
                      value={data.buttonText || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                      placeholder="e.g. Hire Talent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
                    <input
                      type="text"
                      name="buttonLink"
                      value={data.buttonLink || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column — Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image</label>
            <div className="mt-1 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 flex flex-col items-center justify-center relative overflow-hidden group min-h-[300px] h-[calc(100%-1.75rem)] transition-colors hover:border-orange-300">
              {isLoading ? (
                <div className="animate-pulse w-full h-full min-h-[300px] bg-gray-200 rounded-xl"></div>
              ) : imageUploadLoading ? (
                <div className="flex flex-col items-center justify-center gap-3">
                  <Loader2 size={32} className="text-orange-500 animate-spin" />
                  <span className="text-sm font-medium text-gray-600">Processing image...</span>
                  <span className="text-xs text-gray-500">Removing background...</span>
                </div>
              ) : data.heroImage ? (
                <>
                  <img
                    src={data.heroImage}
                    alt="Hero Preview"
                    className="w-full h-full object-contain rounded-xl"
                    style={{ minHeight: '300px' }}
                  />
                  {/* Hover overlay with actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={imageUploadLoading}
                      className="bg-white text-blue-600 hover:text-blue-700 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm"
                    >
                      <Upload size={14} /> Change
                    </button>
                    <button
                      type="button"
                      onClick={removeImage}
                      disabled={imageUploadLoading}
                      className="bg-white text-red-500 hover:text-red-600 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm"
                    >
                      <X size={14} /> Remove
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                    disabled={imageUploadLoading}
                  />
                </>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full min-h-[300px] text-gray-400 hover:text-orange-500 transition-colors p-6">
                  <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mb-4">
                    <ImageIcon size={32} className="text-orange-300" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Click to upload hero image</span>
                  <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP — max 5MB</span>
                  <span className="text-xs text-gray-500 mt-3 text-center">Background will be automatically removed</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleImageChange}
                    disabled={imageUploadLoading}
                  />
                </label>
              )}
            </div>
            {imageUploadError && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600 font-medium">{imageUploadError}</p>
              </div>
            )}
          </div>

          {/* Label + Value pairs */}
          <div className="md:col-span-2 border-t border-gray-100 pt-5">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Label + Value</h3>
                <p className="text-xs text-gray-500 mt-1">Add up to 4 Hero statistics.</p>
              </div>
              <span className="text-xs font-semibold text-gray-500">{stats.length}/4</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                <input
                  value={statDraft.label}
                  onChange={(event) => setStatDraft((previous) => ({ ...previous, label: event.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                  placeholder="e.g. Years of Experience"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                <input
                  value={statDraft.value}
                  onChange={(event) => setStatDraft((previous) => ({ ...previous, value: event.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                  placeholder="e.g. 15+"
                />
              </div>
              <button
                type="button"
                onClick={saveStat}
                disabled={stats.length >= 4 && editingIndex === null}
                className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
              >
                {editingIndex === null ? <Plus size={16} /> : <Pencil size={15} />}
                {editingIndex === null ? 'Add' : 'Update'}
              </button>
            </div>
            {statError && <p className="text-xs text-red-500 mt-2">{statError}</p>}

            {stats.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                {stats.map((stat, index) => (
                  <div key={`${stat.label}-${index}`} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 truncate">{stat.label}</p>
                    <p className="text-lg font-semibold text-gray-800 mt-1 break-words">{stat.value}</p>
                    <div className="flex gap-2 mt-3">
                      <button type="button" onClick={() => editStat(index)} className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded px-2 py-1"><Pencil size={13} /> Edit</button>
                      <button type="button" onClick={() => removeStat(index)} className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded px-2 py-1"><Trash2 size={13} /> Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section Footer: Save Button */}
      {isExpanded && (
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || isLoading}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-sm text-sm"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSaving ? 'Saving...' : 'Save Hero Section'}
          </button>
        </div>
      )}
    </div>
  );
} 

