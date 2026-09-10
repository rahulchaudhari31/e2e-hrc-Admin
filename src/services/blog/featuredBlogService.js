// ─── Shared response handler ────────────────────────────────────────────────────
const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

const API_BASE = '/api';

/**
 * Get all Featured Blog records (Admin)
 * GET /api/admin/featured-blog
 */
export const getFeaturedBlogs = async () => {
  try {
    const response = await fetch(`${API_BASE}/admin/featured-blog`, {
      credentials: 'include',
    });
    return handleResponse(response);
  } catch (error) {
    throw new Error(error?.message || 'Failed to fetch Featured Blog records');
  }
};

/**
 * Get the active Featured Blog (Public)
 * GET /api/featured-blog/active
 */
export const getActiveFeaturedBlog = async () => {
  try {
    const response = await fetch(`${API_BASE}/featured-blog/active`);
    return handleResponse(response);
  } catch (error) {
    throw new Error(error?.message || 'Failed to fetch active Featured Blog');
  }
};

/**
 * Create a new Featured Blog record (Admin)
 * POST /api/admin/featured-blog
 * @param {FormData} formData
 */
export const createFeaturedBlog = async (formData) => {
  try {
    const response = await fetch(`${API_BASE}/admin/featured-blog`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
      // Do NOT set Content-Type — browser sets it with boundary for FormData
    });
    return handleResponse(response);
  } catch (error) {
    throw new Error(error?.message || 'Failed to create Featured Blog');
  }
};

/**
 * Update an existing Featured Blog record (Admin)
 * PUT /api/admin/featured-blog/:id
 * @param {string} id
 * @param {FormData} formData
 */
export const updateFeaturedBlog = async (id, formData) => {
  try {
    const response = await fetch(`${API_BASE}/admin/featured-blog/${id}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData,
      // Do NOT set Content-Type — browser sets it with boundary for FormData
    });
    return handleResponse(response);
  } catch (error) {
    throw new Error(error?.message || 'Failed to update Featured Blog');
  }
};

/**
 * Delete a Featured Blog record (Admin)
 * DELETE /api/admin/featured-blog/:id
 * @param {string} id
 */
export const deleteFeaturedBlog = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/admin/featured-blog/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse(response);
  } catch (error) {
    throw new Error(error?.message || 'Failed to delete Featured Blog');
  }
};
