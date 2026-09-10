const API_BASE = '/api';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
};

// Admin routes for Why Choose E2E management
export const getAdminWhyChooseE2E = async () => {
  const response = await fetch(`${API_BASE}/admin/about/why-choose`, { credentials: 'include' });
  return handleResponse(response);
};

export const createWhyChooseE2E = async (formData) => {
  const response = await fetch(`${API_BASE}/admin/about/why-choose`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

export const updateWhyChooseE2E = async (id, data) => {
  const response = await fetch(`${API_BASE}/admin/about/why-choose/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteWhyChooseE2E = async (id) => {
  const response = await fetch(`${API_BASE}/admin/about/why-choose/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};

export const uploadWhyChooseE2EImage = async (id, formData) => {
  const response = await fetch(`${API_BASE}/admin/about/why-choose/${id}/image`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};
