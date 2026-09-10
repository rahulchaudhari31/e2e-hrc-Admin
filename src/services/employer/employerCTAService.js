const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

export const getEmployerCTAs = async () => {
  const response = await fetch('/api/admin/employer-cta', {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const createEmployerCTA = async (payload) => {
  const response = await fetch('/api/admin/employer-cta', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const updateEmployerCTA = async (id, payload) => {
  const response = await fetch(`/api/admin/employer-cta/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const deleteEmployerCTA = async (id) => {
  const response = await fetch(`/api/admin/employer-cta/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};
