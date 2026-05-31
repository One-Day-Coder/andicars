import type { Vehicle, VehicleStatus } from "@/modules/vehicles/types";

export const vehicleStatusOptions: Array<{ value: VehicleStatus; label: string }> = [
  { value: "en_preparacion", label: "En preparacion" },
  { value: "disponible", label: "Disponible" },
  { value: "reservado", label: "Reservado" },
  { value: "senado", label: "Senado" },
  { value: "vendido", label: "Vendido" },
  { value: "entregado", label: "Entregado" }
];

export const vehicleTypeOptions = ["Sedan", "Hatchback", "SUV", "Pickup"];

export const transmissionOptions = ["Manual", "Automatico"];

export const fuelOptions = ["Nafta", "Diesel", "Hibrido", "Electrico"];

export const demoVehicles: Vehicle[] = [
  {
    id: "demo-corolla",
    brand: "Toyota",
    model: "Corolla",
    version: "XEI",
    year: 2021,
    mileage: 52000,
    vehicle_type: "Sedan",
    transmission: "Automatico",
    fuel: "Nafta",
    price_usd: 24500,
    purchase_price_usd: null,
    color: "#637083",
    description: "Excelente estado general, service al dia y lista para transferir.",
    status: "disponible",
    is_published: true,
    created_at: new Date().toISOString(),
    main_photo_url: null
  },
  {
    id: "demo-nivus",
    brand: "Volkswagen",
    model: "Nivus",
    version: "Highline",
    year: 2022,
    mileage: 38000,
    vehicle_type: "SUV",
    transmission: "Automatico",
    fuel: "Nafta",
    price_usd: 27800,
    purchase_price_usd: null,
    color: "#234b4a",
    description: "SUV compacta con buen equipamiento, confort y bajo consumo.",
    status: "disponible",
    is_published: true,
    created_at: new Date().toISOString(),
    main_photo_url: null
  },
  {
    id: "demo-ranger",
    brand: "Ford",
    model: "Ranger",
    version: "XLT",
    year: 2020,
    mileage: 74000,
    vehicle_type: "Pickup",
    transmission: "Manual",
    fuel: "Diesel",
    price_usd: 31900,
    purchase_price_usd: null,
    color: "#7a2f2f",
    description: "Pickup robusta para trabajo y uso familiar, documentacion completa.",
    status: "reservado",
    is_published: true,
    created_at: new Date().toISOString(),
    main_photo_url: null
  }
];
