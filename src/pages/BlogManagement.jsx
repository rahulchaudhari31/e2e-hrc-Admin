import React, { useState, useEffect, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import {
  Image as ImageIcon,
  Save,
  Loader2,
  Trash2,
  X,
  Plus,
  Eye,
  Edit2,
} from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  updateBlogStatus,
} from '../services/blog/blogService';
import BlogCTA from '../components/blog/BlogCTA';

const EMPTY_FORM = {
  blogHeading: '',
  author: '',
  publishDate: '',
  slug: '',
  paragraph1: '',
  image: null,
  imagePreview: '',
  paragraph2: '',
  heading2: '',
  paragraph3: '',
  quote: '',
  heading3: '',
  paragraph4: '',
  paragraph5: '',
  heading4: '',
  paragraph6: '',
  tags: [],
  seo: {
    metaTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
  },
  isActive: true,
};

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    ['link'],
    ['clean'],
  ],
};

export default function BlogManagement() {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingBlog, setViewingBlog] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState(EMPTY_FORM);
  const fileInputRef = useRef(null);
  const ogImageInputRef = useRef(null);
  const [ogImageFile, setOgImageFile] = useState(null);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    setIsLoading(true);
    try {
      const response = await getBlogs();
      if (response?.success) {
        setBlogs(response.data || []);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load blogs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNew = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setErrors({});
    setIsFormExpanded(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = async (blog) => {
    try {
      const response = await getBlogById(blog._id);
      if (response?.success && response?.data) {
        const blogData = response.data;
        setFormData({
          blogHeading: blogData.blogHeading || '',
          author: blogData.author || '',
          publishDate: blogData.publishDate ? new Date(blogData.publishDate).toISOString().split('T')[0] : '',
          slug: blogData.slug || '',
          paragraph1: blogData.paragraph1 || '',
          image: null,
          imagePreview: blogData.image || '',
          paragraph2: blogData.paragraph2 || '',
          heading2: blogData.heading2 || '',
          paragraph3: blogData.paragraph3 || '',
          quote: blogData.quote || '',
          heading3: blogData.heading3 || '',
          paragraph4: blogData.paragraph4 || '',
          paragraph5: blogData.paragraph5 || '',
          heading4: blogData.heading4 || '',
          paragraph6: blogData.paragraph6 || '',
          tags: blogData.tags || [],
          seo: blogData.seo || EMPTY_FORM.seo,
          isActive: blogData.isActive ?? true,
        });
        setOgImageFile(null);
        setEditingId(blog._id);
        setErrors({});
        setIsFormExpanded(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      toast.error(error.message || 'Failed to load blog');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSeoChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      seo: { ...prev.seo, [field]: value },
    }));
    if (errors[`seo.${field}`]) {
      setErrors(prev => ({ ...prev, [`seo.${field}`]: '' }));
    }
  };

  const handleQuillChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    setFormData(prev => ({
      ...prev,
      image: file,
      imagePreview: URL.createObjectURL(file),
    }));
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const handleBlogImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null,
      imagePreview: '',
    }));
  };

  const handleOgImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('OG Image must be less than 5MB');
      return;
    }
    setOgImageFile(file);
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        ogImage: URL.createObjectURL(file),
      },
    }));
    if (errors['seo.ogImage']) {
      setErrors(prev => ({ ...prev, ['seo.ogImage']: '' }));
    }
  };

  const handleOgImageUploadClick = () => {
    ogImageInputRef.current?.click();
  };

  const removeOgImage = () => {
    setOgImageFile(null);
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        ogImage: '',
      },
    }));
  };

  const handleKeywordAdd = () => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords: [...(prev.seo?.keywords || []), ''],
      },
    }));
  };

  const handleKeywordChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords: prev.seo.keywords.map((keyword, i) => (i === index ? value : keyword)),
      },
    }));
  };

  const handleKeywordRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords: prev.seo.keywords.filter((_, i) => i !== index),
      },
    }));
  };

  const handleTagAdd = () => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, ''],
    }));
  };

  const handleTagChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => (i === index ? value : tag)),
    }));
  };

  const handleTagRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };



  const generateSlug = (heading) => {
    return heading
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleBlogHeadingChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      blogHeading: value,
      slug: !editingId && !prev.slug ? generateSlug(value) : prev.slug,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.blogHeading?.trim()) newErrors.blogHeading = 'Blog heading is required';
    if (!formData.author?.trim()) newErrors.author = 'Author is required';
    if (!formData.publishDate) newErrors.publishDate = 'Publish date is required';
    if (!formData.slug?.trim()) newErrors.slug = 'Slug is required';
    if (!formData.paragraph1?.trim()) newErrors.paragraph1 = 'Paragraph 1 is required';
    if (!formData.imagePreview && !formData.image) newErrors.image = 'Image is required';
    if (!formData.seo.metaTitle?.trim()) newErrors['seo.metaTitle'] = 'Meta title is required';
    if (!formData.seo.metaDescription?.trim()) newErrors['seo.metaDescription'] = 'Meta description is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const payload = new FormData();
      payload.append('blogHeading', formData.blogHeading.trim());
      payload.append('author', formData.author.trim());
      payload.append('publishDate', new Date(formData.publishDate).toISOString());
      payload.append('slug', formData.slug.toLowerCase().trim());
      payload.append('paragraph1', formData.paragraph1);
      payload.append('paragraph2', formData.paragraph2 || '');
      payload.append('heading2', formData.heading2 || '');
      payload.append('paragraph3', formData.paragraph3 || '');
      payload.append('quote', formData.quote || '');
      payload.append('heading3', formData.heading3 || '');
      payload.append('paragraph4', formData.paragraph4 || '');
      payload.append('paragraph5', formData.paragraph5 || '');
      payload.append('heading4', formData.heading4 || '');
      payload.append('paragraph6', formData.paragraph6 || '');
      payload.append('tags', JSON.stringify(formData.tags.filter(t => t.trim())));
      payload.append('seo', JSON.stringify({
        metaTitle: formData.seo.metaTitle,
        metaDescription: formData.seo.metaDescription,
        canonicalUrl: formData.seo.canonicalUrl || '',
        ogTitle: formData.seo.ogTitle || '',
        ogDescription: formData.seo.ogDescription || '',
        ogImage: formData.seo.ogImage || '',
      }));
      payload.append('isActive', formData.isActive);

      if (formData.image) {
        payload.append('image', formData.image);
      }

      if (ogImageFile) {
        payload.append('ogImage', ogImageFile);
      }

      let response;
      if (editingId) {
        response = await updateBlog(editingId, payload);
        if (response?.success) {
          toast.success('Blog updated successfully!');
        }
      } else {
        response = await createBlog(payload);
        if (response?.success) {
          toast.success('Blog created successfully!');
        }
      }

      setFormData(EMPTY_FORM);
      setOgImageFile(null);
      setEditingId(null);
      setIsFormExpanded(false);
      await loadBlogs();
    } catch (error) {
      toast.error(error.message || 'Failed to save blog');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setConfirmDelete(id);
  };

  const confirmDeleteAction = async () => {
    const id = confirmDelete;
    setConfirmDelete(null);
    try {
      const response = await deleteBlog(id);
      if (response?.success) {
        toast.success('Blog deleted successfully!');
        await loadBlogs();
        if (editingId === id) {
          setFormData(EMPTY_FORM);
          setEditingId(null);
          setIsFormExpanded(false);
        }
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete blog');
    }
  };

  const handleStatusToggle = async (blog) => {
    try {
      const response = await updateBlogStatus(blog._id, !blog.isActive);
      if (response?.success) {
        toast.success(`Blog ${!blog.isActive ? 'activated' : 'deactivated'} successfully!`);
        await loadBlogs();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update blog status');
    }
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
    setEditingId(null);
    setOgImageFile(null);
    setErrors({});
  };

  if (isLoading && blogs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={24} className="animate-spin text-orange-500" />
        <span className="ml-2 text-gray-600">Loading blogs...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-20 relative md:mt-15 mt-5">
      <Toaster position="top-right" />

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 px-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create, edit, and manage blog posts</p>
        </div>
        <button
          onClick={handleAddNew}
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-sm"
        >
          <Plus size={18} />
          Add Blog
        </button>
      </div>

      {/* Form Card */}
      {isFormExpanded && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 mx-4">
          {/* Form Header */}
          <div className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-gray-800">
                {editingId ? 'Edit Blog' : 'Create New Blog'}
              </h2>
              {editingId && (
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                  Edit Mode
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setIsFormExpanded(false);
                resetForm();
              }}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Section 1: Blog Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 pb-3 border-b border-gray-200">
                Blog Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Blog Heading */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blog Heading <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="blogHeading"
                    value={formData.blogHeading}
                    onChange={handleBlogHeadingChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors ${errors.blogHeading ? 'border-red-400 bg-red-50' : 'border-gray-200'
                      }`}
                    placeholder="e.g., Top 10 Hiring Trends"
                  />
                  {errors.blogHeading && <p className="text-red-500 text-xs mt-1">{errors.blogHeading}</p>}
                </div>

                {/* Author */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Author <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors ${errors.author ? 'border-red-400 bg-red-50' : 'border-gray-200'
                      }`}
                    placeholder="Author name"
                  />
                  {errors.author && <p className="text-red-500 text-xs mt-1">{errors.author}</p>}
                </div>

                {/* Publish Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Publish Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="publishDate"
                    value={formData.publishDate}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors ${errors.publishDate ? 'border-red-400 bg-red-50' : 'border-gray-200'
                      }`}
                  />
                  {errors.publishDate && <p className="text-red-500 text-xs mt-1">{errors.publishDate}</p>}
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors ${errors.slug ? 'border-red-400 bg-red-50' : 'border-gray-200'
                      }`}
                    placeholder="slug-for-url"
                  />
                  {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug}</p>}
                </div>
              </div>

              {/* Main Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blog Image <span className="text-red-500">*</span>
                </label>

                <div
                  onClick={handleBlogImageUploadClick}
                  className={`mt-1 border-2 border-dashed rounded-xl bg-gray-50 hover:border-orange-300 hover:bg-orange-50 transition-colors flex flex-col items-center justify-center relative overflow-hidden min-h-64 cursor-pointer ${errors.image
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200"
                    }`}
                >
                  {formData.imagePreview ? (
                    <>
                      <img
                        src={formData.imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />

                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          className="bg-white text-blue-600 hover:text-blue-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
                        >
                          Change
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage();
                          }}
                          className="bg-white text-red-500 hover:text-red-600 px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-orange-500 transition-colors p-6">
                      <ImageIcon
                        size={48}
                        className="mb-3 text-gray-300"
                      />

                      <span className="text-sm font-medium">
                        Click to upload image
                      </span>

                      <span className="text-xs text-gray-400 mt-1">
                        PNG, JPG, WEBP — max 5MB
                      </span>
                    </div>
                  )}

                  <input
                    id="blog-image-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>

                {errors.image && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.image}
                  </p>
                )}
              </div>
            </div>

            {/* Section 2: Blog Content */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 pb-3 border-b border-gray-200">
                Blog Content
              </h3>

              {/* Paragraph 1 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paragraph 1 <span className="text-red-500">*</span>
                </label>
                <ReactQuill
                  value={formData.paragraph1}
                  onChange={(value) => handleQuillChange('paragraph1', value)}
                  modules={quillModules}
                  className={`bg-white border rounded-lg ${errors.paragraph1 ? 'border-red-400' : 'border-gray-200'}`}
                />
                {errors.paragraph1 && <p className="text-red-500 text-xs mt-1">{errors.paragraph1}</p>}
              </div>

              {/* Paragraph 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paragraph 2</label>
                <ReactQuill
                  value={formData.paragraph2}
                  onChange={(value) => handleQuillChange('paragraph2', value)}
                  modules={quillModules}
                  className="bg-white border border-gray-200 rounded-lg"
                />
              </div>

              {/* Heading 2 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Heading 2</label>
                <input
                  type="text"
                  name="heading2"
                  value={formData.heading2}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                  placeholder="Section heading"
                />
              </div>

              {/* Paragraph 3 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paragraph 3</label>
                <ReactQuill
                  value={formData.paragraph3}
                  onChange={(value) => handleQuillChange('paragraph3', value)}
                  modules={quillModules}
                  className="bg-white border border-gray-200 rounded-lg"
                />
              </div>

              {/* Quote */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quote</label>
                <textarea
                  name="quote"
                  value={formData.quote}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors resize-none"
                  placeholder="Add a quote or highlight..."
                />
              </div>

              {/* Heading 3 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Heading 3</label>
                <input
                  type="text"
                  name="heading3"
                  value={formData.heading3}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                  placeholder="Section heading"
                />
              </div>

              {/* Paragraph 4 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paragraph 4</label>
                <ReactQuill
                  value={formData.paragraph4}
                  onChange={(value) => handleQuillChange('paragraph4', value)}
                  modules={quillModules}
                  className="bg-white border border-gray-200 rounded-lg"
                />
              </div>

              {/* Heading 4 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Heading 4</label>
                <input
                  type="text"
                  name="heading4"
                  value={formData.heading4}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                  placeholder="Section heading"
                />
              </div>

              {/* Paragraph 5 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paragraph 5</label>
                <ReactQuill
                  value={formData.paragraph5}
                  onChange={(value) => handleQuillChange('paragraph5', value)}
                  modules={quillModules}
                  className="bg-white border border-gray-200 rounded-lg"
                />
              </div>

              {/* Paragraph 6 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paragraph 6</label>
                <ReactQuill
                  value={formData.paragraph6}
                  onChange={(value) => handleQuillChange('paragraph6', value)}
                  modules={quillModules}
                  className="bg-white border border-gray-200 rounded-lg"
                />
              </div>
            </div>

            {/* Section 4: Tags */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800 pb-3 border-b border-gray-200 flex-1">
                  Tags
                </h3>
                <button
                  type="button"
                  onClick={handleTagAdd}
                  className="ml-3 inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border border-orange-500 text-orange-600 hover:bg-orange-50 transition-colors"
                >
                  <Plus size={14} />
                  Add Tag
                </button>
              </div>

              <div className="space-y-2">
                {formData.tags.map((tag, index) => (
                  <div key={`tag-${index}`} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => handleTagChange(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                      placeholder="Enter tag"
                    />
                    <button
                      type="button"
                      onClick={() => handleTagRemove(index)}
                      className="inline-flex items-center justify-center w-10 h-10 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 5: SEO Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">SEO Settings</h3>
              </div>

              <div className="p-6 space-y-6">
                {/* Meta Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.seo.metaTitle}
                    onChange={(e) => handleSeoChange('metaTitle', e.target.value)}
                    maxLength={60}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors ${errors['seo.metaTitle'] ? 'border-red-400 bg-red-50' : 'border-gray-200'
                      }`}
                    placeholder="SEO title (max 60 characters)"
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.seo.metaTitle.length}/60</p>
                  {errors['seo.metaTitle'] && <p className="text-red-500 text-xs mt-1">{errors['seo.metaTitle']}</p>}
                </div>

                {/* Meta Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.seo.metaDescription}
                    onChange={(e) => handleSeoChange('metaDescription', e.target.value)}
                    maxLength={160}
                    rows={3}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors resize-none ${errors['seo.metaDescription'] ? 'border-red-400 bg-red-50' : 'border-gray-200'
                      }`}
                    placeholder="SEO description (max 160 characters)"
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.seo.metaDescription.length}/160</p>
                  {errors['seo.metaDescription'] && <p className="text-red-500 text-xs mt-1">{errors['seo.metaDescription']}</p>}
                </div>

                {/* Keywords */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Keywords</label>
                    <button
                      type="button"
                      onClick={() => handleKeywordAdd()}
                      className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border border-orange-500 text-orange-600 hover:bg-orange-50 transition-colors"
                    >
                      <Plus size={14} />
                      Add Keyword
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formData?.seo?.keywords?.map((keyword, index) => (
                      <div key={`keyword-${index}`} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={keyword}
                          onChange={(e) => handleKeywordChange(index, e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                          placeholder="Enter keyword"
                        />
                        <button
                          type="button"
                          onClick={() => handleKeywordRemove(index)}
                          className="inline-flex items-center justify-center w-10 h-10 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Canonical URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Canonical URL</label>
                  <input
                    type="text"
                    value={formData.seo.canonicalUrl}
                    onChange={(e) => handleSeoChange('canonicalUrl', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                    placeholder="https://example.com/blog/post"
                  />
                </div>

                {/* OG Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">OG Title</label>
                  <input
                    type="text"
                    value={formData.seo.ogTitle}
                    onChange={(e) => handleSeoChange('ogTitle', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors"
                    placeholder="Title for social sharing"
                  />
                </div>

                {/* OG Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">OG Description</label>
                  <textarea
                    value={formData.seo.ogDescription}
                    onChange={(e) => handleSeoChange('ogDescription', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-100 focus:border-orange-400 outline-none transition-colors resize-none"
                    placeholder="Description for social sharing"
                  />
                </div>

                {/* OG Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">OG Image</label>
                  <div
                    onClick={handleOgImageUploadClick}
                    className={`mt-2 border-2 border-dashed rounded-xl bg-gray-50 hover:border-orange-300 hover:bg-orange-50 transition-colors flex flex-col items-center justify-center relative overflow-hidden min-h-64 cursor-pointer ${errors['seo.ogImage'] ? 'border-red-400 bg-red-50' : 'border-gray-200'
                      }`}
                  >
                    {formData.seo.ogImage ? (
                      <>
                        <img src={formData.seo.ogImage} alt="OG Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              ogImageInputRef.current?.click();
                            }}
                            className="bg-white text-blue-600 hover:text-blue-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeOgImage();
                            }}
                            className="bg-white text-red-500 hover:text-red-600 px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-orange-500 transition-colors p-6">
                        <ImageIcon size={48} className="mb-3 text-gray-300" />
                        <span className="text-sm font-medium">Click to upload OG image</span>
                        <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP — max 5MB</span>
                      </div>
                    )}
                    <input
                      ref={ogImageInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleOgImageChange}
                    />
                  </div>
                  {errors['seo.ogImage'] && <p className="text-red-500 text-xs mt-1">{errors['seo.ogImage']}</p>}
                </div>
              </div>
            </div>

            {/* Status Toggle */}
            <div className="flex items-center gap-3 pt-4">
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
              <span className="text-sm text-gray-700">{formData.isActive ? 'Active' : 'Inactive'}</span>
            </div>
          </div>

          {/* Form Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setIsFormExpanded(false);
                resetForm();
              }}
              className="text-gray-600 hover:text-gray-800 font-medium text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-sm"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSaving ? 'Saving...' : editingId ? 'Update Blog' : 'Create Blog'}
            </button>
          </div>
        </div>
      )}


      {/* Blogs List */}
      <div className="space-y-4 px-4">
        {blogs.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-sm">No blogs created yet. Click "Add Blog" to create your first blog post.</p>
          </div>
        ) : (
          blogs.map((blog) => (
            <div
              key={blog._id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4 p-4">
                {/* Image */}
                <div className="flex-shrink-0 w-24 h-24">
                  <img
                    src={blog.image || ''}
                    alt={blog.blogHeading}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-base font-semibold text-gray-900 line-clamp-2">{blog.blogHeading}</h3>
                    <div className="flex items-center gap-2 ml-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          blog.status === 'Published'
                            ? 'bg-green-100 text-green-700'
                            : blog.status === 'Scheduled'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {blog.status || 'Draft'}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">{blog.author} • {new Date(blog.publishDate).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{blog.blogHeading}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(blog)}
                      className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      <Edit2 size={12} />
                      Edit
                    </button>

                    <button
                      onClick={() => setViewingBlog(blog)}
                      className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      <Eye size={12} />
                      View
                    </button>

                    <button
                      onClick={() => handleStatusToggle(blog)}
                      className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      {blog.isActive ? 'Deactivate' : 'Activate'}
                    </button>

                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Modal */}
      {viewingBlog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Blog Details</h2>
              <button
                onClick={() => setViewingBlog(null)}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Blog Heading */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Blog Heading</h3>
                <p className="text-gray-900">{viewingBlog.blogHeading}</p>
              </div>

              {/* Author & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Author</h3>
                  <p className="text-gray-900">{viewingBlog.author}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Publish Date</h3>
                  <p className="text-gray-900">{new Date(viewingBlog.publishDate).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Image */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Image</h3>
                <img src={viewingBlog.image} alt={viewingBlog.blogHeading} className="w-full rounded-lg" />
              </div>

              {/* Content Preview */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Content</h3>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 line-clamp-4">
                  <div dangerouslySetInnerHTML={{ __html: viewingBlog.paragraph1 }} />
                </div>
              </div>

              {/* Tags */}
              {viewingBlog.tags?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {viewingBlog.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* SEO */}
              {viewingBlog.seo && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">SEO Settings</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Meta Title:</span> {viewingBlog.seo.metaTitle}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Meta Description:</span> {viewingBlog.seo.metaDescription}
                    </div>
                  </div>
                </div>
              )}

              {/* Status */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Status</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${viewingBlog.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                    }`}
                >
                  {viewingBlog.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  handleEdit(viewingBlog);
                  setViewingBlog(null);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
              >
                <Edit2 size={16} />
                Edit Blog
              </button>
              <button
                onClick={() => setViewingBlog(null)}
                className="flex-1 text-gray-700 hover:text-gray-900 font-semibold py-2.5 px-4 rounded-lg transition-colors border border-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Blog?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this blog post? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAction}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
       <BlogCTA />
    </div>
  );
}
