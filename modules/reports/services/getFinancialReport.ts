import type { VehicleExpense } from "@/modules/expenses/types";
import type { Sale } from "@/modules/sales/types";

export function getFinancialReport(expenses: VehicleExpense[], sales: Sale[]) {
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const totalSales = sales.reduce((sum, sale) => sum + Number(sale.sale_price_usd || 0), 0);

  return { totalExpenses, totalSales };
}
