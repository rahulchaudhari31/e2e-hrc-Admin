const API_BASE = '/api';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
};

export const getMissionVision = async () => {
  const response = await fetch(`${API_BASE}/about/mission-vision`, { credentials: 'include' });
  return handleResponse(response);
};

export const getAdminMissionVision = async () => {
  const response = await fetch(`${API_BASE}/admin/about/mission-vision`, { credentials: 'include' });
  return handleResponse(response);
};

export const createMissionVision = async (data) => {
  const response = await fetch(`${API_BASE}/admin/about/mission-vision`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateMissionVision = async (id, data) => {
  const response = await fetch(`${API_BASE}/admin/about/mission-vision/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteMissionVision = async (id) => {
  const response = await fetch(`${API_BASE}/admin/about/mission-vision/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};
