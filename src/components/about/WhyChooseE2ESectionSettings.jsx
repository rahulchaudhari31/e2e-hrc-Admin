import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAdminWhyChooseE2ESection,
  createWhyChooseE2ESection,
  updateWhyChooseE2ESection,
} from '../../services/aboutUs/whyChooseE2ESectionService.js';

// Shared Toggle Component
const Toggle = ({ checked, onChange, name }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" name={name} checked={checked} onChange={onChange} className="sr-only peer" />
    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
  </label>
);

const EMPTY_FORM = {
  sectionTitle: '',
  sectionDescription: '',
  isActive: true,
};

export default function WhyChooseE2ESectionSettings() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [sectionLoading, setSectionLoading] = useState(true);
  const [sectionSubmitting, setSectionSubmitting] = useState(false);
  const [sectionId, setSectionId] = useState(null);
  const [sectionForm, setSectionForm] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchSection();
  }, []);

  const fetchSection = async () => {
    try {
      setSectionLoading(true);
      const res = await getAdminWhyChooseE2ESection();
      const items = Array.isArray(res.data) ? res.data : [];
      const latestSection = items[0] || null;
      
      if (latestSection) {
        setSectionId(latestSection._id);
        setSectionForm({
          sectionTitle: latestSection.sectionTitle || '',
          sectionDescription: latestSection.sectionDescription || '',
          isActive: latestSection.isActive !== false,
        });
      } else {
        setSectionId(null);
        setSectionForm(EMPTY_FORM);
      }
    } catch (error) {
      console.error('Failed to load Why Choose E2E section:', error);
      toast.error(error?.response?.data?.message || 'Failed to load Why Choose E2E section.');
      setSectionId(null);
      setSectionForm(EMPTY_FORM);
    } finally {
      setSectionLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSectionForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validate = () => {
    if (!sectionForm.sectionTitle?.trim()) {
      toast.error('Section Title is required.');
      return false;
    }
    return true;
  };

  const saveSection = async () => {
    if (!validate()) return;

    setSectionSubmitting(true);
    try {
      const payload = {
        sectionTitle: sectionForm.sectionTitle.trim(),
        sectionDescription: sectionForm.sectionDescription.trim(),
        isActive: sectionForm.isActive,
      };

      if (sectionId) {
        // Update existing section
        const response = await updateWhyChooseE2ESection(sectionId, payload);
        
        // Extract updated section from response
        const updatedSection =
          response?.data?.data ??
          response?.data?.section ??
          response?.data ??
          null;

        // Update form with returned data
        if (updatedSection?._id) {
          setSectionId(updatedSection._id);
          setSectionForm({
            sectionTitle: updatedSection.sectionTitle || '',
            sectionDescription: updatedSection.sectionDescription || '',
            isActive: updatedSection.isActive !== false,
          });
        }
        toast.success('Section updated successfully!');
      } else {
        // Create new section
        const response = await createWhyChooseE2ESection(payload);
        
        // Extract created section from response
        const createdSection =
          response?.data?.data ??
          response?.data?.section ??
          response?.data ??
          null;

        // Update form with returned data immediately
        if (createdSection?._id) {
          setSectionId(createdSection._id);
          setSectionForm({
            sectionTitle: createdSection.sectionTitle || '',
            sectionDescription: createdSection.sectionDescription || '',
            isActive: createdSection.isActive !== false,
          });
          toast.success('Section created successfully!');
        } else {
          toast.error('Section created but could not retrieve data.');
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error?.response?.data?.message || `Failed to ${sectionId ? 'update' : 'create'} Why Choose E2E section.`);
    } finally {
      setSectionSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
      {/* Header / Toggle */}
      <div
        className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h3 className="text-lg font-bold text-gray-800">Why Choose E2E - Section Settings</h3>
          <p className="text-sm text-gray-500 mt-1">Manage the section header details</p>
        </div>
        <button className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Form Content */}
      {isExpanded && (
        <div className="p-6">
          {sectionLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 size={32} className="animate-spin text-orange-500" />
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="sectionTitle"
                  value={sectionForm.sectionTitle}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                  placeholder="e.g. Why Choose E2E HRC?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section Description</label>
                <textarea
                  name="sectionDescription"
                  value={sectionForm.sectionDescription}
                  onChange={handleFormChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors resize-none"
                  placeholder="Section description..."
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <label className="text-sm font-medium text-gray-700">Status:</label>
                <Toggle checked={sectionForm.isActive} onChange={handleFormChange} name="isActive" />
                <span className="text-sm text-gray-600">{sectionForm.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      {isExpanded && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={saveSection}
            disabled={sectionLoading || sectionSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-lg hover:bg-orange-600 disabled:bg-orange-300 transition-colors shadow-sm"
          >
            {sectionSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {sectionId ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save size={18} />
                {sectionId ? 'Update Section' : 'Create Section'}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
