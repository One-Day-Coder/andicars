"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { formatKm, formatUsd } from "@/lib/format";
import type { Vehicle, VehiclePhoto, VehicleStatus } from "@/types/vehicle";

type FormState = {
  brand: string;
  model: string;
  version: string;
  year: string;
  mileage: string;
  vehicle_type: string;
  transmission: string;
  fuel: string;
  price_usd: string;
  purchase_price_usd: string;
  color: string;
  description: string;
  status: Vehicle["status"];
  is_published: boolean;
  main_photo_url: string;
};

const initialForm: FormState = {
  brand: "",
  model: "",
  version: "",
  year: "",
  mileage: "",
  vehicle_type: "Sedan",
  transmission: "Manual",
  fuel: "Nafta",
  price_usd: "",
  purchase_price_usd: "",
  color: "#0f766e",
  description: "",
  status: "en_preparacion",
  is_published: false,
  main_photo_url: ""
};

const vehicleStatusOptions: Array<{ value: VehicleStatus; label: string }> = [
  { value: "en_preparacion", label: "En preparacion" },
  { value: "disponible", label: "Disponible" },
  { value: "reservado", label: "Reservado" },
  { value: "senado", label: "Senado" },
  { value: "vendido", label: "Vendido" },
  { value: "entregado", label: "Entregado" }
];

export function VehicleForm() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [currentPhotos, setCurrentPhotos] = useState<VehiclePhoto[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadVehicles() {
    if (!supabase) {
      setMessage("Falta configurar Supabase. Completa .env.local con tus claves para guardar vehiculos reales.");
      return;
    }

    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(`No pude cargar vehiculos: ${error.message}`);
      return;
    }

    setVehicles(data || []);
  }

  useEffect(() => {
    loadVehicles();
  }, []);

  function updateField(name: keyof FormState, value: string | boolean) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function updatePhotoFile(file: File | null) {
    setPhotoFile(file);
  }

  function updateGalleryFiles(files: FileList | null) {
    setGalleryFiles(files ? Array.from(files) : []);
  }

  async function loadVehiclePhotos(vehicleId: string) {
    if (!supabase) {
      return;
    }

    const { data, error } = await supabase
      .from("vehicle_photos")
      .select("*")
      .eq("vehicle_id", vehicleId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      setMessage(`No pude cargar fotos adicionales: ${error.message}`);
      return;
    }

    setCurrentPhotos(data || []);
  }

  function resetForm() {
    setForm(initialForm);
    setPhotoFile(null);
    setGalleryFiles([]);
    setCurrentPhotos([]);
    setEditingId(null);
    setMessage("");
  }

  async function editVehicle(vehicle: Vehicle) {
    setEditingId(vehicle.id);
    setForm({
      brand: vehicle.brand || "",
      model: vehicle.model || "",
      version: vehicle.version || "",
      year: String(vehicle.year || ""),
      mileage: String(vehicle.mileage || ""),
      vehicle_type: vehicle.vehicle_type || "Sedan",
      transmission: vehicle.transmission || "Manual",
      fuel: vehicle.fuel || "Nafta",
      price_usd: String(vehicle.price_usd || ""),
      purchase_price_usd: vehicle.purchase_price_usd ? String(vehicle.purchase_price_usd) : "",
      color: vehicle.color || "#0f766e",
      description: vehicle.description || "",
      status: vehicle.status || "en_preparacion",
      is_published: vehicle.is_published || false,
      main_photo_url: vehicle.main_photo_url || ""
    });
    setPhotoFile(null);
    setGalleryFiles([]);
    await loadVehiclePhotos(vehicle.id);
    setMessage("Editando vehiculo. Cuando termines, toca Guardar cambios.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadMainPhoto(vehicleId: string) {
    if (!supabase || !photoFile) {
      return null;
    }

    const extension = photoFile.name.split(".").pop() || "jpg";
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    const filePath = `${vehicleId}/${safeName}`;

    const { error } = await supabase.storage
      .from("vehicle-photos")
      .upload(filePath, photoFile, {
        cacheControl: "3600",
        upsert: false
      });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = supabase.storage.from("vehicle-photos").getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function uploadGalleryPhotos(vehicleId: string) {
    if (!supabase || galleryFiles.length === 0) {
      return;
    }

    const uploadedRows = [];

    for (const [index, file] of galleryFiles.entries()) {
      const extension = file.name.split(".").pop() || "jpg";
      const safeName = `gallery-${Date.now()}-${index}-${Math.random().toString(36).slice(2)}.${extension}`;
      const filePath = `${vehicleId}/${safeName}`;

      const { error } = await supabase.storage
        .from("vehicle-photos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (error) {
        throw new Error(error.message);
      }

      const { data } = supabase.storage.from("vehicle-photos").getPublicUrl(filePath);

      uploadedRows.push({
        vehicle_id: vehicleId,
        url: data.publicUrl,
        sort_order: currentPhotos.length + index + 1
      });
    }

    const { error } = await supabase.from("vehicle_photos").insert(uploadedRows);

    if (error) {
      throw new Error(error.message);
    }
  }

  async function deleteGalleryPhoto(photo: VehiclePhoto) {
    if (!supabase) {
      setMessage("Falta configurar Supabase.");
      return;
    }

    const confirmed = window.confirm("Eliminar esta foto adicional?");

    if (!confirmed) {
      return;
    }

    const publicPathMarker = "/vehicle-photos/";
    const filePath = photo.url.includes(publicPathMarker)
      ? decodeURIComponent(photo.url.split(publicPathMarker)[1])
      : "";

    if (filePath) {
      await supabase.storage.from("vehicle-photos").remove([filePath]);
    }

    const { error } = await supabase.from("vehicle_photos").delete().eq("id", photo.id);

    if (error) {
      setMessage(`No se pudo eliminar la foto: ${error.message}`);
      return;
    }

    setMessage("Foto adicional eliminada.");

    if (editingId) {
      await loadVehiclePhotos(editingId);
    }
  }

  async function deleteVehicle(vehicle: Vehicle) {
    if (!supabase) {
      setMessage("Falta configurar Supabase.");
      return;
    }

    const title = `${vehicle.brand} ${vehicle.model}`;
    const confirmed = window.confirm(`Seguro que queres eliminar ${title}? Esta accion no se puede deshacer.`);

    if (!confirmed) {
      return;
    }

    const { error } = await supabase.from("vehicles").delete().eq("id", vehicle.id);

    if (error) {
      setMessage(`No se pudo eliminar: ${error.message}`);
      return;
    }

    if (editingId === vehicle.id) {
      resetForm();
    }

    setMessage("Vehiculo eliminado correctamente.");
    await loadVehicles();
  }

  async function togglePublished(vehicle: Vehicle) {
    if (!supabase) {
      setMessage("Falta configurar Supabase.");
      return;
    }

    const { error } = await supabase
      .from("vehicles")
      .update({ is_published: !vehicle.is_published })
      .eq("id", vehicle.id);

    if (error) {
      setMessage(`No se pudo cambiar la publicacion: ${error.message}`);
      return;
    }

    setMessage(vehicle.is_published ? "Vehiculo ocultado de la web." : "Vehiculo publicado en la web.");
    await loadVehicles();
  }

  async function updateVehicleStatus(vehicle: Vehicle, status: VehicleStatus) {
    if (!supabase) {
      setMessage("Falta configurar Supabase.");
      return;
    }

    const { error } = await supabase.from("vehicles").update({ status }).eq("id", vehicle.id);

    if (error) {
      setMessage(`No se pudo cambiar el estado: ${error.message}`);
      return;
    }

    setVehicles((current) => current.map((item) => (item.id === vehicle.id ? { ...item, status } : item)));
    setMessage("Estado del vehiculo actualizado.");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (!supabase) {
      setMessage("Falta configurar Supabase. Primero crea .env.local con tus claves.");
      setLoading(false);
      return;
    }

    const payload = {
      brand: form.brand,
      model: form.model,
      version: form.version || null,
      year: Number(form.year),
      mileage: Number(form.mileage),
      vehicle_type: form.vehicle_type,
      transmission: form.transmission,
      fuel: form.fuel || null,
      price_usd: Number(form.price_usd),
      purchase_price_usd: form.purchase_price_usd ? Number(form.purchase_price_usd) : null,
      color: form.color,
      description: form.description || null,
      status: form.status,
      is_published: form.is_published,
      main_photo_url: form.main_photo_url || null
    };

    try {
      if (editingId) {
        const publicUrl = await uploadMainPhoto(editingId);
        const updatePayload = publicUrl ? { ...payload, main_photo_url: publicUrl } : payload;
        const { error } = await supabase.from("vehicles").update(updatePayload).eq("id", editingId);

        if (error) {
          throw new Error(error.message);
        }

        await uploadGalleryPhotos(editingId);
      } else {
        const { data, error } = await supabase.from("vehicles").insert(payload).select("id").single();

        if (error) {
          throw new Error(error.message);
        }

        if (data?.id) {
          const publicUrl = await uploadMainPhoto(data.id);

          if (publicUrl) {
            const { error: photoError } = await supabase
              .from("vehicles")
              .update({ main_photo_url: publicUrl })
              .eq("id", data.id);

            if (photoError) {
              throw new Error(photoError.message);
            }
          }

          await uploadGalleryPhotos(data.id);
        }
      }

      setForm(initialForm);
      setPhotoFile(null);
      setGalleryFiles([]);
      setCurrentPhotos([]);
      setEditingId(null);
      setMessage(editingId ? "Vehiculo actualizado correctamente." : "Vehiculo guardado correctamente.");
      await loadVehicles();
    } catch (error) {
      setMessage(`No se pudo guardar: ${error instanceof Error ? error.message : "Error desconocido"}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-layout">
      <form className="vehicle-form" onSubmit={handleSubmit}>
        <div className="wide-field form-title-row">
          <div>
            <h2>{editingId ? "Editar vehiculo" : "Agregar vehiculo"}</h2>
            <p>{editingId ? "Estas modificando un auto ya cargado." : "Carga una unidad nueva al stock interno."}</p>
          </div>
          {editingId ? (
            <button className="button light" type="button" onClick={resetForm}>
              Cancelar edicion
            </button>
          ) : null}
        </div>
        <label>
          Marca
          <input value={form.brand} onChange={(event) => updateField("brand", event.target.value)} required />
        </label>
        <label>
          Modelo
          <input value={form.model} onChange={(event) => updateField("model", event.target.value)} required />
        </label>
        <label>
          Version
          <input value={form.version} onChange={(event) => updateField("version", event.target.value)} />
        </label>
        <label>
          Anio
          <input type="number" value={form.year} onChange={(event) => updateField("year", event.target.value)} required />
        </label>
        <label>
          Kilometraje
          <input type="number" value={form.mileage} onChange={(event) => updateField("mileage", event.target.value)} required />
        </label>
        <label>
          Tipo
          <select value={form.vehicle_type} onChange={(event) => updateField("vehicle_type", event.target.value)}>
            <option>Sedan</option>
            <option>Hatchback</option>
            <option>SUV</option>
            <option>Pickup</option>
          </select>
        </label>
        <label>
          Transmision
          <select value={form.transmission} onChange={(event) => updateField("transmission", event.target.value)}>
            <option>Manual</option>
            <option>Automatico</option>
          </select>
        </label>
        <label>
          Combustible
          <select value={form.fuel} onChange={(event) => updateField("fuel", event.target.value)}>
            <option>Nafta</option>
            <option>Diesel</option>
            <option>Hibrido</option>
            <option>Electrico</option>
          </select>
        </label>
        <label>
          Precio publicado USD
          <input type="number" value={form.price_usd} onChange={(event) => updateField("price_usd", event.target.value)} required />
        </label>
        <label>
          Precio compra USD
          <input type="number" value={form.purchase_price_usd} onChange={(event) => updateField("purchase_price_usd", event.target.value)} />
        </label>
        <label>
          Estado
          <select value={form.status} onChange={(event) => updateField("status", event.target.value as Vehicle["status"])}>
            {vehicleStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Color
          <input type="color" value={form.color} onChange={(event) => updateField("color", event.target.value)} />
        </label>
        <div className="photo-field wide-field">
          <label>
            Foto principal
            <input
              accept="image/jpeg,image/png,image/webp"
              type="file"
              onChange={(event) => updatePhotoFile(event.target.files?.[0] || null)}
            />
          </label>
          {photoFile ? <p>Foto seleccionada: {photoFile.name}</p> : null}
          {form.main_photo_url ? (
            <div className="photo-preview">
              <img src={form.main_photo_url} alt="Foto principal actual" />
            </div>
          ) : null}
        </div>
        <label className="wide-field">
          URL foto principal
          <input value={form.main_photo_url} onChange={(event) => updateField("main_photo_url", event.target.value)} placeholder="Tambien podes pegar una URL externa" />
        </label>
        <div className="photo-field wide-field">
          <label>
            Fotos adicionales
            <input
              accept="image/jpeg,image/png,image/webp"
              multiple
              type="file"
              onChange={(event) => updateGalleryFiles(event.target.files)}
            />
          </label>
          {galleryFiles.length > 0 ? <p>{galleryFiles.length} foto{galleryFiles.length === 1 ? "" : "s"} seleccionada{galleryFiles.length === 1 ? "" : "s"} para galeria.</p> : null}
          {currentPhotos.length > 0 ? (
            <div className="admin-photo-grid">
              {currentPhotos.map((photo) => (
                <article key={photo.id}>
                  <img src={photo.url} alt="Foto adicional del vehiculo" />
                  <button className="button danger" type="button" onClick={() => deleteGalleryPhoto(photo)}>
                    Eliminar foto
                  </button>
                </article>
              ))}
            </div>
          ) : null}
        </div>
        <label className="wide-field">
          Descripcion
          <textarea rows={4} value={form.description} onChange={(event) => updateField("description", event.target.value)} />
        </label>
        <label className="checkbox-field wide-field">
          <input type="checkbox" checked={form.is_published} onChange={(event) => updateField("is_published", event.target.checked)} />
          Publicar en la web
        </label>
        <div className="form-actions wide-field">
          <button className="button primary" type="submit" disabled={loading}>
            {loading ? "Guardando..." : editingId ? "Guardar cambios" : "Guardar vehiculo"}
          </button>
          <button className="button light" type="button" onClick={resetForm}>
            Limpiar
          </button>
        </div>
        {message ? <p className="form-message wide-field">{message}</p> : null}
      </form>

      <aside className="admin-tools">
        <h2>Stock interno</h2>
        <p>{vehicles.length} vehiculos cargados</p>
        <p className="admin-note">
          Usa publicar/ocultar para controlar que aparece en la web. Solo se ven
          autos publicados con estado disponible o reservado.
        </p>
      </aside>

      <section className="admin-stock wide-admin-section">
        <div className="stock-header">
          <div>
            <h2>Vehiculos cargados</h2>
            <p>Edita, elimina o cambia la publicacion sin entrar a Supabase.</p>
          </div>
        </div>

        {vehicles.length === 0 ? (
          <p className="empty-state">Todavia no hay vehiculos cargados.</p>
        ) : (
          <div className="vehicle-list">
            {vehicles.map((vehicle) => {
              const title = `${vehicle.brand} ${vehicle.model}${vehicle.version ? ` ${vehicle.version}` : ""}`;

              return (
                <article className="vehicle-row" key={vehicle.id}>
                  <div>
                    <h3>{title}</h3>
                    <p>
                      {vehicle.year} - {formatKm(vehicle.mileage)} - {vehicle.vehicle_type} - {vehicle.status.replace("_", " ")}
                    </p>
                  </div>
                  {vehicle.main_photo_url ? <span className="status-badge published">Con foto</span> : <span className="status-badge">Sin foto</span>}
                  <strong>{formatUsd(vehicle.price_usd)}</strong>
                  <label className="quick-status">
                    Estado
                    <select value={vehicle.status} onChange={(event) => updateVehicleStatus(vehicle, event.target.value as VehicleStatus)}>
                      {vehicleStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <span className={vehicle.is_published ? "status-badge published" : "status-badge"}>
                    {vehicle.is_published ? "Publicado" : "Oculto"}
                  </span>
                  <div className="row-actions">
                    <button className="button light" type="button" onClick={() => editVehicle(vehicle)}>
                      Editar
                    </button>
                    <button className="button light" type="button" onClick={() => togglePublished(vehicle)}>
                      {vehicle.is_published ? "Ocultar" : "Publicar"}
                    </button>
                    <button className="button danger" type="button" onClick={() => deleteVehicle(vehicle)}>
                      Eliminar
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
