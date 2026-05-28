import Link from "next/link";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { LeadForm } from "@/components/LeadForm";
import { VehicleGallery } from "@/components/VehicleGallery";
import { demoVehicles } from "@/lib/demo-data";
import { formatKm, formatUsd } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { vehicleCardSelect } from "@/lib/vehicle-queries";
import type { Vehicle, VehiclePhoto } from "@/types/vehicle";

export const dynamic = "force-dynamic";

type VehicleDetailPageProps = {
  params: {
    id: string;
  };
};

async function getVehicle(id: string): Promise<Vehicle | null> {
  const demoVehicle = demoVehicles.find((vehicle) => vehicle.id === id);
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return demoVehicle || null;
  }

  const { data, error } = await supabase
    .from("vehicles")
    .select(vehicleCardSelect)
    .eq("id", id)
    .eq("is_published", true)
    .single();

  if (error || !data) {
    return demoVehicle || null;
  }

  return data;
}

async function getVehiclePhotos(id: string): Promise<VehiclePhoto[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("vehicle_photos")
    .select("*")
    .eq("vehicle_id", id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data;
}

export default async function VehicleDetailPage({ params }: VehicleDetailPageProps) {
  const vehicle = await getVehicle(params.id);

  if (!vehicle) {
    notFound();
  }

  const photos = await getVehiclePhotos(vehicle.id);
  const title = `${vehicle.brand} ${vehicle.model}${vehicle.version ? ` ${vehicle.version}` : ""}`;
  const whatsappText = encodeURIComponent(`Hola AndiCars, quiero consultar por el ${title} ${vehicle.year}.`);
  const galleryImages = [
    ...(vehicle.main_photo_url ? [vehicle.main_photo_url] : []),
    ...photos.map((photo) => photo.url)
  ];

  return (
    <>
      <SiteHeader />
      <main className="detail-shell">
        <section className="detail-media">
          <VehicleGallery
            title={title}
            images={galleryImages}
            fallback={
              <div className="car-visual detail-placeholder" style={{ "--card-color": vehicle.color || "#637083" } as CSSProperties}>
                <div className="car-wheels" aria-hidden="true">
                  <span />
                  <span />
                </div>
              </div>
            }
          />
        </section>
        <section className="detail-info">
          <p className="eyebrow">{vehicle.status.replace("_", " ")}</p>
          <h1>{title}</h1>
          <strong className="detail-price">{formatUsd(vehicle.price_usd)}</strong>
          <div className="car-meta">
            <span className="pill">{vehicle.year}</span>
            <span className="pill">{formatKm(vehicle.mileage)}</span>
            <span className="pill">{vehicle.vehicle_type}</span>
            <span className="pill">{vehicle.transmission}</span>
            {vehicle.fuel ? <span className="pill">{vehicle.fuel}</span> : null}
          </div>
          <p>{vehicle.description || "Unidad seleccionada por AndiCars."}</p>
          <div className="hero-actions">
            <a className="button primary" href={`https://wa.me/5491112345678?text=${whatsappText}`} target="_blank" rel="noreferrer">
              Consultar por WhatsApp
            </a>
            <Link className="button light" href="/autos">
              Volver al catalogo
            </Link>
          </div>
          <LeadForm vehicleId={vehicle.id} vehicleTitle={title} />
        </section>
      </main>
    </>
  );
}
