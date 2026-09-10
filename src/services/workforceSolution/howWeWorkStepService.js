const API_BASE = '/api';

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

export const getHowWeWorkSteps = async () => {
  const response = await fetch(`${API_BASE}/admin/workforce-solutions/how-we-work-steps`, {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const createHowWeWorkStep = async (data) => {
  const response = await fetch(`${API_BASE}/admin/workforce-solutions/how-we-work-steps`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateHowWeWorkStep = async (id, data) => {
  const response = await fetch(`${API_BASE}/admin/workforce-solutions/how-we-work-steps/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteHowWeWorkStep = async (id) => {
  const response = await fetch(`${API_BASE}/admin/workforce-solutions/how-we-work-steps/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};

export default {
  getHowWeWorkSteps,
  createHowWeWorkStep,
  updateHowWeWorkStep,
  deleteHowWeWorkStep,
};
