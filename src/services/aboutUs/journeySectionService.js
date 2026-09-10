const API_BASE = '/api';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
};

// GET /api/admin/journey-section
export const getAdminJourneySection = async () => {
  const response = await fetch(`${API_BASE}/admin/journey-section`, { credentials: 'include' });
  return handleResponse(response);
};

// POST /api/admin/journey-section (creates or updates)
export const createOrUpdateJourneySection = async (data) => {
  const response = await fetch(`${API_BASE}/admin/journey-section`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

// PUT /api/admin/journey-section/:id
export const updateJourneySection = async (id, data) => {
  const response = await fetch(`${API_BASE}/admin/journey-section/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

// DELETE /api/admin/journey-section/:id
export const deleteJourneySection = async (id) => {
  const response = await fetch(`${API_BASE}/admin/journey-section/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};
