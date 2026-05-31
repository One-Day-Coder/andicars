import { AdminGuard, RoleGuard, SiteHeader } from "@/modules/core";
import { ExpensesPanel } from "@/modules/expenses";

export default function AdminExpensesPage() {
  return (
    <>
      <SiteHeader />
      <AdminGuard>
        <main className="admin-shell">
          <section className="admin-intro">
            <p className="eyebrow">Gastos</p>
          <h1>Gastos por vehiculo</h1>
          <p>
            Registra inversiones y arreglos asociados a cada auto. Esta es la
            base para calcular rentabilidad real mas adelante. Este modulo queda
            pensado para roles de dueño o encargado.
          </p>
          </section>
          <RoleGuard module="expenses">
            <ExpensesPanel />
          </RoleGuard>
        </main>
      </AdminGuard>
    </>
  );
}
