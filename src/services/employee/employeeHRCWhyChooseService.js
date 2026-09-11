const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

export const getAdminHRCSection = async () => {
  const response = await fetch('/api/admin/employee/hrc-why-choose-section', {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const saveHRCSection = async (payload) => {
  const response = await fetch('/api/admin/employee/hrc-why-choose-section', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const getAdminHRCCards = async () => {
  const response = await fetch('/api/admin/employee/hrc-why-choose-cards', {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const createHRCCard = async (payload) => {
  const response = await fetch('/api/admin/employee/hrc-why-choose-card', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const updateHRCCard = async (id, payload) => {
  const response = await fetch(`/api/admin/employee/hrc-why-choose-card/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const uploadHRCCardImage = async (id, formData) => {
  const response = await fetch(`/api/admin/employee/hrc-why-choose-card/${id}/image`, {
    method: 'PATCH',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

export const deleteHRCCard = async (id) => {
  const response = await fetch(`/api/admin/employee/hrc-why-choose-card/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};