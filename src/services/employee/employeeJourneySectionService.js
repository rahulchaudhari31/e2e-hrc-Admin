const API_BASE = '/api';

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

export const getEmployeeJourneySections = async () => {
  const response = await fetch(`${API_BASE}/admin/employee-journey-section`, {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const createEmployeeJourneySection = async (data) => {
  const response = await fetch(`${API_BASE}/admin/employee-journey-section`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateEmployeeJourneySection = async (id, data) => {
  const response = await fetch(`${API_BASE}/admin/employee-journey-section/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteEmployeeJourneySection = async (id) => {
  const response = await fetch(`${API_BASE}/admin/employee-journey-section/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};

export default {
  getEmployeeJourneySections,
  createEmployeeJourneySection,
  updateEmployeeJourneySection,
  deleteEmployeeJourneySection,
};
