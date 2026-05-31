import Link from "next/link";
import { PasswordRecoveryRedirect, SiteHeader } from "@/modules/core";
import { PublicContactInfo } from "@/modules/public-site";
import { demoVehicles, VehicleCard, vehicleCardSelect } from "@/modules/vehicles";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Vehicle } from "@/modules/vehicles";

export const dynamic = "force-dynamic";

async function getFeaturedVehicles(): Promise<Vehicle[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return demoVehicles;
  }

  const { data, error } = await supabase
    .from("vehicles")
    .select(vehicleCardSelect)
    .eq("is_published", true)
    .in("status", ["disponible", "reservado"])
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) {
    return demoVehicles;
  }

  return data || [];
}

export default async function HomePage() {
  const vehicles = await getFeaturedVehicles();

  return (
    <>
      <PasswordRecoveryRedirect />
      <SiteHeader />
      <main>
        <section className="hero" id="inicio" aria-label="Presentacion de AndiCars">
          <img src="/assets/hero-andicars.png" alt="Showroom moderno de autos seleccionados" />
          <div className="hero-overlay" />
          <div className="hero-content">
            <p className="eyebrow">Agencia de compra y venta de autos</p>
            <h1>AndiCars</h1>
            <p>
              Elegi tu proximo auto con respaldo real, unidades verificadas y una
              atencion clara desde la primera consulta hasta la entrega.
            </p>
            <div className="hero-actions">
              <Link className="button primary" href="/autos">
                Ver autos
              </Link>
              <Link className="button ghost" href="/#vender">
                Tasame mi auto
              </Link>
            </div>
          </div>
        </section>

        <section className="trust-strip" aria-label="Ventajas principales">
          <div>
            <strong>48 hs</strong>
            <span>para una tasacion inicial</span>
          </div>
          <div>
            <strong>100%</strong>
            <span>unidades revisadas</span>
          </div>
          <div>
            <strong>Planes</strong>
            <span>de financiacion flexibles</span>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <p className="eyebrow">Stock destacado</p>
            <h2>Autos listos para conocer</h2>
            <p>
              El catalogo se alimenta desde Supabase. Si todavia no conectaste la
              base, se muestran ejemplos para que la pagina no quede vacia.
            </p>
          </div>
          <div className="car-grid">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </section>

        <section className="split-section" id="vender">
          <div className="section-heading compact">
            <p className="eyebrow">Compra directa</p>
            <h2>Tambien compramos tu auto</h2>
            <p>
              Hacemos una tasacion honesta, revisamos la unidad y te acompanamos
              con la documentacion para que el tramite sea simple.
            </p>
          </div>
          <div className="process-list">
            <article>
              <span>01</span>
              <h3>Envianos los datos</h3>
              <p>Marca, modelo, anio, kilometraje, fotos y estado general.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Coordinamos revision</h3>
              <p>Miramos mecanica, papeles y detalles para definir una oferta.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Cerramos la operacion</h3>
              <p>Gestionamos pago, transferencia y entrega de forma ordenada.</p>
            </article>
          </div>
        </section>

        <section className="section services-section" id="servicios">
          <div className="section-heading">
            <p className="eyebrow">Servicios</p>
            <h2>Todo lo importante en un solo lugar</h2>
          </div>
          <div className="service-grid">
            <article>
              <h3>Financiacion</h3>
              <p>Opciones de pago pensadas para avanzar con seguridad.</p>
            </article>
            <article>
              <h3>Permutas</h3>
              <p>Tomamos tu vehiculo como parte de pago segun estado y cotizacion.</p>
            </article>
            <article>
              <h3>Gestoria</h3>
              <p>Acompanamiento en informes, transferencia y documentacion.</p>
            </article>
            <article>
              <h3>Postventa</h3>
              <p>Seguimiento despues de la entrega para resolver dudas iniciales.</p>
            </article>
          </div>
        </section>
        <PublicContactInfo />
      </main>
    </>
  );
}
