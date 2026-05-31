"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Vehicle } from "@/modules/vehicles/types";
import type { VehicleExpense } from "@/modules/expenses/types";
import type { Sale } from "@/modules/sales/types";

function formatMoney(amount: number | string, currency: "ARS" | "USD") {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(Number(amount || 0));
}

function vehicleLabel(vehicle: Pick<Vehicle, "brand" | "model" | "version" | "year">) {
  return `${vehicle.brand} ${vehicle.model}${vehicle.version ? ` ${vehicle.version}` : ""} ${vehicle.year}`;
}

export function ReportsPanel() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [expenses, setExpenses] = useState<VehicleExpense[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [exchangeRate, setExchangeRate] = useState("1000");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    if (!supabase) {
      setMessage("Falta configurar Supabase.");
      setLoading(false);
      return;
    }

    setLoading(true);

    const [vehiclesResult, expensesResult, salesResult] = await Promise.all([
      supabase.from("vehicles").select("*").order("created_at", { ascending: false }),
      supabase.from("vehicle_expenses").select("*"),
      supabase.from("sales").select("*").neq("operation_status", "cancelado")
    ]);

    if (vehiclesResult.error) {
      setMessage(`No pude cargar vehiculos: ${vehiclesResult.error.message}`);
      setLoading(false);
      return;
    }

    if (expensesResult.error) {
      setMessage(`No pude cargar gastos: ${expensesResult.error.message}`);
      setLoading(false);
      return;
    }

    if (salesResult.error) {
      setMessage(`No pude cargar ventas: ${salesResult.error.message}`);
      setLoading(false);
      return;
    }

    setVehicles(vehiclesResult.data || []);
    setExpenses(expensesResult.data || []);
    setSales(salesResult.data || []);
    setMessage("");
    setLoading(false);
  }

  useEffect(() => {
    const savedRate = window.localStorage.getItem("andicars_exchange_rate");

    if (savedRate) {
      setExchangeRate(savedRate);
    }

    loadData();
  }, []);

  function updateExchangeRate(value: string) {
    setExchangeRate(value);
    window.localStorage.setItem("andicars_exchange_rate", value);
  }

  const exchangeRateNumber = Number(exchangeRate || 0);
  const canConvertArs = exchangeRateNumber > 0;

  const report = useMemo(() => {
    const activeSales = sales.filter((sale) => sale.operation_status !== "cancelado");
    const vehicleIdsWithSale = new Set(activeSales.map((sale) => sale.vehicle_id));
    const soldOrReservedVehicles = vehicles.filter((vehicle) => vehicleIdsWithSale.has(vehicle.id));
    const stockVehicles = vehicles.filter((vehicle) => !["vendido", "entregado"].includes(vehicle.status));

    const purchaseInvestmentUsd = vehicles.reduce((total, vehicle) => total + Number(vehicle.purchase_price_usd || 0), 0);
    const stockPurchaseInvestmentUsd = stockVehicles.reduce((total, vehicle) => total + Number(vehicle.purchase_price_usd || 0), 0);
    const publishedStockValueUsd = stockVehicles.reduce((total, vehicle) => total + Number(vehicle.price_usd || 0), 0);

    const expensesArs = expenses
      .filter((expense) => expense.currency === "ARS")
      .reduce((total, expense) => total + Number(expense.amount || 0), 0);
    const expensesUsd = expenses
      .filter((expense) => expense.currency === "USD")
      .reduce((total, expense) => total + Number(expense.amount || 0), 0);
    const expensesUsdEquivalent = expensesUsd + (canConvertArs ? expensesArs / exchangeRateNumber : 0);

    const salePriceUsd = activeSales.reduce((total, sale) => total + Number(sale.sale_price_usd || 0), 0);
    const depositsUsd = activeSales.reduce((total, sale) => total + Number(sale.deposit_usd || 0), 0);
    const pendingBalanceUsd = activeSales.reduce(
      (total, sale) => total + Math.max(Number(sale.sale_price_usd || 0) - Number(sale.deposit_usd || 0), 0),
      0
    );

    const soldPurchaseUsd = soldOrReservedVehicles.reduce((total, vehicle) => total + Number(vehicle.purchase_price_usd || 0), 0);
    const soldVehicleIds = new Set(soldOrReservedVehicles.map((vehicle) => vehicle.id));
    const expensesForSoldUsd = expenses
      .filter((expense) => soldVehicleIds.has(expense.vehicle_id))
      .reduce((total, expense) => {
        if (expense.currency === "USD") {
          return total + Number(expense.amount || 0);
        }

        return total + (canConvertArs ? Number(expense.amount || 0) / exchangeRateNumber : 0);
      }, 0);
    const realProfitUsd = salePriceUsd - soldPurchaseUsd - expensesForSoldUsd;

    const estimatedTotalProfitUsd = vehicles.reduce((total, vehicle) => {
      const sale = activeSales.find((item) => item.vehicle_id === vehicle.id);
      const vehicleExpensesUsd = expenses
        .filter((expense) => expense.vehicle_id === vehicle.id)
        .reduce((expenseTotal, expense) => {
          if (expense.currency === "USD") {
            return expenseTotal + Number(expense.amount || 0);
          }

          return expenseTotal + (canConvertArs ? Number(expense.amount || 0) / exchangeRateNumber : 0);
        }, 0);
      const incomeUsd = sale ? Number(sale.sale_price_usd || 0) : Number(vehicle.price_usd || 0);
      const purchaseUsd = Number(vehicle.purchase_price_usd || 0);

      if (!purchaseUsd) {
        return total;
      }

      return total + incomeUsd - purchaseUsd - vehicleExpensesUsd;
    }, 0);

    return {
      totalVehicles: vehicles.length,
      publishedVehicles: vehicles.filter((vehicle) => vehicle.is_published).length,
      hiddenVehicles: vehicles.filter((vehicle) => !vehicle.is_published).length,
      availableVehicles: vehicles.filter((vehicle) => vehicle.status === "disponible").length,
      reservedVehicles: vehicles.filter((vehicle) => ["reservado", "senado"].includes(vehicle.status)).length,
      soldVehicles: vehicles.filter((vehicle) => ["vendido", "entregado"].includes(vehicle.status)).length,
      purchaseInvestmentUsd,
      stockPurchaseInvestmentUsd,
      publishedStockValueUsd,
      expensesArs,
      expensesUsd,
      expensesUsdEquivalent,
      saleCount: activeSales.length,
      salePriceUsd,
      depositsUsd,
      pendingBalanceUsd,
      realProfitUsd,
      estimatedTotalProfitUsd
    };
  }, [vehicles, expenses, sales, canConvertArs, exchangeRateNumber]);

  const vehicleReports = useMemo(() => {
    return vehicles.map((vehicle) => {
      const sale = sales.find((item) => item.vehicle_id === vehicle.id && item.operation_status !== "cancelado");
      const vehicleExpenses = expenses.filter((expense) => expense.vehicle_id === vehicle.id);
      const expensesArs = vehicleExpenses
        .filter((expense) => expense.currency === "ARS")
        .reduce((total, expense) => total + Number(expense.amount || 0), 0);
      const expensesUsd = vehicleExpenses
        .filter((expense) => expense.currency === "USD")
        .reduce((total, expense) => total + Number(expense.amount || 0), 0);
      const totalExpensesUsd = expensesUsd + (canConvertArs ? expensesArs / exchangeRateNumber : 0);
      const incomeUsd = sale ? Number(sale.sale_price_usd || 0) : Number(vehicle.price_usd || 0);
      const purchaseUsd = Number(vehicle.purchase_price_usd || 0);
      const profitUsd = purchaseUsd ? incomeUsd - purchaseUsd - totalExpensesUsd : null;

      return {
        vehicle,
        sale,
        totalExpensesUsd,
        expensesArs,
        expensesUsd,
        incomeUsd,
        profitUsd
      };
    });
  }, [vehicles, expenses, sales, canConvertArs, exchangeRateNumber]);

  return (
    <div className="reports-layout">
      <section className="summary-section wide-admin-section">
        <div className="stock-header">
          <div>
            <h2>Resumen general</h2>
            <p>Vista completa de stock, operaciones, gastos y rentabilidad.</p>
          </div>
          <button className="button light" type="button" onClick={loadData}>
            Actualizar
          </button>
        </div>

        <label className="report-rate-field">
          Dolar usado para convertir ARS
          <input
            type="number"
            min="1"
            step="0.01"
            value={exchangeRate}
            onChange={(event) => updateExchangeRate(event.target.value)}
          />
        </label>

        {message ? <p className="form-message">{message}</p> : null}
        {loading ? <p className="empty-state">Cargando reportes...</p> : null}

        <div className="report-grid">
          <article>
            <span>Vehiculos</span>
            <strong>{report.totalVehicles}</strong>
            <p>{report.publishedVehicles} publicados / {report.hiddenVehicles} ocultos</p>
          </article>
          <article>
            <span>Stock activo</span>
            <strong>{report.availableVehicles}</strong>
            <p>{report.reservedVehicles} reservados o senados / {report.soldVehicles} vendidos</p>
          </article>
          <article>
            <span>Inversion compra</span>
            <strong>{formatMoney(report.purchaseInvestmentUsd, "USD")}</strong>
            <p>Stock actual: {formatMoney(report.stockPurchaseInvestmentUsd, "USD")}</p>
          </article>
          <article>
            <span>Valor publicado stock</span>
            <strong>{formatMoney(report.publishedStockValueUsd, "USD")}</strong>
            <p>Precio visible de autos no entregados</p>
          </article>
          <article>
            <span>Gastos totales</span>
            <strong>{canConvertArs ? formatMoney(report.expensesUsdEquivalent, "USD") : "Sin cotizacion"}</strong>
            <p>{formatMoney(report.expensesUsd, "USD")} + {formatMoney(report.expensesArs, "ARS")}</p>
          </article>
          <article>
            <span>Ventas / reservas</span>
            <strong>{report.saleCount}</strong>
            <p>Total acordado {formatMoney(report.salePriceUsd, "USD")}</p>
          </article>
          <article>
            <span>Senas cobradas</span>
            <strong>{formatMoney(report.depositsUsd, "USD")}</strong>
            <p>Saldo pendiente {formatMoney(report.pendingBalanceUsd, "USD")}</p>
          </article>
          <article>
            <span>Ganancia real</span>
            <strong className={report.realProfitUsd < 0 ? "negative-money" : ""}>{formatMoney(report.realProfitUsd, "USD")}</strong>
            <p>Solo operaciones cargadas</p>
          </article>
          <article className="highlighted-report">
            <span>Resultado proyectado</span>
            <strong className={report.estimatedTotalProfitUsd < 0 ? "negative-money" : ""}>
              {formatMoney(report.estimatedTotalProfitUsd, "USD")}
            </strong>
            <p>Ventas reales + stock a precio publicado</p>
          </article>
        </div>
      </section>

      <section className="admin-stock wide-admin-section">
        <div className="stock-header">
          <div>
            <h2>Detalle por vehiculo</h2>
            <p>La ganancia usa venta real si existe; si no, usa precio publicado.</p>
          </div>
        </div>

        <div className="report-list">
          {vehicleReports.map((item) => (
            <article className="report-row" key={item.vehicle.id}>
              <div>
                <h3>{vehicleLabel(item.vehicle)}</h3>
                <p>Estado: {item.vehicle.status.replace("_", " ")}</p>
              </div>
              <div>
                <span>Compra</span>
                <strong>{item.vehicle.purchase_price_usd ? formatMoney(item.vehicle.purchase_price_usd, "USD") : "Sin dato"}</strong>
              </div>
              <div>
                <span>Ingreso</span>
                <strong>{formatMoney(item.incomeUsd, "USD")}</strong>
                <p>{item.sale ? item.sale.operation_status : "precio publicado"}</p>
              </div>
              <div>
                <span>Gastos</span>
                <strong>{canConvertArs ? formatMoney(item.totalExpensesUsd, "USD") : "Sin cotizacion"}</strong>
                <p>{formatMoney(item.expensesUsd, "USD")} + {formatMoney(item.expensesArs, "ARS")}</p>
              </div>
              <div>
                <span>{item.sale ? "Ganancia" : "Margen"}</span>
                <strong className={item.profitUsd !== null && item.profitUsd < 0 ? "negative-money" : ""}>
                  {item.profitUsd === null ? "Falta compra" : formatMoney(item.profitUsd, "USD")}
                </strong>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
