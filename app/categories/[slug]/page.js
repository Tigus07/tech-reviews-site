import Link from "next/link";
import { notFound } from "next/navigation";
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

      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <div
            key={product.slug}
            className="border rounded-xl shadow-sm hover:shadow-md transition bg-white flex flex-col"
          >
            {product.images?.main && (
              <img
                src={product.images.main}
                alt={product.title}
                className="w-full h-48 object-cover rounded-t-xl"
              />
            )}

            <div className="p-6 flex flex-col flex-grow">
              <h2 className="text-xl font-semibold mb-2">{product.title}</h2>
              <p className="text-gray-700 mb-4 line-clamp-3">{product.intro}</p>

              {product.rating?.overall && (
                <div className="flex items-center mb-4">
                  <span className="text-yellow-500 mr-2">
                    {"★".repeat(product.rating.overall)}
                  </span>
                  <span className="text-gray-400">
                    {"★".repeat(10 - product.rating.overall)}
                  </span>
                  <span className="ml-2 text-gray-600 text-sm">
                    {product.rating.overall}/10
                  </span>
                </div>
              )}

              <div className="mt-auto">
                <Link
                  href={`/reviews/${product.slug}`}
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  Read full review →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
