const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
};

export const getFooterNavigations = async () => {
  const response = await fetch('/api/admin/footer-navigation', { credentials: 'include' });
  return handleResponse(response);
};

export const createFooterNavigation = async (payload) => {
  const response = await fetch('/api/admin/footer-navigation', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

export const updateFooterNavigation = async (id, payload) => {
  const response = await fetch(`/api/admin/footer-navigation/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

export const deleteFooterNavigation = async (id) => {
  const response = await fetch(`/api/admin/footer-navigation/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  return handleResponse(response);
};
