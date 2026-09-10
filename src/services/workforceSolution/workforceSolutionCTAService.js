const API_BASE = '/api';

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Workforce solution CTA request failed');
  }
  return data;
};

export const getAdminWorkforceSolutionCTA = async () => {
  const response = await fetch(`${API_BASE}/admin/workforce-solutions/cta`, {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const createWorkforceSolutionCTA = async (ctaData) => {
  const response = await fetch(`${API_BASE}/admin/workforce-solutions/cta`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ctaData),
  });
  return handleResponse(response);
};

export const updateWorkforceSolutionCTA = async (id, ctaData) => {
  const response = await fetch(`${API_BASE}/admin/workforce-solutions/cta/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ctaData),
  });
  return handleResponse(response);
};

export const deleteWorkforceSolutionCTA = async (id) => {
  const response = await fetch(`${API_BASE}/admin/workforce-solutions/cta/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};

export default {
  getAdminWorkforceSolutionCTA,
  createWorkforceSolutionCTA,
  updateWorkforceSolutionCTA,
  deleteWorkforceSolutionCTA,
};
