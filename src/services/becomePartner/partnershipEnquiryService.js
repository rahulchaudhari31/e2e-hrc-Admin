const API_BASE = '/api';

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || 'API request failed');
  }

  return data;
};

export const getAllPartnershipEnquiries = async () => {
  const response = await fetch(`${API_BASE}/admin/partnership-enquiries`, {
    credentials: 'include',
  });

  const payload = await handleResponse(response);
  return payload?.data ?? payload;
};

export const getPartnershipEnquiryById = async (id) => {
  const response = await fetch(`${API_BASE}/admin/partnership-enquiries/${id}`, {
    credentials: 'include',
  });

  const payload = await handleResponse(response);
  return payload?.data ?? payload;
};

export const updatePartnershipEnquiry = async (id, data) => {
  const response = await fetch(`${API_BASE}/admin/partnership-enquiries/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const payload = await handleResponse(response);
  return payload?.data ?? payload;
};

export const deletePartnershipEnquiry = async (id) => {
  const response = await fetch(`${API_BASE}/admin/partnership-enquiries/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  const payload = await handleResponse(response);
  return payload?.data ?? payload;
};

export default {
  getAllPartnershipEnquiries,
  getPartnershipEnquiryById,
  updatePartnershipEnquiry,
  deletePartnershipEnquiry,
};
