// ─── Shared response handler ────────────────────────────────────────────────
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

// ════════════════════════════════════════════════════════════════════════════
// TESTIMONIALS MODULE
// ════════════════════════════════════════════════════════════════════════════

// --- Section Endpoints ---

export const getSection = async () => {
  const response = await fetch('/api/admin/testimonial-section', {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const createSection = async (sectionData) => {
  const response = await fetch('/api/admin/testimonial-section', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sectionData),
  });
  return handleResponse(response);
};

export const updateSection = async (id, sectionData) => {
  const response = await fetch(`/api/admin/testimonial-section/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sectionData),
  });
  return handleResponse(response);
};

export const deleteSection = async (id) => {
  const response = await fetch(`/api/admin/testimonial-section/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};

// --- Cards Endpoints ---

export const getCards = async () => {
  const response = await fetch('/api/admin/testimonial-cards', {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const getCard = async (id) => {
  const response = await fetch(`/api/admin/testimonial-cards/${id}`, {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const createCard = async (cardData) => {
  const response = await fetch('/api/admin/testimonial-cards', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cardData),
  });
  return handleResponse(response);
};

export const updateCard = async (id, cardData) => {
  const response = await fetch(`/api/admin/testimonial-cards/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cardData),
  });
  return handleResponse(response);
};

export const deleteCard = async (id) => {
  const response = await fetch(`/api/admin/testimonial-cards/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};

export const uploadLogo = async (id, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  const response = await fetch(`/api/admin/testimonial-cards/${id}/logo`, {
    method: 'PATCH',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

// --- Public Endpoints ---
export const getPublicTestimonials = async () => {
  const response = await fetch('/api/testimonials');
  return handleResponse(response);
};
