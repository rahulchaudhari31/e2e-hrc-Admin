import axios from 'axios';

const API_BASE = '/api';

// About Hero
export const getAboutHero = async () => {
  const res = await axios.get(`${API_BASE}/about/hero`);
  return res.data?.data ?? res.data ?? null;
};

export const createAboutHero = async (formData) => {
  const res = await axios.post(`${API_BASE}/hero`, formData, { withCredentials: true });
  return res.data;
};

export const updateAboutHero = async (id, data) => {
  const res = await axios.put(`${API_BASE}/hero/${id}`, data, { withCredentials: true });
  return res.data;
};

export const deleteAboutHero = async (id) => {
  const res = await axios.delete(`${API_BASE}/hero/${id}`, { withCredentials: true });
  return res.data;
};

export const uploadAboutHeroImage = async (id, formData) => {
  const res = await axios.post(`${API_BASE}/hero/${id}/image`, formData, {
    withCredentials: true,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

// Who We Are
export const createWhoWeAre = async (data) => {
  const res = await axios.post(`${API_BASE}/admin/about/who-we-are`, data, { withCredentials: true });
  return res.data;
};

export const updateWhoWeAre = async (id, data) => {
  const res = await axios.put(`${API_BASE}/admin/about/who-we-are/${id}`, data, { withCredentials: true });
  return res.data;
};

export const uploadWhoWeAreImage = async (id, formData) => {
  const res = await axios.post(`${API_BASE}/admin/about/who-we-are/${id}/image`, formData, {
    withCredentials: true,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const deleteWhoWeAre = async (id) => {
  const res = await axios.delete(`${API_BASE}/admin/about/who-we-are/${id}`, { withCredentials: true });
  return res.data;
};

// About Info
export const getAllAboutInfo = async () => {
  const res = await axios.get(`${API_BASE}/admin/about-info`, { withCredentials: true });
  return res.data;
};

export const createAboutInfo = async (data) => {
  const res = await axios.post(`${API_BASE}/admin/about-info`, data, { withCredentials: true });
  return res.data;
};

export const updateAboutInfo = async (id, data) => {
  const res = await axios.put(`${API_BASE}/admin/about-info/${id}`, data, { withCredentials: true });
  return res.data;
};

export const uploadAboutInfoImage = async (id, formData) => {
  const res = await axios.post(`${API_BASE}/admin/about-info/${id}/image`, formData, {
    withCredentials: true,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const deleteAboutInfo = async (id) => {
  const res = await axios.delete(`${API_BASE}/admin/about-info/${id}`, { withCredentials: true });
  return res.data;
};

// Mission & Vision
export const getAdminMissionVision = async () => {
  const res = await axios.get(`${API_BASE}/admin/about/mission-vision`, { withCredentials: true });
  return res.data;
};

export const getMissionVisionById = async (id) => {
  const res = await axios.get(`${API_BASE}/admin/about/mission-vision/${id}`, { withCredentials: true });
  return res.data;
};

export const createMissionVision = async (data) => {
  const res = await axios.post(`${API_BASE}/admin/about/mission-vision`, data, { withCredentials: true });
  return res.data;
};

export const updateMissionVision = async (id, data) => {
  const res = await axios.put(`${API_BASE}/admin/about/mission-vision/${id}`, data, { withCredentials: true });
  return res.data;
};

export const deleteMissionVision = async (id) => {
  const res = await axios.delete(`${API_BASE}/admin/about/mission-vision/${id}`, { withCredentials: true });
  return res.data;
};

// Testimonials
export const getAdminTestimonials = async () => {
  const res = await axios.get(`${API_BASE}/admin/about/testimonials`, { withCredentials: true });
  return res.data;
};

export const getTestimonialById = async (id) => {
  const res = await axios.get(`${API_BASE}/admin/about/testimonials/${id}`, { withCredentials: true });
  return res.data;
};

export const createTestimonial = async (data) => {
  const res = await axios.post(`${API_BASE}/admin/about/testimonials`, data, { withCredentials: true });
  return res.data;
};

export const updateTestimonial = async (id, data) => {
  const res = await axios.put(`${API_BASE}/admin/about/testimonials/${id}`, data, { withCredentials: true });
  return res.data;
};

export const deleteTestimonial = async (id) => {
  const res = await axios.delete(`${API_BASE}/admin/about/testimonials/${id}`, { withCredentials: true });
  return res.data;
};

export default {
  // hero
  getAboutHero,
  createAboutHero,
  updateAboutHero,
  deleteAboutHero,
  uploadAboutHeroImage,
  // who we are
  createWhoWeAre,
  updateWhoWeAre,
  uploadWhoWeAreImage,
  deleteWhoWeAre,
  // about info
  getAllAboutInfo,
  createAboutInfo,
  updateAboutInfo,
  uploadAboutInfoImage,
  deleteAboutInfo,
  // mission vision
  getAdminMissionVision,
  getMissionVisionById,
  createMissionVision,
  updateMissionVision,
  deleteMissionVision,
  // testimonials
  getAdminTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
};
