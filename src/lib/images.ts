// Helpers for images stored in Supabase Storage (shared by browser and server).

export const PRODUCT_IMAGES_BUCKET = "product-images";
export const TESTIMONIAL_PHOTOS_BUCKET = "testimonial-photos";

const PUBLIC_MARKER = "/storage/v1/object/public/";
const RENDER_MARKER = "/storage/v1/render/image/public/";

// Object path inside `bucket` for one of its public URLs, or null for any other URL.
export function storagePathFromPublicUrl(url: string | null | undefined, bucket: string) {
  if (!url) return null;
  const marker = `${PUBLIC_MARKER}${bucket}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  try {
    const path = decodeURIComponent(url.slice(i + marker.length).split("?")[0]);
    return path && !path.includes("..") ? path : null;
  } catch {
    return null;
  }
}

export function isStorageUrl(url: string) {
  return url.includes(PUBLIC_MARKER);
}

// Resized WebP copy produced on the fly by Supabase image transformations: the stored
// original is untouched. `resize=contain` keeps the proportions (the default crops).
export function resizedImageUrl(url: string, width: number) {
  if (!isStorageUrl(url)) return url;
  const base = url.split("?")[0].replace(PUBLIC_MARKER, RENDER_MARKER);
  return `${base}?width=${width}&quality=75&resize=contain`;
}

export const RESPONSIVE_WIDTHS = [320, 640, 960, 1280];

export function imageSrcSet(url: string) {
  return RESPONSIVE_WIDTHS.map((w) => `${resizedImageUrl(url, w)} ${w}w`).join(", ");
}
