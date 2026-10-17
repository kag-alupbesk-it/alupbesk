export const IMAGES_BUCKET = "images";

export const IMAGES_BUCKET_CONFIG = {
  public: true,
  fileSizeLimit: 5 * 1024 * 1024,
  allowedMimeTypes: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
  ],
};
