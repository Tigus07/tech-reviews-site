// Usage:
//   UNSPLASH_ACCESS_KEY=xxxx node scripts/unsplash_enricher.mjs
// It will read products.json and add/replace images with Unsplash URLs based on product title/brand/category
import fs from "fs";
import path from "path";
import { createApi } from "unsplash-js";

const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
if (!ACCESS_KEY) {
  console.error("Missing UNSPLASH_ACCESS_KEY in environment.");
  process.exit(1);
}
const unsplash = createApi({ accessKey: ACCESS_KEY });

const ROOT = process.cwd();
const PRODUCTS_PATH = path.join(ROOT, "products.json");
const db = JSON.parse(fs.readFileSync(PRODUCTS_PATH, "utf-8"));

function buildQuery(p) {
  // Prefer explicit query if provided
  if (p.images?.query) return p.images.query;
  const parts = [p.brand, p.title, p.category].filter(Boolean);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

async function fetchImages(query, count = 5) {
  const res = await unsplash.search.getPhotos({ query, perPage: count });
  if (res.errors) {
    console.error("Unsplash error:", res.errors);
    return [];
  }
  const results = res.response?.results || [];
  return results.map((r) => ({
    small: r.urls.small,
    regular: r.urls.regular,
    raw: r.urls.raw,
    alt: r.alt_description || query,
    author: r.user?.name,
    link: r.links?.html
  }));
}

async function main() {
  const products = db.products || [];
  let changed = 0;

  for (const p of products) {
    const needsMain = !p.images?.main || p.images.main.startsWith("/images/");
    const needsGallery = !(Array.isArray(p.images?.gallery) && p.images.gallery.length >= 3);

    if (!needsMain && !needsGallery) continue;

    const query = buildQuery(p);
    console.log(`Fetching images for: ${p.slug} ← "${query}"`);
    const imgs = await fetchImages(query, 6);
    if (!imgs.length) {
      console.warn("No images found for", p.slug);
      continue;
    }

    p.images = p.images || {};
    if (needsMain) {
      p.images.main = imgs[0].regular;
    }
    if (needsGallery) {
      p.images.gallery = imgs.slice(1, 6).map((x) => x.regular);
    }
    p.images.query = query; // keep for next time
    changed++;
  }

  if (changed > 0) {
    fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(db, null, 2));
    console.log(`Updated products.json with Unsplash images for ${changed} product(s).`);
  } else {
    console.log("No changes needed.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
