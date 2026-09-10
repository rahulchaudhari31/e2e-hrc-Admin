const API_BASE = '/api';

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

// ═══════════════════════════════════════════════════════════════════════════
// SECTION APIS
// ═══════════════════════════════════════════════════════════════════════════

export const getEmployeeWhyChooseSections = async () => {
  const response = await fetch(`${API_BASE}/admin/employee-why-choose-section`, {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const createEmployeeWhyChooseSection = async (data) => {
  const response = await fetch(`${API_BASE}/admin/employee-why-choose-section`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateEmployeeWhyChooseSection = async (id, data) => {
  const response = await fetch(`${API_BASE}/admin/employee-why-choose-section/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteEmployeeWhyChooseSection = async (id) => {
  const response = await fetch(`${API_BASE}/admin/employee-why-choose-section/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};

// ═══════════════════════════════════════════════════════════════════════════
// CARD APIS
// ═══════════════════════════════════════════════════════════════════════════

export const getEmployeeWhyChooseCards = async () => {
  const response = await fetch(`${API_BASE}/admin/employee-why-choose-cards`, {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const createEmployeeWhyChooseCard = async (formData) => {
  const response = await fetch(`${API_BASE}/admin/employee-why-choose-cards`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

export const updateEmployeeWhyChooseCard = async (id, formData) => {
  const response = await fetch(`${API_BASE}/admin/employee-why-choose-cards/${id}`, {
    method: 'PUT',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

export const updateEmployeeWhyChooseCardImage = async (id, formData) => {
  const response = await fetch(`${API_BASE}/admin/employee-why-choose-cards/${id}/image`, {
    method: 'PATCH',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

export const deleteEmployeeWhyChooseCard = async (id) => {
  const response = await fetch(`${API_BASE}/admin/employee-why-choose-cards/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};

export default {
  getEmployeeWhyChooseSections,
  createEmployeeWhyChooseSection,
  updateEmployeeWhyChooseSection,
  deleteEmployeeWhyChooseSection,
  getEmployeeWhyChooseCards,
  createEmployeeWhyChooseCard,
  updateEmployeeWhyChooseCard,
  updateEmployeeWhyChooseCardImage,
  deleteEmployeeWhyChooseCard,
};
