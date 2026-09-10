const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

// ─── GET /api/v1/admin/contact-card — Get Contact Card data ─────────────────────
export const getAdminContactCard = async () => {
  try {
    const response = await fetch('/api/v1/admin/contact-card', {
      credentials: 'include',
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching Contact Card:', error);
    throw new Error(error?.message || 'Failed to fetch Contact Card');
  }
};

// ─── POST /api/v1/admin/contact-card — Create Contact Card ────────────────────────
export const createContactCard = async (data) => {
  try {
    const response = await fetch('/api/v1/admin/contact-card', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error creating Contact Card:', error);
    throw new Error(error?.message || 'Failed to create Contact Card');
  }
};

// ─── PUT /api/v1/admin/contact-card/:id — Update Contact Card ──────────────────────
export const updateContactCard = async (id, data) => {
  try {
    const response = await fetch(`/api/v1/admin/contact-card/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error updating Contact Card:', error);
    throw new Error(error?.message || 'Failed to update Contact Card');
  }
};

// ─── DELETE /api/v1/admin/contact-card/:id — Delete Contact Card ─────────────────────
export const deleteContactCard = async (id) => {
  try {
    const response = await fetch(`/api/v1/admin/contact-card/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error deleting Contact Card:', error);
    throw new Error(error?.message || 'Failed to delete Contact Card');
  }
};
