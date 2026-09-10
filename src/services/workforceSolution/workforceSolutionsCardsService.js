const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Workforce solution card request failed');
  }
  return data;
};

export const getAllWorkforceSolutionsAdmin = async () => {
  const response = await fetch('/api/admin/workforce-solution-cards', {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const createWorkforceSolution = async (solutionData) => {
  const response = await fetch('/api/admin/workforce-solution-cards', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(solutionData),
  });
  return handleResponse(response);
};

export const updateWorkforceSolution = async (id, solutionData) => {
  const response = await fetch(`/api/admin/workforce-solution-cards/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(solutionData),
  });
  return handleResponse(response);
};

export const deleteWorkforceSolution = async (id) => {
  const response = await fetch(`/api/admin/workforce-solution-cards/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};
