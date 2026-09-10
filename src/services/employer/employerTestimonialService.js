// ─── Shared response handler ────────────────────────────────────────────────
const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || 'API request failed');
  }
  return data;
};

// ════════════════════════════════════════════════════════════════════════════
// TESTIMONIAL SECTION APIs
// Routes: /api/admin/employer/testimonial-section
// ════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/admin/employer/testimonial-section
 * Create a new testimonial section (only one can exist).
 * @param {{ badgeText: string, sectionTitle: string, sectionDescription: string, isActive: boolean }} payload
 */
export const createTestimonialSection = async (payload) => {
  const response = await fetch('/api/admin/employer/testimonial-section', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

/**
 * GET /api/admin/employer/employertestimonial-section
 * Fetch the existing testimonial section for admin.
 * Response shape: { success, message, data: { _id, badgeText, sectionTitle, sectionDescription, isActive } | null }
 */
export const getAdminTestimonialSection = async () => {
  const response = await fetch('/api/admin/employer/employertestimonial-section', {
    method: 'GET',
    credentials: 'include',
  });
  return handleResponse(response);
};

/**
 * PUT /api/admin/employer/testimonial-section/:id
 * Update an existing testimonial section by ID.
 * @param {string} id  MongoDB ObjectId of the section
 * @param {{ badgeText?: string, sectionTitle?: string, sectionDescription?: string, isActive?: boolean }} payload
 */
export const updateTestimonialSection = async (id, payload) => {
  const response = await fetch(`/api/admin/employer/testimonial-section/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

/**
 * DELETE /api/admin/employer/testimonial-section/:id
 * Delete a testimonial section by ID.
 * @param {string} id  MongoDB ObjectId of the section
 */
export const deleteTestimonialSection = async (id) => {
  const response = await fetch(`/api/admin/employer/testimonial-section/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};

// ════════════════════════════════════════════════════════════════════════════
// TESTIMONIAL CARD APIs
// Routes: /api/admin/employer/testimonial-cards
// ════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/admin/employer/testimonial-cards
 * Create a new testimonial card. Uses multipart/form-data for logo upload.
 * FormData must include field "companyLogo" for the file (optional).
 * @param {FormData} formData  Contains: title, reviewText, companyName, reviewerName,
 *                             reviewerDesignation, order, isActive, companyLogo (optional file)
 */
export const createTestimonialCard = async (formData) => {
  const response = await fetch('/api/admin/employer/testimonial-cards', {
    method: 'POST',
    credentials: 'include',
    // Do NOT set Content-Type header — browser sets it automatically with the correct boundary for multipart
    body: formData,
  });
  return handleResponse(response);
};

/**
 * GET /api/admin/employer/testimonial-cards
 * Fetch all testimonial cards (admin view, active + inactive), sorted by order asc.
 * Response shape: { success, message, data: Card[] }
 */
export const getAdminTestimonialCards = async () => {
  const response = await fetch('/api/admin/employer/testimonial-cards', {
    method: 'GET',
    credentials: 'include',
  });
  return handleResponse(response);
};

/**
 * GET /api/admin/employer/testimonial-cards/:id
 * Fetch a single testimonial card by ID.
 * @param {string} id  MongoDB ObjectId of the card
 * Response shape: { success, message, data: Card }
 */
export const getAdminTestimonialCardById = async (id) => {
  const response = await fetch(`/api/admin/employer/testimonial-cards/${id}`, {
    method: 'GET',
    credentials: 'include',
  });
  return handleResponse(response);
};

/**
 * PUT /api/admin/employer/testimonial-cards/:id
 * Update text fields of a testimonial card. Does NOT update the logo.
 * Use updateTestimonialCardLogo() to replace the logo separately.
 * @param {string} id  MongoDB ObjectId of the card
 * @param {{ title?: string, reviewText?: string, companyName?: string, reviewerName?: string,
 *           reviewerDesignation?: string, order?: number, isActive?: boolean }} payload
 */
export const updateTestimonialCard = async (id, payload) => {
  const response = await fetch(`/api/admin/employer/testimonial-cards/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

/**
 * DELETE /api/admin/employer/testimonial-cards/:id
 * Delete a testimonial card by ID.
 * @param {string} id  MongoDB ObjectId of the card
 */
export const deleteTestimonialCard = async (id) => {
  const response = await fetch(`/api/admin/employer/testimonial-cards/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};

/**
 * PATCH /api/admin/employer/testimonial-cards/:id/company-logo
 * Replace only the company logo of an existing card. Uses multipart/form-data.
 * FormData must include field "companyLogo" with the new image file.
 * @param {string}   id        MongoDB ObjectId of the card
 * @param {FormData} formData  Must contain a file field named "companyLogo"
 */
export const updateTestimonialCardLogo = async (id, formData) => {
  const response = await fetch(`/api/admin/employer/testimonial-cards/${id}/company-logo`, {
    method: 'PATCH',
    credentials: 'include',
    // Do NOT set Content-Type header — browser sets correct multipart boundary automatically
    body: formData,
  });
  return handleResponse(response);
};

/**
 * updateCompanyLogo — dedicated named export used by CardModal for logo uploads.
 * Wraps updateTestimonialCardLogo with the exact FormData the backend expects.
 * @param {string}   id   MongoDB ObjectId of the card
 * @param {FormData} formData  Must contain field "companyLogo" with the image File
 */
export const updateCompanyLogo = async (id, formData) => {
  const response = await fetch(`/api/admin/employer/testimonial-cards/${id}/company-logo`, {
    method: 'PATCH',
    credentials: 'include',
    // Do NOT set Content-Type — browser sets multipart boundary automatically
    body: formData,
  });
  return handleResponse(response);
};
