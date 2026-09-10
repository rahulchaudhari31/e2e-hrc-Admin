const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
};

export const getFooterContacts = async () => {
  const response = await fetch('/api/admin/footer-contact', { credentials: 'include' });
  return handleResponse(response);
};

export const createFooterContact = async (payload) => {
  const response = await fetch('/api/admin/footer-contact', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

export const updateFooterContact = async (id, payload) => {
  const response = await fetch(`/api/admin/footer-contact/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

export const deleteFooterContact = async (id) => {
  const response = await fetch(`/api/admin/footer-contact/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  return handleResponse(response);
};
