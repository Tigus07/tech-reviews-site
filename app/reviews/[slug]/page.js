import { notFound } from "next/navigation";
import db from "../../../products.json";

export default function ReviewPage({ params }) {
  const { slug } = params;
  const product = (db.products || []).find((p) => p.slug === slug);

  if (!product) return notFound();

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
      <p className="text-gray-600 mb-6">{product.intro}</p>

      {product.images?.main && (
        <div className="mb-8">
          <img
            src={product.images.main}
            alt={product.title}
            className="w-full rounded-lg shadow-md"
          />
        </div>
      )}

      {product.specs && (
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-3">Specifications</h2>
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <tbody>
              {Object.entries(product.specs).map(([key, value]) => (
                <tr key={key} className="border-b last:border-none">
                  <td className="px-4 py-2 font-medium bg-gray-50">{key}</td>
                  <td className="px-4 py-2">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {(product.pros?.length > 0 || product.cons?.length > 0) && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {product.pros?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2 text-green-600">✅ Pros</h2>
              <ul className="list-disc list-inside text-gray-700">
                {product.pros.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}
          {product.cons?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2 text-red-600">❌ Cons</h2>
              <ul className="list-disc list-inside text-gray-700">
                {product.cons.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {product.affiliateLink && (
        <div className="text-center mt-12">
          <a
            href={product.affiliateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg shadow-lg transition"
          >
            Buy on Amazon
          </a>
        </div>
      )}
    </main>
  );
}
