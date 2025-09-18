export const metadata = {
  title: "About Us – Tech Reviews Hub",
  description: "Who we are, how we test, and how Tech Reviews Hub makes money.",
};

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">About Tech Reviews Hub</h1>

      <p className="text-gray-700 mb-4">
        Tech Reviews Hub is an independent site dedicated to clear, unbiased reviews
        and practical buying advice for laptops, PC components, and accessories.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-3">Affiliate Disclosure</h2>
      <p className="text-gray-700 mb-4">
        Some links on this site are affiliate links. If you buy through those links,
        we may earn a commission at no extra cost to you. This helps keep the site
        running and does not influence our editorial opinions.
      </p>

    </main>
  );
}
