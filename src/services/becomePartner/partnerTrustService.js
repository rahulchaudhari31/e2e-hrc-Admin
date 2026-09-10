const API_BASE = '/api';

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error('Partner Trust API Error:', response.status, data);
    const message = data?.message || 'Partner Trust request failed';
    throw new Error(message);
  }

  return data;
};

const getRequestOptions = (method, data) => {
  const isFormData = data instanceof FormData;

  return {
    method,
    credentials: 'include',
    headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
    body: isFormData ? data : JSON.stringify(data),
  };
};

export const getAllPartnerTrust = async () => {
  try {
    const response = await fetch(`${API_BASE}/admin/partner-trust`, {
      credentials: 'include',
    });
    const data = await handleResponse(response);
    return data?.data ?? data;
  } catch (error) {
    console.error('Error fetching partner trust records:', error.message);
    throw error;
  }
};

export const getPartnerTrustById = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/admin/partner-trust/${id}`, {
      credentials: 'include',
    });
    const data = await handleResponse(response);
    return data?.data ?? data;
  } catch (error) {
    console.error('Error fetching partner trust record:', error.message);
    throw error;
  }
};

export const createPartnerTrust = async (data) => {
  try {
    console.log('Partner Trust Payload:', data);
    const response = await fetch(`${API_BASE}/admin/partner-trust`, getRequestOptions('POST', data));
    return await handleResponse(response);
  } catch (error) {
    console.error('Create Partner Trust Error:', error.message);
    throw error;
  }
};

export const updatePartnerTrust = async (id, data) => {
  try {
    console.log('Partner Trust Payload:', data);
    const response = await fetch(`${API_BASE}/admin/partner-trust/${id}`, getRequestOptions('PUT', data));
    return await handleResponse(response);
  } catch (error) {
    console.error('Update Partner Trust Error:', error.message);
    throw error;
  }
};

export const deletePartnerTrust = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/admin/partner-trust/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Delete Partner Trust Error:', error.message);
    throw error;
  }
};

export default {
  getAllPartnerTrust,
  getPartnerTrustById,
  createPartnerTrust,
  updatePartnerTrust,
  deletePartnerTrust,
};
