import products from "../../products.json"
import Link from "next/link"

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }))
}

export default function ProductPage({ params }) {
  const product = products.find((p) => p.slug === params.slug)

  if (!product) {
    return <div className="p-10 text-center">Product not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Title */}
      <h1 className="text-4xl font-bold mb-6">{product.title}</h1>

      {/* Images */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {product.images &&
          product.images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`${product.title} image ${i + 1}`}
              className="rounded-xl shadow-md"
            />
          ))}
      </div>

      {/* Intro */}
      <p className="text-lg mb-6">{product.intro}</p>

      {/* Dynamic Layouts */}
      {product.layoutType === "review" && <ReviewLayout product={product} />}

      {product.layoutType === "comparison" && (
        <ComparisonLayout product={product} />
      )}

      {product.layoutType === "top-picks" && <TopPicksLayout product={product} />}

      {/* CTA Button */}
      {product.asin && (
        <div className="mt-10 text-center">
          <a
            href={`https://www.amazon.com/dp/${product.asin}?tag=YOUR-AFFILIATE-ID`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-yellow-500 text-black px-6 py-3 rounded-lg shadow hover:bg-yellow-600 transition"
          >
            {product.ctaText}
          </a>
        </div>
      )}

      {/* Conclusion */}
      {product.conclusion && (
        <div className="mt-10 border-t pt-6">
          <h2 className="text-2xl font-semibold mb-3">Final Thoughts</h2>
          <p className="text-lg">{product.conclusion}</p>
        </div>
      )}

      {/* Back Link */}
      <div className="mt-10">
        <Link href="/" className="text-blue-600 hover:underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}

/* ==============================
   📌 Different Layouts
============================== */

function ReviewLayout({ product }) {
  return (
    <>
      {/* Features */}
      <h2 className="text-2xl font-semibold mt-8 mb-3">Key Features</h2>
      <ul className="list-disc list-inside mb-6 space-y-2">
        {product.features.map((f, i) => (
          <li key={i}>{f}</li>
        ))}
      </ul>

      {/* Pros & Cons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold mb-2 text-green-600">✅ Pros</h3>
          <ul className="list-disc list-inside space-y-1">
            {product.pros.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2 text-red-600">❌ Cons</h3>
          <ul className="list-disc list-inside space-y-1">
            {product.cons.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}

function ComparisonLayout({ product }) {
  return (
    <>
      <h2 className="text-2xl font-semibold mt-8 mb-3">Comparison Highlights</h2>
      <p className="mb-4">
        Here are some key factors to consider when comparing products:
      </p>
      <ul className="list-decimal list-inside mb-6 space-y-2">
        {product.features.map((f, i) => (
          <li key={i}>{f}</li>
        ))}
      </ul>
    </>
  )
}

function TopPicksLayout({ product }) {
  return (
    <>
      <h2 className="text-2xl font-semibold mt-8 mb-3">Our Top Picks</h2>
      <p className="mb-4">
        Based on performance, price, and reliability, here are our top picks:
      </p>
      <ul className="list-disc list-inside mb-6 space-y-2">
        {product.features.map((f, i) => (
          <li key={i}>{f}</li>
        ))}
      </ul>
    </>
  )
}
