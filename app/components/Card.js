import Link from "next/link"

export default function Card({ title, description, slug, link }) {
  // Si slug est fourni, c'est une review, sinon on utilise link (catégorie ou autre)
  // On vérifie que le lien de catégorie existe (laptops, desktops, etc.)
  const validCategoryPages = ["/laptops"] // Ajoute ici les pages de catégorie existantes
  const href = slug ? `/reviews/${slug}` : (validCategoryPages.includes(link) ? link : null)

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg p-6 text-center transition">
      <h4 className="text-xl font-semibold mb-2">{title}</h4>
      <p className="text-gray-600 mb-4">{description}</p>

      {href && (
        <Link
          href={href}
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          See More
        </Link>
      )}
    </div>
  )
}
