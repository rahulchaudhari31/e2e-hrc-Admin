const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

export const getAdminHowWeWorkSteps = async () => {
  const response = await fetch('/api/admin/employer-how-we-work-steps', {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const createEmployerHowWeWorkStep = async (payload) => {
  const response = await fetch('/api/admin/employer-how-we-work-step', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const updateEmployerHowWeWorkStep = async (id, payload) => {
  const response = await fetch(`/api/admin/employer-how-we-work-step/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const deleteEmployerHowWeWorkStep = async (id) => {
  const response = await fetch(`/api/admin/employer-how-we-work-step/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};
