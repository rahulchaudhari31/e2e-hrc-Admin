// ─── Shared response handler ────────────────────────────────────────────────
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONTACT US ENQUIRIES (Form Submissions)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get all contact us enquiries
 * GET /api/contact/enquiries
 */
export const getAllContactEnquiries = async () => {
  const response = await fetch('/api/contact/enquiries', {
    credentials: 'include',
  });
  return handleResponse(response);
};

/**
 * Get a specific contact us enquiry by ID
 * GET /api/contact/enquiries/:id
 */
export const getContactEnquiryById = async (id) => {
  const response = await fetch(`/api/contact/enquiries/${id}`, {
    credentials: 'include',
  });
  return handleResponse(response);
};

/**
 * Update contact us enquiry status
 * PUT /api/contact/enquiries/:id/status
 */
export const updateContactEnquiryStatus = async (id, status) => {
  const response = await fetch(`/api/contact/enquiries/${id}/status`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return handleResponse(response);
};

/**
 * Delete a contact us enquiry
 * DELETE /api/contact/enquiries/:id
 */
export const deleteContactEnquiry = async (id) => {
  const response = await fetch(`/api/contact/enquiries/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};

export default {
  getAllContactEnquiries,
  getContactEnquiryById,
  updateContactEnquiryStatus,
  deleteContactEnquiry,
};
