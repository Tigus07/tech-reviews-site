export const metadata = {
  title: "Privacy Policy – Tech Reviews Hub",
  description:
    "We do not collect personal data on this website. Learn how outbound affiliate links and third-party sites handle data.",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: 2025-09-18</p>

      <h2 className="text-2xl font-semibold mb-3">Summary</h2>
      <p className="text-gray-700 mb-4">
        Tech Reviews Hub does <strong>not collect</strong> personal data from visitors and does{" "}
        <strong>not use analytics, tracking pixels, or marketing cookies</strong> on this website.
      </p>

      <h2 className="text-2xl font-semibold mb-3">What we don’t do</h2>
      <ul className="list-disc ml-6 text-gray-700 mb-4">
        <li>No account creation, comments, or forms on this site.</li>
        <li>No analytics (e.g., Google Analytics), no tracking pixels.</li>
        <li>No advertising SDKs or third-party trackers embedded.</li>
        <li>No sale, sharing, or transfer of visitor data.</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-3">Affiliate links</h2>
      <p className="text-gray-700 mb-4">
        We include affiliate links (e.g., Amazon). When you click an affiliate link, you are taken to
        the retailer’s website, which may use its own cookies or tracking to attribute a purchase to us.
        We do not control those third-party sites. Please review the retailer’s privacy policy (e.g.,
        Amazon’s) for details on their data practices.
      </p>

      <h2 className="text-2xl font-semibold mb-3">Server logs (minimal & ephemeral)</h2>
      <p className="text-gray-700 mb-4">
        Our hosting provider may generate standard, short-lived server logs (e.g., IP address, user
        agent, timestamp, requested URL) for security and troubleshooting. We do not combine logs with
        other data or attempt to identify visitors. Logs are automatically rotated and deleted by the
        host.
      </p>

      <h2 className="text-2xl font-semibold mb-3">Cookies</h2>
      <p className="text-gray-700 mb-4">
        This site does <strong>not</strong> set non-essential cookies. We do not use a cookie banner
        because no consent is required in the absence of analytics/marketing cookies. Third-party sites
        you visit via outbound links may set their own cookies.
      </p>

      <h2 className="text-2xl font-semibold mb-3">Your rights</h2>
      <p className="text-gray-700 mb-4">
        Since we do not collect or store personal data, there is generally nothing for us to access,
        correct, delete, or export. If you contact us by email and share information, we will use it
        solely to respond and then delete it within a reasonable period.
      </p>

      <h2 className="text-2xl font-semibold mb-3">Third-party websites</h2>
      <p className="text-gray-700 mb-4">
        Our website links to third-party websites (e.g., retailers). Their privacy practices are
        governed by their own policies. We encourage you to read those policies before providing any
        personal information on their sites.
      </p>

      <h2 className="text-2xl font-semibold mb-3">Changes to this policy</h2>
      <p className="text-gray-700 mb-4">
        If we start using analytics, forms, ads, or collect any data in the future, we will update
        this Privacy Policy and, where required, implement a consent banner.
      </p>

      <p className="text-xs text-gray-500 mt-8">
        This page is provided for informational purposes and does not constitute legal advice.
      </p>
    </main>
  );
}
