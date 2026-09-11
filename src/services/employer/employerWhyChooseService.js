const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

export const getAdminWhyChooseSection = async () => {
  const response = await fetch('/api/admin/employer/why-choose-section', {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const saveWhyChooseSection = async (payload) => {
  const response = await fetch('/api/admin/employer/why-choose-section', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const getAdminWhyChooseCards = async () => {
  const response = await fetch('/api/admin/employer/why-choose-cards', {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const createWhyChooseCard = async (payload) => {
  const response = await fetch('/api/admin/employer/why-choose-card', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const updateWhyChooseCard = async (id, payload) => {
  const response = await fetch(`/api/admin/employer/why-choose-card/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const uploadWhyChooseCardImage = async (id, formData) => {
  const response = await fetch(`/api/admin/employer/why-choose-card/${id}/image`, {
    method: 'PATCH',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

export const deleteWhyChooseCard = async (id) => {
  const response = await fetch(`/api/admin/employer/why-choose-card/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};