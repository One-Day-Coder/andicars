"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { formatKm, formatUsd } from "@/lib/format";
import { fuelOptions, transmissionOptions, vehicleStatusOptions, vehicleTypeOptions } from "@/modules/vehicles/constants";
import type { AdminRole } from "@/modules/core";
import type { Vehicle, VehiclePhoto, VehicleStatus } from "@/modules/vehicles/types";

type FormState = {
  brand: string;
  model: string;
  version: string;
  year: string;
  mileage: string;
  vehicle_type: string;
  transmission: string;
  fuel: string;
  current_location: string;
  price_usd: string;
  purchase_price_usd: string;
  color: string;
  description: string;
  status: Vehicle["status"];
  is_published: boolean;
  main_photo_url: string;
};

type ValidationErrors = Partial<Record<keyof FormState, string>>;

const initialForm: FormState = {
  brand: "",
  model: "",
  version: "",
  year: "",
  mileage: "",
  vehicle_type: "Sedan",
  transmission: "Manual",
  fuel: "Nafta",
  current_location: "",
  price_usd: "",
  purchase_price_usd: "",
  color: "#0f766e",
  description: "",
  status: "en_preparacion",
  is_published: false,
  main_photo_url: ""
};

const publishedFilterOptions = [
  { value: "todos", label: "Todos" },
  { value: "publicados", label: "Publicados" },
  { value: "ocultos", label: "Ocultos" },
  { value: "catalogo", label: "Visibles en catalogo" },
  { value: "no_catalogo", label: "No visibles en catalogo" },
  { value: "sin_foto", label: "Sin foto" },
  { value: "sin_precio_compra", label: "Sin precio compra" }
];

const sortOptions = [
  { value: "recientes", label: "Mas nuevos" },
  { value: "precio_mayor", label: "Precio mayor" },
  { value: "precio_menor", label: "Precio menor" },
  { value: "estado", label: "Estado" }
];

function getCatalogVisibility(vehicle: Vehicle) {
  const visibleStatuses: VehicleStatus[] = ["disponible", "reservado"];

  if (!vehicle.is_published) {
    return {
      label: "Oculto manualmente",
      detail: "No aparece porque no esta publicado.",
      className: "status-badge"
    };
  }

  if (!visibleStatuses.includes(vehicle.status)) {
    return {
      label: "Publicado, no visible",
      detail: `No aparece porque el estado es ${vehicle.status.replace("_", " ")}.`,
      className: "status-badge warning"
    };
  }

  return {
    label: "Visible en catalogo",
    detail: "Aparece en Autos en venta.",
    className: "status-badge published"
  };
}

export function VehicleForm() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [savedForm, setSavedForm] = useState<FormState>(initialForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [currentPhotos, setCurrentPhotos] = useState<VehiclePhoto[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  const [mainPhotoPreview, setMainPhotoPreview] = useState("");
  const [galleryPreviews, setGalleryPreviews] = useState<Array<{ name: string; url: string }>>([]);
  const [filterSearch, setFilterSearch] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterPublished, setFilterPublished] = useState("todos");
  const [sortBy, setSortBy] = useState("recientes");
  const [role, setRole] = useState<AdminRole | null>(null);
  const mainPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const isOwner = role === "owner";

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
    loadRole();
  }, []);

  async function loadRole() {
    if (!supabase) {
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;

    if (!userId) {
      return;
    }

    const { data, error } = await supabase
      .from("admin_users")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (!error) {
      setRole((data?.role as AdminRole | undefined) || null);
    }
  }

  useEffect(() => {
    if (!photoFile) {
      setMainPhotoPreview("");
      return;
    }

    const objectUrl = URL.createObjectURL(photoFile);
    setMainPhotoPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [photoFile]);

  useEffect(() => {
    const previews = galleryFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file)
    }));

    setGalleryPreviews(previews);

    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [galleryFiles]);

  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(form) !== JSON.stringify(savedForm) || Boolean(photoFile) || galleryFiles.length > 0;
  }, [form, savedForm, photoFile, galleryFiles]);

  const filteredVehicles = useMemo(() => {
    const search = filterSearch.trim().toLowerCase();
    const locationSearch = filterLocation.trim().toLowerCase();

    return vehicles
      .filter((vehicle) => {
        const title = `${vehicle.brand} ${vehicle.model} ${vehicle.version || ""} ${vehicle.year}`.toLowerCase();
        const location = (vehicle.current_location || "").toLowerCase();
        const matchesSearch = !search || title.includes(search);
        const matchesLocation = !locationSearch || location.includes(locationSearch);
        const matchesStatus = filterStatus === "todos" || vehicle.status === filterStatus;
        const isCatalogVisible = vehicle.is_published && ["disponible", "reservado"].includes(vehicle.status);
        const matchesPublished =
          filterPublished === "todos" ||
          (filterPublished === "publicados" && vehicle.is_published) ||
          (filterPublished === "ocultos" && !vehicle.is_published) ||
          (filterPublished === "catalogo" && isCatalogVisible) ||
          (filterPublished === "no_catalogo" && !isCatalogVisible) ||
          (filterPublished === "sin_foto" && !vehicle.main_photo_url) ||
          (filterPublished === "sin_precio_compra" && isOwner && (!vehicle.purchase_price_usd || Number(vehicle.purchase_price_usd) <= 0));

        return matchesSearch && matchesLocation && matchesStatus && matchesPublished;
      })
      .sort((first, second) => {
        if (sortBy === "precio_mayor") {
          return Number(second.price_usd || 0) - Number(first.price_usd || 0);
        }

        if (sortBy === "precio_menor") {
          return Number(first.price_usd || 0) - Number(second.price_usd || 0);
        }

        if (sortBy === "estado") {
          return first.status.localeCompare(second.status);
        }

        return new Date(second.created_at).getTime() - new Date(first.created_at).getTime();
      });
  }, [vehicles, filterSearch, filterLocation, filterStatus, filterPublished, sortBy, isOwner]);

  function updateField(name: keyof FormState, value: string | boolean) {
    setForm((current) => ({ ...current, [name]: value }));
    setValidationErrors((current) => {
      if (!current[name]) {
        return current;
      }

      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function fieldClass(name: keyof FormState) {
    return validationErrors[name] ? "field-error" : "";
  }

  function validateForm() {
    const errors: ValidationErrors = {};
    const year = Number(form.year);
    const mileage = Number(form.mileage);
    const priceUsd = Number(form.price_usd);
    const purchasePriceUsd = Number(form.purchase_price_usd);
    const nextYear = new Date().getFullYear() + 1;

    if (!form.brand.trim()) {
      errors.brand = "La marca es obligatoria.";
    }

    if (!form.model.trim()) {
      errors.model = "El modelo es obligatorio.";
    }

    if (!form.year || !Number.isFinite(year) || year < 1900 || year > nextYear) {
      errors.year = `Usa un año entre 1900 y ${nextYear}.`;
    }

    if (!form.mileage || !Number.isFinite(mileage) || mileage < 0) {
      errors.mileage = "Revisa el kilometraje.";
    }

    if (!form.price_usd || !Number.isFinite(priceUsd) || priceUsd <= 0) {
      errors.price_usd = "El precio publicado es obligatorio.";
    }

    if (isOwner && form.purchase_price_usd && (!Number.isFinite(purchasePriceUsd) || purchasePriceUsd < 0)) {
      errors.purchase_price_usd = "El precio de compra no puede ser negativo.";
    }

    return errors;
  }

  function updatePhotoFile(file: File | null) {
    if (!file) {
      return;
    }

    setPhotoFile(file);
  }

  function updateGalleryFiles(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }

    setGalleryFiles(Array.from(files));
  }

  function removeMainPhotoFile() {
    setPhotoFile(null);

    if (mainPhotoInputRef.current) {
      mainPhotoInputRef.current.value = "";
    }
  }

  function removeGalleryFile(indexToRemove: number) {
    setGalleryFiles((current) => current.filter((_, index) => index !== indexToRemove));

    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
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
    setSavedForm(initialForm);
    setPhotoFile(null);
    setGalleryFiles([]);
    if (mainPhotoInputRef.current) {
      mainPhotoInputRef.current.value = "";
    }
    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
    setCurrentPhotos([]);
    setEditingId(null);
    setMessage("");
    setValidationErrors({});
  }

  async function editVehicle(vehicle: Vehicle) {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm("Tenes cambios sin guardar. Si editas otro vehiculo ahora, esos cambios se pierden. Queres continuar?");

      if (!confirmed) {
        return;
      }
    }

    const nextForm = {
      brand: vehicle.brand || "",
      model: vehicle.model || "",
      version: vehicle.version || "",
      year: String(vehicle.year || ""),
      mileage: String(vehicle.mileage || ""),
      vehicle_type: vehicle.vehicle_type || "Sedan",
      transmission: vehicle.transmission || "Manual",
      fuel: vehicle.fuel || "Nafta",
      current_location: vehicle.current_location || "",
      price_usd: String(vehicle.price_usd || ""),
      purchase_price_usd: vehicle.purchase_price_usd ? String(vehicle.purchase_price_usd) : "",
      color: vehicle.color || "#0f766e",
      description: vehicle.description || "",
      status: vehicle.status || "en_preparacion",
      is_published: vehicle.is_published || false,
      main_photo_url: vehicle.main_photo_url || ""
    };

    setEditingId(vehicle.id);
    setForm(nextForm);
    setSavedForm(nextForm);
    setPhotoFile(null);
    setGalleryFiles([]);
    setValidationErrors({});
    if (mainPhotoInputRef.current) {
      mainPhotoInputRef.current.value = "";
    }
    if (galleryInputRef.current) {
      galleryInputRef.current.value = "";
    }
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

    const errors = validateForm();
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      setMessage("Revisa los campos marcados en rojo antes de guardar.");
      setLoading(false);
      return;
    }

    if (!form.brand.trim() || !form.model.trim()) {
      setMessage("Marca y modelo son obligatorios.");
      setLoading(false);
      return;
    }

    if (Number(form.year) <= 0 || Number(form.mileage) < 0 || Number(form.price_usd) <= 0) {
      setMessage("Revisa año, kilometraje y precio publicado. Tienen que ser numeros validos.");
      setLoading(false);
      return;
    }

    const payload = {
      brand: form.brand.trim(),
      model: form.model.trim(),
      version: form.version.trim() || null,
      year: Number(form.year),
      mileage: Number(form.mileage),
      vehicle_type: form.vehicle_type,
      transmission: form.transmission,
      fuel: form.fuel || null,
      current_location: form.current_location.trim() || null,
      price_usd: Number(form.price_usd),
      purchase_price_usd: form.purchase_price_usd ? Number(form.purchase_price_usd) : null,
      color: form.color,
      description: form.description.trim() || null,
      status: form.status,
      is_published: form.is_published,
      main_photo_url: form.main_photo_url || null
    };

    if (!isOwner) {
      delete (payload as Partial<Vehicle>).purchase_price_usd;
    }

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
      setSavedForm(initialForm);
      setPhotoFile(null);
      setGalleryFiles([]);
      if (mainPhotoInputRef.current) {
        mainPhotoInputRef.current.value = "";
      }
      if (galleryInputRef.current) {
        galleryInputRef.current.value = "";
      }
      setCurrentPhotos([]);
      setEditingId(null);
      setValidationErrors({});
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
      <form className="vehicle-form" onSubmit={handleSubmit} noValidate>
        <div className="wide-field form-title-row">
          <div>
            <h2>{editingId ? "Editar vehiculo" : "Agregar vehiculo"}</h2>
            <p>{editingId ? "Estas modificando un auto ya cargado." : "Carga una unidad nueva al stock interno."}</p>
          </div>
          {editingId ? (
            <button className="button secondary" type="button" onClick={resetForm}>
              Cancelar edicion
            </button>
          ) : null}
        </div>
        <div className="compact-field-grid compact-field-grid-main wide-field">
          <label className={fieldClass("brand")}>
            Marca
            <input value={form.brand} onChange={(event) => updateField("brand", event.target.value)} aria-invalid={Boolean(validationErrors.brand)} />
            {validationErrors.brand ? <span className="field-error-message">{validationErrors.brand}</span> : null}
          </label>
          <label className={fieldClass("model")}>
            Modelo
            <input value={form.model} onChange={(event) => updateField("model", event.target.value)} aria-invalid={Boolean(validationErrors.model)} />
            {validationErrors.model ? <span className="field-error-message">{validationErrors.model}</span> : null}
          </label>
          <label>
            Version
            <input value={form.version} onChange={(event) => updateField("version", event.target.value)} />
          </label>
          <label className={fieldClass("year")}>
            Año
            <input type="number" value={form.year} onChange={(event) => updateField("year", event.target.value)} aria-invalid={Boolean(validationErrors.year)} />
            {validationErrors.year ? <span className="field-error-message">{validationErrors.year}</span> : null}
          </label>
          <label className={fieldClass("mileage")}>
            Kilometraje
            <input type="number" value={form.mileage} onChange={(event) => updateField("mileage", event.target.value)} aria-invalid={Boolean(validationErrors.mileage)} />
            {validationErrors.mileage ? <span className="field-error-message">{validationErrors.mileage}</span> : null}
          </label>
        </div>
        <div className="compact-field-grid wide-field">
          <label>
            Tipo
            <select value={form.vehicle_type} onChange={(event) => updateField("vehicle_type", event.target.value)}>
              {vehicleTypeOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label>
            Transmision
            <select value={form.transmission} onChange={(event) => updateField("transmission", event.target.value)}>
              {transmissionOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label>
            Combustible
            <select value={form.fuel} onChange={(event) => updateField("fuel", event.target.value)}>
              {fuelOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label>
            Ubicacion actual
            <input value={form.current_location} onChange={(event) => updateField("current_location", event.target.value)} placeholder="Ej: Agencia Centro" />
          </label>
        </div>
        <div className="compact-field-grid wide-field">
          <label className={fieldClass("price_usd")}>
            Precio publicado USD
            <input type="number" value={form.price_usd} onChange={(event) => updateField("price_usd", event.target.value)} aria-invalid={Boolean(validationErrors.price_usd)} />
            {validationErrors.price_usd ? <span className="field-error-message">{validationErrors.price_usd}</span> : null}
          </label>
          {isOwner ? (
            <label className={`${fieldClass("purchase_price_usd")} owner-internal-field ${editingId ? "owner-internal-field-editing" : ""}`}>
              Precio compra USD
              <input
                type="number"
                value={form.purchase_price_usd}
                onChange={(event) => updateField("purchase_price_usd", event.target.value)}
                aria-invalid={Boolean(validationErrors.purchase_price_usd)}
              />
              {validationErrors.purchase_price_usd ? <span className="field-error-message">{validationErrors.purchase_price_usd}</span> : null}
            </label>
          ) : null}
        </div>
        <div className="compact-field-grid wide-field">
          <label className={`status-control status-${form.status}`}>
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
            Color de respaldo
            <input type="color" value={form.color} onChange={(event) => updateField("color", event.target.value)} />
            <span className="field-help">Se usa solo si el auto no tiene foto.</span>
          </label>
        </div>
        <div className="photo-field wide-field">
          <label>
            Foto principal
            <input
              accept="image/jpeg,image/png,image/webp"
              ref={mainPhotoInputRef}
              type="file"
              onChange={(event) => updatePhotoFile(event.target.files?.[0] || null)}
            />
          </label>
          {photoFile ? <p>Foto seleccionada: {photoFile.name}</p> : null}
          {mainPhotoPreview ? (
            <div className="photo-preview selected-photo-preview">
              <img src={mainPhotoPreview} alt="Vista previa de la foto principal" />
              <button className="button danger" type="button" onClick={removeMainPhotoFile}>
                Quitar foto seleccionada
              </button>
            </div>
          ) : form.main_photo_url ? (
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
              ref={galleryInputRef}
              type="file"
              onChange={(event) => updateGalleryFiles(event.target.files)}
            />
          </label>
          {galleryFiles.length > 0 ? <p>{galleryFiles.length} foto{galleryFiles.length === 1 ? "" : "s"} seleccionada{galleryFiles.length === 1 ? "" : "s"} para galeria.</p> : null}
          {galleryPreviews.length > 0 ? (
            <div className="admin-photo-grid">
              {galleryPreviews.map((preview, index) => (
                <article key={preview.url}>
                  <img src={preview.url} alt={`Vista previa de ${preview.name}`} />
                  <p>{preview.name}</p>
                  <button className="button danger" type="button" onClick={() => removeGalleryFile(index)}>
                    Quitar
                  </button>
                </article>
              ))}
            </div>
          ) : null}
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
          <button className="button secondary" type="button" onClick={resetForm}>
            Limpiar
          </button>
          {hasUnsavedChanges ? <span className="unsaved-hint">Cambios sin guardar</span> : null}
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
            <p>Edita, filtra, elimina o cambia la publicacion sin entrar a Supabase.</p>
          </div>
        </div>

        <div className="vehicle-filters">
          <label>
            Buscar
            <input value={filterSearch} onChange={(event) => setFilterSearch(event.target.value)} placeholder="Marca, modelo, version o año" />
          </label>
          <label>
            Ubicacion
            <input value={filterLocation} onChange={(event) => setFilterLocation(event.target.value)} placeholder="Agencia, deposito o zona" />
          </label>
          <label>
            Estado
            <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
              <option value="todos">Todos</option>
              {vehicleStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Publicacion
            <select value={filterPublished} onChange={(event) => setFilterPublished(event.target.value)}>
              {publishedFilterOptions
                .filter((option) => option.value !== "sin_precio_compra" || isOwner)
                .map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Orden
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {vehicles.length === 0 ? (
          <p className="empty-state">Todavia no hay vehiculos cargados.</p>
        ) : filteredVehicles.length === 0 ? (
          <p className="empty-state">No hay vehiculos que coincidan con esos filtros.</p>
        ) : (
          <div className="vehicle-list">
            {filteredVehicles.map((vehicle) => {
              const title = `${vehicle.brand} ${vehicle.model}${vehicle.version ? ` ${vehicle.version}` : ""}`;
              const catalogVisibility = getCatalogVisibility(vehicle);

              return (
                <article className="vehicle-row" key={vehicle.id}>
                  <div>
                    <h3>{title}</h3>
                    <p>
                      {vehicle.year} - {formatKm(vehicle.mileage)} - {vehicle.vehicle_type} - {vehicle.status.replace("_", " ")}
                    </p>
                    {vehicle.current_location ? <p className="vehicle-location">Ubicacion: {vehicle.current_location}</p> : null}
                  </div>
                  <div className="vehicle-row-alerts">
                    {vehicle.main_photo_url ? <span className="status-badge published">Con foto</span> : <span className="status-badge warning strong">Sin foto</span>}
                    {isOwner && (!vehicle.purchase_price_usd || Number(vehicle.purchase_price_usd) <= 0) ? (
                      <span className="status-badge warning">Sin precio compra</span>
                    ) : null}
                  </div>
                  <strong>{formatUsd(vehicle.price_usd)}</strong>
                  <label className={`quick-status status-control status-${vehicle.status}`}>
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
                  <div className="catalog-visibility">
                    <span className={catalogVisibility.className}>{catalogVisibility.label}</span>
                    <p>{catalogVisibility.detail}</p>
                  </div>
                  <div className="row-actions">
                    <button className="button action-edit" type="button" onClick={() => editVehicle(vehicle)}>
                      Editar
                    </button>
                    <button className={vehicle.is_published ? "button action-hide" : "button action-publish"} type="button" onClick={() => togglePublished(vehicle)}>
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
