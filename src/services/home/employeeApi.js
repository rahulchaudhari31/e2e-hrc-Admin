const API_BASE = '/api';

const handleResponse = async (response) => {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || 'Employee API request failed');
  return payload?.data ?? payload;
};

export const getAllEmployees = async () => handleResponse(await fetch(`${API_BASE}/admin/employees`, { credentials: 'include' }));

export const getEmployeeById = async (id) => handleResponse(await fetch(`${API_BASE}/admin/employees/${id}`, { credentials: 'include' }));

export const updateEmployeeStatus = async (id, status) => handleResponse(await fetch(`${API_BASE}/admin/employees/${id}/status`, {
  method: 'PATCH',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status }),
}));

export const deleteEmployee = async (id) => handleResponse(await fetch(`${API_BASE}/admin/employees/${id}`, {
  method: 'DELETE',
  credentials: 'include',
}));

export default { getAllEmployees, getEmployeeById, updateEmployeeStatus, deleteEmployee };
