import '../styles/globals.css'
import Header from './components/Header'
import Footer from './components/Footer'

export const metadata = {
  title: 'Tech Reviews Hub',
  description: 'Best computer products & reviews 2025',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
