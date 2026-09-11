const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

export const getAdminCandidateCTA = async () => {
  const response = await fetch('/api/admin/employee/candidate-cta', {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const saveCandidateCTA = async (payload) => {
  const response = await fetch('/api/admin/employee/candidate-cta', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const deleteCandidateCTA = async () => {
  const response = await fetch('/api/admin/employee/candidate-cta', {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};