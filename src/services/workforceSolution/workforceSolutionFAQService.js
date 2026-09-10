const API_BASE = '/api';

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Workforce solution FAQ request failed');
  }
  return data;
};

export const getAdminWorkforceSolutionFAQs = async () => {
  const response = await fetch(`${API_BASE}/admin/workforce-solutions/faq`, {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const createWorkforceSolutionFAQ = async (faqData) => {
  const response = await fetch(`${API_BASE}/admin/workforce-solutions/faq`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(faqData),
  });
  return handleResponse(response);
};

export const updateWorkforceSolutionFAQ = async (id, faqData) => {
  const response = await fetch(`${API_BASE}/admin/workforce-solutions/faq/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(faqData),
  });
  return handleResponse(response);
};

export const deleteWorkforceSolutionFAQ = async (id) => {
  const response = await fetch(`${API_BASE}/admin/workforce-solutions/faq/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};

export default {
  getAdminWorkforceSolutionFAQs,
  createWorkforceSolutionFAQ,
  updateWorkforceSolutionFAQ,
  deleteWorkforceSolutionFAQ,
};
