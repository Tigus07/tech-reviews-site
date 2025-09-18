"use client";

import { useState } from "react";
import Link from "next/link";
import db from "../../products.json";

export default function ReviewsPage() {
  const [search, setSearch] = useState("");

  const filteredProducts = (db.products || []).filter((product) => {
    const term = search.toLowerCase();
    return (
      product.title?.toLowerCase().includes(term) ||
      product.brand?.toLowerCase().includes(term) ||
      (product.category || "").toLowerCase().includes(term)
    );
  });

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Tech Product Reviews</h1>
      <p className="text-gray-600 text-center mb-8">
        Honest and detailed reviews of the latest laptops, keyboards, and other tech gear.
      </p>

      <div className="flex justify-center mb-10">
        <input
          type="text"
          placeholder="Search by product, brand or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <div
              key={product.slug}
              className="border rounded-xl shadow-sm hover:shadow-md transition bg-white flex flex-col"
            >
              {product.images?.main && (
                <img
                  src={product.images.main}
                  alt={product.title}
                  className="w-full h-48 object-cover rounded-t-xl"
                />
              )}

              <div className="p-6 flex flex-col flex-grow">
                <h2 className="text-xl font-semibold mb-2">{product.title}</h2>
                <p className="text-sm text-gray-500 mb-4">
                  {product.brand} • {product.category}
                </p>
                <p className="text-gray-700 mb-4 line-clamp-3">{product.intro}</p>

                {product.rating?.overall && (
                  <div className="flex items-center mb-4">
                    <span className="text-yellow-500 mr-2">
                      {"★".repeat(product.rating.overall)}
                    </span>
                    <span className="text-gray-400">
                      {"★".repeat(10 - product.rating.overall)}
                    </span>
                    <span className="ml-2 text-gray-600 text-sm">
                      {product.rating.overall}/10
                    </span>
                  </div>
                )}

                <div className="mt-auto">
                  <Link
                    href={`/reviews/${product.slug}`}
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    Read full review →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No products found.</p>
      )}
    </main>
  );
}
