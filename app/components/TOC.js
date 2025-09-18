"use client";
import { useEffect } from "react";

export default function TOC({ items = [] }) {
  // items: [{id:'specs', label:'Specifications'}, ...]
  useEffect(() => {
    // nothing needed for now; ids are set in sections
  }, [items]);

  if (!items.length) return null;

  return (
    <nav className="mb-6 border rounded-lg p-4 bg-white shadow-sm">
      <h2 className="font-semibold mb-3">Table of Contents</h2>
      <ul className="list-disc ml-6 space-y-1">
        {items.map((it) => (
          <li key={it.id}>
            <a href={`#${it.id}`} className="text-blue-600 hover:underline">
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
