import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SupabaseDebugPage() {
  const supabase = createSupabaseServerClient();
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "No configurado";

  if (!supabase) {
    return (
      <main className="page-shell">
        <section className="section-heading">
          <p className="eyebrow">Diagnostico</p>
          <h1>Supabase no esta configurado</h1>
          <p>Revisa el archivo .env.local.</p>
        </section>
      </main>
    );
  }

  const published = await supabase
    .from("vehicles")
    .select("id, brand, model, status, is_published")
    .eq("is_published", true)
    .in("status", ["disponible", "reservado"]);

  const allVisible = await supabase
    .from("vehicles")
    .select("id, brand, model, status, is_published")
    .limit(10);

  return (
    <main className="page-shell">
      <section className="section-heading">
        <p className="eyebrow">Diagnostico</p>
        <h1>Conexion Supabase</h1>
        <p>Proyecto usado por la web: {projectUrl}</p>
      </section>

      <section className="debug-grid">
        <article className="admin-tools">
          <h2>Autos publicos visibles</h2>
          <p>Error: {published.error?.message || "Sin error"}</p>
          <p>Cantidad: {published.data?.length ?? 0}</p>
          <pre>{JSON.stringify(published.data, null, 2)}</pre>
        </article>

        <article className="admin-tools">
          <h2>Todos los autos visibles para anon</h2>
          <p>Error: {allVisible.error?.message || "Sin error"}</p>
          <p>Cantidad: {allVisible.data?.length ?? 0}</p>
          <pre>{JSON.stringify(allVisible.data, null, 2)}</pre>
        </article>
      </section>
    </main>
  );
}
