import Link from "next/link";
import db from "../../products.json";

export default function ArticlesPage() {
  const { articles, products } = db;
  const productBySlug = Object.fromEntries(products.map((p) => [p.slug, p]));

  const reviews = (articles || []).filter((a) => a.type === "review");
  const comparisons = (articles || []).filter((a) => a.type === "comparison");
  const guides = (articles || []).filter((a) => a.type === "guide");

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Articles</h1>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((a) => {
              const p = productBySlug[a.productSlug];
              if (!p) return null;
              return (
                <div
                  key={a.slug}
                  className="border rounded-xl shadow-sm bg-white overflow-hidden"
                >
                  {p.images?.main && (
                    <img
                      src={p.images.main}
                      alt={p.title}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold">{a.title || p.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-3 mt-2">
                      {p.intro}
                    </p>
                    <Link
                      href={`/reviews/${p.slug}`}
                      className="inline-block mt-3 text-blue-600 hover:underline"
                    >
                      Read review →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Comparisons */}
      {comparisons.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Comparisons</h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
            {comparisons.map((a) => {
              const left = productBySlug[a.products?.[0]];
              const right = productBySlug[a.products?.[1]];
              if (!left || !right) return null;
              return (
                <div
                  key={a.slug}
                  className="border rounded-xl shadow-sm bg-white overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-0">
                    <div className="p-4">
                      {left.images?.main && (
                        <img
                          src={left.images.main}
                          alt={left.title}
                          className="w-full h-32 object-cover rounded"
                        />
                      )}
                      <p className="font-medium mt-2 text-sm">{left.title}</p>
                    </div>
                    <div className="p-4 border-l">
                      {right.images?.main && (
                        <img
                          src={right.images.main}
                          alt={right.title}
                          className="w-full h-32 object-cover rounded"
                        />
                      )}
                      <p className="font-medium mt-2 text-sm">{right.title}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold">{a.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-3 mt-1">
                      {a.intro}
                    </p>
                    <Link
                      href={`/articles/${a.slug}`}
                      className="inline-block mt-3 text-blue-600 hover:underline"
                    >
                      Read comparison →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Guides */}
      {guides.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Guides</h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((a) => (
              <div
                key={a.slug}
                className="border rounded-xl shadow-sm bg-white overflow-hidden"
              >
                <div className="p-4">
                  <h3 className="font-semibold">{a.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3 mt-1">
                    {a.intro}
                  </p>
                  <Link
                    href={`/articles/${a.slug}`}
                    className="inline-block mt-3 text-blue-600 hover:underline"
                  >
                    Read guide →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
