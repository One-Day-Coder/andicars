export type ModuleKey =
  | "core"
  | "vehicles"
  | "crm"
  | "expenses"
  | "sales"
  | "reports"
  | "settings"
  | "users"
  | "public_site"
  | "documents"
  | "trade_ins";

export type ModuleDefinition = {
  key: ModuleKey;
  label: string;
  description: string;
  href: string;
  sellable: boolean;
  requiredDependencies: ModuleKey[];
  optionalDependencies: ModuleKey[];
};

export const moduleRegistry: ModuleDefinition[] = [
  {
    key: "core",
    label: "Core",
    description: "Base de autenticacion, permisos, navegacion y estructura comun.",
    href: "/admin",
    sellable: false,
    requiredDependencies: [],
    optionalDependencies: []
  },
  {
    key: "vehicles",
    label: "Stock de vehiculos",
    description: "Carga, edicion, fotos, estados y catalogo de unidades.",
    href: "/admin/vehiculos",
    sellable: true,
    requiredDependencies: ["core"],
    optionalDependencies: ["public_site", "expenses", "sales"]
  },
  {
    key: "crm",
    label: "CRM",
    description: "Clientes, consultas, notas y seguimiento comercial.",
    href: "/admin/consultas",
    sellable: true,
    requiredDependencies: ["core"],
    optionalDependencies: ["vehicles", "sales"]
  },
  {
    key: "expenses",
    label: "Gastos",
    description: "Gastos por vehiculo, conversion y resumen de inversion.",
    href: "/admin/gastos",
    sellable: true,
    requiredDependencies: ["core", "vehicles"],
    optionalDependencies: ["reports"]
  },
  {
    key: "sales",
    label: "Ventas",
    description: "Reservas, senas, ventas, entregas y saldos.",
    href: "/admin/ventas",
    sellable: true,
    requiredDependencies: ["core", "vehicles"],
    optionalDependencies: ["crm", "reports"]
  },
  {
    key: "reports",
    label: "Reportes",
    description: "Resumen de stock, inversion, gastos y rentabilidad.",
    href: "/admin/reportes",
    sellable: true,
    requiredDependencies: ["core"],
    optionalDependencies: ["vehicles", "expenses", "sales"]
  },
  {
    key: "settings",
    label: "Configuracion",
    description: "Datos generales, WhatsApp y protecciones operativas.",
    href: "/admin/configuracion",
    sellable: false,
    requiredDependencies: ["core"],
    optionalDependencies: []
  },
  {
    key: "users",
    label: "Usuarios",
    description: "Roles y accesos internos del panel.",
    href: "/admin/usuarios",
    sellable: false,
    requiredDependencies: ["core"],
    optionalDependencies: []
  },
  {
    key: "public_site",
    label: "Web publica",
    description: "Inicio, catalogo publico, ficha del auto y consultas.",
    href: "/",
    sellable: true,
    requiredDependencies: ["core"],
    optionalDependencies: ["vehicles", "crm"]
  },
  {
    key: "documents",
    label: "Documentacion",
    description: "Modulo futuro de documentacion vehicular.",
    href: "/admin",
    sellable: true,
    requiredDependencies: ["core", "vehicles"],
    optionalDependencies: ["sales"]
  },
  {
    key: "trade_ins",
    label: "Permutas",
    description: "Modulo futuro para vehiculos recibidos en parte de pago.",
    href: "/admin",
    sellable: true,
    requiredDependencies: ["core", "vehicles"],
    optionalDependencies: ["sales", "reports"]
  }
];

