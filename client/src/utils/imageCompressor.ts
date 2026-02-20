import imageCompression from "browser-image-compression";

export async function processFile(file: File): Promise<File> {
  // If PDF → return as-is
  if (file.type === "application/pdf") {
    return file;
  }

  try {
    const options = {
      maxSizeMB: 0.5, // ~500KB
      maxWidthOrHeight: 1200,
      useWebWorker: true,
    };

    const compressedBlob = await imageCompression(file, options);

    // Convert Blob back to File, keep original name and type
    const compressedFile = new File([compressedBlob], file.name, {
      type: compressedBlob.type,
    });

    return compressedFile;
  } catch (error) {
    console.error(error);
    // fallback: return original file if compression fails
    return file;
  }
}
