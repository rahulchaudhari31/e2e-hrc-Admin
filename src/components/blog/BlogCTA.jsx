import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Edit2, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import { getBlogCTA, createBlogCTA, updateBlogCTA, deleteBlogCTA } from "../../services/blog/blogCtaService";

const EMPTY_FORM = { title: "", description: "", buttonText: "", buttonLink: "", isActive: true };

export default function BlogCTA() {
  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState({});

  useEffect(() => { loadItem(); }, []);

  const loadItem = async () => {
    setIsLoading(true);
    try {
      const response = await getBlogCTA();
      const records = Array.isArray(response?.data) ? response.data : [];
      setItem(records[0] || null);
    } catch (error) {
      toast.error(error.message || "Failed to load Blog CTA records.");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateForm = () => {
    setFormData({ ...EMPTY_FORM });
    setErrors({});
    setIsFormVisible(true);
  };

  const openEditForm = () => {
    if (!item) return;
    setFormData({ title: item.title || "", description: item.description || "", buttonText: item.buttonText || "", buttonLink: item.buttonLink || "", isActive: item.isActive ?? true });
    setErrors({});
    setIsFormVisible(true);
  };

  const closeForm = () => {
    if (isSaving) return;
    setIsFormVisible(false);
    setFormData({ ...EMPTY_FORM });
    setErrors({});
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((previous) => ({ ...previous, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((previous) => ({ ...previous, [name]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.title.trim()) nextErrors.title = "Title is required.";
    if (!formData.description.trim()) nextErrors.description = "Description is required.";
    if (!formData.buttonText.trim()) nextErrors.buttonText = "Button text is required.";
    if (!formData.buttonLink.trim()) nextErrors.buttonLink = "Button link is required.";
    if (typeof formData.isActive !== "boolean") nextErrors.isActive = "Status must be active or inactive.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveItem = async () => {
    if (isSaving) return;
    if (!validate()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setIsSaving(true);
    const payload = { title: formData.title.trim(), description: formData.description.trim(), buttonText: formData.buttonText.trim(), buttonLink: formData.buttonLink.trim(), isActive: formData.isActive };
    try {
      if (item?._id) {
        await updateBlogCTA(item._id, payload);
        toast.success("Blog CTA updated successfully.");
      } else {
        await createBlogCTA(payload);
        toast.success("Blog CTA created successfully.");
      }
      setIsFormVisible(false);
      await loadItem();
    } catch (error) {
      toast.error(error.message || (item?._id ? "Failed to update Blog CTA." : "Failed to create Blog CTA."));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!item?._id || isDeleting || !window.confirm("Are you sure you want to delete this Blog CTA?")) return;
    setIsDeleting(true);
    try {
      await deleteBlogCTA(item._id);
      toast.success("Blog CTA deleted successfully.");
      setItem(null);
      setIsFormVisible(false);
      setFormData({ ...EMPTY_FORM });
    } catch (error) {
      toast.error(error.message || "Failed to delete Blog CTA.");
    } finally {
      setIsDeleting(false);
    }
  };

  const renderField = (field, label) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label} <span className="text-red-500">*</span></label>
      <input type="text" name={field} value={formData[field]} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors ${errors[field] ? "border-red-400 bg-red-50" : "border-gray-200"}`} />
      {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 mx-4">
      <div className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer select-none" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-3"><h2 className="text-lg font-semibold text-gray-800">Blog CTA Section</h2><span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-md">{item ? "1 Item" : "0 Items"}</span></div>
        <div className="flex items-center gap-3">
          {!item && !isFormVisible && !isLoading && <button type="button" onClick={(event) => { event.stopPropagation(); openCreateForm(); }} className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"><Plus size={16} /> Add CTA</button>}
          {isExpanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
        </div>
      </div>

      {isExpanded && (isLoading ? (
        <div className="p-8 flex justify-center text-sm text-gray-500"><Loader2 size={18} className="animate-spin text-orange-400 mr-2" />Loading Blog CTA records...</div>
      ) : isFormVisible ? (
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3"><h3 className="text-lg font-semibold text-gray-800">{item ? "Edit Blog CTA" : "Create Blog CTA"}</h3><button type="button" onClick={closeForm} className="text-gray-400 hover:text-gray-600"><X size={20} /></button></div>
          {renderField("title", "Title")}
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label><textarea name="description" value={formData.description} onChange={handleChange} rows={4} className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors resize-none ${errors.description ? "border-red-400 bg-red-50" : "border-gray-200"}`} />{errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{renderField("buttonText", "Button Text")}{renderField("buttonLink", "Button Link")}</div>
          <div className="flex items-center gap-3"><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="sr-only peer" /><div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" /></label><span className="text-sm text-gray-700">{formData.isActive ? "Active" : "Inactive"}</span>{errors.isActive && <p className="text-red-500 text-xs">{errors.isActive}</p>}</div>
          <div className="px-0 pt-4 border-t border-gray-200 flex items-center justify-end gap-3"><button type="button" onClick={closeForm} disabled={isSaving} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button><button type="button" onClick={saveItem} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-lg hover:bg-orange-600 shadow-sm disabled:bg-orange-300">{isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {isSaving ? "Saving..." : item ? "Update CTA" : "Create CTA"}</button></div>
        </div>
      ) : item ? (
        <div className="p-6 space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><p className="text-xs font-medium text-gray-500 mb-1">Title</p><p className="text-sm font-semibold text-gray-800">{item.title}</p></div><div><p className="text-xs font-medium text-gray-500 mb-1">Status</p><span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${item.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{item.isActive ? "Active" : "Inactive"}</span></div></div><div><p className="text-xs font-medium text-gray-500 mb-1">Description</p><p className="text-sm text-gray-600">{item.description}</p></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><p className="text-xs font-medium text-gray-500 mb-1">Button Text</p><p className="text-sm text-gray-700">{item.buttonText}</p></div><div><p className="text-xs font-medium text-gray-500 mb-1">Button Link</p><p className="text-sm text-gray-700 break-all">{item.buttonLink}</p></div></div><div className="pt-4 border-t border-gray-200 flex items-center gap-2"><button type="button" onClick={openEditForm} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"><Edit2 size={12} /> Edit</button><button type="button" onClick={handleDelete} disabled={isDeleting} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"><Trash2 size={12} /> {isDeleting ? "Deleting..." : "Delete"}</button></div></div>
      ) : <div className="p-8 text-center text-gray-500 text-sm">No Blog CTA records added yet.</div>)}
    </div>
  );
}
