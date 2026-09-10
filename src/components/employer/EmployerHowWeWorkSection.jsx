import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Edit2,
  Trash2,
  Save,
  Loader2,
  X,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  createEmployerHowWeWorkStep,
  deleteEmployerHowWeWorkStep,
  getAdminHowWeWorkSteps,
  updateEmployerHowWeWorkStep,
} from "../../services/employer/employerHowWeWorkService";

const EMPTY_STEP = {
  title: "",
  description: "",
  order: 1,
  isActive: true,
};

export default function EmployerHowWeWorkSection() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [steps, setSteps] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStep, setNewStep] = useState({ ...EMPTY_STEP });
  const [addErrors, setAddErrors] = useState({});
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadSteps();
  }, []);

  const loadSteps = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminHowWeWorkSteps();
      if (res && res.success && Array.isArray(res.data)) {
        setSteps(res.data);
      } else {
        setSteps([]);
      }
    } catch (error) {
      toast.error(error.message || "Failed to load How We Work steps");
      setSteps([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ---- Add Step ----
  const handleNewStepChange = (e) => {
    if(steps.length>=6){
      toast.error("Maximum 6 steps are Allowed")
      return
    }
    const { name, value, type, checked } = e.target;
    setNewStep((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setAddErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateNewStep = () => {
    const errs = {};
    if (!newStep.title.trim()) errs.title = "Title is required";
    if (!newStep.description.trim())
      errs.description = "Description is required";
    setAddErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddStep = async () => {
    if (!validateNewStep()) return;
    setIsAdding(true);
    try {
      const payload = {
        title: newStep.title.trim(),
        description: newStep.description.trim(),
        order: Number(newStep.order) || 0,
        isActive: Boolean(newStep.isActive),
      };
      const res = await createEmployerHowWeWorkStep(payload);
      if (res && res.success) {
        toast.success(res.message || "Step created successfully");
        setNewStep({ ...EMPTY_STEP, order: steps.length + 2 });
        setShowAddForm(false);
        setAddErrors({});
        await loadSteps();
      }
    } catch (error) {
      toast.error(error.message || "Failed to create step");
    } finally {
      setIsAdding(false);
    }
  };

  // ---- Edit Step ----
  const startEditing = (step) => {
    setEditingId(step._id);
    setEditForm({
      title: step.title,
      description: step.description,
      order: step.order,
      isActive: step.isActive,
    });
    setEditErrors({});
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
    setEditErrors({});
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setEditErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateEditForm = () => {
    const errs = {};
    if (!editForm.title?.trim()) errs.title = "Title is required";
    if (!editForm.description?.trim())
      errs.description = "Description is required";
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveEdit = async (id) => {
    if (!validateEditForm()) return;
    setSavingId(id);
    try {
      const payload = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        order: Number(editForm.order) || 0,
        isActive: Boolean(editForm.isActive),
      };
      const res = await updateEmployerHowWeWorkStep(id, payload);
      if (res && res.success) {
        toast.success(res.message || "Step updated successfully");
        setEditingId(null);
        setEditForm({});
        await loadSteps();
      }
    } catch (error) {
      toast.error(error.message || "Failed to update step");
    } finally {
      setSavingId(null);
    }
  };

  // ---- Delete Step ----
  const handleDeleteStep = async (id) => {
    if (!window.confirm("Are you sure you want to delete this step?")) return;
    setDeletingId(id);
    try {
      const res = await deleteEmployerHowWeWorkStep(id);
      if (res && res.success) {
        toast.success(res.message || "Step deleted successfully");
        await loadSteps();
      }
    } catch (error) {
      toast.error(error.message || "Failed to delete step");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div
        className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">
            How We Work Steps
          </h2>
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${steps.length > 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
          >
            {steps.length > 0
              ? `${steps.length} step${steps.length > 1 ? "s" : ""}`
              : "No steps"}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp size={20} className="text-gray-500" />
        ) : (
          <ChevronDown size={20} className="text-gray-500" />
        )}
      </div>

      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Add Step Button / Form */}
          {!showAddForm ? (
            <button
              onClick={() => {
                if (steps.length >= 6) {
                  toast.error("Maximum 6 steps are allowed.");
                  return;
                }

                setShowAddForm(true);
                setNewStep({
                  ...EMPTY_STEP,
                  order: steps.length + 1,
                });
              }}
              disabled={steps.length >= 6}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                steps.length >= 6
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              <Plus size={16} />
              {steps.length >= 6 ? "Maximum 6 Steps" : "Add New Step"}
            </button>
          ) : (
            <div className="rounded-2xl border-2 border-orange-200 bg-orange-50/50 p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-900">New Step</p>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setAddErrors({});
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-1">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="title"
                    value={newStep.title}
                    onChange={handleNewStepChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    placeholder="Enter step title"
                  />
                  {addErrors.title && (
                    <p className="mt-1 text-sm text-red-600">
                      {addErrors.title}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={newStep.description}
                    onChange={handleNewStepChange}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none"
                    placeholder="Enter step description"
                  />
                  {addErrors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {addErrors.description}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    value={newStep.order}
                    onChange={handleNewStepChange}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-3 py-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={newStep.isActive}
                      onChange={handleNewStepChange}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
                  </label>
                  <span className="text-sm text-gray-700">Active</span>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleAddStep}
                  disabled={isAdding}
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors disabled:opacity-60"
                >
                  {isAdding ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}
                  {isAdding ? "Creating..." : "Create Step"}
                </button>
              </div>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-orange-500" />
              <span className="ml-2 text-sm text-gray-500">
                Loading steps...
              </span>
            </div>
          )}

          {/* Steps List */}
          {!isLoading && steps.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              No steps added yet. Click "Add New Step" to get started.
            </div>
          )}

          {!isLoading &&
            steps.map((step, index) => (
              <div
                key={step._id}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex items-center justify-between gap-3 pb-2 border-b border-gray-200 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-orange-100 text-orange-700 text-xs font-bold">
                      {step.order || index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {editingId === step._id ? "Editing Step" : step.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {step.isActive ? (
                          <span className="text-green-600">Active</span>
                        ) : (
                          <span className="text-red-500">Inactive</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {editingId === step._id ? (
                      <>
                        <button
                          onClick={cancelEditing}
                          className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                          <X size={14} /> Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(step._id)}
                          disabled={savingId === step._id}
                          className="inline-flex items-center gap-1 rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600 transition-colors disabled:opacity-60"
                        >
                          {savingId === step._id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Check size={14} />
                          )}
                          {savingId === step._id ? "Saving..." : "Save"}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(step)}
                          className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-100 hover:bg-blue-50 transition-colors"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteStep(step._id)}
                          disabled={deletingId === step._id}
                          className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-red-600 border border-red-100 hover:bg-red-50 transition-colors disabled:opacity-60"
                        >
                          {deletingId === step._id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                          {deletingId === step._id ? "Deleting..." : "Delete"}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {editingId === step._id ? (
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="md:col-span-1">
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="title"
                        value={editForm.title}
                        onChange={handleEditFormChange}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        placeholder="Enter step title"
                      />
                      {editErrors.title && (
                        <p className="mt-1 text-sm text-red-600">
                          {editErrors.title}
                        </p>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="description"
                        value={editForm.description}
                        onChange={handleEditFormChange}
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none"
                        placeholder="Enter step description"
                      />
                      {editErrors.description && (
                        <p className="mt-1 text-sm text-red-600">
                          {editErrors.description}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Order
                      </label>
                      <input
                        type="number"
                        name="order"
                        value={editForm.order}
                        onChange={handleEditFormChange}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-3 py-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={editForm.isActive}
                          onChange={handleEditFormChange}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
                      </label>
                      <span className="text-sm text-gray-700">Active</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="md:col-span-1">
                      <p className="text-xs text-gray-500 mb-1">Title</p>
                      <p className="text-sm text-gray-800 font-medium">
                        {step.title}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-500 mb-1">Description</p>
                      <p className="text-sm text-gray-700">
                        {step.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
