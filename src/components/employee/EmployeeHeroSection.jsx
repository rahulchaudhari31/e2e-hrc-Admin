import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Image as ImageIcon, Save, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getEmployeeHeroes,
  createEmployeeHero,
  updateEmployeeHero,
  deleteEmployeeHero,
  updateLeftTopImage,
  updateLeftBottomImage,
  updateRightImage,
} from '../../services/employee/employeeHeroService';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const EMPTY_FORM = {
  badgeText: '',
  titleLine1: '',
  description: '',
  isActive: true,
};

function validateImageFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Only JPG, JPEG, PNG, and WEBP images are allowed.';
  }
  if (file.size > MAX_SIZE_BYTES) {
    return 'Image size must be less than 5MB.';
  }
  return null;
}

// ─── Single Image Upload Sub-component ────────────────────────────────────────
function ImageField({
  label,
  fieldKey,
  savedUrl,
  file,
  preview,
  error,
  uploading,
  heroId,
  onFileChange,
  onRemovePreview,
  onUpload,
  fileInputRef,
}) {
  const displayUrl = preview || savedUrl || '';

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="mt-1 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:border-orange-300 transition-colors flex flex-col items-center justify-center relative overflow-hidden min-h-44">
        {displayUrl ? (
          <>
            <img src={displayUrl} alt={label} className="w-full h-full object-contain" />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm"
              >
                Change
              </button>
              {preview && (
                <button
                  type="button"
                  onClick={onRemovePreview}
                  className="bg-white text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm"
                >
                  Remove
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={onFileChange}
            />
          </>
        ) : (
          <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full text-gray-400 hover:text-orange-500 transition-colors p-6">
            <ImageIcon size={28} className="mb-2 text-gray-300" />
            <span className="text-sm font-medium">Click to upload</span>
            <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP — max 5MB</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={onFileChange}
            />
          </label>
        )}
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {/* Show "Update image" button only when a record already exists and a new file was chosen */}
      {heroId && file && !error && (
        <button
          type="button"
          onClick={onUpload}
          disabled={uploading}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-3 py-1.5 rounded-lg transition-colors shadow-sm"
        >
          {uploading ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          {uploading ? 'Uploading...' : `Update ${label}`}
        </button>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function EmployeeHeroSection() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [heroId, setHeroId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // ── Image state per slot ──────────────────────────────────────────────────
  const [leftTopFile, setLeftTopFile] = useState(null);
  const [leftTopPreview, setLeftTopPreview] = useState('');
  const [leftTopSaved, setLeftTopSaved] = useState('');
  const [leftTopError, setLeftTopError] = useState('');
  const [leftTopUploading, setLeftTopUploading] = useState(false);
  const leftTopRef = useRef(null);

  const [leftBottomFile, setLeftBottomFile] = useState(null);
  const [leftBottomPreview, setLeftBottomPreview] = useState('');
  const [leftBottomSaved, setLeftBottomSaved] = useState('');
  const [leftBottomError, setLeftBottomError] = useState('');
  const [leftBottomUploading, setLeftBottomUploading] = useState(false);
  const leftBottomRef = useRef(null);

  const [rightFile, setRightFile] = useState(null);
  const [rightPreview, setRightPreview] = useState('');
  const [rightSaved, setRightSaved] = useState('');
  const [rightError, setRightError] = useState('');
  const [rightUploading, setRightUploading] = useState(false);
  const rightRef = useRef(null);

  // ── Load data ─────────────────────────────────────────────────────────────
  useEffect(() => {
    loadHero();
  }, []);

  const loadHero = async () => {
    setIsLoading(true);
    try {
      const response = await getEmployeeHeroes();
      const items = Array.isArray(response?.data) ? response.data : [];
      const latest = items[0] || null;

      if (latest) {
        setHeroId(latest._id || null);
        setFormData({
          badgeText: latest.badgeText || '',
          titleLine1: latest.titleLine1 || '',
          description: latest.description || '',
          isActive: latest.isActive !== undefined ? latest.isActive : true,
        });
        setLeftTopSaved(latest.leftTopImage || '');
        setLeftBottomSaved(latest.leftBottomImage || '');
        setRightSaved(latest.rightImage || '');
      } else {
        resetAll();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load Employee Hero data');
    } finally {
      setIsLoading(false);
    }
  };

  const resetAll = () => {
    setHeroId(null);
    setFormData(EMPTY_FORM);
    setLeftTopFile(null); setLeftTopPreview(''); setLeftTopSaved(''); setLeftTopError('');
    setLeftBottomFile(null); setLeftBottomPreview(''); setLeftBottomSaved(''); setLeftBottomError('');
    setRightFile(null); setRightPreview(''); setRightSaved(''); setRightError('');
    setErrors({});
  };

  // ── Text field handlers ───────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // ── Image file handlers ───────────────────────────────────────────────────
  const makeFileHandler = (setFile, setPreview, setError) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateImageFile(file);
    if (err) { setError(err); return; }
    setError('');
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const makeRemoveHandler = (setFile, setPreview, setError, inputRef) => () => {
    setFile(null);
    setPreview('');
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!formData.titleLine1.trim()) newErrors.titleLine1 = 'Title Line 1 is required.';
    if (!formData.description.trim()) newErrors.description = 'Description is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Create / Update hero text fields ─────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (heroId) {
        // Update text fields only via PUT
        const response = await updateEmployeeHero(heroId, {
          badgeText: formData.badgeText,
          titleLine1: formData.titleLine1,
          description: formData.description,
          isActive: formData.isActive,
        });
        if (response?.success) {
          toast.success('Employee Hero updated successfully');
          await loadHero();
        }
      } else {
        // Create via POST with FormData (images + text)
        const fd = new FormData();
        fd.append('badgeText', formData.badgeText);
        fd.append('titleLine1', formData.titleLine1);
        fd.append('description', formData.description);
        fd.append('isActive', String(formData.isActive));
        if (leftTopFile) fd.append('leftTopImage', leftTopFile);
        if (leftBottomFile) fd.append('leftBottomImage', leftBottomFile);
        if (rightFile) fd.append('rightImage', rightFile);

        const response = await createEmployeeHero(fd);
        if (response?.success) {
          toast.success('Employee Hero created successfully');
          setLeftTopFile(null); setLeftTopPreview('');
          setLeftBottomFile(null); setLeftBottomPreview('');
          setRightFile(null); setRightPreview('');
          await loadHero();
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save Employee Hero');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Individual image uploads (PATCH) ─────────────────────────────────────
  const handleUploadLeftTop = async () => {
    if (!leftTopFile || !heroId) return;
    setLeftTopUploading(true);
    try {
      const fd = new FormData();
      fd.append('leftTopImage', leftTopFile);
      const response = await updateLeftTopImage(heroId, fd);
      if (response?.success) {
        toast.success('Left Top Image updated successfully');
        setLeftTopFile(null); setLeftTopPreview('');
        if (leftTopRef.current) leftTopRef.current.value = '';
        await loadHero();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update Left Top Image');
    } finally {
      setLeftTopUploading(false);
    }
  };

  const handleUploadLeftBottom = async () => {
    if (!leftBottomFile || !heroId) return;
    setLeftBottomUploading(true);
    try {
      const fd = new FormData();
      fd.append('leftBottomImage', leftBottomFile);
      const response = await updateLeftBottomImage(heroId, fd);
      if (response?.success) {
        toast.success('Left Bottom Image updated successfully');
        setLeftBottomFile(null); setLeftBottomPreview('');
        if (leftBottomRef.current) leftBottomRef.current.value = '';
        await loadHero();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update Left Bottom Image');
    } finally {
      setLeftBottomUploading(false);
    }
  };

  const handleUploadRight = async () => {
    if (!rightFile || !heroId) return;
    setRightUploading(true);
    try {
      const fd = new FormData();
      fd.append('rightImage', rightFile);
      const response = await updateRightImage(heroId, fd);
      if (response?.success) {
        toast.success('Right Image updated successfully');
        setRightFile(null); setRightPreview('');
        if (rightRef.current) rightRef.current.value = '';
        await loadHero();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update Right Image');
    } finally {
      setRightUploading(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!heroId) return;
    if (!window.confirm('Are you sure you want to delete the Employee Hero section? This action cannot be undone.')) return;
    setIsDeleting(true);
    try {
      const response = await deleteEmployeeHero(heroId);
      if (response?.success) {
        toast.success('Employee Hero deleted successfully');
        resetAll();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete Employee Hero');
    } finally {
      setIsDeleting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* ── Header / Collapse toggle ─────────────────────────────────────── */}
      <div
        className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200 cursor-pointer select-none"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">Employee Hero Section</h2>
          {heroId && (
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                formData.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {formData.isActive ? 'Active' : 'Inactive'}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp size={20} className="text-gray-500" />
        ) : (
          <ChevronDown size={20} className="text-gray-500" />
        )}
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      {isExpanded && (
        <>
          {isLoading ? (
            <div className="p-8 text-center text-sm text-gray-500">
              Loading Employee Hero data...
            </div>
          ) : (
            <>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* ── Left column: Text fields ──────────────────────────── */}
                <div className="space-y-4">
                  {/* Badge Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      name="badgeText"
                      value={formData.badgeText}
                      onChange={handleChange}
                      placeholder="e.g. Find Jobs That Match Your Skills"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                    />
                  </div>

                  {/* Title Line 1 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title Line 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="titleLine1"
                      value={formData.titleLine1}
                      onChange={handleChange}
                      placeholder="e.g. Find Your Dream Job Today"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors ${
                        errors.titleLine1 ? 'border-red-400' : 'border-gray-200'
                      }`}
                    />
                    {errors.titleLine1 && (
                      <p className="text-xs text-red-500 mt-1">{errors.titleLine1}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Brief description about the employee hero section..."
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors resize-none ${
                        errors.description ? 'border-red-400' : 'border-gray-200'
                      }`}
                    />
                    {errors.description && (
                      <p className="text-xs text-red-500 mt-1">{errors.description}</p>
                    )}
                  </div>

                  {/* Active toggle */}
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500" />
                    </label>
                    <span className="text-sm text-gray-700">
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* ── Right column: Image fields ────────────────────────── */}
                <div className="space-y-5 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <ImageField
                    label="Left Top Image"
                    fieldKey="leftTopImage"
                    savedUrl={leftTopSaved}
                    file={leftTopFile}
                    preview={leftTopPreview}
                    error={leftTopError}
                    uploading={leftTopUploading}
                    heroId={heroId}
                    onFileChange={makeFileHandler(setLeftTopFile, setLeftTopPreview, setLeftTopError)}
                    onRemovePreview={makeRemoveHandler(setLeftTopFile, setLeftTopPreview, setLeftTopError, leftTopRef)}
                    onUpload={handleUploadLeftTop}
                    fileInputRef={leftTopRef}
                  />

                  <hr className="border-gray-200" />

                  <ImageField
                    label="Left Bottom Image"
                    fieldKey="leftBottomImage"
                    savedUrl={leftBottomSaved}
                    file={leftBottomFile}
                    preview={leftBottomPreview}
                    error={leftBottomError}
                    uploading={leftBottomUploading}
                    heroId={heroId}
                    onFileChange={makeFileHandler(setLeftBottomFile, setLeftBottomPreview, setLeftBottomError)}
                    onRemovePreview={makeRemoveHandler(setLeftBottomFile, setLeftBottomPreview, setLeftBottomError, leftBottomRef)}
                    onUpload={handleUploadLeftBottom}
                    fileInputRef={leftBottomRef}
                  />

                  <hr className="border-gray-200" />

                  <ImageField
                    label="Right Image"
                    fieldKey="rightImage"
                    savedUrl={rightSaved}
                    file={rightFile}
                    preview={rightPreview}
                    error={rightError}
                    uploading={rightUploading}
                    heroId={heroId}
                    onFileChange={makeFileHandler(setRightFile, setRightPreview, setRightError)}
                    onRemovePreview={makeRemoveHandler(setRightFile, setRightPreview, setRightError, rightRef)}
                    onUpload={handleUploadRight}
                    fileInputRef={rightRef}
                  />
                </div>
              </div>

              {/* ── Footer: Delete + Save ───────────────────────────────── */}
              <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  {heroId && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="inline-flex items-center gap-1.5 text-red-500 hover:text-red-600 text-sm font-medium px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                      {isDeleting ? 'Deleting...' : 'Delete Hero'}
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-sm text-sm"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {isSaving
                    ? 'Saving...'
                    : heroId
                    ? 'Update Employee Hero'
                    : 'Create Employee Hero'}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
