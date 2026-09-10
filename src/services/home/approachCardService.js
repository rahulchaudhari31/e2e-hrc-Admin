const API_BASE = '/api';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
};

export const getAdminApproachCards = async () => {
  const response = await fetch(`${API_BASE}/admin/approach-cards`, { credentials: 'include' });
  return handleResponse(response);
};

export const createApproachCard = async (formData) => {
  const response = await fetch(`${API_BASE}/admin/approach-cards`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

export const updateApproachCard = async (id, formData) => {
  const response = await fetch(`${API_BASE}/admin/approach-cards/${id}`, {
    method: 'PUT',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

export const deleteApproachCard = async (id) => {
  const response = await fetch(`${API_BASE}/admin/approach-cards/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};

export const uploadApproachCardImage = async (id, formData) => {
  const response = await fetch(`${API_BASE}/admin/approach-cards/${id}/image`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};
