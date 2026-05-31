import { AdminGuard, RoleGuard, SiteHeader } from "@/modules/core";
import { UsersPanel } from "@/modules/users";

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
              usuario. Esta seccion queda reservada para Dueno.
            </p>
          </section>
          <RoleGuard module="users">
            <UsersPanel />
          </RoleGuard>
        </main>
      </AdminGuard>
    </>
  );
}
