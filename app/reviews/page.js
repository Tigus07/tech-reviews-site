import products from "../../products.json"
import Card from "../components/Card"

export default function ReviewsPage() {
  const sortedProducts = [...products].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">All Reviews</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedProducts.map((product, i) => (
          <Card
            key={i}
            title={product.title}
            description={product.intro || "Read our full review."}
            link={`/${product.slug}`}
          />
        ))}
      </div>
    </div>
  )
}
