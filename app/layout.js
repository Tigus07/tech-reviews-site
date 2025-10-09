import "../styles/globals.css";
import Header from './components/Header';
import Footer from './components/Footer';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Tech Reviews Hub",
    template: "%s – Tech Reviews Hub",
  },
  description:
    "Independent reviews, comparisons, and buying guides for laptops, PC components, and accessories.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
