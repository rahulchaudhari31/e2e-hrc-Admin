const API_BASE = '/api';

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

export const getWorkforceSolutionHeroes = async () => {
  const response = await fetch(`${API_BASE}/admin/workforce-solution/employer-hero`, {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const createWorkforceSolutionHero = async (formData) => {
  const response = await fetch(`${API_BASE}/admin/workforce-solution/employer-hero`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

export const updateWorkforceSolutionHero = async (id, data) => {
  const response = await fetch(`${API_BASE}/admin/workforce-solution/employer-hero/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateWorkforceSolutionHeroImage = async (id, formData) => {
  const response = await fetch(`${API_BASE}/admin/workforce-solution/employer-hero/${id}/image`, {
    method: 'PATCH',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

export const deleteWorkforceSolutionHero = async (id) => {
  const response = await fetch(`${API_BASE}/admin/workforce-solution/employer-hero/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};

export default {
  getWorkforceSolutionHeroes,
  createWorkforceSolutionHero,
  updateWorkforceSolutionHero,
  updateWorkforceSolutionHeroImage,
  deleteWorkforceSolutionHero,
};
