const API_BASE = '/api';

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

export const getTestimonialCards = async () => {
  const response = await fetch(`${API_BASE}/admin/workforce-solutions/testimonial-cards`, {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const createTestimonialCard = async (data) => {
  const response = await fetch(`${API_BASE}/admin/workforce-solutions/testimonial-cards`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateTestimonialCard = async (id, data) => {
  const response = await fetch(`${API_BASE}/admin/workforce-solutions/testimonial-cards/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteTestimonialCard = async (id) => {
  const response = await fetch(`${API_BASE}/admin/workforce-solutions/testimonial-cards/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};

export default {
  getTestimonialCards,
  createTestimonialCard,
  updateTestimonialCard,
  deleteTestimonialCard,
};
