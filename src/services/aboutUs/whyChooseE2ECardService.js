const API_BASE = '/api';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
};

// Admin routes for Why Choose E2E Card management
export const getAdminWhyChooseE2ECards = async () => {
  const response = await fetch(`${API_BASE}/admin/about/why-choose-cards`, { credentials: 'include' });
  return handleResponse(response);
};

export const createWhyChooseE2ECard = async (formData) => {
  const response = await fetch(`${API_BASE}/admin/about/why-choose-cards`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

export const updateWhyChooseE2ECard = async (id, data) => {
  const response = await fetch(`${API_BASE}/admin/about/why-choose-cards/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const uploadWhyChooseE2ECardImage = async (id, formData) => {
  const response = await fetch(`${API_BASE}/admin/about/why-choose-cards/${id}/image`, {
    method: 'PATCH',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

export const deleteWhyChooseE2ECard = async (id) => {
  const response = await fetch(`${API_BASE}/admin/about/why-choose-cards/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};
