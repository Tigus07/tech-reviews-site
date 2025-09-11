export default function Header() {
  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">Tech Reviews Hub</h1>
      <nav className="space-x-4">
        <a href="/" className="hover:underline">Home</a>
        <a href="/laptops" className="hover:underline">Laptops</a>
        <a href="/desktops" className="hover:underline">Desktops</a>
        <a href="/components" className="hover:underline">Components</a>
        <a href="/accessories" className="hover:underline">Accessories</a>
        <a href="/about" className="hover:underline">About</a>
      </nav>
    </header>
  )
}
