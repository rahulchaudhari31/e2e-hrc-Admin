const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Workforce solution section request failed');
  }
  return data;
};

export const getAllSectionsAdmin = async () => {
  const response = await fetch('/api/admin/workforce-solution-section', {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const createSection = async (sectionData) => {
  const response = await fetch('/api/admin/workforce-solution-section', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sectionData),
  });
  return handleResponse(response);
};

export const updateSection = async (id, sectionData) => {
  const response = await fetch(`/api/admin/workforce-solution-section/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sectionData),
  });
  return handleResponse(response);
};

export const deleteSection = async (id) => {
  const response = await fetch(`/api/admin/workforce-solution-section/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};
