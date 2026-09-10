const API_BASE = '/api';

const handleResponse = async (response) => {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || 'Employer API request failed');
  return payload?.data ?? payload;
};

export const getAllEmployers = async () => handleResponse(await fetch(`${API_BASE}/admin/employers`, { credentials: 'include' }));

export const getEmployerById = async (id) => handleResponse(await fetch(`${API_BASE}/admin/employers/${id}`, { credentials: 'include' }));

export const updateEmployerStatus = async (id, status) => handleResponse(await fetch(`${API_BASE}/admin/employers/${id}/status`, {
  method: 'PATCH',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status }),
}));

export const deleteEmployer = async (id) => handleResponse(await fetch(`${API_BASE}/admin/employers/${id}`, {
  method: 'DELETE',
  credentials: 'include',
}));

export default { getAllEmployers, getEmployerById, updateEmployerStatus, deleteEmployer };
