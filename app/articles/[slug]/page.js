import { notFound, redirect } from "next/navigation";
import db from "../../../products.json";

export default function ArticlePage({ params }) {
  const { slug } = params;
  const { articles, products } = db;
  const article = (articles || []).find((a) => a.slug === slug);
  if (!article) return notFound();

  const productBySlug = Object.fromEntries(products.map((p) => [p.slug, p]));

  if (article.type === "review") {
    return redirect(`/reviews/${article.productSlug}`);
  }

  if (article.type === "comparison") {
    const left = productBySlug[article.products?.[0]];
    const right = productBySlug[article.products?.[1]];
    if (!left || !right) return notFound();

    const specKeys = Array.from(
      new Set([
        ...Object.keys(left.specs || {}),
        ...Object.keys(right.specs || {}),
      ])
    );

    return (
      <main className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
        {article.intro && <p className="text-gray-700 mb-6">{article.intro}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {[left, right].map((p, idx) => (
            <div key={idx} className="border rounded-lg p-4 bg-white shadow-sm">
              {p.images?.main && (
                <img
                  src={p.images.main}
                  alt={p.title}
                  className="w-full h-48 object-cover rounded"
                />
              )}
              <h2 className="text-xl font-semibold mt-3">{p.title}</h2>
              <p className="text-sm text-gray-600 mt-1">{p.intro}</p>
              {p.affiliateLink && (
                <a
                  href={p.affiliateLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded"
                >
                  Buy on Amazon
                </a>
              )}
            </div>
          ))}
        </div>

        {specKeys.length > 0 && (
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">Specs Comparison</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2">Spec</th>
                    <th className="text-left px-4 py-2">{left.title}</th>
                    <th className="text-left px-4 py-2">{right.title}</th>
                  </tr>
                </thead>
                <tbody>
                  {specKeys.map((key) => (
                    <tr key={key} className="border-t">
                      <td className="px-4 py-2 font-medium bg-gray-50">{key}</td>
                      <td className="px-4 py-2">{left.specs?.[key] ?? "—"}</td>
                      <td className="px-4 py-2">{right.specs?.[key] ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {article.verdict && (
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Verdict</h2>
            <p className="text-gray-700">{article.verdict}</p>
          </section>
        )}
      </main>
    );
  }

  if (article.type === "guide") {
    const items = (article.sections && article.sections.length > 0
      ? article.sections.map((s) => ({ ...s, p: productBySlug[s.product] }))
      : (article.products || []).map((sl) => ({
          heading: "Top Pick",
          blurb: productBySlug[sl]?.intro,
          p: productBySlug[sl],
        })))
      .filter((x) => x.p);

    return (
      <main className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
        {article.intro && <p className="text-gray-700 mb-6">{article.intro}</p>}

        <ol className="space-y-6">
          {items.map((x, i) => (
            <li key={i} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex flex-col md:flex-row gap-4">
                {x.p.images?.main && (
                  <img
                    src={x.p.images.main}
                    alt={x.p.title}
                    className="w-full md:w-56 h-40 object-cover rounded"
                  />
                )}
                <div>
                  <h2 className="text-xl font-semibold">{x.heading}</h2>
                  <p className="text-sm text-gray-600 mt-1">{x.blurb}</p>
                  <p className="mt-2 font-medium">{x.p.title}</p>
                  <ul className="list-disc list-inside text-gray-700 mt-1">
                    {(x.p.highlights || []).slice(0, 3).map((h, idx) => (
                      <li key={idx}>{h}</li>
                    ))}
                  </ul>
                  {x.p.affiliateLink && (
                    <a
                      href={x.p.affiliateLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded"
                    >
                      View on Amazon
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </main>
    );
  }

  return notFound();
}
