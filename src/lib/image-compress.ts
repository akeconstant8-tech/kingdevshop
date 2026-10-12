// Browser-side resizing before upload, so new photos (often 2–5 MB from a phone)
// are stored at a reasonable size. Falls back to the original file whenever the
// browser cannot decode or re-encode it, or when compression would not help.

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function compressImage(file: File, maxSize = 1600, quality = 0.85): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  // Product photos are shown on white: flatten transparency so JPEG output stays clean.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  // Safari cannot encode WebP and silently returns PNG: fall back to JPEG there.
  let blob = await canvasToBlob(canvas, "image/webp", quality);
  if (!blob || blob.type !== "image/webp") blob = await canvasToBlob(canvas, "image/jpeg", quality);
  if (!blob || blob.size >= file.size) return file;

  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  return new File([blob], `${file.name.replace(/\.[^.]+$/, "") || "image"}.${ext}`, { type: blob.type });
}
