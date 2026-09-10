const API_BASE = '/api';

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

export const getTestimonialSections = async () => {
  const response = await fetch(`${API_BASE}/admin/workforce-solutions/testimonial-section`, {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const createTestimonialSection = async (data) => {
  const response = await fetch(`${API_BASE}/admin/workforce-solutions/testimonial-section`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateTestimonialSection = async (id, data) => {
  const response = await fetch(`${API_BASE}/admin/workforce-solutions/testimonial-section/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteTestimonialSection = async (id) => {
  const response = await fetch(`${API_BASE}/admin/workforce-solutions/testimonial-section/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};

export default {
  getTestimonialSections,
  createTestimonialSection,
  updateTestimonialSection,
  deleteTestimonialSection,
};
