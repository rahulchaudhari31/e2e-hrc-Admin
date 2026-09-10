/**
 * Hero Image Upload Service
 * Handles uploading and processing hero images with automatic background removal
 */

/**
 * Upload hero image to backend for processing
 * @param {File} imageFile - The selected image file (JPG/PNG/WebP)
 * @returns {Promise<Object>} - Response with processed heroImage URL
 */
export const uploadHeroImage = async (imageFile) => {
  if (!imageFile) {
    throw new Error("No image file provided");
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (!allowedTypes.includes(imageFile.type)) {
    throw new Error("Invalid file type. Only JPG, PNG, and WebP are allowed.");
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (imageFile.size > maxSize) {
    throw new Error("Image must be less than 5MB");
  }

  const formData = new FormData();
  formData.append("image", imageFile);

  try {
    const response = await fetch("/api/admin/hero/home/image", {
      method: "POST",
      credentials: "include",
      body: formData,
      // Do NOT manually set Content-Type - browser will set it with boundary
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to upload image");
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || "Upload failed");
    }

    // Return the processed image URL from the backend
    return {
      success: true,
      message: data.message,
      heroImage: data.data.heroImage,
    };
  } catch (error) {
    console.error("Image upload error:", error);
    throw error;
  }
};
