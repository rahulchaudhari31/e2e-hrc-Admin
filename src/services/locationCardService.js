const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Location card request failed');
  }
  return data;
};

export const getAllLocationCardsAdmin = async () => {
  const response = await fetch('/api/admin/location-cards', {
    credentials: 'include',
  });
  return handleResponse(response);
};

export const createLocationCard = async (cardData, imageFile) => {
  const formData = new FormData();

  Object.entries(cardData || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });

  if (imageFile) {
    formData.append('image', imageFile);
  }

  const response = await fetch('/api/admin/location-cards', {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  return handleResponse(response);
};

export const updateLocationCard = async (id, cardData) => {
  const response = await fetch(`/api/admin/location-cards/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cardData),
  });

  return handleResponse(response);
};

export const deleteLocationCard = async (id) => {
  const response = await fetch(`/api/admin/location-cards/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  return handleResponse(response);
};

export const uploadLocationCardImage = async (id, imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch(`/api/admin/location-cards/${id}/image`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  return handleResponse(response);
};
