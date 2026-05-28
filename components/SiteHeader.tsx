import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link className="brand" href="/">
        <span className="brand-mark">A</span>
        <span>AndiCars</span>
      </Link>

      <nav className="main-nav">
        <Link href="/autos">Autos</Link>
        <Link href="/#vender">Vender mi auto</Link>
        <Link href="/#servicios">Servicios</Link>
        <Link href="/admin">Panel</Link>
      </nav>
    </header>
  );
}
