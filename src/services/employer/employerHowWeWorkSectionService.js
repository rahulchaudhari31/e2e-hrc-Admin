const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

export const getAdminHowWeWorkSection = async () => {
  const response = await fetch('/api/admin/employer-how-we-work-section', {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const saveHowWeWorkSection = async (payload) => {
  const response = await fetch('/api/admin/employer-how-we-work-section', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};