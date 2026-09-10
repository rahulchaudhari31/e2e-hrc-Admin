const API_BASE = '/api';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
};

export const getWhyChoose = async () => {
  const response = await fetch(`${API_BASE}/why-choose`, { credentials: 'include' });
  return handleResponse(response);
};

export const getAdminWhyChoose = async () => {
  const response = await fetch(`${API_BASE}/admin/why-choose`, { credentials: 'include' });
  return handleResponse(response);
};

export const createWhyChoose = async (payload) => {
  const response = await fetch(`${API_BASE}/admin/why-choose`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const updateWhyChoose = async (id, payload) => {
  const response = await fetch(`${API_BASE}/admin/why-choose/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const deleteWhyChoose = async (id) => {
  const response = await fetch(`${API_BASE}/admin/why-choose/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};

export const uploadWhyChooseImage = async (id, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch(`${API_BASE}/admin/why-choose/${id}/image`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};
