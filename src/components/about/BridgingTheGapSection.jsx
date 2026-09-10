import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Image as ImageIcon, X, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getBridgingTheGap, createBridgingTheGap, updateBridgingTheGap, uploadBridgingTheGapImage } from '../../services/api';

const EMPTY_FORM = {
  heading: '',
  description: '',
  image: '',
  isActive: true,
};

export default function BridgingTheGapSection() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState(EMPTY_FORM);
  const [features, setFeatures] = useState(['']);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await getBridgingTheGap();
      if (res && res.data) {
        setData({ ...EMPTY_FORM, ...res.data });
        const loadedFeatures = [res.data.feature1 || '', res.data.feature2 || '', res.data.feature3 || ''];
        const hasFeatureValue = loadedFeatures.some((feature) => feature.toString().trim() !== '');
        setFeatures(hasFeatureValue ? loadedFeatures : ['']);
      } else {
        setData(EMPTY_FORM);
        setFeatures(['']);
      }
    } catch (error) {
      if (!error.message?.includes('404')) {
        toast.error('Failed to load Bridging The Gap data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFeatureChange = (index, value) => {
    setFeatures((prev) => prev.map((feature, idx) => (idx === index ? value : feature)));
  };

  const handleAddFeature = () => {
    if (features.length >= 3) return;
    setFeatures((prev) => [...prev, '']);
  };

  const handleRemoveFeature = (index) => {
    setFeatures((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      return next.length ? next : [''];
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setImageFile(file);
      setData((prev) => ({ ...prev, image: URL.createObjectURL(file) }));
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setData((prev) => ({ ...prev, image: '' }));
  };

  const handleSave = async () => {
    if (!data.heading?.trim()) {
      toast.error('Heading is required');
      return;
    }

    setIsSaving(true);
    try {
      let res;
      if (data._id) {
        if (imageFile) {
          const uploadRes = await uploadBridgingTheGapImage(imageFile, data._id);
          if (uploadRes && uploadRes.data) {
            setData((prev) => ({ ...prev, image: uploadRes.data.image || prev.image }));
          }
        }

        const payload = {
          heading: data.heading.trim(),
          description: data.description || '',
          feature1: features[0] || '',
          feature2: features[1] || '',
          feature3: features[2] || '',
          isActive: data.isActive === false ? false : true,
        };
        res = await updateBridgingTheGap(data._id, payload);
      } else {
        const formData = new FormData();
        formData.append('heading', data.heading.trim());
        formData.append('description', data.description || '');
        formData.append('feature1', features[0] || '');
        formData.append('feature2', features[1] || '');
        formData.append('feature3', features[2] || '');
        formData.append('isActive', data.isActive === false ? 'false' : 'true');
        if (imageFile) {
          formData.append('image', imageFile);
        }
        res = await createBridgingTheGap(formData);
      }

      if (res && res.data) {
        setData({ ...EMPTY_FORM, ...res.data });
        const loadedFeatures = [res.data.feature1 || '', res.data.feature2 || '', res.data.feature3 || ''];
        const hasFeatureValue = loadedFeatures.some((feature) => feature.toString().trim() !== '');
        setFeatures(hasFeatureValue ? loadedFeatures : ['']);
      }

      toast.success('Bridging The Gap saved successfully!');
      await loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to save Bridging The Gap');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div
        className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">Bridging The Gap Section</h2>
          <div className="flex items-center gap-2 ml-4">
            <span className="text-sm text-gray-500">Status:</span>
            <label className="relative inline-flex items-center cursor-pointer" onClick={(e) => e.stopPropagation()}>
              <input type="checkbox" name="isActive" checked={data.isActive} onChange={handleChange} className="sr-only peer" />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
        </div>
        {isExpanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
      </div>

      {isExpanded && (
        <>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              <div className="col-span-2 flex justify-center py-10"><Loader2 className="animate-spin text-orange-500" size={32} /></div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Heading <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="heading"
                      value={data.heading}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                      placeholder="e.g. Bridging The Gap"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={data.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors resize-none"
                      placeholder="Enter description..."
                    />
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
                        <p className="text-xs text-gray-500">Add up to 3 features. Empty values will be saved as blank.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddFeature}
                        disabled={features.length >= 3}
                        className="text-sm px-3 py-1.5 rounded-lg border border-orange-500 text-orange-600 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add Feature
                      </button>
                    </div>

                    {features.map((feature, index) => (
                      <div key={`feature-${index}`} className="grid grid-cols-[1fr_auto] gap-3 items-start">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Feature {index + 1}</label>
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                            placeholder={`Feature ${index + 1}`}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(index)}
                          className="mt-7 inline-flex items-center justify-center px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section Image</label>
                  <div className="mt-1 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors flex flex-col items-center justify-center relative overflow-hidden group min-h-75 h-[calc(100%-1.75rem)]">
                    {data.image ? (
                      <>
                        <img src={data.image} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button onClick={() => fileInputRef.current?.click()} className="bg-white text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 shadow-sm">
                            Change
                          </button>
                          <button onClick={removeImage} className="bg-white text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 shadow-sm">
                            <X size={14} /> Remove
                          </button>
                        </div>
                        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                      </>
                    ) : (
                      <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full text-gray-400 hover:text-orange-500 transition-colors">
                        <ImageIcon size={40} className="mb-3 text-gray-300" />
                        <span className="text-sm font-medium">Click to upload image</span>
                        <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                      </label>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-sm text-sm"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSaving ? 'Saving...' : 'Save Bridging The Gap'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
