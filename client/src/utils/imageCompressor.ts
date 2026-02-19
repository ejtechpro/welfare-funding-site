import imageCompression from "browser-image-compression";

export async function processFile(file: File) {
  // If PDF → return as-is
  if (file.type === "application/pdf") {
    return file;
  }

  try {
    // If image → compress
    const options = {
      maxSizeMB: 0.5, // ~500KB
      maxWidthOrHeight: 1200,
      useWebWorker: true,
    };

    return await imageCompression(file, options);
  } catch (error) {
    console.log(error);
  }
}
