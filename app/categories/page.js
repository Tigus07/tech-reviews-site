export const metadata = {
  title: "All Categories – Tech Reviews Hub",
  description: "Browse product categories and subcategories.",
};

import Link from "next/link";

const categoryTree = {
  Computers: [
    { name: "Laptops", slug: "laptops" },
    { name: "Desktops", slug: "desktops" },
  ],
  Components: [
    { name: "Graphics Cards", slug: "graphics-cards" },
    { name: "Processors", slug: "processors" },
    { name: "Motherboards", slug: "motherboards" },
    { name: "RAM", slug: "ram" },
    { name: "Storage", slug: "storage" },
    { name: "Power Supplies", slug: "power-supplies" },
    { name: "Cases", slug: "cases" },
    { name: "Cooling", slug: "cooling" },
  ],
  Accessories: [
    { name: "Keyboards", slug: "keyboards" },
    { name: "Mice", slug: "mice" },
    { name: "Monitors", slug: "monitors" },
    { name: "Headsets", slug: "headsets" },
    { name: "Microphones", slug: "microphones" },
    { name: "Mousepads", slug: "mousepads" },
    { name: "Other", slug: "other" },
  ],
};

export default function CategoriesPage() {
  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Product Categories</h1>
      <p className="text-gray-600 text-center mb-12">
        Browse our reviews by category.
      </p>

      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(categoryTree).map(([mainCat, subs]) => (
          <div key={mainCat} className="border rounded-xl shadow-sm bg-white p-6">
            <h2 className="text-2xl font-semibold mb-4">{mainCat}</h2>
            <ul className="space-y-2">
              {subs.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/categories/${s.slug}`}
                    className="text-blue-600 hover:underline"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={`/categories/${mainCat.toLowerCase()}`}
              className="inline-block mt-4 text-sm text-gray-700 hover:underline"
            >
              See all {mainCat.toLowerCase()} →
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
