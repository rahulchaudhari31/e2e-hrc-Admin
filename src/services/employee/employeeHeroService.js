const API_BASE = '/api';

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

export const getEmployeeHeroes = async () => {
  const response = await fetch(`${API_BASE}/admin/employee-hero`, {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const createEmployeeHero = async (formData) => {
  const response = await fetch(`${API_BASE}/admin/employee-hero`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

export const updateEmployeeHero = async (id, data) => {
  const response = await fetch(`${API_BASE}/admin/employee-hero/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteEmployeeHero = async (id) => {
  const response = await fetch(`${API_BASE}/admin/employee-hero/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};

export const updateLeftTopImage = async (id, formData) => {
  const response = await fetch(`${API_BASE}/admin/employee-hero/${id}/left-top-image`, {
    method: 'PATCH',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

export const updateLeftBottomImage = async (id, formData) => {
  const response = await fetch(`${API_BASE}/admin/employee-hero/${id}/left-bottom-image`, {
    method: 'PATCH',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

export const updateRightImage = async (id, formData) => {
  const response = await fetch(`${API_BASE}/admin/employee-hero/${id}/right-image`, {
    method: 'PATCH',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

export default {
  getEmployeeHeroes,
  createEmployeeHero,
  updateEmployeeHero,
  deleteEmployeeHero,
  updateLeftTopImage,
  updateLeftBottomImage,
  updateRightImage,
};
