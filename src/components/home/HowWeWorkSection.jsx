import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Edit2, Trash2, Save, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getHowWeWork,
  createHowWeWork,
  updateHowWeWork,
  updateEmployerStep,
  updateEmployeeStep,
  deleteEmployerStep,
  deleteEmployeeStep,
} from '../../services/howWeWorkService';

const EMPTY_FORM = {
  sectionTitle: '',
  sectionDescription: '',
  isActive: true,
};

const EMPTY_STEP = {
  stepNumber: '',
  title: '',
  description: '',
  displayOrder: 1,
  isActive: true,
  journeyType: '',
};

const buildStepsPayload = (sectionData) => {
  const employerSteps = Array.isArray(sectionData?.employerSteps) ? sectionData.employerSteps : [];
  const employeeSteps = Array.isArray(sectionData?.employeeSteps) ? sectionData.employeeSteps : [];

  return [
    ...employerSteps.map((step) => ({ ...step, journeyType: 'employer' })),
    ...employeeSteps.map((step) => ({ ...step, journeyType: 'employee' })),
  ];
};

export default function HowWeWorkSection() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [section, setSection] = useState(null);
  const [sectionForm, setSectionForm] = useState(EMPTY_FORM);
  const [activeTab, setActiveTab] = useState('employer');
  const [isSaving, setIsSaving] = useState(false);
  const [stepModalOpen, setStepModalOpen] = useState(false);
  const [stepMode, setStepMode] = useState('create');
  const [selectedStep, setSelectedStep] = useState(null);
  const [stepForm, setStepForm] = useState(EMPTY_STEP);
  const [stepListType, setStepListType] = useState('employer');
  const [deletingStep, setDeletingStep] = useState(null);

  useEffect(() => {
    loadSection();
  }, []);

  const loadSection = async () => {
    setIsLoading(true);
    try {
      const res = await getHowWeWork();
      if (res?.data) {
        setSection(res.data);
        setSectionForm({
          sectionTitle: res.data.sectionTitle || '',
          sectionDescription: res.data.sectionDescription || '',
          isActive: res.data.isActive !== false,
        });
      } else {
        setSection(null);
        setSectionForm(EMPTY_FORM);
      }
    } catch (error) {
      console.error('Failed to load How We Work section:', error);
      toast.error('Failed to load How We Work section');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSectionForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleStepChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStepForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const openStepModal = (type, step = null) => {
    setStepListType(type);
    setStepMode(step ? 'edit' : 'create');
    setSelectedStep(step);
    setStepForm(step ? {
      stepNumber: step.stepNumber || '',
      title: step.title || '',
      description: step.description || '',
      displayOrder: step.displayOrder ?? step.displayorder ?? 1,
      isActive: step.isActive !== undefined ? step.isActive : true,
    } : EMPTY_STEP);
    setStepModalOpen(true);
  };

  const closeStepModal = () => {
    setStepModalOpen(false);
    setSelectedStep(null);
    setStepForm(EMPTY_STEP);
  };

  const saveSection = async () => {
    if (!sectionForm.sectionTitle.trim() || !sectionForm.sectionDescription.trim()) {
      toast.error('Section title and description are required');
      return;
    }

    setIsSaving(true);
    try {
      const stepsPayload = buildStepsPayload(section);
      console.log('Frontend Steps:', stepsPayload);

      if (!Array.isArray(stepsPayload)) {
        toast.error('Steps must be provided as an array');
        return;
      }

      const payload = {
        sectionTitle: sectionForm.sectionTitle,
        sectionDescription: sectionForm.sectionDescription,
        isActive: sectionForm.isActive,
        steps: stepsPayload,
      };

      if (section?._id) {
        await updateHowWeWork(section._id, payload);
      } else {
        await createHowWeWork(payload);
      }

      toast.success(section?._id ? 'How We Work section updated successfully!' : 'How We Work section created successfully!');
      await loadSection();
    } catch (error) {
      console.error('How We Work section save error:', error);
      toast.error(error.message || 'Failed to save section');
    } finally {
      setIsSaving(false);
    }
  };

  const saveStep = async () => {
    if (!stepForm.title.trim() || !stepForm.description.trim()) {
      toast.error('Step title and description are required');
      return;
    }

    try {
      const payload = {
        stepNumber: stepForm.stepNumber,
        title: stepForm.title,
        description: stepForm.description,
        displayOrder: Number(stepForm.displayOrder),
        isActive: stepForm.isActive,
        journeyType: stepListType,
      };

      if (!section?._id) {
        toast.error('Create the section first before adding steps');
        return;
      }

      const stepsPayload = buildStepsPayload(section);
      console.log('Frontend Steps:', stepsPayload);

      if (!Array.isArray(stepsPayload)) {
        toast.error('Steps must be provided as an array');
        return;
      }

      if (stepMode === 'edit' && selectedStep) {
        if (stepListType === 'employer') {
          await updateEmployerStep(section._id, selectedStep.index, payload);
        } else {
          await updateEmployeeStep(section._id, selectedStep.index, payload);
        }
        toast.success('Step updated successfully');
      } else {
        const existingSteps = stepListType === 'employer' ? section?.employerSteps || [] : section?.employeeSteps || [];
        const updatedSteps = [...existingSteps, { ...payload, displayOrder: Number(payload.displayOrder) || existingSteps.length + 1, isActive: payload.isActive }];
        const payloadData = {
          sectionTitle: sectionForm.sectionTitle,
          sectionDescription: sectionForm.sectionDescription,
          employerSteps: stepListType === 'employer' ? updatedSteps : section?.employerSteps || [],
          employeeSteps: stepListType === 'employee' ? updatedSteps : section?.employeeSteps || [],
          steps: [
            ...buildStepsPayload({
              employerSteps: stepListType === 'employer' ? updatedSteps : section?.employerSteps || [],
              employeeSteps: stepListType === 'employee' ? updatedSteps : section?.employeeSteps || [],
            }),
          ],
          isActive: sectionForm.isActive,
        };
        await updateHowWeWork(section._id, payloadData);
        toast.success('Step added successfully');
      }

      closeStepModal();
      await loadSection();
    } catch (error) {
      console.error('Step save error:', error);
      toast.error(error.message || 'Failed to save step');
    }
  };

  const handleDeleteStep = async (type, index) => {
    try {
      if (type === 'employer') {
        await deleteEmployerStep(section._id, index);
      } else {
        await deleteEmployeeStep(section._id, index);
      }
      toast.success('Step deleted successfully');
      await loadSection();
    } catch (error) {
      console.error('Delete step error:', error);
      toast.error(error.message || 'Failed to delete step');
    } finally {
      setDeletingStep(null);
    }
  };

  const steps = useMemo(() => {
    if (!section) return [];
    return activeTab === 'employer' ? (section.employerSteps || []) : (section.employeeSteps || []);
  }, [section, activeTab]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="flex items-center justify-between p-5 bg-orange-50 border-b border-orange-100 cursor-pointer select-none" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">How We Work</h2>
          {isLoading ? (
            <span className="bg-gray-100 text-gray-400 text-xs font-bold px-2 py-1 rounded-md animate-pulse">Loading...</span>
          ) : (
            <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-md">{section ? 'Configured' : 'Not Configured'}</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button onClick={(e) => { e.stopPropagation(); openStepModal(activeTab); }} className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
            <Plus size={16} /> Add Step
          </button>
          {isExpanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-6">
          <div className="rounded-xl border border-orange-100 bg-orange-50/70 p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Section Title</label>
                <input name="sectionTitle" value={sectionForm.sectionTitle} onChange={handleSectionChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="How We Work" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Section Status</label>
                <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-3 py-2">
                  <input type="checkbox" name="isActive" checked={sectionForm.isActive} onChange={handleSectionChange} className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                  <span className="text-sm text-gray-700">Active on public homepage</span>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Section Description</label>
                <textarea name="sectionDescription" value={sectionForm.sectionDescription} onChange={handleSectionChange} rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Describe the journey for employers and employees" />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={saveSection} disabled={isSaving} className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-70">
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {isSaving ? 'Saving...' : 'Save Section'}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 p-4">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setActiveTab('employer')} className={`rounded-full px-4 py-2 text-sm font-medium ${activeTab === 'employer' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700'}`}>Employer Journey</button>
              <button onClick={() => setActiveTab('employee')} className={`rounded-full px-4 py-2 text-sm font-medium ${activeTab === 'employee' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700'}`}>Employee Journey</button>
            </div>

            <div className="mt-4 overflow-x-auto">
              {isLoading ? (
                <div className="p-4 text-sm text-gray-500">Loading steps...</div>
              ) : steps.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">No steps added yet. Click “Add Step” to create one.</div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                      <th className="p-3 font-medium">Step</th>
                      <th className="p-3 font-medium">Title</th>
                      <th className="p-3 font-medium hidden lg:table-cell">Description</th>
                      <th className="p-3 font-medium hidden md:table-cell">Order</th>
                      <th className="p-3 font-medium">Status</th>
                      <th className="p-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {steps.map((step, index) => (
                      <tr key={`${activeTab}-${index}`} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 text-sm text-gray-700">{step.stepNumber || index + 1}</td>
                        <td className="p-3 text-sm text-gray-700">{step.title}</td>
                        <td className="p-3 text-sm text-gray-700 hidden lg:table-cell">{step.description}</td>
                        <td className="p-3 text-sm text-gray-700 hidden md:table-cell">{step.displayOrder ?? step.displayorder ?? index + 1}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${step.isActive !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {step.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openStepModal(activeTab, { ...step, index })} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Edit">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDeleteStep(activeTab, index)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {stepModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-800">{stepMode === 'edit' ? 'Edit Step' : 'Add Step'}</h3>
              <button onClick={closeStepModal} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Step Number</label>
                <input name="stepNumber" value={stepForm.stepNumber} onChange={handleStepChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="01" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Display Order</label>
                <input type="number" name="displayOrder" value={stepForm.displayOrder} onChange={handleStepChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Title</label>
                <input name="title" value={stepForm.title} onChange={handleStepChange} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Enter step title" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" value={stepForm.description} onChange={handleStepChange} rows={4} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Describe this journey step" />
              </div>
              <div className="md:col-span-2 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Active Status</p>
                  <p className="text-xs text-gray-500">Toggle to show or hide this step on the public homepage.</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" name="isActive" checked={stepForm.isActive} onChange={handleStepChange} className="peer sr-only" />
                  <div className="h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-orange-500 transition-colors" />
                  <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button onClick={closeStepModal} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={saveStep} className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600">
                <Save size={16} /> Save Step
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
