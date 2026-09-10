import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getContactCTA, saveContactCTA } from '../../services/api';

const EMPTY_FORM = {
  badgeText: '',
  headingLine1: '',
  highlightText: '',
  headingLine2: '',
  description: '',
  feature1: '',
  feature2: '',
  button1Text: '',
  button2Text: '',
  isActive: true,
};

export default function ContactCTASection() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [ctaData, setCtaData] = useState(EMPTY_FORM);

  // ── Load CTA data on mount ─────────────────────────────────────────────────
  useEffect(() => {
    const loadCTA = async () => {
      setIsLoading(true);
      try {
        const res = await getContactCTA();
        if (res && res.data) {
          setCtaData({ ...EMPTY_FORM, ...res.data });
        }
      } catch (error) {
        // 404 just means no CTA exists yet — that's fine, form stays empty
        if (!error.message?.includes('404')) {
          console.error('Failed to load Contact CTA:', error);
          toast.error('Failed to load Contact CTA data');
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadCTA();
  }, []);

  // ── Form handler ───────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCtaData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // ── Save (upsert) ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!ctaData.headingLine1.trim()) {
      toast.error('Heading Line 1 is required');
      return;
    }
    if (!ctaData.highlightText.trim()) {
      toast.error('Highlight Text is required');
      return;
    }
    if (!ctaData.headingLine2.trim()) {
      toast.error('Heading Line 2 is required');
      return;
    }
    if (!ctaData.description.trim()) {
      toast.error('Description is required');
      return;
    }

    setIsSaving(true);
    try {
      const res = await saveContactCTA({
        badgeText: ctaData.badgeText,
        headingLine1: ctaData.headingLine1,
        highlightText: ctaData.highlightText,
        headingLine2: ctaData.headingLine2,
        description: ctaData.description,
        feature1: ctaData.feature1,
        feature2: ctaData.feature2,
        button1Text: ctaData.button1Text,
        button2Text: ctaData.button2Text,
        isActive: ctaData.isActive,
      });
      // Keep state in sync with the saved record (updates _id if newly created)
      if (res && res.data) {
        setCtaData({ ...EMPTY_FORM, ...res.data });
      }
      toast.success('Contact CTA saved successfully!');
    } catch (error) {
      console.error('Contact CTA save error:', error);
      toast.error(error.message || 'Failed to save Contact CTA');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-24">
      {/* Header / Toggle */}
      <div
        className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-lg font-semibold text-gray-800">Contact CTA Section</h2>

          {/* Active Status Toggle */}
          <div className="flex items-center gap-2 ml-2" onClick={e => e.stopPropagation()}>
            <label className="relative inline-flex items-center cursor-pointer gap-2">
              <input
                type="checkbox"
                name="isActive"
                className="sr-only peer"
                checked={ctaData.isActive}
                onChange={handleChange}
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ctaData.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                {ctaData.isActive ? 'Active' : 'Inactive'}
              </span>
            </label>
          </div>
        </div>
        {isExpanded ? <ChevronUp size={20} className="text-gray-500 shrink-0" /> : <ChevronDown size={20} className="text-gray-500 shrink-0" />}
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            // Skeleton loader
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                  <div className="h-10 bg-gray-100 rounded-lg w-full" />
                </div>
              ))}
            </>
          ) : (
            <>
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Badge Text</label>
                  <input
                    type="text" name="badgeText" value={ctaData.badgeText} onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                    placeholder="e.g. Let's Connect"
                  />
                </div>

                <div className="space-y-4 pt-2 border-t border-gray-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heading Line 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text" name="headingLine1" value={ctaData.headingLine1} onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                      placeholder="e.g. Ready to transform"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Highlight Text <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text" name="highlightText" value={ctaData.highlightText} onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors text-orange-500 font-medium"
                      placeholder="e.g. your business?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heading Line 2 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text" name="headingLine2" value={ctaData.headingLine2} onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                      placeholder="e.g. Contact us today."
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description" value={ctaData.description} onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors resize-none"
                    placeholder="Enter contact CTA description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Feature 1</label>
                    <input
                      type="text" name="feature1" value={ctaData.feature1} onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                      placeholder="e.g. 24/7 Support"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Feature 2</label>
                    <input
                      type="text" name="feature2" value={ctaData.feature2} onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                      placeholder="e.g. Expert Team"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Button 1 Text</label>
                    <input
                      type="text" name="button1Text" value={ctaData.button1Text} onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                      placeholder="e.g. Contact Us"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Button 2 Text</label>
                    <input
                      type="text" name="button2Text" value={ctaData.button2Text} onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                      placeholder="e.g. View Services"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Section Footer: Save Button */}
      {isExpanded && (
        <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-sm text-sm"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSaving ? 'Saving...' : 'Save Contact CTA'}
          </button>
        </div>
      )}
    </div>
  );
}
