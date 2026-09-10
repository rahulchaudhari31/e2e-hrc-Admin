const API_BASE = '/api';

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

export const getRecruitmentPartners = async () => {
  const response = await fetch(`${API_BASE}/admin/recruitment-partner`, {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const createRecruitmentPartner = async (formData) => {
  const response = await fetch(`${API_BASE}/admin/recruitment-partner`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

export const updateRecruitmentPartner = async (id, formData) => {
  const response = await fetch(`${API_BASE}/admin/recruitment-partner/${id}`, {
    method: 'PUT',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

export const deleteRecruitmentPartner = async (id) => {
  const response = await fetch(`${API_BASE}/admin/recruitment-partner/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};

export const getActiveRecruitmentPartner = async () => {
  const response = await fetch(`${API_BASE}/recruitment-partner/active`);
  return handleResponse(response);
};

export default {
  getRecruitmentPartners,
  createRecruitmentPartner,
  updateRecruitmentPartner,
  deleteRecruitmentPartner,
  getActiveRecruitmentPartner,
};
