const normalizePayload = (data = {}) => {
  const payload = { ...data };

  if (Array.isArray(payload.steps)) {
    payload.steps = JSON.stringify(payload.steps);
  }

  return payload;
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'How We Work request failed');
  }
  return data;
};

export const getHowWeWork = async () => {
  const response = await fetch('/api/admin/how-we-work', {
    credentials: 'include',
  });

  if (response.status === 404) return null;
  return handleResponse(response);
};

export const createHowWeWork = async (data) => {
  const response = await fetch('/api/admin/how-we-work', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(normalizePayload(data)),
  });

  return handleResponse(response);
};

export const updateHowWeWork = async (id, data) => {
  const response = await fetch('/api/admin/how-we-work', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(normalizePayload({ ...data, _id: id })),
  });

  return handleResponse(response);
};

export const updateEmployerStep = async (sectionId, stepIndex, data) => {
  const response = await fetch(`/api/admin/how-we-work/employer-steps/${sectionId}/${stepIndex}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
};

export const updateEmployeeStep = async (sectionId, stepIndex, data) => {
  const response = await fetch(`/api/admin/how-we-work/employee-steps/${sectionId}/${stepIndex}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
};

export const deleteEmployerStep = async (sectionId, stepIndex) => {
  const response = await fetch(`/api/admin/how-we-work/employer-steps/${sectionId}/${stepIndex}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  return handleResponse(response);
};

export const deleteEmployeeStep = async (sectionId, stepIndex) => {
  const response = await fetch(`/api/admin/how-we-work/employee-steps/${sectionId}/${stepIndex}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  return handleResponse(response);
};
