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
 * Get all Blog Hero records (Admin)
 * GET /api/admin/blog-hero
 */
export const getBlogHeroes = async () => {
  try {
    const response = await fetch(`${API_BASE}/admin/blog-hero`, {
      credentials: 'include',
    });
    return handleResponse(response);
  } catch (error) {
    throw new Error(error?.message || 'Failed to fetch Blog Hero records');
  }
};

/**
 * Get the active Blog Hero (Public)
 * GET /api/blog-hero/active
 */
export const getActiveBlogHero = async () => {
  try {
    const response = await fetch(`${API_BASE}/blog-hero/active`);
    return handleResponse(response);
  } catch (error) {
    throw new Error(error?.message || 'Failed to fetch active Blog Hero');
  }
};

/**
 * Create a new Blog Hero record (Admin)
 * POST /api/admin/blog-hero
 * @param {FormData} formData
 */
export const createBlogHero = async (formData) => {
  try {
    const response = await fetch(`${API_BASE}/admin/blog-hero`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
      // Do NOT set Content-Type — browser sets it with boundary for FormData
    });
    return handleResponse(response);
  } catch (error) {
    throw new Error(error?.message || 'Failed to create Blog Hero');
  }
};

/**
 * Update an existing Blog Hero record (Admin)
 * PUT /api/admin/blog-hero/:id
 * @param {string} id
 * @param {FormData} formData
 */
export const updateBlogHero = async (id, formData) => {
  try {
    const response = await fetch(`${API_BASE}/admin/blog-hero/${id}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData,
      // Do NOT set Content-Type — browser sets it with boundary for FormData
    });
    return handleResponse(response);
  } catch (error) {
    throw new Error(error?.message || 'Failed to update Blog Hero');
  }
};

/**
 * Delete a Blog Hero record (Admin)
 * DELETE /api/admin/blog-hero/:id
 * @param {string} id
 */
export const deleteBlogHero = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/admin/blog-hero/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse(response);
  } catch (error) {
    throw new Error(error?.message || 'Failed to delete Blog Hero');
  }
};
