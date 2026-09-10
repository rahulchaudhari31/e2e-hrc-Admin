const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

// ─── GET /api/admin/blogs — Get all blogs ──────────────────────────────────────
export const getBlogs = async () => {
  try {
    const response = await fetch('/api/admin/blogs', {
      credentials: 'include',
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw new Error(error?.message || 'Failed to fetch blogs');
  }
};

// ─── GET /api/admin/blogs/:id — Get blog by ID ─────────────────────────────────
export const getBlogById = async (id) => {
  try {
    const response = await fetch(`/api/admin/blogs/${id}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching blog:', error);
    throw new Error(error?.message || 'Failed to fetch blog');
  }
};

// ─── POST /api/admin/blogs — Create new blog ──────────────────────────────────
export const createBlog = async (formData) => {
  try {
    const response = await fetch('/api/admin/blogs', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error creating blog:', error);
    throw new Error(error?.message || 'Failed to create blog');
  }
};

// ─── PUT /api/admin/blogs/:id — Update blog ────────────────────────────────────
export const updateBlog = async (id, formData) => {
  try {
    const response = await fetch(`/api/admin/blogs/${id}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData,
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error updating blog:', error);
    throw new Error(error?.message || 'Failed to update blog');
  }
};

// ─── DELETE /api/admin/blogs/:id — Delete blog ─────────────────────────────────
export const deleteBlog = async (id) => {
  try {
    const response = await fetch(`/api/admin/blogs/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error deleting blog:', error);
    throw new Error(error?.message || 'Failed to delete blog');
  }
};

// ─── PATCH /api/admin/blogs/:id/status — Update blog status ────────────────────
export const updateBlogStatus = async (id, isActive) => {
  try {
    const response = await fetch(`/api/admin/blogs/${id}/status`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error updating blog status:', error);
    throw new Error(error?.message || 'Failed to update blog status');
  }
};
