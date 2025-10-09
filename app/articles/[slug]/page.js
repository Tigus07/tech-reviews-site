import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import db from "../../../products.json";

/** ISR conseillé si tu mets à jour le JSON régulièrement */
export const revalidate = 300;

function absUrl(path = "") {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "http://localhost:3000";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

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

function getArticle(slug) {
  const a = Array.isArray(db.articles) ? db.articles.find((x) => x.slug === slug) : null;
  if (!a) return null;

  // Normalise Keys (avoid undefined)
  return {
    ...a,
    products: Array.isArray(a.products) ? a.products : [],
    sections: Array.isArray(a.sections) ? a.sections : [],
  };
}

function getProductsBySlugs(slugs = []) {
  const all = Array.isArray(db.products) ? db.products : [];
  return slugs.map((s) => all.find((p) => p.slug === s)).filter(Boolean);
}

/** Construit le JSON-LD ItemList pour un article de type "guide" */
function buildItemListLd(article, items) {
  const url = absUrl(`/articles/${article.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: article.title,
    description: article.intro || article.excerpt || undefined,
    itemListOrder: "http://schema.org/ItemListOrderAscending",
    numberOfItems: items.length,
    url,
    itemListElement: items.map((p, i) => {
      const productPage = absUrl(`/reviews/${p.slug}`);
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          name: p.title,
          image: p?.images?.main,
          brand: p.brand ? { "@type": "Brand", name: p.brand } : undefined,
          category: p.category,
          url: productPage,
          aggregateRating:
            p?.rating?.value && p?.rating?.count
              ? {
                  "@type": "AggregateRating",
                  ratingValue: String(p.rating.value),
                  ratingCount: String(p.rating.count),
                }
              : undefined,
        },
      };
    }),
  };
}

function buildBreadcrumbsLd(article) {
  const current = absUrl(`/articles/${article.slug}`);
  const list = absUrl("/articles");
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absUrl("/") },
      { "@type": "ListItem", position: 2, name: "Articles", item: list },
      { "@type": "ListItem", position: 3, name: article.title, item: current },
    ],
  };
}

/** Petit helper pour injecter proprement du JSON-LD */
function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify supprime automatiquement les "undefined"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function ArticlePage({ params }) {
  const article = getArticle(params.slug);
  if (!article) {
    notFound();
  }

  const isGuide = article.type === "guide";
  const isReview = article.type === "review";
  const isComparison = article.type === "comparison";

  const orderedProducts = getProductsBySlugs(article.products);

  // JSON-LD
  const itemListLd = isGuide ? buildItemListLd(article, orderedProducts) : null;
  const breadcrumbsLd = buildBreadcrumbsLd(article);
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.intro || undefined,
    url: absUrl(`/articles/${article.slug}`),
    articleSection: article.type,
  };

  // Helpers for review/comparison
  const productBySlug = Object.fromEntries(
    (db.products || []).map((p) => [p.slug, p])
  );
  const left = isComparison && article.products?.[0] ? productBySlug[article.products[0]] : null;
  const right = isComparison && article.products?.[1] ? productBySlug[article.products[1]] : null;
  const reviewProduct = isReview && article.productSlug ? productBySlug[article.productSlug] : null;
  const reviewBuyUrl = reviewProduct?.affiliateLink
    ? withAffiliateTag(reviewProduct.affiliateLink)
    : null;

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <JsonLd data={breadcrumbsLd} />
      {itemListLd && <JsonLd data={itemListLd} />}
      <JsonLd data={articleLd} />

      {/* En-tête article */}
      <header className="mb-8">
        <p className="text-xs uppercase tracking-wide text-gray-500">
          {isGuide ? "Guide" : isComparison ? "Comparison" : "Review"}
        </p>
        <h1 className="mt-1 text-3xl md:text-4xl font-bold">{article.title}</h1>
        {article.date && (
          <time
            dateTime={article.date}
            className="mt-2 block text-sm text-gray-500"
          >
            {new Date(article.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        )}
        {article.intro && (
          <p className="mt-5 text-lg text-gray-700">{article.intro}</p>
        )}

        {/* CTA for review type */}
        {isReview && reviewBuyUrl && (
          <div className="mt-5">
            <a
              href={reviewBuyUrl}
              target="_blank"
              rel="nofollow sponsored noopener"
              className="inline-flex items-center justify-center rounded-lg bg-amber-600 hover:bg-amber-700 text-white px-5 py-3 font-semibold"
            >
              Check price on Amazon
            </a>
            <p className="mt-2 text-xs text-gray-500">
              As an Amazon Associate, we earn from qualifying purchases.
            </p>
          </div>
        )}
      </header>

      {/* GUIDE LAYOUT */}
      {isGuide && orderedProducts.length > 0 && (
        <section className="mt-8 space-y-6">
          {orderedProducts.map((p, idx) => (
            <article
              key={p.slug}
              className="border rounded-xl overflow-hidden bg-white flex flex-col md:flex-row"
            >
              {p.images?.main && (
                <Image
                  src={p.images.main}
                  alt={p.title}
                  width={520}
                  height={320}
                  className="w-full md:w-80 h-56 object-cover"
                />
              )}
              <div className="p-5 flex-1">
                <h2 className="text-xl font-semibold">
                  {article.sections?.[idx]?.heading || p.title}
                </h2>
                <p className="text-gray-700 mt-2">
                  {article.sections?.[idx]?.blurb || p.intro}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(p.highlights || []).slice(0, 6).map((h, i) => (
                    <span key={i} className="text-xs bg-gray-100 px-2.5 py-1 rounded-full">
                      {h}
                    </span>
                  ))}
                </div>

                {p.affiliateLink && (
                  <a
                    href={withAffiliateTag(p.affiliateLink)}
                    target="_blank"
                    rel="nofollow sponsored noopener"
                    className="inline-flex mt-4 items-center justify-center rounded-lg bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 font-semibold"
                  >
                    See price on Amazon
                  </a>
                )}
              </div>
            </article>
          ))}
        </section>
      )}

      {/* REVIEW LAYOUT */}
      {isReview && reviewProduct && (
        <section className="mt-8">
          {reviewProduct.images?.main && (
            <Image
              src={reviewProduct.images.main}
              alt={reviewProduct.title}
              width={1200}
              height={675}
              className="w-full h-auto rounded-xl object-cover"
            />
          )}

          {/* Sections content */}
          {Array.isArray(article.sections) && article.sections.length > 0 && (
            <div className="prose prose-neutral max-w-none mt-8">
              {article.sections.map((sec, i) => (
                <section key={i} className="mb-6">
                  {sec.heading && <h2>{sec.heading}</h2>}
                  {sec.body && <p>{sec.body}</p>}
                </section>
              ))}
            </div>
          )}

          {/* Key Specs */}
          {reviewProduct.specs && Object.keys(reviewProduct.specs).length > 0 && (
            <div className="mt-8 overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                <tbody>
                  {Object.entries(reviewProduct.specs).map(([k, v]) => (
                    <tr key={k} className="border-t">
                      <th className="px-4 py-2 text-left bg-gray-50 w-48">{k}</th>
                      <td className="px-4 py-2">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pros/Cons */}
          {(Array.isArray(reviewProduct.pros) && reviewProduct.pros.length > 0) ||
          (Array.isArray(reviewProduct.cons) && reviewProduct.cons.length > 0) ? (
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              {Array.isArray(reviewProduct.pros) && reviewProduct.pros.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-2">Pros</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    {reviewProduct.pros.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(reviewProduct.cons) && reviewProduct.cons.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-2">Cons</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    {reviewProduct.cons.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}

          {/* Bottom CTA */}
          {reviewBuyUrl && (
            <div className="my-10 text-center">
              <a
                href={reviewBuyUrl}
                target="_blank"
                rel="nofollow sponsored noopener"
                className="inline-flex items-center justify-center rounded-lg bg-amber-600 hover:bg-amber-700 text-white px-5 py-3 font-semibold"
              >
                See latest price on Amazon
              </a>
            </div>
          )}
        </section>
      )}

      {/* COMPARISON LAYOUT */}
      {isComparison && left && right && (
        <section className="mt-8 space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            {[left, right].map((p) => {
              const u = p.affiliateLink ? withAffiliateTag(p.affiliateLink) : null;
              return (
                <div key={p.slug} className="border rounded-xl overflow-hidden bg-white">
                  {p.images?.main && (
                    <Image
                      src={p.images.main}
                      alt={p.title}
                      width={640}
                      height={400}
                      className="w-full h-56 object-cover"
                    />
                  )}
                  <div className="p-5">
                    <h2 className="text-xl font-semibold">{p.title}</h2>
                    <p className="text-gray-700 mt-1">{p.intro}</p>
                    {u && (
                      <a
                        href={u}
                        target="_blank"
                        rel="nofollow sponsored noopener"
                        className="inline-flex mt-4 items-center justify-center rounded-lg bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 font-semibold"
                      >
                        See price on Amazon
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick spec comparison */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Spec</th>
                  <th className="px-4 py-2 text-left">{left.title}</th>
                  <th className="px-4 py-2 text-left">{right.title}</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(new Set([
                  ...Object.keys(left.specs || {}),
                  ...Object.keys(right.specs || {}),
                ])).map((key) => (
                  <tr key={key} className="border-t">
                    <th className="px-4 py-2 text-left bg-gray-50 w-48">{key}</th>
                    <td className="px-4 py-2">{left.specs?.[key] || "—"}</td>
                    <td className="px-4 py-2">{right.specs?.[key] || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Article sections text */}
          {Array.isArray(article.sections) && article.sections.length > 0 && (
            <div className="prose prose-neutral max-w-none">
              {article.sections.map((sec, i) => (
                <section key={i} className="mb-6">
                  {sec.heading && <h2>{sec.heading}</h2>}
                  {sec.body && <p>{sec.body}</p>}
                </section>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Sources */}
      {Array.isArray(article.sources) && article.sources.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-3">Sources</h2>
          <ul className="list-disc pl-6 space-y-1">
            {article.sources.map((s, i) => (
              <li key={i}>
                <a className="text-blue-600 hover:underline" href={s.url} target="_blank" rel="noopener">
                  {s.name || s.url}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Note d'affiliation (conformité) */}
      <p className="mt-10 text-xs text-gray-500">
        As an Amazon Associate, we earn from qualifying purchases.
      </p>
    </main>
  );
}
