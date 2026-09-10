// ─── Shared response handler (same pattern as src/services/api.js) ────────────
const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

const API_BASE = '/api';

/**
 * Get all Recruitment Partners (Admin)
 * GET /api/admin/recruitment-partners
 */
export const getRecruitmentPartners = async () => {
  try {
    const response = await fetch(`${API_BASE}/admin/recruitment-partners`, {
      credentials: 'include',
    });
    return handleResponse(response);
  } catch (error) {
    throw new Error(
      error?.message || 'Failed to fetch recruitment partners'
    );
  }
};

/**
 * Get the active Recruitment Partner (Public)
 * GET /api/recruitment-partners/active
 */
export const getActiveRecruitmentPartner = async () => {
  try {
    const response = await fetch(`${API_BASE}/recruitment-partners/active`);
    return handleResponse(response);
  } catch (error) {
    throw new Error(
      error?.message || 'Failed to fetch active recruitment partner'
    );
  }
};

/**
 * Create a new Recruitment Partner (Admin)
 * POST /api/admin/recruitment-partners
 * @param {FormData} formData
 */
export const createRecruitmentPartner = async (formData) => {
  try {
    const response = await fetch(`${API_BASE}/admin/recruitment-partners`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
      // Do NOT set Content-Type — browser sets it with boundary for FormData
    });
    return handleResponse(response);
  } catch (error) {
    throw new Error(
      error?.message || 'Failed to create recruitment partner'
    );
  }
};

/**
 * Update an existing Recruitment Partner (Admin)
 * PUT /api/admin/recruitment-partners/:id
 * @param {string} id
 * @param {FormData} formData
 */
export const updateRecruitmentPartner = async (id, formData) => {
  try {
    const response = await fetch(`${API_BASE}/admin/recruitment-partners/${id}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData,
      // Do NOT set Content-Type — browser sets it with boundary for FormData
    });
    return handleResponse(response);
  } catch (error) {
    throw new Error(
      error?.message || 'Failed to update recruitment partner'
    );
  }
};

/**
 * Delete a Recruitment Partner (Admin)
 * DELETE /api/admin/recruitment-partners/:id
 * @param {string} id
 */
export const deleteRecruitmentPartner = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/admin/recruitment-partners/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse(response);
  } catch (error) {
    throw new Error(
      error?.message || 'Failed to delete recruitment partner'
    );
  }
};
