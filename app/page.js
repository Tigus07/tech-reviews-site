import Card from "./components/Card"
import products from "../products.json"
import Link from "next/link"

export default function Home() {
  const categories = [
    { name: "Laptops", description: "Best laptops for gaming, work, and students." },
    { name: "Desktops", description: "Desktop computers for home office and gaming." },
    { name: "Components", description: "CPUs, GPUs, RAM, and more." },
    { name: "Accessories", description: "Keyboards, mice, headsets, and webcams." },
  ]

  // Trier les produits par date dÃ©croissante
  const sortedProducts = [...products].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )

  return (
    <div>
      {/* Hero */}
      <section className="text-center py-16 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <h2 className="text-4xl font-bold mb-4">Best Computer Products & Reviews 2025</h2>
        <p className="mb-6">Find the best laptops, desktops, and accessories with unbiased comparisons.</p>
        <a href="#categories" className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow hover:shadow-lg">
          See Top Picks
        </a>
      </section>

      {/* Categories */}
      <section id="categories" className="py-12 max-w-6xl mx-auto px-4">
        <h3 className="text-2xl font-bold mb-8 text-center">Explore Categories</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Card
              key={cat.name}
              title={cat.name}
              description={cat.description}
              link={`/${cat.name.toLowerCase()}`}
            />
          ))}
        </div>
      </section>

      {/* Latest Reviews */}
      <section className="py-12 bg-gray-100 px-4">
        <h3 className="text-2xl font-bold mb-8 text-center">Latest Reviews</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {sortedProducts.slice(0, 6).map((product, i) => (
            <Card
              key={i}
              title={product.title}
              description={product.intro || "Read our full review."}
              link={`/${product.slug}`}
            />
          ))}
        </div>

        {/* Button to see all reviews */}
        <div className="text-center mt-10">
          <Link
            href="/reviews"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
          >
            View All Reviews â†’
          </Link>
        </div>
      </section>
    </div>
  )
}
