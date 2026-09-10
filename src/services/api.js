// ─── Shared response handler ────────────────────────────────────────────────
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  return data;
};

// ════════════════════════════════════════════════════════════════════════════
// HERO SECTION
// ════════════════════════════════════════════════════════════════════════════

// GET /api/hero/home — public
export const getHeroData = async () => {
  const response = await fetch('/api/hero/home');
  if (response.status === 404) return null;
  return handleResponse(response);
};

// PUT /api/admin/hero/home — update hero text fields
export const updateHeroData = async (heroData) => {
  const response = await fetch('/api/admin/hero/home', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(heroData),
  });
  return handleResponse(response);
};

// POST /api/admin/hero/home/image — upload hero image
export const uploadHeroImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  const response = await fetch('/api/admin/hero/home/image', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

// ════════════════════════════════════════════════════════════════════════════
// SERVICES SECTION
// ════════════════════════════════════════════════════════════════════════════

// GET /api/admin/services — all services (active + inactive) for admin
export const getAllServices = async () => {
  const response = await fetch('/api/admin/services', {
    credentials: 'include',
  });
  return handleResponse(response);
};

// POST /api/admin/services — create a new service
export const createService = async (serviceData) => {
  const response = await fetch('/api/admin/services', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(serviceData),
  });
  return handleResponse(response);
};

// PUT /api/admin/services/:id — update a service
export const updateService = async (id, serviceData) => {
  const response = await fetch(`/api/admin/services/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(serviceData),
  });
  return handleResponse(response);
};

// DELETE /api/admin/services/:id — delete a service
export const deleteService = async (id) => {
  const response = await fetch(`/api/admin/services/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};

// POST /api/admin/services/:id/image — upload service image
export const uploadServiceImage = async (id, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  const response = await fetch(`/api/admin/services/${id}/image`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

// ════════════════════════════════════════════════════════════════════════════
// APPROACH CARDS SECTION  (displayed as "Why Choose Us" in admin)
// ════════════════════════════════════════════════════════════════════════════

// GET /api/admin/approach-cards — all cards for admin
export const getAllApproachCards = async () => {
  const response = await fetch('/api/admin/approach-cards', {
    credentials: 'include',
  });
  return handleResponse(response);
};

// POST /api/admin/approach-cards — create a new card
export const createApproachCard = async (cardData) => {
  const response = await fetch('/api/admin/approach-cards', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cardData),
  });
  return handleResponse(response);
};

// PUT /api/admin/approach-cards/:id — update a card
export const updateApproachCard = async (id, cardData) => {
  const response = await fetch(`/api/admin/approach-cards/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cardData),
  });
  return handleResponse(response);
};

// DELETE /api/admin/approach-cards/:id — delete a card
export const deleteApproachCard = async (id) => {
  const response = await fetch(`/api/admin/approach-cards/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};

// POST /api/admin/approach-cards/:id/image — upload card image
export const uploadApproachCardImage = async (id, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  const response = await fetch(`/api/admin/approach-cards/${id}/image`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

// ════════════════════════════════════════════════════════════════════════════
// EMPLOYER SECTION
// ════════════════════════════════════════════════════════════════════════════

// GET /api/admin/employeecard — all cards for admin
export const getAllEmployerSectionCards = async () => {
  const response = await fetch('/api/admin/employeecard', {
    credentials: 'include',
  });
  return handleResponse(response);
};

// POST /api/admin/employeecard — create a new card
export const createEmployerSectionCard = async (cardData) => {
  const response = await fetch('/api/admin/employeecard', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cardData),
  });
  return handleResponse(response);
};

// PUT /api/admin/employeecard/:id — update a card
export const updateEmployerSectionCard = async (id, cardData) => {
  const response = await fetch(`/api/admin/employeecard/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cardData),
  });
  return handleResponse(response);
};

// DELETE /api/admin/employeecard/:id — delete a card
export const deleteEmployerSectionCard = async (id) => {
  const response = await fetch(`/api/admin/employeecard/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};

// POST /api/admin/employeecard/:id/image — upload employee card image
export const uploadEmployerSectionCardImage = async (id, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  const response = await fetch(`/api/admin/employeecard/${id}/image`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

// ════════════════════════════════════════════════════════════════════════════
// CONTACT CTA SECTION
// ════════════════════════════════════════════════════════════════════════════

// GET /api/contact-cta — fetch current CTA record
export const getContactCTA = async () => {
  const response = await fetch('/api/contact-cta');
  if (response.status === 404) return null;
  return handleResponse(response);
};

// PUT /api/admin/contact-cta — upsert (create or update) the single CTA record
export const saveContactCTA = async (ctaData) => {
  const response = await fetch('/api/admin/contact-cta', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ctaData),
  });
  return handleResponse(response);
};

// ════════════════════════════════════════════════════════════════════════════
// ABOUT US SECTION
// ════════════════════════════════════════════════════════════════════════════

// ── ABOUT HERO ──
export const getAboutHero = async () => {
  const response = await fetch('/api/about/hero');
  if (response.status === 404) return null;
  return handleResponse(response);
};

export const saveAboutHero = async (data, imageFile = null) => {
  if (data && data._id) {
    const response = await fetch(`/api/hero/${data._id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  }

  const formData = new FormData();
  formData.append('subtitle', data.subtitle || '');
  formData.append('mainTitle', data.mainTitle || '');
  formData.append('description', data.description || '');
  formData.append('isActive', data.isActive ?? true);
  formData.append('button1Text', data.button1Text || '');
  formData.append('button1Link', data.button1Link || '');
  formData.append('button2Text', data.button2Text || '');
  formData.append('button2Link', data.button2Link || '');

  if (imageFile instanceof File) {
    formData.append('heroImage', imageFile);
  }

  const response = await fetch('/api/hero', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

export const uploadAboutHeroImage = async (imageFile, id = null) => {
  const formData = new FormData();
  // backend expects file field named 'heroImage' when creating/updating via hero routes
  formData.append('heroImage', imageFile);
  const url = id ? `/api/hero/${id}/image` : `/api/hero`;
  const response = await fetch(url, {
    method: id ? 'POST' : 'POST',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

// ── WHO WE ARE ──
export const getWhoWeAre = async () => {
  const response = await fetch('/api/about/who-we-are');
  if (response.status === 404) return null;
  return handleResponse(response);
};

export const saveWhoWeAre = async (data) => {
  if (data && data._id) {
    const response = await fetch(`/api/admin/about/who-we-are/${data._id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  }

  const formData = data instanceof FormData ? data : new FormData();

  if (!(data instanceof FormData)) {
    formData.append('title', data.title || '');
    formData.append('description1', data.description1 || '');
    formData.append('description2', data.description2 || '');
    formData.append('description3', data.description3 || '');
    formData.append('experienceYears', data.experienceYears || '');
    formData.append('experienceLabel', data.experienceLabel || '');
    formData.append('isActive', data.isActive === false ? 'false' : 'true');
    if (data.image instanceof File) {
      formData.append('image', data.image);
    }
  }

  const response = await fetch('/api/admin/about/who-we-are', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

export const uploadWhoWeAreImage = async (imageFile, id = null) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  const url = id ? `/api/admin/about/who-we-are/${id}/image` : `/api/admin/about/who-we-are`;
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

// ── BRIDGING THE GAP ── 
export const getBridgingTheGap = async () => {
  const response = await fetch('/api/about/bridging');
  if (response.status === 404) return null;
  return handleResponse(response);
};

export const createBridgingTheGap = async (formData) => {
  const response = await fetch('/api/admin/about/bridging', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

export const updateBridgingTheGap = async (id, data) => {
  const response = await fetch(`/api/admin/about/bridging/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const saveBridgingTheGap = async (data) => {
  if (data && data._id) {
    return updateBridgingTheGap(data._id, data);
  }

  const formData = data instanceof FormData ? data : new FormData();

  if (!(data instanceof FormData)) {
    formData.append('heading', data.heading || '');
    formData.append('description', data.description || '');
    formData.append('feature1', data.feature1 || '');
    formData.append('feature2', data.feature2 || '');
    formData.append('feature3', data.feature3 || '');
    formData.append('isActive', data.isActive === false ? 'false' : 'true');
    if (data.image instanceof File) {
      formData.append('image', data.image);
    }
  }

  const response = await fetch('/api/admin/about/bridging', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};

export const uploadBridgingTheGapImage = async (imageFile, id = null) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  const url = id ? `/api/admin/about/bridging/${id}/image` : `/api/admin/about/bridging`;
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  return handleResponse(response);
};


// ── ABOUT TESTIMONIALS ──
export const getAboutTestimonials = async () => {
  const response = await fetch('/api/admin/about/testimonials', { credentials: 'include' });
  return handleResponse(response);
};

export const createAboutTestimonial = async (data) => {
  const response = await fetch('/api/admin/about/testimonials', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateAboutTestimonial = async (id, data) => {
  const response = await fetch(`/api/admin/about/testimonials/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteAboutTestimonial = async (id) => {
  const response = await fetch(`/api/admin/about/testimonials/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse(response);
};
