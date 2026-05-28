"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Sale, Vehicle, VehicleExpense } from "@/types/vehicle";

const expenseCategories = [
  "Mecanica",
  "Chapa y pintura",
  "Lavado/detailing",
  "Gestoria",
  "Transferencia",
  "Publicidad",
  "Comision",
  "Cubiertas",
  "Bateria",
  "Otros"
];

function vehicleLabel(vehicle?: Pick<Vehicle, "brand" | "model" | "version" | "year"> | null) {
  if (!vehicle) {
    return "Sin vehiculo";
  }

  return `${vehicle.brand} ${vehicle.model}${vehicle.version ? ` ${vehicle.version}` : ""} ${vehicle.year}`;
}

function formatMoney(amount: number | string, currency: string) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(Number(amount || 0));
}

export function ExpensesPanel() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [expenses, setExpenses] = useState<VehicleExpense[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [exchangeRate, setExchangeRate] = useState("1000");
  const [vehicleId, setVehicleId] = useState("");
  const [category, setCategory] = useState(expenseCategories[0]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"ARS" | "USD">("ARS");
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [filterVehicleId, setFilterVehicleId] = useState("todos");
  const [filterCategory, setFilterCategory] = useState("todas");
  const [filterCurrency, setFilterCurrency] = useState("todas");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [filterSearch, setFilterSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadData() {
    if (!supabase) {
      setMessage("Falta configurar Supabase.");
      return;
    }

    const [vehiclesResult, expensesResult, salesResult] = await Promise.all([
      supabase.from("vehicles").select("*").order("created_at", { ascending: false }),
      supabase
        .from("vehicle_expenses")
        .select("*, vehicles(brand, model, version, year)")
        .order("expense_date", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("sales")
        .select("*")
        .neq("operation_status", "cancelado")
        .order("sale_date", { ascending: false })
        .order("created_at", { ascending: false })
    ]);

    if (vehiclesResult.error) {
      setMessage(`No pude cargar vehiculos: ${vehiclesResult.error.message}`);
      return;
    }

    if (expensesResult.error) {
      setMessage(`No pude cargar gastos: ${expensesResult.error.message}`);
      return;
    }

    if (salesResult.error) {
      setMessage(`No pude cargar ventas: ${salesResult.error.message}`);
      return;
    }

    const nextVehicles = vehiclesResult.data || [];
    setVehicles(nextVehicles);
    setExpenses(expensesResult.data || []);
    setSales(salesResult.data || []);

    if (!vehicleId && nextVehicles.length > 0) {
      setVehicleId(nextVehicles[0].id);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const savedRate = window.localStorage.getItem("andicars_exchange_rate");

    if (savedRate) {
      setExchangeRate(savedRate);
    }
  }, []);

  function updateExchangeRate(value: string) {
    setExchangeRate(value);
    window.localStorage.setItem("andicars_exchange_rate", value);
  }

  const exchangeRateNumber = Number(exchangeRate || 0);
  const canConvertArs = exchangeRateNumber > 0;

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesVehicle = filterVehicleId === "todos" || expense.vehicle_id === filterVehicleId;
      const matchesCategory = filterCategory === "todas" || expense.category === filterCategory;
      const matchesCurrency = filterCurrency === "todas" || expense.currency === filterCurrency;
      const matchesFrom = !filterFromDate || expense.expense_date >= filterFromDate;
      const matchesTo = !filterToDate || expense.expense_date <= filterToDate;
      const normalizedSearch = filterSearch.trim().toLowerCase();
      const searchableText = [
        expense.category,
        expense.description,
        expense.currency,
        vehicleLabel(expense.vehicles)
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);

      return matchesVehicle && matchesCategory && matchesCurrency && matchesFrom && matchesTo && matchesSearch;
    });
  }, [expenses, filterVehicleId, filterCategory, filterCurrency, filterFromDate, filterToDate, filterSearch]);

  const totals = useMemo(() => {
    const partialTotals = filteredExpenses.reduce(
      (summary, expense) => {
        if (expense.currency === "USD") {
          summary.usd += Number(expense.amount || 0);
        } else {
          summary.ars += Number(expense.amount || 0);
        }

        return summary;
      },
      { ars: 0, usd: 0 }
    );

    return {
      ...partialTotals,
      usdEquivalent: partialTotals.usd + (canConvertArs ? partialTotals.ars / exchangeRateNumber : 0)
    };
  }, [filteredExpenses, canConvertArs, exchangeRateNumber]);

  const vehicleSummaries = useMemo(() => {
    return vehicles.map((vehicle) => {
      const vehicleExpenses = expenses.filter((expense) => expense.vehicle_id === vehicle.id);
      const vehicleSale = sales.find((sale) => sale.vehicle_id === vehicle.id);
      const arsExpenses = vehicleExpenses
        .filter((expense) => expense.currency === "ARS")
        .reduce((total, expense) => total + Number(expense.amount || 0), 0);
      const usdExpenses = vehicleExpenses
        .filter((expense) => expense.currency === "USD")
        .reduce((total, expense) => total + Number(expense.amount || 0), 0);
      const purchasePrice = Number(vehicle.purchase_price_usd || 0);
      const publishedPrice = Number(vehicle.price_usd || 0);
      const realSalePrice = vehicleSale ? Number(vehicleSale.sale_price_usd || 0) : null;
      const salePriceForMargin = realSalePrice ?? publishedPrice;
      const depositUsd = vehicleSale ? Number(vehicleSale.deposit_usd || 0) : 0;
      const pendingBalanceUsd = realSalePrice !== null ? Math.max(realSalePrice - depositUsd, 0) : null;
      const totalExpensesUsd = usdExpenses + (canConvertArs ? arsExpenses / exchangeRateNumber : 0);
      const profitUsd = purchasePrice > 0 ? salePriceForMargin - purchasePrice - totalExpensesUsd : null;

      return {
        vehicle,
        sale: vehicleSale || null,
        arsExpenses,
        usdExpenses,
        totalExpensesUsd,
        publishedPrice,
        realSalePrice,
        depositUsd,
        pendingBalanceUsd,
        profitUsd
      };
    });
  }, [vehicles, expenses, sales, canConvertArs, exchangeRateNumber]);

  function clearFilters() {
    setFilterVehicleId("todos");
    setFilterCategory("todas");
    setFilterCurrency("todas");
    setFilterFromDate("");
    setFilterToDate("");
    setFilterSearch("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setMessage("Falta configurar Supabase.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("vehicle_expenses").insert({
      vehicle_id: vehicleId,
      category,
      description: description || null,
      amount: Number(amount),
      currency,
      expense_date: expenseDate
    });

    if (error) {
      setMessage(`No se pudo guardar el gasto: ${error.message}`);
      setLoading(false);
      return;
    }

    setDescription("");
    setAmount("");
    setCurrency("ARS");
    setExpenseDate(new Date().toISOString().slice(0, 10));
    setMessage("Gasto guardado.");
    setLoading(false);
    await loadData();
  }

  async function deleteExpense(expense: VehicleExpense) {
    if (!supabase) {
      setMessage("Falta configurar Supabase.");
      return;
    }

    const confirmed = window.confirm("Eliminar este gasto?");

    if (!confirmed) {
      return;
    }

    const { error } = await supabase.from("vehicle_expenses").delete().eq("id", expense.id);

    if (error) {
      setMessage(`No se pudo eliminar: ${error.message}`);
      return;
    }

    setMessage("Gasto eliminado.");
    await loadData();
  }

  return (
    <div className="expenses-layout">
      <form className="vehicle-form" onSubmit={handleSubmit}>
        <div className="wide-field form-title-row">
          <div>
            <h2>Cargar gasto</h2>
            <p>Asocia cada gasto al vehiculo correspondiente.</p>
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
          Categoria
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {expenseCategories.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>

        <label>
          Fecha
          <input type="date" value={expenseDate} onChange={(event) => setExpenseDate(event.target.value)} required />
        </label>

        <label>
          Monto
          <input type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} required />
        </label>

        <label>
          Moneda
          <select value={currency} onChange={(event) => setCurrency(event.target.value as "ARS" | "USD")}>
            <option value="ARS">ARS</option>
            <option value="USD">USD</option>
          </select>
        </label>

        <label className="wide-field">
          Detalle
          <textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Ej: Cambio de cubiertas delanteras" />
        </label>

        <div className="form-actions wide-field">
          <button className="button primary" type="submit" disabled={loading || vehicles.length === 0}>
            {loading ? "Guardando..." : "Guardar gasto"}
          </button>
        </div>
        {message ? <p className="form-message wide-field">{message}</p> : null}
      </form>

      <aside className="summary-section">
        <h2>Total cargado</h2>
        <label className="exchange-rate-field">
          Dolar usado para convertir ARS
          <input
            type="number"
            min="1"
            step="0.01"
            value={exchangeRate}
            onChange={(event) => updateExchangeRate(event.target.value)}
          />
        </label>
        <div className="expense-total">
          <span>ARS</span>
          <strong>{formatMoney(totals.ars, "ARS")}</strong>
        </div>
        <div className="expense-total">
          <span>USD</span>
          <strong>{formatMoney(totals.usd, "USD")}</strong>
        </div>
        <div className="expense-total highlighted-total">
          <span>Total convertido a USD</span>
          <strong>{canConvertArs ? formatMoney(totals.usdEquivalent, "USD") : "Sin cotizacion"}</strong>
        </div>
      </aside>

      <section className="admin-stock wide-admin-section">
        <div className="stock-header">
          <div>
            <h2>Gastos cargados</h2>
            <p>Control inicial de inversion por vehiculo.</p>
          </div>
          <button className="button light" type="button" onClick={loadData}>
            Actualizar
          </button>
        </div>

        <div className="expense-filters">
          <label>
            Buscar
            <input
              type="search"
              value={filterSearch}
              onChange={(event) => setFilterSearch(event.target.value)}
              placeholder="Detalle, categoria o auto"
            />
          </label>
          <label>
            Vehiculo
            <select value={filterVehicleId} onChange={(event) => setFilterVehicleId(event.target.value)}>
              <option value="todos">Todos</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicleLabel(vehicle)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Categoria
            <select value={filterCategory} onChange={(event) => setFilterCategory(event.target.value)}>
              <option value="todas">Todas</option>
              {expenseCategories.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label>
            Moneda
            <select value={filterCurrency} onChange={(event) => setFilterCurrency(event.target.value)}>
              <option value="todas">Todas</option>
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>
          </label>
          <label>
            Desde
            <input type="date" value={filterFromDate} onChange={(event) => setFilterFromDate(event.target.value)} />
          </label>
          <label>
            Hasta
            <input type="date" value={filterToDate} onChange={(event) => setFilterToDate(event.target.value)} />
          </label>
          <button className="button light" type="button" onClick={clearFilters}>
            Limpiar filtros
          </button>
        </div>

        {expenses.length === 0 ? (
          <p className="empty-state">Todavia no hay gastos cargados.</p>
        ) : filteredExpenses.length === 0 ? (
          <p className="empty-state">No hay gastos con esos filtros.</p>
        ) : (
          <div className="expense-list">
            {filteredExpenses.map((expense) => (
              <article className="expense-row" key={expense.id}>
                <div>
                  <h3>{expense.category}</h3>
                  <p>{vehicleLabel(expense.vehicles)} - {expense.expense_date}</p>
                  {expense.description ? <p>{expense.description}</p> : null}
                </div>
                <strong>{formatMoney(expense.amount, expense.currency)}</strong>
                <button className="button danger" type="button" onClick={() => deleteExpense(expense)}>
                  Eliminar
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="admin-stock wide-admin-section">
        <div className="stock-header">
          <div>
            <h2>Resumen por vehiculo</h2>
            <p>Rentabilidad usando ventas reales cuando existen, o precio publicado si todavia no hay operacion.</p>
          </div>
        </div>

        <div className="profit-list">
          {vehicleSummaries.map((summary) => (
            <article className="profit-row" key={summary.vehicle.id}>
              <div>
                <h3>{vehicleLabel(summary.vehicle)}</h3>
                <p>Estado: {summary.vehicle.status.replace("_", " ")}</p>
              </div>
              <div>
                <span>Compra</span>
                <strong>{summary.vehicle.purchase_price_usd ? formatMoney(summary.vehicle.purchase_price_usd, "USD") : "Sin dato"}</strong>
              </div>
              <div>
                <span>Publicado</span>
                <strong>{formatMoney(summary.publishedPrice, "USD")}</strong>
              </div>
              <div>
                <span>Operacion</span>
                <strong>{summary.realSalePrice === null ? "Sin venta" : formatMoney(summary.realSalePrice, "USD")}</strong>
                {summary.sale ? <p>{summary.sale.operation_status}</p> : null}
              </div>
              <div>
                <span>Gastos</span>
                <strong>{formatMoney(summary.usdExpenses, "USD")}</strong>
                <p>{formatMoney(summary.arsExpenses, "ARS")}</p>
              </div>
              <div>
                <span>Gastos en USD total</span>
                <strong>{canConvertArs ? formatMoney(summary.totalExpensesUsd, "USD") : "Sin cotizacion"}</strong>
              </div>
              <div>
                <span>Sena</span>
                <strong>{summary.sale ? formatMoney(summary.depositUsd, "USD") : "Sin dato"}</strong>
                {summary.pendingBalanceUsd !== null ? <p>Saldo {formatMoney(summary.pendingBalanceUsd, "USD")}</p> : null}
              </div>
              <div>
                <span>{summary.sale ? "Ganancia real" : "Margen estimado"}</span>
                <strong className={summary.profitUsd !== null && summary.profitUsd < 0 ? "negative-money" : ""}>
                  {summary.profitUsd === null ? "Falta compra" : formatMoney(summary.profitUsd, "USD")}
                </strong>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
