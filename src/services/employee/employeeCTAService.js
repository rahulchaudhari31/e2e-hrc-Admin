const API_BASE = '/api';

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Employee CTA request failed');
  }
  return data;
};

export const getAdminEmployeeCTA = async () => {
  const response = await fetch(`${API_BASE}/admin/employee/cta`, {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const createEmployeeCTA = async (ctaData) => {
  const response = await fetch(`${API_BASE}/admin/employee/cta`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ctaData),
  });
  return handleResponse(response);
};

export const updateEmployeeCTA = async (id, ctaData) => {
  const response = await fetch(`${API_BASE}/admin/employee/cta/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ctaData),
  });
  return handleResponse(response);
};

export const deleteEmployeeCTA = async (id) => {
  const response = await fetch(`${API_BASE}/admin/employee/cta/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};

export default {
  getAdminEmployeeCTA,
  createEmployeeCTA,
  updateEmployeeCTA,
  deleteEmployeeCTA,
};
