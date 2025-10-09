import { notFound } from "next/navigation";
import Image from "next/image";
import db from "../../../products.json";
import TOC from "../../components/TOC";
import ImageGallery from "../../components/ImageGallery";

/** ISR: rebuild every 5 min */
export const revalidate = 300;

function absUrl(path = "") {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Ensure amazon links include the affiliate tag */
function withAffiliateTag(url, tag = "techrevie004c-20") {
  try {
    const u = new URL(url);
    if (!/amazon\./i.test(u.hostname)) return url;
    if (!u.searchParams.get("tag")) u.searchParams.set("tag", tag);
    return u.toString();
  } catch {
    return url;
  }
}

/** JSON-LD helper */
function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export async function generateStaticParams() {
  const products = Array.isArray(db.products) ? db.products : [];
  return products.map((p) => ({ slug: p.slug }));
}

/** SEO: title/description/canonical/OG/Twitter */
export function generateMetadata({ params }) {
  const product = (db.products || []).find((p) => p.slug === params.slug);
  if (!product) return { title: "Review not found" };

  const year = new Date().getFullYear();
  const title = `${product.title} Review (${year})`;
  const description =
    product.intro?.slice(0, 160) || `${product.title} full review with specs, pros & cons.`;
  const pageUrl = absUrl(`/reviews/${product.slug}`);

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description,
      url: pageUrl,
      images: product.images?.main ? [product.images.main] : [],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.images?.main ? [product.images.main] : [],
    },
  };
}

export default function ReviewPage({ params }) {
  const { slug } = params;
  const product = (db.products || []).find((p) => p.slug === slug);
  if (!product) return notFound();

  const buyUrl = product.affiliateLink ? withAffiliateTag(product.affiliateLink) : null;
  const pageUrl = absUrl(`/reviews/${product.slug}`);

  // JSON-LD structures
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    image: product.images?.main ? [product.images.main] : undefined,
    description: product.intro,
    sku: product.slug,
    url: pageUrl,
    offers: buyUrl
      ? {
          "@type": "Offer",
          priceCurrency: "USD",
          availability: "http://schema.org/InStock",
          url: buyUrl,
        }
      : undefined,
  };

  const reviewLd = product.rating?.overall
    ? {
        "@context": "https://schema.org",
        "@type": "Review",
        itemReviewed: { "@type": "Product", name: product.title },
        reviewBody: product.intro,
        author: { "@type": "Organization", name: "Tech Reviews Hub" },
        reviewRating: {
          "@type": "Rating",
          ratingValue: String(product.rating.overall),
          bestRating: "10",
          worstRating: "0",
        },
      }
    : null;

  const faqLd =
    Array.isArray(product.faq) && product.faq.length
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: product.faq.map((q) => ({
            "@type": "Question",
            name: q.q,
            acceptedAnswer: { "@type": "Answer", text: q.a },
          })),
        }
      : null;

  const breadcrumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
      { "@type": "ListItem", position: 2, name: "Reviews", item: absUrl("/reviews") },
      { "@type": "ListItem", position: 3, name: product.title, item: pageUrl },
    ],
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      {/* JSON-LD */}
      <JsonLd data={productLd} />
      {reviewLd && <JsonLd data={reviewLd} />}
      {faqLd && <JsonLd data={faqLd} />}
      <JsonLd data={breadcrumbsLd} />

      <article>
        <header className="mb-6">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            {product.brand} • {product.category}
          </p>
          <h1 className="mt-1 text-3xl md:text-4xl font-bold">{product.title} — Review</h1>
          {product.date && (
            <time dateTime={product.date} className="mt-2 block text-sm text-gray-500">
              Updated {new Date(product.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          )}
          {product.intro && <p className="mt-5 text-lg text-gray-700">{product.intro}</p>}

          {/* Top CTA — centered */}
          {buyUrl && (
            <div className="mt-5 text-center">
              <a
                href={buyUrl}
                target="_blank"
                rel="nofollow sponsored noopener"
                className="mx-auto inline-flex items-center justify-center rounded-lg bg-amber-600 hover:bg-amber-700 text-white px-5 py-3 font-semibold"
              >
                Check price on Amazon
              </a>
              <p className="mt-2 text-xs text-gray-500">
                As an Amazon Associate, we earn from qualifying purchases.
              </p>
            </div>
          )}
        </header>

        {/* Image (reduced width, better quality & responsive sizes) */}
        {product.images?.main && (
          <div className="mb-8 max-w-2xl mx-auto">
            <Image
              src={product.images.main}
              alt={product.title}
              width={1400}          // large intrinsic to build a good srcset
              height={788}
              sizes="(min-width: 1280px) 720px, (min-width: 768px) 600px, 92vw"
              quality={90}
              className="w-full h-auto rounded-xl object-contain"
              priority
            />
          </div>
        )}

        {/* Highlights */}
        {Array.isArray(product.highlights) && product.highlights.length > 0 && (
          <section id="highlights" className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">Highlights</h2>
            <ul className="flex flex-wrap gap-2">
              {product.highlights.map((h, i) => (
                <li
                  key={i}
                  className="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded-full"
                >
                  {h}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Specs */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <section id="specs" className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">Key Specs</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                <tbody>
                  {Object.entries(product.specs).map(([k, v]) => (
                    <tr key={k} className="border-t">
                      <th className="px-4 py-2 text-left bg-gray-50 w-48">{k}</th>
                      <td className="px-4 py-2">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Pros & Cons */}
        {(Array.isArray(product.pros) && product.pros.length > 0) ||
        (Array.isArray(product.cons) && product.cons.length > 0) ? (
          <section id="pros-cons" className="mb-10 grid md:grid-cols-2 gap-6">
            {Array.isArray(product.pros) && product.pros.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-3">Pros</h2>
                <ul className="list-disc pl-6 space-y-1">
                  {product.pros.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(product.cons) && product.cons.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-3">Cons</h2>
                <ul className="list-disc pl-6 space-y-1">
                  {product.cons.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        ) : null}

        {/* Benchmarks (optional) */}
        {product.benchmarks?.fps?.length > 0 && (
          <section id="benchmarks-fps" className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">Game Benchmarks</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2">Game (Preset)</th>
                    <th className="text-left px-4 py-2">Avg FPS</th>
                  </tr>
                </thead>
                <tbody>
                  {product.benchmarks.fps.map((row, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-4 py-2">{row.game}</td>
                      <td className="px-4 py-2">{row.avg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {product.benchmarks?.synthetic?.length > 0 && (
          <section id="benchmarks-synth" className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">Synthetic Benchmarks</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2">Test</th>
                    <th className="text-left px-4 py-2">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {product.benchmarks.synthetic.map((row, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-4 py-2">{row.name}</td>
                      <td className="px-4 py-2">{row.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* FAQ */}
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

        {/* CTA mid-page (déjà centré) */}
        {buyUrl && (
          <div className="my-10 text-center">
            <a
              href={buyUrl}
              target="_blank"
              rel="nofollow sponsored noopener"
              className="inline-flex items-center justify-center rounded-lg bg-amber-600 hover:bg-amber-700 text-white px-5 py-3 font-semibold"
            >
              See latest price on Amazon
            </a>
          </div>
        )}

        {/* Sources */}
        {Array.isArray(product.sources) && product.sources.length > 0 && (
          <section id="sources" className="mb-10">
            <h2 className="text-2xl font-semibold mb-3">Sources</h2>
            <ul className="list-disc pl-6 space-y-1">
              {product.sources.map((s, i) => (
                <li key={i}>
                  <a className="text-blue-600 hover:underline" href={s.url} target="_blank" rel="noopener">
                    {s.name || s.url}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Gallery */}
        {(product.images?.main ||
          (Array.isArray(product.images?.gallery) && product.images.gallery.length > 0)) && (
          <section id="gallery" className="mb-16">
            <h2 className="text-2xl font-semibold mb-3">Gallery</h2>
            <ImageGallery
              main={product.images?.main || null}
              images={product.images?.gallery || []}
              alt={product.title}
            />
          </section>
        )}
      </article>

      {/* Sticky mobile CTA */}
      {buyUrl && (
        <div className="fixed md:hidden bottom-0 inset-x-0 z-20 bg-white/90 backdrop-blur border-t border-gray-200 p-3">
          <a
            href={buyUrl}
            target="_blank"
            rel="nofollow sponsored noopener"
            className="block w-full text-center rounded-lg bg-amber-600 hover:bg-amber-700 text-white px-5 py-3 font-semibold"
          >
            Buy on Amazon
          </a>
        </div>
      )}
    </main>
  );
}
