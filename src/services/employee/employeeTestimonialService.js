const API_BASE = '/api';

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Employee Testimonial request failed');
  }
  return data;
};

// ════════════════════════════════════════════════════════════════════════════
// SECTION SERVICES
// ════════════════════════════════════════════════════════════════════════════

export const createEmployeeTestimonialSection = async (data) => {
  const response = await fetch(`${API_BASE}/admin/employee/testimonial-section`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const getAdminEmployeeTestimonialSections = async () => {
  const response = await fetch(`${API_BASE}/admin/employee/testimonial-section`, {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const updateEmployeeTestimonialSection = async (id, data) => {
  const response = await fetch(`${API_BASE}/admin/employee/testimonial-section/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteEmployeeTestimonialSection = async (id) => {
  const response = await fetch(`${API_BASE}/admin/employee/testimonial-section/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};

export const updateEmployeeTestimonialBackgroundImage = async (id, formData) => {
  const response = await fetch(
    `${API_BASE}/admin/employee/testimonial-section/${id}/background-image`,
    {
      method: 'PATCH',
      credentials: 'include',
      body: formData,
    }
  );
  return handleResponse(response);
};

// ════════════════════════════════════════════════════════════════════════════
// CARD SERVICES
// ════════════════════════════════════════════════════════════════════════════

export const createEmployeeTestimonialCard = async (formData) => {
  const response = await fetch(`${API_BASE}/admin/employee/testimonial-cards`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

export const getAdminEmployeeTestimonialCards = async () => {
  const response = await fetch(`${API_BASE}/admin/employee/testimonial-cards`, {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const getAdminEmployeeTestimonialCardById = async (id) => {
  const response = await fetch(`${API_BASE}/admin/employee/testimonial-cards/${id}`, {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const updateEmployeeTestimonialCard = async (id, data) => {
  const response = await fetch(`${API_BASE}/admin/employee/testimonial-cards/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteEmployeeTestimonialCard = async (id) => {
  const response = await fetch(`${API_BASE}/admin/employee/testimonial-cards/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};

export const updateEmployeeTestimonialCardLogo = async (id, formData) => {
  const response = await fetch(`${API_BASE}/admin/employee/testimonial-cards/${id}/logo`, {
    method: 'PATCH',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

export default {
  createEmployeeTestimonialSection,
  getAdminEmployeeTestimonialSections,
  updateEmployeeTestimonialSection,
  deleteEmployeeTestimonialSection,
  updateEmployeeTestimonialBackgroundImage,
  createEmployeeTestimonialCard,
  getAdminEmployeeTestimonialCards,
  getAdminEmployeeTestimonialCardById,
  updateEmployeeTestimonialCard,
  deleteEmployeeTestimonialCard,
  updateEmployeeTestimonialCardLogo,
};
