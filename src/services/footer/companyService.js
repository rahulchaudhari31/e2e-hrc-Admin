const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
};

export const getFooterCompanies = async () => {
  const response = await fetch('/api/admin/footer-company', { credentials: 'include' });
  return handleResponse(response);
};

export const createFooterCompany = async (description, isActive, logoFile) => {
  const formData = new FormData();
  formData.append('description', description);
  formData.append('isActive', String(isActive));
  if (logoFile) {
    formData.append('logo', logoFile);
  }

  const response = await fetch('/api/admin/footer-company', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  return handleResponse(response);
};

export const updateFooterCompany = async (id, description, isActive, logoFile) => {
  const formData = new FormData();
  formData.append('description', description);
  formData.append('isActive', String(isActive));
  if (logoFile) {
    formData.append('logo', logoFile);
  }

  const response = await fetch(`/api/admin/footer-company/${id}`, {
    method: 'PUT',
    credentials: 'include',
    body: formData,
  });

  return handleResponse(response);
};

export const deleteFooterCompany = async (id) => {
  const response = await fetch(`/api/admin/footer-company/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  return handleResponse(response);
};
