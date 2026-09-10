const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
};

export const getFooterOfficeLocations = async () => {
  const response = await fetch('/api/admin/footer-office-location', { credentials: 'include' });
  return handleResponse(response);
};

export const createFooterOfficeLocation = async (title, isActive, imageFile) => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('isActive', String(isActive));
  if (imageFile) {
    formData.append('image', imageFile);
  }

  const response = await fetch('/api/admin/footer-office-location', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  return handleResponse(response);
};

export const updateFooterOfficeLocation = async (id, title, isActive, imageFile) => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('isActive', String(isActive));
  if (imageFile) {
    formData.append('image', imageFile);
  }

  const response = await fetch(`/api/admin/footer-office-location/${id}`, {
    method: 'PUT',
    credentials: 'include',
    body: formData,
  });

  return handleResponse(response);
};

export const deleteFooterOfficeLocation = async (id) => {
  const response = await fetch(`/api/admin/footer-office-location/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  return handleResponse(response);
};
