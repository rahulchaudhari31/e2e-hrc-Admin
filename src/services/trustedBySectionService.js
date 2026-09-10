// ─── Shared response handler ────────────────────────────────────────────────
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

// ════════════════════════════════════════════════════════════════════════════
// TRUSTED BY SECTION
// ════════════════════════════════════════════════════════════════════════════

// GET /api/admin/trusted-by-section — fetch section for editing
export const getTrustedBySection = async () => {
  const response = await fetch('/api/admin/trusted-by-section', {
    credentials: 'include',
  });
  if (response.status === 404) return null;
  return handleResponse(response);
};

// POST /api/admin/trusted-by-section — create section
export const createTrustedBySection = async (sectionData) => {
  const response = await fetch('/api/admin/trusted-by-section', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sectionData),
  });
  return handleResponse(response);
};

// PUT /api/admin/trusted-by-section/:id — update section
export const updateTrustedBySection = async (id, sectionData) => {
  const response = await fetch(`/api/admin/trusted-by-section/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sectionData),
  });
  return handleResponse(response);
};

// DELETE /api/admin/trusted-by-section/:id — delete section
export const deleteTrustedBySection = async (id) => {
  const response = await fetch(`/api/admin/trusted-by-section/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};
