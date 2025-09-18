import db from "../products.json";

export default function sitemap() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const urls = [];

  // Home
  urls.push({ url: `${site}/`, changeFrequency: "daily", priority: 1 });

  // Reviews
  (db.products || []).forEach((p) => {
    urls.push({
      url: `${site}/reviews/${p.slug}`,
      changeFrequency: "weekly",
      priority: 0.8,
    });
  });

  // Subcategories from products
  const subcats = Array.from(
    new Set(
      (db.products || [])
        .map((p) => (p.category || "").toLowerCase().replace(/\s+/g, "-"))
        .filter(Boolean)
    )
  );
  subcats.forEach((c) =>
    urls.push({
      url: `${site}/categories/${c}`,
      changeFrequency: "weekly",
      priority: 0.6,
    })
  );

  // Main categories
  ["computers", "components", "accessories"].forEach((c) => {
    urls.push({
      url: `${site}/categories/${c}`,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  });

  // Articles
  (db.articles || []).forEach((a) => {
    urls.push({
      url: `${site}/articles/${a.slug}`,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  });

  // Index pages
  urls.push({ url: `${site}/articles`, changeFrequency: "weekly", priority: 0.5 });
  urls.push({ url: `${site}/reviews`, changeFrequency: "weekly", priority: 0.5 });
  urls.push({ url: `${site}/categories`, changeFrequency: "weekly", priority: 0.5 });

  return urls;
}
