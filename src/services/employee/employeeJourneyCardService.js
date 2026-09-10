const API_BASE = '/api';

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

export const getEmployeeJourneyCards = async () => {
  const response = await fetch(`${API_BASE}/admin/employee-journey-cards`, {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const createEmployeeJourneyCard = async (data) => {
  const response = await fetch(`${API_BASE}/admin/employee-journey-cards`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateEmployeeJourneyCard = async (id, data) => {
  const response = await fetch(`${API_BASE}/admin/employee-journey-cards/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteEmployeeJourneyCard = async (id) => {
  const response = await fetch(`${API_BASE}/admin/employee-journey-cards/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};

export default {
  getEmployeeJourneyCards,
  createEmployeeJourneyCard,
  updateEmployeeJourneyCard,
  deleteEmployeeJourneyCard,
};
