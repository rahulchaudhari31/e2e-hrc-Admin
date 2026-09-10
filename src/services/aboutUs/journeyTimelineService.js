const API_BASE = '/api';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
};

// GET /api/admin/journey-cards
export const getAdminJourneyCards = async () => {
  const response = await fetch(`${API_BASE}/admin/journey-cards`, { credentials: 'include' });
  return handleResponse(response);
};

// GET /api/admin/journey-cards/:id
export const getJourneyCardById = async (id) => {
  const response = await fetch(`${API_BASE}/admin/journey-cards/${id}`, { credentials: 'include' });
  return handleResponse(response);
};

// POST /api/admin/journey-cards
export const createJourneyCard = async (data) => {
  const response = await fetch(`${API_BASE}/admin/journey-cards`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

// PUT /api/admin/journey-cards/:id
export const updateJourneyCard = async (id, data) => {
  const response = await fetch(`${API_BASE}/admin/journey-cards/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

// DELETE /api/admin/journey-cards/:id
export const deleteJourneyCard = async (id) => {
  const response = await fetch(`${API_BASE}/admin/journey-cards/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};
