import Link from "next/link";
import { AdminGuard } from "@/components/AdminGuard";
import { AdminSummary } from "@/components/AdminSummary";
import { SiteHeader } from "@/components/SiteHeader";

export default function AdminPage() {
  return (
    <>
      <SiteHeader />
      <AdminGuard>
        <main className="admin-shell">
          <section className="admin-intro">
            <p className="eyebrow">Panel interno</p>
            <h1>Administracion AndiCars</h1>
            <p>
              Desde aca vas a cargar vehiculos, publicar autos en la web y luego
              sumar clientes, gastos, ventas y reportes.
            </p>
          </section>
          <AdminSummary />
          <section className="service-grid">
            <article>
              <h3>Vehiculos</h3>
              <p>Carga autos, estado, precio y publicacion.</p>
              <Link className="button light" href="/admin/vehiculos">
                Abrir vehiculos
              </Link>
            </article>
            <article>
              <h3>Clientes</h3>
              <p>Consultas y seguimiento comercial basico.</p>
              <Link className="button light" href="/admin/consultas">
                Abrir consultas
              </Link>
            </article>
            <article>
              <h3>Gastos</h3>
              <p>Carga gastos asociados a cada unidad.</p>
              <Link className="button light" href="/admin/gastos">
                Abrir gastos
              </Link>
            </article>
            <article>
              <h3>Ventas</h3>
              <p>Registra reservas, senas, ventas y entregas.</p>
              <Link className="button light" href="/admin/ventas">
                Abrir ventas
              </Link>
            </article>
            <article>
              <h3>Reportes</h3>
              <p>Resumen general de inversion, gastos y rentabilidad.</p>
              <Link className="button light" href="/admin/reportes">
                Abrir reportes
              </Link>
            </article>
          </section>
        </main>
      </AdminGuard>
    </>
  );
}
