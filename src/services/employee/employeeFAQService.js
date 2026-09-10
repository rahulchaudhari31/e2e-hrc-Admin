const API_BASE = '/api';

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Employee FAQ request failed');
  }
  return data;
};

export const getAdminEmployeeFAQs = async () => {
  const response = await fetch(`${API_BASE}/admin/employee/faq`, {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const createEmployeeFAQ = async (faqData) => {
  const response = await fetch(`${API_BASE}/admin/employee/faq`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(faqData),
  });
  return handleResponse(response);
};

export const updateEmployeeFAQ = async (id, faqData) => {
  const response = await fetch(`${API_BASE}/admin/employee/faq/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(faqData),
  });
  return handleResponse(response);
};

export const deleteEmployeeFAQ = async (id) => {
  const response = await fetch(`${API_BASE}/admin/employee/faq/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};

export default {
  getAdminEmployeeFAQs,
  createEmployeeFAQ,
  updateEmployeeFAQ,
  deleteEmployeeFAQ,
};
