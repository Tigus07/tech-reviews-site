import { notFound } from "next/navigation";
import Image from "next/image";
import db from "../../../products.json";
import TOC from "../../components/TOC";

export function generateMetadata({ params }) {
  const product = (db.products || []).find((p) => p.slug === params.slug);
  if (!product) return { title: "Review not found" };

  const year = new Date().getFullYear();
  const title = `${product.title} Review (${year})`;
  const description =
    product.intro?.slice(0, 160) ||
    `${product.title} full review with specs, pros & cons.`;
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = `${site}/reviews/${product.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, images: product.images?.main ? [product.images.main] : [] },
    twitter: { card: "summary_large_image", title, description, images: product.images?.main ? [product.images.main] : [] }
  };
}

export default function ReviewPage({ params }) {
  const { slug } = params;
  const product = (db.products || []).find((p) => p.slug === slug);
  if (!product) return notFound();

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
      <p className="text-gray-600 mb-6">{product.intro}</p>

      {/* JSON-LD: Product + optional FAQ (no ratings) */}
      {(() => {
        const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        const pageUrl = `${site}/reviews/${product.slug}`;

        const productLd = {
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.title,
          brand: product.brand,
          image: product.images?.main ? [product.images.main] : undefined,
          description: product.intro,
          sku: product.slug,
          url: pageUrl
        };

        const faqLd =
          Array.isArray(product.faq) && product.faq.length
            ? {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: product.faq.map((q) => ({
                  "@type": "Question",
                  name: q.q,
                  acceptedAnswer: { "@type": "Answer", text: q.a }
                }))
              }
            : null;

        const blocks = [productLd, faqLd].filter(Boolean);
        return blocks.map((obj, i) => (
          <script key={`jsonld-${i}`} type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }} />
        ));
      })()}

      <TOC
        items={[
          { id: "overview", label: "Overview" },
          { id: "specs", label: "Specifications" },
          { id: "proscons", label: "Pros & Cons" },
          { id: "gallery", label: "Gallery" },
          ...(product.faq?.length ? [{ id: "faq", label: "FAQ" }] : []),
          { id: "buy", label: "Where to Buy" }
        ]}
      />

      <section id="overview" className="mb-6">
        {product.affiliateLink && (
          <a
            href={product.affiliateLink}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg shadow-lg transition inline-block"
          >
            Buy on Amazon
          </a>
        )}
      </section>

      {product.images?.main && (
        <div className="mb-8">
          <Image
            src={product.images.main}
            alt={product.title}
            width={800}
            height={500}
            className="w-full h-auto rounded-lg shadow-md object-cover"
          />
        </div>
      )}

      {product.specs && (
        <section id="specs" className="mb-10">
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
        <section id="proscons" className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {product.pros?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2 text-green-600">✅ Pros</h2>
              <ul className="list-disc list-inside text-gray-700">
                {product.pros.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          )}
          {product.cons?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-2 text-red-600">❌ Cons</h2>
              <ul className="list-disc list-inside text-gray-700">
                {product.cons.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Mid CTA */}
      {product.affiliateLink && (
        <div className="text-center my-8">
          <a
            href={product.affiliateLink}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg shadow-lg transition"
          >
            Check Price on Amazon
          </a>
        </div>
      )}

      {Array.isArray(product.images?.gallery) && product.images.gallery.length > 0 && (
        <section id="gallery" className="mb-10">
          <h2 className="text-2xl font-semibold mb-3">Gallery</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {product.images.gallery.map((src, i) => (
              <div key={i} className="relative w-full h-40">
                <Image src={src} alt={product.title} fill className="object-cover rounded" />
              </div>
            ))}
          </div>
        </section>
      )}

      {Array.isArray(product.faq) && product.faq.length > 0 && (
        <section id="faq" className="mb-10">
          <h2 className="text-2xl font-semibold mb-3">FAQ</h2>
          <ul className="space-y-3">
            {product.faq.map((q, i) => (
              <li key={i}>
                <p className="font-medium">{q.q}</p>
                <p className="text-gray-700">{q.a}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {product.affiliateLink && (
        <section id="buy" className="text-center mt-12">
          <a
            href={product.affiliateLink}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-6 rounded-lg shadow-lg transition"
          >
            Buy on Amazon
          </a>
        </section>
      )}
    </main>
  );
}
