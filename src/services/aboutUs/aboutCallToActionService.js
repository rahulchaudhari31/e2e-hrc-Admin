const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

export const getAdminAboutCTA = async () => {
  const response = await fetch('/api/admin/about/call-to-action', {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const saveAboutCTA = async (payload) => {
  const response = await fetch('/api/admin/about/call-to-action', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const deleteAboutCTA = async () => {
  const response = await fetch('/api/admin/about/call-to-action', {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};