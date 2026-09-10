// ─── Shared response handler ────────────────────────────────────────────────
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

// ════════════════════════════════════════════════════════════════════════════
// TRUSTED BY LOGOS
// ════════════════════════════════════════════════════════════════════════════

// GET /api/admin/trusted-by-logos — fetch all logos (active + inactive) for admin
export const getAllTrustedByLogos = async () => {
  const response = await fetch('/api/admin/trusted-by-logos', {
    credentials: 'include',
  });
  return handleResponse(response);
};

// GET /api/admin/trusted-by-logos/:id — fetch single logo by id
export const getTrustedByLogoById = async (id) => {
  const response = await fetch(`/api/admin/trusted-by-logos/${id}`, {
    credentials: 'include',
  });
  return handleResponse(response);
};

// POST /api/admin/trusted-by-logos — create a new logo with image
export const createTrustedByLogo = async (logoData) => {
  const response = await fetch('/api/admin/trusted-by-logos', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(logoData),
  });
  return handleResponse(response);
};

// POST /api/admin/trusted-by-logos with FormData — create logo with image file
export const createTrustedByLogoWithImage = async (formData) => {
  const response = await fetch('/api/admin/trusted-by-logos', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

// PUT /api/admin/trusted-by-logos/:id — update logo details
export const updateTrustedByLogo = async (id, logoData) => {
  const response = await fetch(`/api/admin/trusted-by-logos/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(logoData),
  });
  return handleResponse(response);
};

// DELETE /api/admin/trusted-by-logos/:id — delete logo
export const deleteTrustedByLogo = async (id) => {
  const response = await fetch(`/api/admin/trusted-by-logos/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};

// PATCH /api/admin/trusted-by-logos/:id/logo — upload/replace logo image
export const uploadTrustedByLogoImage = async (id, imageFile) => {
  const formData = new FormData();
  formData.append('logo', imageFile);
  const response = await fetch(`/api/admin/trusted-by-logos/${id}/logo`, {
    method: 'PATCH',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};
