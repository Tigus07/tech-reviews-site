import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-white mt-16">
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <h3 className="text-lg font-semibold">Tech Reviews Hub</h3>
          <p className="text-sm text-gray-600 mt-2">
            Unbiased reviews and buying guides for laptops, PC components, and accessories.
          </p>
          <p className="text-xs text-gray-500 mt-3">
            As an Amazon Associate, we may earn commissions from qualifying purchases.
          </p>
        </div>

        {/* Site links */}
        <nav>
          <h4 className="text-sm font-semibold text-gray-800">Site</h4>
          <ul className="mt-3 space-y-2 text-gray-700">
            <li><Link href="/reviews" className="hover:underline">All Reviews</Link></li>
            <li><Link href="/articles" className="hover:underline">Articles</Link></li>
            <li><Link href="/categories" className="hover:underline">Categories</Link></li>
          </ul>
        </nav>

        {/* Legal links */}
        <nav>
          <h4 className="text-sm font-semibold text-gray-800">Legal</h4>
          <ul className="mt-3 space-y-2 text-gray-700">
            <li><Link href="/about" className="hover:underline">About Us</Link></li>
            <li><Link href="/privacy" className="hover:underline">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:underline">Terms of Service</Link></li>
          </ul>
        </nav>
      </div>

      <div className="border-t">
        <div className="max-w-6xl mx-auto px-6 py-4 text-sm text-gray-500 flex flex-col sm:flex-row items-center justify-between">
          <span>© {year} Tech Reviews Hub. All rights reserved.</span>
          <span className="mt-2 sm:mt-0">Built with Next.js</span>
        </div>
      </div>
    </footer>
  );
}
