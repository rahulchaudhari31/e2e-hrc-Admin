const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || 'API request failed');
  }
  return data;
};

export const createEmployerHero = async (formData) => {
  const response = await fetch('/api/admin/employer/hero', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

export const getEmployerHero = async () => {
  const response = await fetch('/api/employer/hero');
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || 'API request failed');
  }
  return { success: true, message: data.message, data: data.data };
};

export const updateEmployerHero = async (id, formData) => {
  const response = await fetch(`/api/admin/employer/hero/${id}`, {
    method: 'PUT',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

export const deleteEmployerHero = async (id) => {
  const response = await fetch(`/api/admin/employer/hero/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};
