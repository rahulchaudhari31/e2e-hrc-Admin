const API_BASE = '/api';

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

export const getHowWeWorkSections = async () => {
  const response = await fetch(`${API_BASE}/admin/workforce-solutions/how-we-work-section`, {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const createHowWeWorkSection = async (data) => {
  const response = await fetch(`${API_BASE}/admin/workforce-solutions/how-we-work-section`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateHowWeWorkSection = async (id, data) => {
  const response = await fetch(`${API_BASE}/admin/workforce-solutions/how-we-work-section/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteHowWeWorkSection = async (id) => {
  const response = await fetch(`${API_BASE}/admin/workforce-solutions/how-we-work-section/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};

export default {
  getHowWeWorkSections,
  createHowWeWorkSection,
  updateHowWeWorkSection,
  deleteHowWeWorkSection,
};
