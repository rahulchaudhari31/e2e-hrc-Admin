const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

export const getEmployerFAQs = async () => {
  const response = await fetch('/api/admin/employer-faq', {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const createEmployerFAQ = async (payload) => {
  const response = await fetch('/api/admin/employer-faq', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const updateEmployerFAQ = async (id, payload) => {
  const response = await fetch(`/api/admin/employer-faq/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const deleteEmployerFAQ = async (id) => {
  const response = await fetch(`/api/admin/employer-faq/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};
