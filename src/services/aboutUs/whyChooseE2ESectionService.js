const API_BASE = '/api';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
};

// Admin routes for Why Choose E2E Section management
export const getAdminWhyChooseE2ESection = async () => {
  const response = await fetch(`${API_BASE}/admin/about/why-choose-section`, { credentials: 'include' });
  return handleResponse(response);
};

export const createWhyChooseE2ESection = async (data) => {
  const response = await fetch(`${API_BASE}/admin/about/why-choose-section`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateWhyChooseE2ESection = async (id, data) => {
  const response = await fetch(`${API_BASE}/admin/about/why-choose-section/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteWhyChooseE2ESection = async (id) => {
  const response = await fetch(`${API_BASE}/admin/about/why-choose-section/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};
