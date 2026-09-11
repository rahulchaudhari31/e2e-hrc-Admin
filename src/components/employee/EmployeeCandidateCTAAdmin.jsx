import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Save, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  deleteCandidateCTA,
  getAdminCandidateCTA,
  saveCandidateCTA,
} from '../../services/employee/employeeCandidateCTAService';

const EMPTY_CARD = {
  badgeLabel: '',
  badgeIcon: '',
  headingLine1: '',
  headingAccent: '',
  headingRest: '',
  baseColor: '#FFFFFF',
  accentColor: '#F39308',
  description: '',
  descriptionColor: '#FFFFFF',
  bg: '#C9DB82',
  buttonText: 'Explore',
  buttonLink: '#',
};

const EMPTY_FORM = {
  employerCard: { ...EMPTY_CARD },
  employeeCard: { ...EMPTY_CARD, baseColor: '#004CA5', descriptionColor: '#004CA5', bg: '#FFFFFF' },
  isActive: true,
};

const CARD_FIELDS = [
  { key: 'badgeLabel', label: 'Badge Label' },
  { key: 'headingLine1', label: 'Heading Line 1' },
  { key: 'headingAccent', label: 'Heading Accent (highlighted word)' },
  { key: 'headingRest', label: 'Heading Rest (last word)' },
  { key: 'baseColor', label: 'Base Text Color (hex)' },
  { key: 'accentColor', label: 'Accent Color (hex)' },
  { key: 'description', label: 'Description', textarea: true },
  { key: 'descriptionColor', label: 'Description Color (hex)' },
  { key: 'bg', label: 'Background Color (hex)' },
  { key: 'buttonText', label: 'Button Text' },
  { key: 'buttonLink', label: 'Button Link' },
];

export default function EmployeeCandidateCTAAdmin() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadCTA();
  }, []);

  const loadCTA = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminCandidateCTA();
      if (res && res.success && res.data) {
        const d = res.data;
        setFormData({
          employerCard: { ...EMPTY_CARD, ...(d.employerCard || {}) },
          employeeCard: { ...EMPTY_CARD, baseColor: '#004CA5', descriptionColor: '#004CA5', bg: '#FFFFFF', ...(d.employeeCard || {}) },
          isActive: d.isActive !== false,
        });
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load Candidate CTA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (cardKey) => (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [cardKey]: {
        ...prev[cardKey],
        [name]: type === 'checkbox' ? checked : value,
      },
    }));
    if (formError) setFormError('');
  };

  const handleSave = async () => {
    if (!formData.employerCard.badgeLabel.trim() || !formData.employeeCard.badgeLabel.trim()) {
      setFormError('Both cards need a badge label');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        employerCard: { ...formData.employerCard },
        employeeCard: { ...formData.employeeCard },
        isActive: Boolean(formData.isActive),
      };
      ['employerCard', 'employeeCard'].forEach((key) => {
        ['badgeLabel', 'headingLine1', 'headingAccent', 'headingRest', 'description', 'buttonText', 'buttonLink'].forEach((f) => {
          payload[key][f] = (payload[key][f] || '').trim();
        });
      });
      const res = await saveCandidateCTA(payload);
      if (res && res.success) {
        toast.success('Candidate CTA saved successfully');
        setFormError('');
        await loadCTA();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save Candidate CTA');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Reset this section back to defaults? This clears saved content and cannot be undone.')) return;
    setIsSaving(true);
    try {
      const res = await deleteCandidateCTA();
      if (res && res.success) {
        toast.success('Candidate CTA deleted');
        await loadCTA();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete Candidate CTA');
    } finally {
      setIsSaving(false);
    }
  };

  const renderCardForm = (cardKey, title) => (
    <div className="rounded-2xl border border-gray-200 p-4 space-y-4">
      <p className="text-sm font-semibold text-gray-900">{title}</p>
      <div className="grid gap-4 md:grid-cols-2">
        {CARD_FIELDS.map((field) => (
          <div key={field.key} className={field.key === 'description' ? 'md:col-span-2' : ''}>
            <label className="mb-1 block text-sm font-medium text-gray-700">{field.label}</label>
            {field.textarea ? (
              <textarea
                name={field.key}
                value={formData[cardKey][field.key] || ''}
                onChange={handleChange(cardKey)}
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none"
              />
            ) : (
              <input
                name={field.key}
                value={formData[cardKey][field.key] || ''}
                onChange={handleChange(cardKey)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div
        className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">Candidate CTA (Two Cards)</h2>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${formData.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            {formData.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        {isExpanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
      </div>

      {isExpanded && (
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-orange-500" />
            </div>
          ) : (
            <div className="space-y-4">
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5">
                  {formError}
                </div>
              )}
              {renderCardForm('employerCard', 'For Employers Card')}
              {renderCardForm('employeeCard', 'For Employee Card')}
              <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-3 py-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
                </label>
                <span className="text-sm text-gray-700">Active</span>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleDelete}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-60"
                >
                  Reset to Defaults
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors disabled:opacity-60"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {isSaving ? 'Saving...' : 'Save CTA'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}