import { AdminGuard } from "@/components/AdminGuard";
import { SiteHeader } from "@/components/SiteHeader";
import { UsersPanel } from "@/components/UsersPanel";

export default function AdminUsersPage() {
  return (
    <>
      <SiteHeader />
      <AdminGuard>
        <main className="admin-shell">
          <section className="admin-intro">
            <p className="eyebrow">Usuarios</p>
            <h1>Usuarios internos</h1>
            <p>
              Administra quienes pueden entrar al panel y que rol tiene cada
              usuario. Esta seccion queda reservada para owner.
            </p>
          </section>
          <UsersPanel />
        </main>
      </AdminGuard>
    </>
  );
}
