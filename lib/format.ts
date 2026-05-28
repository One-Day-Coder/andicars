export function formatUsd(value: number | string | null) {
  const numericValue = Number(value || 0);

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(numericValue);
}

export function formatKm(value: number | string | null) {
  const numericValue = Number(value || 0);

  return `${new Intl.NumberFormat("es-AR").format(numericValue)} km`;
}
