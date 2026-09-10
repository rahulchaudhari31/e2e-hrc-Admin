const API_BASE = '/api';

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'API request failed');
  return data;
};

const request = async (path, options = {}) => {
  try {
    return await handleResponse(await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      ...options,
    }));
  } catch (error) {
    throw new Error(error?.message || 'Blog CTA API request failed.');
  }
};

export const getBlogCTA = async () => request('/admin/blog-cta');

export const createBlogCTA = async (data) => request('/admin/blog-cta', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

export const updateBlogCTA = async (id, data) => request(`/admin/blog-cta/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

export const deleteBlogCTA = async (id) => request(`/admin/blog-cta/${id}`, {
  method: 'DELETE',
});

export const getActiveBlogCTA = async () => request('/blog-cta/active');
