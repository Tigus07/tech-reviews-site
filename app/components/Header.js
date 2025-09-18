"use client";

import Link from "next/link";
import { useState } from "react";

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

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Tech Reviews Hub
        </Link>

        <nav className="hidden md:flex space-x-6 text-gray-700 font-medium items-center">
          <Link href="/reviews" className="hover:text-blue-600 transition">
            All Reviews
          </Link>
          <Link href="/articles" className="hover:text-blue-600 transition">
            Articles
          </Link>

          {Object.entries(categoryTree).map(([mainCat, subCats]) => (
            <div key={mainCat} className="relative group">
              <Link
                href={`/categories/${mainCat.toLowerCase()}`}
                className="hover:text-blue-600 transition"
              >
                {mainCat}
              </Link>

              <div className="absolute left-0 mt-2 hidden group-hover:block">
                <div className="bg-white border rounded-lg shadow-lg z-50 relative">
                  {/* hover buffer */}
                  <div className="absolute -top-3 left-0 w-full h-3"></div>
                  <ul className="py-2 w-56">
                    {subCats.map((sub) => (
                      <li key={sub.slug}>
                        <Link
                          href={`/categories/${sub.slug}`}
                          className="block px-4 py-2 hover:bg-gray-100"
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </nav>

        <button
          className="md:hidden text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✖" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <nav className="md:hidden bg-white border-t border-gray-200">
          <ul className="flex flex-col p-4 space-y-3 text-gray-700 font-medium">
            <li>
              <Link
                href="/reviews"
                className="block hover:text-blue-600 transition"
                onClick={() => setMenuOpen(false)}
              >
                All Reviews
              </Link>
            </li>
            <li>
              <Link
                href="/articles"
                className="block hover:text-blue-600 transition"
                onClick={() => setMenuOpen(false)}
              >
                Articles
              </Link>
            </li>

            {Object.entries(categoryTree).map(([mainCat, subCats]) => (
              <li key={mainCat}>
                <Link
                  href={`/categories/${mainCat.toLowerCase()}`}
                  className="font-semibold block hover:text-blue-600 transition"
                  onClick={() => setMenuOpen(false)}
                >
                  {mainCat}
                </Link>
                <ul className="ml-4 mt-2 space-y-1">
                  {subCats.map((sub) => (
                    <li key={sub.slug}>
                      <Link
                        href={`/categories/${sub.slug}`}
                        className="block hover:text-blue-600 transition"
                        onClick={() => setMenuOpen(false)}
                      >
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
