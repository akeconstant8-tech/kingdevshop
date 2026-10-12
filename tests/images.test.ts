import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PRODUCT_IMAGES_BUCKET, TESTIMONIAL_PHOTOS_BUCKET, imageSrcSet, resizedImageUrl, storagePathFromPublicUrl,
} from "../src/lib/images.ts";

const BASE = "https://spqdoosyxikokxicrnhp.supabase.co/storage/v1/object/public";

test("chemin de stockage extrait d'une URL publique (y compris %2F)", () => {
  assert.equal(storagePathFromPublicUrl(`${BASE}/product-images/uploads/a.png`, PRODUCT_IMAGES_BUCKET), "uploads/a.png");
  assert.equal(storagePathFromPublicUrl(`${BASE}/product-images/draps-4p%2Fdrap-4p-4.jpg`, PRODUCT_IMAGES_BUCKET), "draps-4p/drap-4p-4.jpg");
  assert.equal(storagePathFromPublicUrl(`${BASE}/product-images/drap-1.jpg?v=2`, PRODUCT_IMAGES_BUCKET), "drap-1.jpg");
});

test("URL d'un autre bucket, externe ou piégée : refusée", () => {
  assert.equal(storagePathFromPublicUrl(`${BASE}/testimonial-photos/submissions/x.jpg`, PRODUCT_IMAGES_BUCKET), null);
  assert.equal(storagePathFromPublicUrl("https://exemple.com/image.jpg", PRODUCT_IMAGES_BUCKET), null);
  assert.equal(storagePathFromPublicUrl(`${BASE}/product-images/..%2F..%2Fsecret`, PRODUCT_IMAGES_BUCKET), null);
  assert.equal(storagePathFromPublicUrl(null, PRODUCT_IMAGES_BUCKET), null);
  assert.equal(
    storagePathFromPublicUrl(`${BASE}/testimonial-photos/submissions/x.jpg`, TESTIMONIAL_PHOTOS_BUCKET),
    "submissions/x.jpg",
  );
});

test("image allégée : transformation Supabase sans recadrage", () => {
  const url = `${BASE}/product-images/draps-4p%2Fdrap-4p-4.jpg`;
  assert.equal(
    resizedImageUrl(url, 640),
    "https://spqdoosyxikokxicrnhp.supabase.co/storage/v1/render/image/public/product-images/draps-4p%2Fdrap-4p-4.jpg?width=640&quality=75&resize=contain",
  );
  assert.match(imageSrcSet(url), /width=320&.* 320w, .*width=1280&.* 1280w$/);
  assert.equal(resizedImageUrl("/assets/logo.png", 640), "/assets/logo.png");
});
