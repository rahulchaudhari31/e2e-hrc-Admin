const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

// ─── GET /api/admin/connect-section — Get all Contact Us sections ──────────────
export const getContactUsSections = async () => {
  try {
    const response = await fetch('/api/admin/connect-section', {
      credentials: 'include',
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching Contact Us sections:', error);
    throw new Error(error?.message || 'Failed to fetch Contact Us sections');
  }
};

// ─── GET /api/admin/connect-section/:id — Get Contact Us section by ID ─────────
export const getContactUsSectionById = async (id) => {
  try {
    const response = await fetch(`/api/admin/connect-section/${id}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching Contact Us section:', error);
    throw new Error(error?.message || 'Failed to fetch Contact Us section');
  }
};

// ─── POST /api/admin/connect-section — Create new Contact Us section ───────────
export const createContactUsSection = async (formData) => {
  try {
    const response = await fetch('/api/admin/connect-section', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error creating Contact Us section:', error);
    throw new Error(error?.message || 'Failed to create Contact Us section');
  }
};

// ─── PUT /api/admin/connect-section/:id — Update Contact Us section ────────────
export const updateContactUsSection = async (id, formData) => {
  try {
    const response = await fetch(`/api/admin/connect-section/${id}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData,
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error updating Contact Us section:', error);
    throw new Error(error?.message || 'Failed to update Contact Us section');
  }
};

// ─── DELETE /api/admin/connect-section/:id — Delete Contact Us section ─────────
export const deleteContactUsSection = async (id) => {
  try {
    const response = await fetch(`/api/admin/connect-section/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error deleting Contact Us section:', error);
    throw new Error(error?.message || 'Failed to delete Contact Us section');
  }
};

// ─── PATCH /api/admin/connect-section/:id/status — Update Contact Us section status
export const updateContactUsSectionStatus = async (id, isActive) => {
  try {
    const response = await fetch(`/api/admin/connect-section/${id}/status`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error updating Contact Us section status:', error);
    throw new Error(error?.message || 'Failed to update Contact Us section status');
  }
};
