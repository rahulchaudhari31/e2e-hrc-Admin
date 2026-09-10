const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new Error((data && data.message) || 'API request failed');
  }

  return data;
};

export const getSEO = async () => {
  const response = await fetch('/api/v1/admin/seo', {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  return handleResponse(response);
};

export const getSEOById = async (id) => {
  const response = await fetch(`/api/v1/admin/seo/${id}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  return handleResponse(response);
};

export const createSEO = async (payload) => {
  const response = await fetch('/api/v1/admin/seo', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

export const updateSEO = async (id, payload) => {
  const response = await fetch(`/api/v1/admin/seo/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

export const deleteSEO = async (id) => {
  const response = await fetch(`/api/v1/admin/seo/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  return handleResponse(response);
};
