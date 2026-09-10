// ─── Shared response handler ────────────────────────────────────────────────
const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

const API_BASE = '/api';

/**
 * Get all locations (Admin)
 * GET /api/admin/locations
 */
export const getAllLocations = async () => {
  try {
    const response = await fetch(`${API_BASE}/admin/locations`, {
      credentials: 'include',
    });
    return handleResponse(response);
  } catch (error) {
    throw new Error(error?.message || 'Failed to fetch locations');
  }
};

/**
 * Get a location by ID (Admin)
 * GET /api/admin/locations/:id
 */
export const getLocationById = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/admin/locations/${id}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  } catch (error) {
    throw new Error(error?.message || 'Failed to fetch location');
  }
};

/**
 * Create a new location (Admin)
 * POST /api/admin/locations
 * @param {Object} data - Location data
 */
export const createLocation = async (data) => {
  try {
    const response = await fetch(`${API_BASE}/admin/locations`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  } catch (error) {
    throw new Error(error?.message || 'Failed to create location');
  }
};

/**
 * Update a location (Admin)
 * PUT /api/admin/locations/:id
 * @param {string} id - Location ID
 * @param {Object} data - Updated location data
 */
export const updateLocation = async (id, data) => {
  try {
    const response = await fetch(`${API_BASE}/admin/locations/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  } catch (error) {
    throw new Error(error?.message || 'Failed to update location');
  }
};

/**
 * Delete a location (Admin)
 * DELETE /api/admin/locations/:id
 * @param {string} id - Location ID
 */
export const deleteLocation = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/admin/locations/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse(response);
  } catch (error) {
    throw new Error(error?.message || 'Failed to delete location');
  }
};
