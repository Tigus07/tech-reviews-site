import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import db from "../../../products.json";

const categoryTree = {
  computers: ["laptops", "desktops"],
  components: [
    "graphics-cards",
    "processors",
    "motherboards",
    "ram",
    "storage",
    "power-supplies",
    "cases",
    "cooling",
  ],
  accessories: [
    "keyboards",
    "mice",
    "monitors",
    "headsets",
    "microphones",
    "mousepads",
    "other",
  ],
};

/** SEO: dynamic title/description/canonical/OG/Twitter */
export function generateMetadata({ params }) {
  const slug = params.slug;
  const titleBase = slug.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
  const title = `${titleBase} – Reviews & Buying Advice`;
  const description = `Browse reviews, specs and comparisons for ${titleBase}.`;
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = `${site}/categories/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url },
    twitter: { card: "summary", title, description },
  };
}

export default function CategoryPage({ params }) {
  const { slug } = params;
  const mainSubs = categoryTree[slug];

  let filtered = [];
  if (mainSubs) {
    filtered = (db.products || []).filter((p) =>
      mainSubs.includes((p.category || "").toLowerCase())
    );
  } else {
    filtered = (db.products || []).filter(
      (p) => (p.category || "").toLowerCase().replace(/\s+/g, "-") === slug
    );
  }

  if (filtered.length === 0) return notFound();

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center capitalize">
        {slug.replace("-", " ")}
      </h1>

      {/* JSON-LD ItemList */}
      {(() => {
        const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        const items = filtered.map((p, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          url: `${site}/reviews/${p.slug}`,
          name: p.title,
        }));
        const itemListLd = {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: items,
        };
        return (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
          />
        );
      })()}

      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <div
            key={product.slug}
            className="border rounded-xl shadow-sm hover:shadow-md transition bg-white flex flex-col"
          >
            {product.images?.main && (
              <Image
                src={product.images.main}
                alt={product.title}
                width={600}
                height={400}
                className="w-full h-48 object-cover rounded-t-xl"
              />
            )}

            <div className="p-6 flex flex-col flex-grow">
              <h2 className="text-xl font-semibold mb-2">{product.title}</h2>

              {product.intro && (
                <p className="text-gray-700 mb-4 line-clamp-3">{product.intro}</p>
              )}

              <div className="mt-auto">
                <Link
                  href={`/reviews/${product.slug}`}
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  Read full review &rarr;
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
