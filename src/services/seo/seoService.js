const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

// GET /api/seo/:pageName — public
export const getPublicSEO = async (pageName) => {
  const response = await fetch(`/api/seo/${pageName}`);
  if (response.status === 404) return null;
  return handleResponse(response);
};

// GET /api/admin/seo — all SEO records
export const getAllSEO = async () => {
  const response = await fetch('/api/admin/seo', {
    credentials: 'include',
  });
  return handleResponse(response);
};

// POST /api/admin/seo — create SEO record
export const createSEO = async (seoData) => {
  // If it's FormData (has image)
  if (seoData instanceof FormData) {
    const response = await fetch('/api/admin/seo', {
      method: 'POST',
      credentials: 'include',
      body: seoData,
    });
    return handleResponse(response);
  }
  
  // If it's JSON
  const response = await fetch('/api/admin/seo', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(seoData),
  });
  return handleResponse(response);
};

// PUT /api/admin/seo/:id — update SEO text fields
export const updateSEO = async (id, seoData) => {
  const response = await fetch(`/api/admin/seo/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(seoData),
  });
  return handleResponse(response);
};

// POST /api/admin/seo/:id/image — update SEO image
export const updateSEOImage = async (id, formData) => {
  const response = await fetch(`/api/admin/seo/${id}/image`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

// DELETE /api/admin/seo/:id — delete SEO record
export const deleteSEO = async (id) => {
  const response = await fetch(`/api/admin/seo/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};
