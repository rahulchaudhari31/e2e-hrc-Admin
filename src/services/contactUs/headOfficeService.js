const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

// ─── GET /api/v1/admin/head-office — Get Head Office data ────────────────────
export const getAdminHeadOffice = async () => {
  try {
    const response = await fetch('/api/v1/admin/head-office', {
      credentials: 'include',
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching Head Office:', error);
    throw new Error(error?.message || 'Failed to fetch Head Office');
  }
};

// ─── POST /api/v1/admin/head-office — Create Head Office ──────────────────────
export const createHeadOffice = async (data) => {
  try {
    const response = await fetch('/api/v1/admin/head-office', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error creating Head Office:', error);
    throw new Error(error?.message || 'Failed to create Head Office');
  }
};

// ─── PUT /api/v1/admin/head-office/:id — Update Head Office ────────────────────
export const updateHeadOffice = async (id, data) => {
  try {
    const response = await fetch(`/api/v1/admin/head-office/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error updating Head Office:', error);
    throw new Error(error?.message || 'Failed to update Head Office');
  }
};

// ─── DELETE /api/v1/admin/head-office/:id — Delete Head Office ─────────────────
export const deleteHeadOffice = async (id) => {
  try {
    const response = await fetch(`/api/v1/admin/head-office/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error deleting Head Office:', error);
    throw new Error(error?.message || 'Failed to delete Head Office');
  }
};
