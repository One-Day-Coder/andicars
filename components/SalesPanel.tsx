"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Sale, SaleStatus, Vehicle, VehicleStatus } from "@/types/vehicle";

const saleStatuses: { value: SaleStatus; label: string }[] = [
  { value: "reservado", label: "Reservado" },
  { value: "senado", label: "Senado" },
  { value: "vendido", label: "Vendido" },
  { value: "entregado", label: "Entregado" },
  { value: "cancelado", label: "Cancelado" }
];

function vehicleLabel(vehicle?: Pick<Vehicle, "brand" | "model" | "version" | "year"> | null) {
  if (!vehicle) {
    return "Sin vehiculo";
  }

  return `${vehicle.brand} ${vehicle.model}${vehicle.version ? ` ${vehicle.version}` : ""} ${vehicle.year}`;
}

function formatMoney(amount: number | string) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(Number(amount || 0));
}

function statusLabel(status: SaleStatus) {
  return saleStatuses.find((option) => option.value === status)?.label || status;
}

function vehicleStatusFromSale(status: SaleStatus): VehicleStatus | null {
  switch (status) {
    case "reservado":
      return "reservado";
    case "senado":
      return "senado";
    case "vendido":
      return "vendido";
    case "entregado":
      return "entregado";
    case "cancelado":
      return null;
  }
}

export function SalesPanel() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [vehicleId, setVehicleId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [operationStatus, setOperationStatus] = useState<SaleStatus>("reservado");
  const [salePriceUsd, setSalePriceUsd] = useState("");
  const [depositUsd, setDepositUsd] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10));
  const [deliveryDate, setDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [filterStatus, setFilterStatus] = useState<"todos" | SaleStatus>("todos");
  const [filterSearch, setFilterSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadData() {
    if (!supabase) {
      setMessage("Falta configurar Supabase.");
      return;
    }

    const [vehiclesResult, salesResult] = await Promise.all([
      supabase.from("vehicles").select("*").order("created_at", { ascending: false }),
      supabase
        .from("sales")
        .select("*, vehicles(brand, model, version, year)")
        .order("sale_date", { ascending: false })
        .order("created_at", { ascending: false })
    ]);

    if (vehiclesResult.error) {
      setMessage(`No pude cargar vehiculos: ${vehiclesResult.error.message}`);
      return;
    }

    if (salesResult.error) {
      setMessage(`No pude cargar ventas: ${salesResult.error.message}`);
      return;
    }

    const nextVehicles = vehiclesResult.data || [];
    setVehicles(nextVehicles);
    setSales(salesResult.data || []);

    if (!vehicleId && nextVehicles.length > 0) {
      setVehicleId(nextVehicles[0].id);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === vehicleId);

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const matchesStatus = filterStatus === "todos" || sale.operation_status === filterStatus;
      const normalizedSearch = filterSearch.trim().toLowerCase();
      const searchableText = [
        sale.customer_name,
        sale.phone,
        sale.email,
        sale.payment_method,
        sale.notes,
        vehicleLabel(sale.vehicles)
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [sales, filterStatus, filterSearch]);

  const totals = useMemo(() => {
    return sales.reduce(
      (summary, sale) => {
        if (sale.operation_status !== "cancelado") {
          summary.totalSales += Number(sale.sale_price_usd || 0);
          summary.totalDeposits += Number(sale.deposit_usd || 0);
          summary.pendingBalance += Math.max(Number(sale.sale_price_usd || 0) - Number(sale.deposit_usd || 0), 0);
        }

        return summary;
      },
      { totalSales: 0, totalDeposits: 0, pendingBalance: 0 }
    );
  }, [sales]);

  function resetForm() {
    setCustomerName("");
    setPhone("");
    setEmail("");
    setOperationStatus("reservado");
    setSalePriceUsd("");
    setDepositUsd("");
    setPaymentMethod("");
    setSaleDate(new Date().toISOString().slice(0, 10));
    setDeliveryDate("");
    setNotes("");
  }

  async function updateVehicleStatus(nextVehicleId: string, nextStatus: SaleStatus) {
    const vehicleStatus = vehicleStatusFromSale(nextStatus);

    if (!vehicleStatus || !supabase) {
      return null;
    }

    return supabase.from("vehicles").update({ status: vehicleStatus }).eq("id", nextVehicleId);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setMessage("Falta configurar Supabase.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("sales").insert({
      vehicle_id: vehicleId,
      customer_name: customerName,
      phone: phone || null,
      email: email || null,
      operation_status: operationStatus,
      sale_price_usd: Number(salePriceUsd),
      deposit_usd: Number(depositUsd || 0),
      payment_method: paymentMethod || null,
      sale_date: saleDate,
      delivery_date: deliveryDate || null,
      notes: notes || null
    });

    if (error) {
      setMessage(`No se pudo guardar la operacion: ${error.message}`);
      setLoading(false);
      return;
    }

    const vehicleUpdate = await updateVehicleStatus(vehicleId, operationStatus);

    if (vehicleUpdate?.error) {
      setMessage(`Operacion guardada, pero no pude cambiar el estado del auto: ${vehicleUpdate.error.message}`);
      setLoading(false);
      await loadData();
      return;
    }

    resetForm();
    setMessage("Operacion guardada.");
    setLoading(false);
    await loadData();
  }

  async function changeSaleStatus(sale: Sale, nextStatus: SaleStatus) {
    if (!supabase) {
      setMessage("Falta configurar Supabase.");
      return;
    }

    const { error } = await supabase.from("sales").update({ operation_status: nextStatus }).eq("id", sale.id);

    if (error) {
      setMessage(`No se pudo cambiar el estado: ${error.message}`);
      return;
    }

    const vehicleUpdate = await updateVehicleStatus(sale.vehicle_id, nextStatus);

    if (vehicleUpdate?.error) {
      setMessage(`Estado de venta actualizado, pero no pude cambiar el auto: ${vehicleUpdate.error.message}`);
      await loadData();
      return;
    }

    setMessage("Estado actualizado.");
    await loadData();
  }

  async function deleteSale(sale: Sale) {
    if (!supabase) {
      setMessage("Falta configurar Supabase.");
      return;
    }

    const confirmed = window.confirm("Eliminar esta operacion? El auto no cambia de estado automaticamente.");

    if (!confirmed) {
      return;
    }

    const { error } = await supabase.from("sales").delete().eq("id", sale.id);

    if (error) {
      setMessage(`No se pudo eliminar: ${error.message}`);
      return;
    }

    setMessage("Operacion eliminada.");
    await loadData();
  }

  return (
    <div className="sales-layout">
      <form className="vehicle-form" onSubmit={handleSubmit}>
        <div className="wide-field form-title-row">
          <div>
            <h2>Cargar operacion</h2>
            <p>Registra reservas, senas, ventas y entregas por vehiculo.</p>
          </div>
        </div>

        <label className="wide-field">
          Vehiculo
          <select value={vehicleId} onChange={(event) => setVehicleId(event.target.value)} required>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicleLabel(vehicle)}
              </option>
            ))}
          </select>
        </label>

        <label>
          Cliente
          <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} required />
        </label>

        <label>
          Telefono
          <input value={phone} onChange={(event) => setPhone(event.target.value)} />
        </label>

        <label>
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>

        <label>
          Estado de operacion
          <select value={operationStatus} onChange={(event) => setOperationStatus(event.target.value as SaleStatus)}>
            {saleStatuses.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Precio acordado USD
          <input
            type="number"
            min="0"
            step="0.01"
            value={salePriceUsd}
            onChange={(event) => setSalePriceUsd(event.target.value)}
            placeholder={selectedVehicle ? String(selectedVehicle.price_usd) : ""}
            required
          />
        </label>

        <label>
          Sena / anticipo USD
          <input type="number" min="0" step="0.01" value={depositUsd} onChange={(event) => setDepositUsd(event.target.value)} />
        </label>

        <label>
          Fecha
          <input type="date" value={saleDate} onChange={(event) => setSaleDate(event.target.value)} required />
        </label>

        <label>
          Fecha de entrega
          <input type="date" value={deliveryDate} onChange={(event) => setDeliveryDate(event.target.value)} />
        </label>

        <label className="wide-field">
          Forma de pago
          <input value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} placeholder="Ej: efectivo, transferencia, financiado" />
        </label>

        <label className="wide-field">
          Notas
          <textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Ej: entrega pendiente de documentacion" />
        </label>

        <div className="form-actions wide-field">
          <button className="button primary" type="submit" disabled={loading || vehicles.length === 0}>
            {loading ? "Guardando..." : "Guardar operacion"}
          </button>
        </div>
        {message ? <p className="form-message wide-field">{message}</p> : null}
      </form>

      <aside className="summary-section">
        <h2>Resumen ventas</h2>
        <div className="expense-total">
          <span>Operaciones</span>
          <strong>{sales.length}</strong>
        </div>
        <div className="expense-total">
          <span>Total acordado</span>
          <strong>{formatMoney(totals.totalSales)}</strong>
        </div>
        <div className="expense-total">
          <span>Senas cobradas</span>
          <strong>{formatMoney(totals.totalDeposits)}</strong>
        </div>
        <div className="expense-total highlighted-total">
          <span>Saldo pendiente</span>
          <strong>{formatMoney(totals.pendingBalance)}</strong>
        </div>
      </aside>

      <section className="admin-stock wide-admin-section">
        <div className="stock-header">
          <div>
            <h2>Operaciones cargadas</h2>
            <p>Control de reservas, senas, ventas y entregas.</p>
          </div>
          <button className="button light" type="button" onClick={loadData}>
            Actualizar
          </button>
        </div>

        <div className="sale-filters">
          <label>
            Buscar
            <input
              type="search"
              value={filterSearch}
              onChange={(event) => setFilterSearch(event.target.value)}
              placeholder="Cliente, telefono, auto o nota"
            />
          </label>
          <label>
            Estado
            <select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value as "todos" | SaleStatus)}>
              <option value="todos">Todos</option>
              {saleStatuses.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {sales.length === 0 ? (
          <p className="empty-state">Todavia no hay operaciones cargadas.</p>
        ) : filteredSales.length === 0 ? (
          <p className="empty-state">No hay operaciones con esos filtros.</p>
        ) : (
          <div className="sale-list">
            {filteredSales.map((sale) => {
              const balance = Math.max(Number(sale.sale_price_usd || 0) - Number(sale.deposit_usd || 0), 0);

              return (
                <article className="sale-row" key={sale.id}>
                  <div>
                    <span className="status-badge published">{statusLabel(sale.operation_status)}</span>
                    <h3>{sale.customer_name}</h3>
                    <p>{vehicleLabel(sale.vehicles)} - {sale.sale_date}</p>
                    <p>{[sale.phone, sale.email].filter(Boolean).join(" - ")}</p>
                    {sale.notes ? <p>{sale.notes}</p> : null}
                  </div>
                  <div className="sale-money">
                    <span>Precio</span>
                    <strong>{formatMoney(sale.sale_price_usd)}</strong>
                    <span>Sena</span>
                    <strong>{formatMoney(sale.deposit_usd)}</strong>
                    <span>Saldo</span>
                    <strong>{formatMoney(balance)}</strong>
                  </div>
                  <label className="quick-status">
                    Estado
                    <select value={sale.operation_status} onChange={(event) => changeSaleStatus(sale, event.target.value as SaleStatus)}>
                      {saleStatuses.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button className="button danger" type="button" onClick={() => deleteSale(sale)}>
                    Eliminar
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
