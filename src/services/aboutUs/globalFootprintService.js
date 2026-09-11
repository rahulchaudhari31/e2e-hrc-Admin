const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

export const getAdminGlobalFootprint = async () => {
  const response = await fetch('/api/admin/about/global-footprint', {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const saveGlobalFootprint = async (payload) => {
  const response = await fetch('/api/admin/about/global-footprint', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const deleteGlobalFootprint = async () => {
  const response = await fetch('/api/admin/about/global-footprint', {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};